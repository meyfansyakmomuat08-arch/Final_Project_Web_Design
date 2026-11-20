/* Kopi Senja – interaksi dan animasi multi-halaman */
(function () {
  'use strict';

  const calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = window.matchMedia('(hover:hover) and (pointer:fine)').matches;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  /* Mode terang/gelap (tersimpan lintas halaman) */
  const html = document.documentElement;
  try {
    const savedTheme = localStorage.getItem('tema');
    if (savedTheme === 'light' || savedTheme === 'dark') {
      html.setAttribute('data-bs-theme', savedTheme);
    }
  } catch (_) {}

  const themeBtn = $('#themeBtn');

  function updateThemeButton() {
    if (!themeBtn) return;
    const isDark = html.getAttribute('data-bs-theme') === 'dark';
    const label = isDark ? 'Ganti ke mode terang' : 'Ganti ke mode gelap';
    themeBtn.textContent = isDark ? '☼' : '☾';
    themeBtn.setAttribute('aria-label', label);
    themeBtn.setAttribute('title', label);
    themeBtn.setAttribute('aria-pressed', String(!isDark));
  }

  updateThemeButton();

  themeBtn?.addEventListener('click', () => {
    const nextTheme = html.getAttribute('data-bs-theme') === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-bs-theme', nextTheme);
    updateThemeButton();
    try {
      localStorage.setItem('tema', nextTheme);
    } catch (_) {}
  });

  /* Navbar kaca, progres scroll, tombol ke atas */
  const nav = $('.site-nav');
  const prog = $('#prog');
  const toTop = $('#toTop');

  function onScroll() {
    const currentY = window.scrollY;
    nav?.classList.toggle('scrolled', currentY > 40);
    toTop?.classList.toggle('show', currentY > 450);

    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (prog) {
      prog.style.width = (docHeight > 0 ? Math.min(Math.max((currentY / docHeight) * 100, 0), 100) : 0) + '%';
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  toTop?.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: calm ? 'auto' : 'smooth' });
  });

  /* Muncul saat scroll + penghitung angka */
  function countUp(el) {
    if (!el || el.dataset.done) return;
    el.dataset.done = '1';
    const to = Number(el.dataset.count) || 0;
    let startTime = null;

    function step(timestamp) {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / 1400, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = String(Math.round(to * eased));
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    }

    window.requestAnimationFrame(step);
  }

  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('in');
          if (entry.target.dataset.count) {
            countUp(entry.target);
          }
          io.unobserve(entry.target);
        });
      },
      { threshold: 0.12 }
    );

    $$('.rv, .num').forEach((el, i) => {
      el.style.transitionDelay = (i % 4) * 90 + 'ms';
      io.observe(el);
    });
  } else {
    $$('.rv').forEach((el) => el.classList.add('in'));
    $$('.num').forEach((el) => {
      el.textContent = el.dataset.count || '0';
    });
  }

  if (calm) {
    $$('.num').forEach((el) => {
      el.textContent = el.dataset.count || '0';
    });
  }

  /* Biji kopi melayang + garis jaringan, bereaksi pada mouse */
  (function initBeans() {
    const canvas = $('#beans');
    const hero = $('.hero');
    if (!canvas || !hero || calm) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let particles = [];
    const mouse = { x: -999, y: -999 };

    function resizeCanvas() {
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
      const count = width < 600 ? 24 : 50;
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        r: Math.random() * 2 + 1
      }));
    }

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    hero.addEventListener('mousemove', (e) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    });

    hero.addEventListener('mouseleave', () => {
      mouse.x = -999;
      mouse.y = -999;
    });

    function draw() {
      ctx.clearRect(0, 0, width, height);

      particles.forEach((a, i) => {
        a.x += a.vx;
        a.y += a.vy;

        if (a.x < 0 || a.x > width) a.vx *= -1;
        if (a.y < 0 || a.y > height) a.vy *= -1;

        const distMouse = Math.hypot(a.x - mouse.x, a.y - mouse.y);
        if (distMouse < 150) {
          a.x += (mouse.x - a.x) * 0.012;
          a.y += (mouse.y - a.y) * 0.012;
        }

        ctx.fillStyle = 'rgba(227, 182, 111, 0.75)';
        ctx.beginPath();
        ctx.ellipse(a.x, a.y, a.r * 1.4, a.r, 0, 0, Math.PI * 2);
        ctx.fill();

        for (let j = i + 1; j < particles.length; j++) {
          const b = particles[j];
          const d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d < 115) {
            ctx.strokeStyle = `rgba(217, 160, 83, ${(1 - d / 115) * 0.45})`;
            ctx.lineWidth = 0.7;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      });

      window.requestAnimationFrame(draw);
    }

    window.requestAnimationFrame(draw);
  })();

  /* Kartu miring 3D mengikuti kursor */
  if (fine && !calm) {
    document.addEventListener('mousemove', (e) => {
      const card = e.target.closest?.('.tilt');
      if (!card) return;
      const rect = card.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const px = (e.clientX - rect.left) / rect.width - 0.5;
      const py = (e.clientY - rect.top) / rect.height - 0.5;
      card.style.transform = `perspective(800px) rotateY(${px * 8}deg) rotateX(${-py * 8}deg) translateY(-4px)`;
      card.style.boxShadow = '0 18px 40px rgba(0, 0, 0, 0.3)';
    });

    document.addEventListener('mouseout', (e) => {
      const card = e.target.closest?.('.tilt');
      if (card && !card.contains(e.relatedTarget)) {
        card.style.transform = '';
        card.style.boxShadow = '';
      }
    });

    $$('.btn-gold').forEach((btn) => {
      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const dx = (e.clientX - (rect.left + rect.width / 2)) * 0.15;
        const dy = (e.clientY - (rect.top + rect.height / 2)) * 0.25;
        btn.style.transform = `translate(${dx}px, ${dy}px)`;
      });
      btn.addEventListener('mouseleave', () => {
        btn.style.transform = '';
      });
    });
  }

  /* Cari dan filter menu (berfungsi di menu.html maupun mengarahkan dari halaman lain) */
  const rows = $$('#menuTable tbody tr');
  const empty = $('#emptyMsg');
  let activeCat = '';

  function updateCatButtons(cat) {
    $$('[data-filter-cat]').forEach((btn) => {
      const match = btn.dataset.filterCat === cat;
      btn.classList.toggle('btn-gold', match);
      btn.classList.toggle('btn-outline-gold', !match);
    });
  }

  function filterMenu(q, cat) {
    activeCat = cat || '';
    updateCatButtons(activeCat);
    if (!rows.length) return;

    const query = (q || '').trim().toLowerCase();
    let visibleCount = 0;

    rows.forEach((row) => {
      const textMatch = !query || row.textContent.toLowerCase().includes(query);
      const catMatch = !activeCat || row.dataset.cat === activeCat;
      const isVisible = textMatch && catMatch;
      row.hidden = !isVisible;
      if (isVisible) visibleCount++;
    });

    if (empty) {
      empty.classList.toggle('d-none', visibleCount > 0);
    }
  }

  $('#searchForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const q = $('#searchInput')?.value.trim() || '';
    if (rows.length) {
      filterMenu(q, activeCat);
      window.location.hash = '#harga';
    } else {
      window.location.href = 'menu.html' + (q ? '?q=' + encodeURIComponent(q) : '');
    }
  });

  $('#searchInput')?.addEventListener('input', (e) => {
    if (rows.length) {
      filterMenu(e.target.value, activeCat);
    }
  });

  $$('[data-filter-cat]').forEach((btn) => {
    btn.addEventListener('click', () => {
      filterMenu($('#searchInput')?.value || '', btn.dataset.filterCat || '');
    });
  });

  /* Baca parameter URL ?q= atau ?cat= saat membuka menu.html */
  if (rows.length) {
    const params = new URLSearchParams(window.location.search);
    const qParam = params.get('q') || '';
    const catParam = params.get('cat') || '';
    const searchInput = $('#searchInput');
    if (qParam && searchInput) searchInput.value = qParam;
    if (qParam || catParam) filterMenu(qParam, catParam);
  }

  /* Simpan dan tampilkan riwayat pesanan di localStorage */
  function saveOrder(order) {
    try {
      const existing = JSON.parse(localStorage.getItem('pesanan') || '[]');
      const list = Array.isArray(existing) ? existing : [];
      list.unshift(order);
      localStorage.setItem('pesanan', JSON.stringify(list.slice(0, 10)));
    } catch (_) {}
    renderOrderHistory();
  }

  function renderOrderHistory() {
    const list = $('#orderHistoryList');
    if (!list) return;

    let items = [];
    try {
      const parsed = JSON.parse(localStorage.getItem('pesanan') || '[]');
      if (Array.isArray(parsed)) items = parsed;
    } catch (_) {}

    list.innerHTML = '';
    if (!items.length) {
      const emptyLi = document.createElement('li');
      emptyLi.className = 'list-group-item bg-transparent text-secondary px-0';
      emptyLi.textContent = 'Belum ada ringkasan pesanan.';
      list.appendChild(emptyLi);
      return;
    }

    items.forEach((item) => {
      const li = document.createElement('li');
      li.className = 'list-group-item bg-transparent px-0 border-secondary-subtle';
      const detailWaktu = item.jam ? ` ${item.jam}` : '';
      const detailLayanan = item.layanan ? ` [${item.layanan}]` : '';
      li.textContent = `${item.jumlah}x ${item.menu} — ${item.nama}${detailLayanan} (${item.tanggal}${detailWaktu})`;
      list.appendChild(li);
    });
  }

  renderOrderHistory();

  $('#clearHistoryBtn')?.addEventListener('click', () => {
    try {
      localStorage.removeItem('pesanan');
    } catch (_) {}
    renderOrderHistory();
  });

  /* Modal pesan cepat */
  const modal = $('#bookingModal');
  const form = $('#bookingForm');
  const msg = $('#bookingMessage');

  modal?.addEventListener('show.bs.modal', (e) => {
    const trigger = e.relatedTarget;
    const destInput = $('#bookingDestination');
    const dateInput = $('#bookingDate');

    if (destInput) destInput.value = trigger?.dataset?.destination || '';
    if (msg) msg.textContent = '';

    if (dateInput) {
      const todayStr = new Date().toISOString().slice(0, 10);
      dateInput.min = todayStr;
      if (!dateInput.value) dateInput.value = todayStr;
    }
  });

  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const destInput = $('#bookingDestination');
    const nameInput = $('#bookingName');
    const dateInput = $('#bookingDate');
    const guestsInput = $('#bookingGuests');

    const order = {
      menu: (destInput?.value || '').trim(),
      nama: (nameInput?.value || '').trim(),
      tanggal: dateInput?.value || '',
      jumlah: Number(guestsInput?.value) || 1
    };

    saveOrder(order);

    const teks = `Halo Kopi Senja, saya ${order.nama} ingin memesan ${order.jumlah}x ${order.menu} untuk diambil pada ${order.tanggal}.`;
    if (msg) {
      msg.innerHTML = '';
      const summarySpan = document.createElement('span');
      summarySpan.textContent = `Ringkasan: ${order.jumlah}x ${order.menu}, atas nama ${order.nama}, ${order.tanggal}. `;

      const waLink = document.createElement('a');
      waLink.href = 'https://wa.me/6281234567890?text=' + encodeURIComponent(teks);
      waLink.target = '_blank';
      waLink.rel = 'noopener noreferrer';
      waLink.textContent = 'Kirim via WhatsApp';

      msg.append(summarySpan, waLink);
    }
  });

  /* Formulir pemesanan lengkap di halaman pesan.html */
  const pageForm = $('#pageOrderForm');
  const pageResult = $('#pageOrderResult');

  if (pageForm) {
    const orderDate = $('#orderDate');
    const todayStr = new Date().toISOString().slice(0, 10);
    if (orderDate) {
      orderDate.min = todayStr;
      if (!orderDate.value) orderDate.value = todayStr;
    }

    pageForm.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!pageForm.checkValidity()) {
        pageForm.reportValidity();
        return;
      }

      const order = {
        nama: ($('#orderName')?.value || '').trim(),
        layanan: $('#orderType')?.value || '',
        menu: $('#orderMenu')?.value || '',
        jumlah: Number($('#orderQty')?.value) || 1,
        tanggal: $('#orderDate')?.value || '',
        jam: $('#orderTime')?.value || '',
        catatan: ($('#orderNote')?.value || '').trim()
      };

      saveOrder(order);

      const teks = `Halo Kopi Senja, saya ${order.nama} (${order.layanan}) ingin memesan ${order.jumlah}x ${order.menu} pada ${order.tanggal} pukul ${order.jam}.${order.catatan ? ' Catatan: ' + order.catatan : ''}`;
      if (pageResult) {
        pageResult.innerHTML = '';
        const summarySpan = document.createElement('span');
        summarySpan.textContent = `Ringkasan siap: ${order.jumlah}x ${order.menu} (${order.layanan}) a.n. ${order.nama}, ${order.tanggal} ${order.jam}. `;

        const waLink = document.createElement('a');
        waLink.href = 'https://wa.me/6281234567890?text=' + encodeURIComponent(teks);
        waLink.target = '_blank';
        waLink.rel = 'noopener noreferrer';
        waLink.textContent = 'Kirim ke WhatsApp Kedai →';

        pageResult.append(summarySpan, waLink);
      }
    });
  }
})();