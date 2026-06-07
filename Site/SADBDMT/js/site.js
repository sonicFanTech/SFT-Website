const toggle = document.querySelector('[data-nav-toggle]');
const nav = document.querySelector('[data-nav]');
if (toggle && nav) {
  toggle.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(open));
  });
}
const current = location.pathname.replace(/\\/g, '/').split('/').pop() || 'index.html';
document.querySelectorAll('[data-nav-link]').forEach(link => {
  const target = link.getAttribute('href').split('/').pop();
  if (target === current || (current === '' && target === 'index.html')) link.classList.add('active');
});
