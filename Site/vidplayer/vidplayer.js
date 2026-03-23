/* ============================================================
   VidPlayer HQ — vidplayer.js
   Full Glitch Suite: random errors, hover distortion,
   chromatic aberration, CRT instability, fake BSODs,
   link click glitch, and general chaos
   ============================================================ */

/* ── STARFIELD ── */
(function () {
  const canvas = document.getElementById('starfield');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, stars = [], shootingStars = [];
  function resize() { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; }
  function mkStar() {
    return { x:Math.random()*W, y:Math.random()*H, r:Math.random()*1.4+0.2, a:Math.random(),
      speed:Math.random()*0.3+0.05, twinkleSpeed:Math.random()*0.02+0.005, twinkleDir:1,
      color: Math.random()<0.1 ? `hsl(${200+Math.random()*60},100%,80%)` : '#ffffff' };
  }
  function mkShootingStar() {
    return { x:Math.random()*W, y:Math.random()*H*0.5, len:Math.random()*120+60,
      speed:Math.random()*6+4, angle:Math.PI/4+(Math.random()-0.5)*0.3, alpha:1, active:true };
  }
  function init() { resize(); stars = Array.from({length:280}, mkStar); }
  function draw() {
    ctx.clearRect(0,0,W,H);
    for (const s of stars) {
      s.a += s.twinkleSpeed * s.twinkleDir;
      if (s.a>=1) s.twinkleDir=-1; if (s.a<=0.1) s.twinkleDir=1;
      s.y -= s.speed*0.08; if (s.y<0) { s.y=H; s.x=Math.random()*W; }
      ctx.save(); ctx.globalAlpha=s.a*0.85; ctx.fillStyle=s.color;
      ctx.beginPath(); ctx.arc(s.x,s.y,s.r,0,Math.PI*2); ctx.fill(); ctx.restore();
    }
    for (const ss of shootingStars) {
      if (!ss.active) continue;
      const ex=ss.x+Math.cos(ss.angle)*ss.len, ey=ss.y+Math.sin(ss.angle)*ss.len;
      const grad=ctx.createLinearGradient(ss.x,ss.y,ex,ey);
      grad.addColorStop(0,`rgba(0,212,255,${ss.alpha})`); grad.addColorStop(1,'rgba(0,212,255,0)');
      ctx.save(); ctx.strokeStyle=grad; ctx.lineWidth=1.5; ctx.globalAlpha=ss.alpha;
      ctx.beginPath(); ctx.moveTo(ss.x,ss.y); ctx.lineTo(ex,ey); ctx.stroke(); ctx.restore();
      ss.x+=Math.cos(ss.angle)*ss.speed; ss.y+=Math.sin(ss.angle)*ss.speed;
      ss.alpha-=0.012; if (ss.alpha<=0||ss.x>W||ss.y>H) ss.active=false;
    }
    shootingStars=shootingStars.filter(s=>s.active);
    requestAnimationFrame(draw);
  }
  setInterval(()=>{ if(Math.random()<0.4) shootingStars.push(mkShootingStar()); },2200);
  window.addEventListener('resize',resize); init(); draw();
})();

/* ── GLITCH CHARS ── */
const GLITCH_CHARS = '!<>-_\\/[]{}=+*^?#01アイウエオカキクケコ░▒▓█▄▀@$%&ABCDEFX';

/* ── GLOBAL GLITCH OVERLAY ── */
const glitchOverlay = (function(){
  const el = document.createElement('div');
  el.style.cssText='position:fixed;inset:0;z-index:9990;pointer-events:none;opacity:0';
  document.body.appendChild(el);
  return el;
})();

function doGlitchSlices(intensity) {
  intensity = intensity || 1;
  const num = Math.floor((6+Math.random()*10)*intensity);
  const cols = [
    'rgba(0,212,255,__)', 'rgba(123,47,255,__)',
    'rgba(255,0,80,__)',  'rgba(0,255,153,__)'
  ];
  let html = '';
  for (let i=0;i<num;i++) {
    const top=(Math.random()*100).toFixed(1);
    const h=(Math.random()*5*intensity+0.5).toFixed(1);
    const tx=((Math.random()-0.5)*60*intensity).toFixed(1);
    const a=(0.06+Math.random()*0.14).toFixed(2);
    const col=cols[Math.floor(Math.random()*cols.length)].replace('__',a);
    html+=`<div style="position:absolute;left:0;right:0;top:${top}%;height:${h}%;background:${col};transform:translateX(${tx}px)"></div>`;
  }
  glitchOverlay.innerHTML=html; glitchOverlay.style.opacity='1';
  const wr=document.getElementById('wrapper');
  if (wr) {
    const sx=((Math.random()-0.5)*12*intensity).toFixed(1);
    const sy=((Math.random()-0.5)*4*intensity).toFixed(1);
    const sk=((Math.random()-0.5)*1.5).toFixed(2);
    wr.style.transition='none';
    wr.style.transform=`translate(${sx}px,${sy}px) skewX(${sk}deg)`;
    setTimeout(()=>{ wr.style.transform='none'; },80);
  }
  setTimeout(()=>{ glitchOverlay.style.opacity='0'; },60+Math.random()*80);
  if (Math.random()<0.45) {
    setTimeout(()=>{
      glitchOverlay.innerHTML='<div style="position:absolute;inset:0;background:rgba(0,212,255,0.04)"></div>';
      glitchOverlay.style.opacity='1';
      setTimeout(()=>{ glitchOverlay.style.opacity='0'; },45);
    },140+Math.random()*60);
  }
}

/* ── SCHEDULE RANDOM IDLE GLITCHES ── */
(function sched(){ setTimeout(()=>{ doGlitchSlices(); sched(); },5000+Math.random()*9000); })();

/* ── GLITCH TEXT ON HOVER ── */
(function(){
  document.querySelectorAll('[data-glitch]').forEach(el=>{
    const orig=el.textContent;
    el.addEventListener('mouseenter',()=>{
      clearInterval(el._gt); let iters=0;
      el._gt=setInterval(()=>{
        el.textContent=orig.split('').map((c,i)=>{
          if(i<iters) return orig[i];
          if(c===' ') return ' ';
          return GLITCH_CHARS[Math.floor(Math.random()*GLITCH_CHARS.length)];
        }).join('');
        iters+=0.6;
        if(iters>=orig.length){ el.textContent=orig; clearInterval(el._gt); }
      },28);
    });
  });
})();

/* ── CHROMATIC ABERRATION ON LOGO ── */
(function(){
  const logo=document.querySelector('#logo-text h1');
  if(!logo) return;
  function ab(){
    const rx=(Math.random()-0.5)*8, ry=(Math.random()-0.5)*3;
    const bx=(Math.random()-0.5)*8, by=(Math.random()-0.5)*3;
    logo.style.textShadow=`${rx}px ${ry}px 0 rgba(255,0,80,0.75),${bx}px ${by}px 0 rgba(0,212,255,0.75),0 0 10px var(--accent1),0 0 30px rgba(0,180,255,0.3)`;
    setTimeout(()=>{ logo.style.textShadow='0 0 10px var(--accent1),0 0 30px rgba(0,180,255,0.3)'; },70+Math.random()*90);
  }
  (function schedAb(){ setTimeout(()=>{ ab(); schedAb(); },3500+Math.random()*6000); })();
})();

/* ── CRT FLICKER ── */
(function(){
  function flicker(){
    const steps=2+Math.floor(Math.random()*3); let i=0;
    const t=setInterval(()=>{
      document.body.style.filter=`brightness(${0.82+Math.random()*0.18})`;
      if(++i>=steps){ clearInterval(t); document.body.style.filter=''; }
    },40);
    setTimeout(flicker,7000+Math.random()*15000);
  }
  setTimeout(flicker,4000+Math.random()*6000);
})();

/* ── SIGNAL LOST ── */
(function(){
  function sl(){
    document.body.style.filter='contrast(200%) brightness(0.3) saturate(0)';
    setTimeout(()=>{ document.body.style.filter='brightness(1.4)';
      setTimeout(()=>{ document.body.style.filter=''; },60); },80+Math.random()*120);
  }
  (function sched(){ setTimeout(()=>{ sl(); sched(); },28000+Math.random()*40000); })();
})();

/* ── NAVBAR RANDOM GLITCH ── */
(function(){
  function gnav(){
    const links=document.querySelectorAll('#navbar a');
    if(!links.length) return;
    const el=links[Math.floor(Math.random()*links.length)];
    const orig=el.textContent; let i=0;
    const t=setInterval(()=>{
      el.textContent=orig.split('').map(c=>c===' '?' ':GLITCH_CHARS[Math.floor(Math.random()*GLITCH_CHARS.length)]).join('');
      if(++i>6){ el.textContent=orig; clearInterval(t); }
    },40);
  }
  (function sched(){ setTimeout(()=>{ gnav(); sched(); },9000+Math.random()*14000); })();
})();

/* ── FAKE ERRORS ── */
(function(){
  const ERRORS=[
    {title:'KERNEL PANIC',
     body:'UNEXPECTED KERNEL MODE TRAP\nSTOP: 0x0000007E\nvidplayer.sys has caused an error.\nDumping memory... [done]\nPress F8 to continue or wait.',
     bg:'#000080',fg:'#ffffff',type:'bsod'},
    {title:'RUNTIME ERROR',
     body:'Exception in thread "audio" NullPointerException\n  at vidplayer.core.AudioEngine.tick(line 337)\n  at vidplayer.core.PlaybackThread.run(line 88)\nAttempting recovery...',
     bg:'#080808',fg:'#cc0000',type:'console'},
    {title:'SYSTEM WARNING',
     body:'WARNING: vidplayer.exe accessed invalid memory\nAddress: 0xDEADBEEF  Status: RECOVERED\nBuffer reallocated. Continuing...\nThis incident has been logged.',
     bg:'#0a0f0a',fg:'#ffff00',type:'warning'},
    {title:'CONNECTION LOST',
     body:'ERR_NETWORK_CHANGED\nFailed to reach assets.vidplayer.hq:443\nRetrying... [1/3]... [2/3]... [3/3] FAILED\nFalling back to local cache.',
     bg:'#050010',fg:'#00ccff',type:'network'},
    {title:'AUDIO ENGINE',
     body:'WaveOut device busy — waiting for lock...\nSample rate mismatch: 44100 vs 48000\nResampling via libresample... OK\nBuffer underrun count: 3',
     bg:'#0f0800',fg:'#ff9900',type:'warning'},
    {title:'CHECKSUM FAIL',
     body:'CRC32 mismatch: playlist.dat\nExpected: 0xABCDEF12\nGot:      0x00000000\nFile may be corrupted. Rebuilding index...',
     bg:'#080808',fg:'#ff3366',type:'console'},
    {title:'VIDPLAYER.EXE',
     body:'Access violation @ 0xFFFFFFFF\nModule: QtCore.dll +0x004A3C\nCorrupted stack frame detected.\nDumping core... [████████░░] 82%',
     bg:'#050505',fg:'#00ff99',type:'console'},
    {title:'MEMORY LEAK',
     body:'Heap fragmentation detected.\nAllocated: 2.1 GB / Available: 512 MB\nGarbage collector running...\nFreed: 847 MB  Time: 0.003ms — OK',
     bg:'#080508',fg:'#cc44ff',type:'warning'},
  ];

  const style=document.createElement('style');
  style.textContent=`
    @keyframes errorIn { from{opacity:0;transform:translateY(-6px) skewX(1deg)} to{opacity:1;transform:none} }
    @keyframes errorOut{ from{opacity:1} to{opacity:0;transform:skewX(-2deg)} }
    .panel-hidden{opacity:0;transform:translateX(-10px);transition:opacity 0.4s ease,transform 0.4s ease}
    .panel-visible{opacity:1;transform:none}
  `;
  document.head.appendChild(style);

  function showError(){
    const e=ERRORS[Math.floor(Math.random()*ERRORS.length)];
    const isBsod=e.type==='bsod';
    const box=document.createElement('div');
    box.style.cssText=[
      'position:fixed',
      isBsod?'inset:0':`top:${8+Math.random()*55}%`,
      isBsod?'':`left:${4+Math.random()*45}%`,
      'z-index:999990',
      `background:${e.bg}`,
      isBsod?'':'width:380px',
      `border:${isBsod?'none':`1px solid ${e.fg}44`}`,
      `padding:${isBsod?'10% 12%':'16px 18px'}`,
      'font-family:monospace',
      `font-size:${isBsod?'14px':'11px'}`,
      `color:${e.fg}`,
      `box-shadow:${isBsod?'none':`0 0 25px ${e.fg}33,0 0 60px ${e.fg}11`}`,
      'pointer-events:none',
      'animation:errorIn 0.12s ease both',
      'letter-spacing:0.5px','line-height:1.75',
      'white-space:pre'
    ].filter(Boolean).join(';');

    const h=document.createElement('div');
    h.style.cssText=`font-weight:700;font-size:${isBsod?'20px':'12px'};margin-bottom:10px;letter-spacing:${isBsod?'3':'1'}px;color:${e.fg}`;
    h.textContent=isBsod?`A problem has been detected and VidPlayer HQ\nhas been shut down to prevent damage.\n\n${e.title}`:` ► [${e.title}]`;

    const b=document.createElement('pre');
    b.style.cssText='margin:0;font-family:inherit;font-size:inherit;white-space:pre-wrap';
    b.textContent='';

    const note=document.createElement('div');
    note.style.cssText=`margin-top:${isBsod?'40':'10'}px;font-size:10px;opacity:0.5`;
    note.textContent=isBsod?'Collecting error information (100% complete)\n\nThis window will close automatically.':'// auto-dismiss';

    box.appendChild(h); box.appendChild(b); box.appendChild(note);
    document.body.appendChild(box);

    doGlitchSlices(isBsod?2.5:1.3);
    if(isBsod){
      const fl=document.createElement('div');
      fl.style.cssText='position:fixed;inset:0;z-index:999989;background:#000088;opacity:0.6;pointer-events:none';
      document.body.appendChild(fl);
      setTimeout(()=>fl.remove(),100);
    }

    // typewriter
    const full=e.body; let ci=0;
    const tw=setInterval(()=>{ b.textContent=full.slice(0,ci+=2); if(ci>full.length) clearInterval(tw); },16);

    const lifetime=isBsod?3200:3500+Math.random()*1000;
    setTimeout(()=>{
      doGlitchSlices(0.7);
      box.style.animation='errorOut 0.3s ease forwards';
      setTimeout(()=>box.remove(),320);
    },lifetime);
  }

  window._showFakeError=showError;
  (function sched(){ setTimeout(()=>{ showError(); sched(); },20000+Math.random()*35000); })();
})();

/* ── PAGE TRANSITION WITH GLITCH ── */
(function(){
  const ov=document.createElement('div');
  ov.style.cssText='position:fixed;inset:0;z-index:99998;background:rgba(0,8,20,0);pointer-events:none;transition:background 0.18s';
  document.body.appendChild(ov);

  const msg=document.createElement('div');
  msg.style.cssText=[
    'position:fixed','top:50%','left:50%','transform:translate(-50%,-50%)',
    'z-index:99999','pointer-events:none','opacity:0',
    'font-family:monospace','font-size:12px','color:#00d4ff',
    'letter-spacing:2px','text-align:center','text-shadow:0 0 8px #00d4ff',
    'line-height:1.9','white-space:pre'
  ].join(';');
  document.body.appendChild(msg);

  const LINES=['LOADING PAGE...','REDIRECTING...','CHECKSUM OK','INITIALISING MODULE...',
    'DECRYPTING ASSETS...','CACHE HIT','ROUTE RESOLVED','VIDPLAYER.EXE READY',
    'READING DISK...','VERIFYING SIGNATURE...','DECOMPRESSING...'];

  document.querySelectorAll('a[href]').forEach(link=>{
    const href=link.getAttribute('href');
    if(!href||href.startsWith('#')||href.startsWith('http')||href.startsWith('mailto')||link.target==='_blank') return;
    link.addEventListener('click',e=>{
      e.preventDefault();
      doGlitchSlices(2.0);
      setTimeout(()=>doGlitchSlices(1.4),100);
      setTimeout(()=>doGlitchSlices(0.9),210);
      ov.style.background='rgba(0,8,20,0.96)';
      msg.style.opacity='1';
      msg.textContent=LINES[Math.floor(Math.random()*LINES.length)];
      let fl=0;
      const ft=setInterval(()=>{
        msg.textContent=Math.random()<0.5
          ?LINES[Math.floor(Math.random()*LINES.length)]
          :Array.from({length:20},()=>GLITCH_CHARS[Math.floor(Math.random()*GLITCH_CHARS.length)]).join('');
        if(++fl>7) clearInterval(ft);
      },55);
      setTimeout(()=>{ window.location=href; },540);
    });
  });

  window.addEventListener('pageshow',()=>{
    ov.style.background='rgba(0,8,20,0)';
    msg.style.opacity='0';
    setTimeout(()=>doGlitchSlices(0.8),120);
  });
})();

/* ── LINK HOVER + CLICK RANDOM GLITCH ── */
(function(){
  document.querySelectorAll('a').forEach(link=>{
    link.addEventListener('mouseenter',()=>{ if(Math.random()<0.3) doGlitchSlices(0.35); });
    link.addEventListener('mousedown',()=>{
      if(Math.random()<0.18) doGlitchSlices(0.9);
      if(Math.random()<0.04 && window._showFakeError) setTimeout(window._showFakeError,400);
    });
  });
})();

/* ── PANEL ENTRANCE ── */
(function(){
  if(!('IntersectionObserver' in window)) return;
  const obs=new IntersectionObserver((entries)=>{
    entries.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add('panel-visible'); obs.unobserve(e.target); } });
  },{threshold:0.06});
  document.querySelectorAll('.panel').forEach(p=>{ p.classList.add('panel-hidden'); obs.observe(p); });
})();

/* ── FEATURE CARD HOVER GLITCH ── */
(function(){
  // Also hook panels generally for a subtle effect
  document.querySelectorAll('.feature-card, .panel').forEach(card => {
    card.addEventListener('mouseenter', () => {
      // Feature cards get a stronger, more reliable glitch
      const isFeatureCard = card.classList.contains('feature-card');
      const chance = isFeatureCard ? 0.75 : 0.2;
      const intensity = isFeatureCard ? 0.55 : 0.25;
      if (Math.random() < chance) {
        doGlitchSlices(intensity);

        // Also do a quick chromatic aberration on the card title
        const title = card.querySelector('.fc-title, h2, h3');
        if (title) {
          const orig = title.style.textShadow;
          const rx = (Math.random()-0.5)*10, ry=(Math.random()-0.5)*4;
          const bx = (Math.random()-0.5)*10, by=(Math.random()-0.5)*4;
          title.style.textShadow = `${rx}px ${ry}px 0 rgba(255,0,80,0.8), ${bx}px ${by}px 0 rgba(0,212,255,0.8)`;
          // brief pixel-shift on the whole card
          card.style.transition = 'none';
          card.style.transform = `translate(${(Math.random()-0.5)*5}px,${(Math.random()-0.5)*3}px) skewX(${(Math.random()-0.5)*2}deg)`;
          setTimeout(() => {
            title.style.textShadow = orig || '';
            card.style.transform = '';
          }, 80 + Math.random() * 60);
        }
      }
    });

    // On click/mousedown: bigger burst
    card.addEventListener('mousedown', () => {
      const isFeatureCard = card.classList.contains('feature-card');
      if (Math.random() < (isFeatureCard ? 0.9 : 0.35)) {
        doGlitchSlices(isFeatureCard ? 1.1 : 0.6);
        // shake the card itself
        card.style.transition = 'none';
        const sx = (Math.random()-0.5)*8, sy=(Math.random()-0.5)*4;
        card.style.transform = `translate(${sx}px,${sy}px)`;
        setTimeout(() => { card.style.transform = ''; }, 100);
      }
    });
  });
})();
