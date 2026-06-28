
(function(){
  function qs(sel, root){ return (root || document).querySelector(sel); }
  const year = new Date().getFullYear();
  document.querySelectorAll('[data-year]').forEach(el => el.textContent = year);
  document.querySelectorAll('[data-copy]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const value = btn.getAttribute('data-copy') || '';
      try { await navigator.clipboard.writeText(value); btn.textContent = 'Copied'; setTimeout(()=>btn.textContent='Copy', 1200); }
      catch(e){ alert(value); }
    });
  });
})();
