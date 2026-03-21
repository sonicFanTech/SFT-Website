// ── Shared JS for all pages ────────────────────────────────────────────────

// ── Navbar injection ──────────────────────────────────────────────────────
const NAV_PAGES = [
  { label: 'Home',          href: 'index.html'    },
  { label: 'Features',      href: 'features.html' },
  { label: 'OS Compat',     href: 'compat.html'   },
  { label: 'Architecture',  href: 'tech.html'     },
  { label: 'Download',      href: 'download.html' },
  { label: 'Connect',       href: 'connect.html'  },
  { label: 'GitHub ↗',      href: 'https://github.com/sonicFanTech', ext: true },
];

function injectNav() {
  const cur = location.pathname.split('/').pop() || 'index.html';
  const el = document.getElementById('navbar');
  if (!el) return;
  const links = NAV_PAGES.map(p =>
    `<a href="${p.href}" ${p.ext ? 'target="_blank"' : ''}
        class="${(!p.ext && (cur === p.href || (cur==='' && p.href==='index.html'))) ? 'active':''}">${p.label}</a>`
  ).join('');
  el.innerHTML = `
    <div class="nav-inner">
      <a class="nav-logo" href="index.html">
        <div class="nav-logo-icon">C</div>
        <span class="logo-font" style="font-size:1.35rem;font-weight:600;color:#fff;">Cobvuz</span>
        <span class="accent-text logo-font" style="font-size:1.35rem;font-weight:300"> Virtual</span>
      </a>
      <nav class="nav-links">${links}</nav>
      <div style="display:flex;align-items:center;gap:.75rem">
        <button class="nav-download" onclick="showComingSoon()"><i class="fas fa-clock" style="font-size:.7rem"></i> Coming Soon</button>
        <button class="nav-hamburger" id="ham-btn"><i class="fas fa-bars"></i></button>
      </div>
    </div>
    <div class="nav-mobile" id="nav-mobile">${links}</div>`;
  document.getElementById('ham-btn').addEventListener('click', () => {
    const m = document.getElementById('nav-mobile');
    m.classList.toggle('open');
    document.getElementById('ham-btn').innerHTML =
      m.classList.contains('open') ? '<i class="fas fa-times"></i>' : '<i class="fas fa-bars"></i>';
  });
  document.querySelectorAll('.nav-mobile a').forEach(a => {
    a.addEventListener('click', () => {
      document.getElementById('nav-mobile').classList.remove('open');
      document.getElementById('ham-btn').innerHTML = '<i class="fas fa-bars"></i>';
    });
  });
}

// ── Footer injection ───────────────────────────────────────────────────────
function injectFooter() {
  const el = document.getElementById('footer-placeholder');
  if (!el) return;
  el.outerHTML = `
  <footer id="site-footer">
    <div class="footer-inner">
      <div style="display:flex;align-items:center;gap:.75rem">
        <div class="nav-logo-icon" style="width:32px;height:32px;font-size:15px">C</div>
        <span class="logo-font" style="font-size:1.25rem">Cobvuz Virtual</span>
        <span style="font-size:.75rem;color:#374151;margin-left:.5rem">by sonic Fan Tech (SFT)</span>
      </div>
      <div class="footer-copy">Early access coming soon · Pure C++ Hyper-V VM software · © 2026</div>
      <div class="footer-links">
        <a href="https://github.com/sonicFanTech" target="_blank"><i class="fab fa-github"></i></a>
        <a href="https://x.com/sonicfantech" target="_blank"><i class="fab fa-x-twitter"></i></a>
        <a href="https://www.youtube.com/@sonicfantech" target="_blank"><i class="fab fa-youtube"></i></a>
      </div>
    </div>
  </footer>`;
}

// ── Particles ─────────────────────────────────────────────────────────────
function initParticles() {
  const canvas = document.getElementById('particles-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, particles = [];

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  const COLORS = ['rgba(82,130,255,', 'rgba(120,80,255,', 'rgba(72,199,142,'];
  for (let i = 0; i < 70; i++) {
    const c = COLORS[Math.floor(Math.random() * COLORS.length)];
    particles.push({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      r: Math.random() * 1.8 + 0.4,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      alpha: Math.random() * 0.5 + 0.15,
      color: c,
    });
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
      if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.color + p.alpha + ')';
      ctx.fill();
    });
    // Draw lines between nearby particles
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        if (dist < 120) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(82,130,255,${0.07 * (1 - dist/120)})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
    requestAnimationFrame(draw);
  }
  draw();
}

// ── Scroll reveal ─────────────────────────────────────────────────────────
function initScrollReveal() {
  const els = document.querySelectorAll('.reveal-up');
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); } });
  }, { threshold: 0.12 });
  els.forEach(el => obs.observe(el));
}

// ── Page transitions ──────────────────────────────────────────────────────
function initPageTransitions() {
  const overlay = document.getElementById('page-transition');
  if (!overlay) return;

  // Entrance: slide overlay up to reveal page
  setTimeout(() => { overlay.classList.add('in'); }, 50);

  document.querySelectorAll('a.page-link, a[href$=".html"]:not([target="_blank"])').forEach(a => {
    a.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      if (!href || href.startsWith('http') || href.startsWith('#') || href.startsWith('mailto')) return;
      e.preventDefault();
      overlay.classList.remove('in');
      overlay.classList.add('out');
      setTimeout(() => { window.location.href = href; }, 480);
    });
  });
}

// ── Coming soon ───────────────────────────────────────────────────────────
function showComingSoon() {
  alert("Cobvuz Virtual is not available for download yet!\n\nFollow sonic Fan Tech (SFT) on YouTube, X, or GitHub for the official release date.");
}

// ── Smooth scroll for # links ─────────────────────────────────────────────
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const t = document.querySelector(a.getAttribute('href'));
    if (t) { e.preventDefault(); t.scrollIntoView({ behavior: 'smooth' }); }
  });
});

// ── Boot ──────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  injectNav();
  injectFooter();
  initParticles();
  initScrollReveal();
  initPageTransitions();
});
