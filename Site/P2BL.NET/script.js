const tabs=[...document.querySelectorAll('.tab')];
const sections=[...document.querySelectorAll('.section')];
function showTab(id){sections.forEach(s=>s.classList.toggle('active',s.id===id));tabs.forEach(t=>t.classList.toggle('active',t.dataset.target===id));history.replaceState(null,'','#'+id);window.scrollTo({top:0,behavior:'smooth'});}
tabs.forEach(t=>t.addEventListener('click',()=>showTab(t.dataset.target)));
document.querySelectorAll('[data-home]').forEach(a=>a.addEventListener('click',e=>{e.preventDefault();showTab('home')}));
const initial=location.hash.replace('#','');showTab(document.getElementById(initial)?initial:'home');
