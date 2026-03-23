/* ============================================================
   VidPlayer HQ — vidplayer.js  v2.0
   Full randomized glitch engine. Every element gets a random
   effect pool — no two hovers/clicks feel the same.
   Admin-configurable via localStorage (set by admin panel).
   ============================================================ */

/* ── LOAD ADMIN CONFIG FROM LOCALSTORAGE ── */
const VCFG = (function(){
  try {
    const saved = JSON.parse(localStorage.getItem('vp_admin_cfg') || '{}');
    return {
      intensity:   saved.intensity   ?? 1.0,   // 0.1 – 3.0
      frequency:   saved.frequency   ?? 1.0,   // 0.1 – 3.0  (multiplier on chance)
      fakeErrors:  saved.fakeErrors  ?? true,
      navScramble: saved.navScramble ?? true,
      crtFlicker:  saved.crtFlicker  ?? true,
      signalLost:  saved.signalLost  ?? true,
      chromaAb:    saved.chromaAb    ?? true,
      hoverGlitch: saved.hoverGlitch ?? true,
      clickGlitch: saved.clickGlitch ?? true,
      cardGlitch:  saved.cardGlitch  ?? true,
      ticker:      saved.ticker      ?? null,   // null = use page default
    };
  } catch(e) { return { intensity:1,frequency:1,fakeErrors:true,navScramble:true,crtFlicker:true,signalLost:true,chromaAb:true,hoverGlitch:true,clickGlitch:true,cardGlitch:true,ticker:null }; }
})();

const I = VCFG.intensity;   // shorthand
const F = VCFG.frequency;

/* ── GLITCH CHARS ── */
const GC = '!<>-_\\/[]{}=+*^?#01アイウエオカキクケコ░▒▓█▄▀@$%&XZQK∆∑Ω≠×÷';

/* ── RANDOM HELPERS ── */
const rnd  = (a,b) => a + Math.random() * (b - a);
const pick = arr  => arr[Math.floor(Math.random() * arr.length)];
const coin = p    => Math.random() < p;

/* ─────────────────────────────────────────────
   STARFIELD
───────────────────────────────────────────── */
(function(){
  const cv = document.getElementById('starfield');
  if (!cv) return;
  const ctx = cv.getContext('2d');
  let W, H, stars=[], shoots=[];
  const resize = () => { W=cv.width=innerWidth; H=cv.height=innerHeight; };
  const mkStar = () => ({ x:rnd(0,W), y:rnd(0,H), r:rnd(0.2,1.6), a:Math.random(),
    spd:rnd(0.05,0.35), ts:rnd(0.005,0.022), td:1,
    col: coin(0.1)?`hsl(${200+rnd(0,60)},100%,80%)`:'#fff' });
  const mkShoot= () => ({ x:rnd(0,W), y:rnd(0,H*.5), len:rnd(60,180),
    spd:rnd(4,10), ang:Math.PI/4+(Math.random()-.5)*.3, a:1, on:true });
  resize();
  stars = Array.from({length:280}, mkStar);
  function draw(){
    ctx.clearRect(0,0,W,H);
    for(const s of stars){
      s.a+=s.ts*s.td; if(s.a>=1)s.td=-1; if(s.a<=.1)s.td=1;
      s.y-=s.spd*.08; if(s.y<0){s.y=H;s.x=rnd(0,W);}
      ctx.save();ctx.globalAlpha=s.a*.85;ctx.fillStyle=s.col;
      ctx.beginPath();ctx.arc(s.x,s.y,s.r,0,Math.PI*2);ctx.fill();ctx.restore();
    }
    for(const ss of shoots){
      if(!ss.on) continue;
      const ex=ss.x+Math.cos(ss.ang)*ss.len, ey=ss.y+Math.sin(ss.ang)*ss.len;
      const g=ctx.createLinearGradient(ss.x,ss.y,ex,ey);
      g.addColorStop(0,`rgba(0,212,255,${ss.a})`);g.addColorStop(1,'rgba(0,212,255,0)');
      ctx.save();ctx.strokeStyle=g;ctx.lineWidth=1.5;ctx.globalAlpha=ss.a;
      ctx.beginPath();ctx.moveTo(ss.x,ss.y);ctx.lineTo(ex,ey);ctx.stroke();ctx.restore();
      ss.x+=Math.cos(ss.ang)*ss.spd;ss.y+=Math.sin(ss.ang)*ss.spd;
      ss.a-=.012; if(ss.a<=0||ss.x>W||ss.y>H) ss.on=false;
    }
    shoots=shoots.filter(s=>s.on);
    requestAnimationFrame(draw);
  }
  setInterval(()=>{ if(coin(.4)) shoots.push(mkShoot()); },2200);
  addEventListener('resize',resize);
  draw();
})();

/* ─────────────────────────────────────────────
   GLOBAL GLITCH OVERLAY (slices + shake)
───────────────────────────────────────────── */
const _gOv = (()=>{
  const el=document.createElement('div');
  el.style.cssText='position:fixed;inset:0;z-index:9990;pointer-events:none;opacity:0';
  document.body.appendChild(el);
  return el;
})();

function glitchSlices(intens){
  intens=(intens||1)*I;
  const n=Math.floor(rnd(5,14)*intens);
  const COLS=[
    `rgba(0,212,255,__)`,'rgba(123,47,255,__)','rgba(255,0,80,__)','rgba(0,255,153,__)',
    'rgba(255,200,0,__)','rgba(255,80,0,__)'
  ];
  let html='';
  for(let i=0;i<n;i++){
    const top=rnd(0,100).toFixed(1), h=rnd(.3,6*intens).toFixed(1);
    const tx=((Math.random()-.5)*70*intens).toFixed(1);
    const a=(rnd(.04,.18)).toFixed(2);
    const col=pick(COLS).replace('__',a);
    html+=`<div style="position:absolute;left:0;right:0;top:${top}%;height:${h}%;background:${col};transform:translateX(${tx}px)"></div>`;
  }
  _gOv.innerHTML=html; _gOv.style.opacity='1';
  const wr=document.getElementById('wrapper');
  if(wr){ const sx=((Math.random()-.5)*14*intens).toFixed(1),sy=((Math.random()-.5)*5*intens).toFixed(1),sk=((Math.random()-.5)*2).toFixed(2);
    wr.style.transition='none'; wr.style.transform=`translate(${sx}px,${sy}px) skewX(${sk}deg)`;
    setTimeout(()=>wr.style.transform='none',75); }
  setTimeout(()=>_gOv.style.opacity='0', 55+rnd(0,90));
  if(coin(.45)) setTimeout(()=>{ _gOv.innerHTML='<div style="position:absolute;inset:0;background:rgba(0,212,255,0.04)"></div>'; _gOv.style.opacity='1'; setTimeout(()=>_gOv.style.opacity='0',45); },150+rnd(0,60));
}

/* ─────────────────────────────────────────────
   RANDOMIZED EFFECT POOL
   Each call randomly picks from a pool of effects
   so every interaction feels different.
───────────────────────────────────────────── */

// Effect: chromatic aberration on an element
function fx_chroma(el, intensity){
  intensity = (intensity||1)*I;
  const rx=(Math.random()-.5)*12*intensity, ry=(Math.random()-.5)*5*intensity;
  const bx=(Math.random()-.5)*12*intensity, by=(Math.random()-.5)*5*intensity;
  const orig=el.style.textShadow||'';
  el.style.textShadow=`${rx}px ${ry}px 0 rgba(255,0,80,0.85),${bx}px ${by}px 0 rgba(0,212,255,0.85)`;
  setTimeout(()=>el.style.textShadow=orig, 60+rnd(0,100));
}

// Effect: pixel shift / skew on an element
function fx_shift(el, intensity){
  intensity=(intensity||1)*I;
  const sx=((Math.random()-.5)*10*intensity).toFixed(1);
  const sy=((Math.random()-.5)*5*intensity).toFixed(1);
  const sk=((Math.random()-.5)*3*intensity).toFixed(2);
  el.style.transition='none';
  el.style.transform=`translate(${sx}px,${sy}px) skewX(${sk}deg)`;
  setTimeout(()=>{ el.style.transform=''; el.style.transition=''; },70+rnd(0,80));
}

// Effect: flicker opacity on an element
function fx_flicker(el){
  let i=0; const steps=2+Math.floor(rnd(1,5));
  const t=setInterval(()=>{
    el.style.opacity=(rnd(.3,1)).toFixed(2);
    if(++i>=steps){ clearInterval(t); el.style.opacity=''; }
  },35);
}

// Effect: color invert flash on element
function fx_invert(el){
  el.style.filter='invert(1) hue-rotate(90deg)';
  setTimeout(()=>el.style.filter='',55+rnd(0,60));
}

// Effect: text scramble on element (picks random chars, resolves back)
function fx_scramble(el, duration){
  duration=duration||300;
  const orig=el.textContent;
  if(orig.trim().length<1) return;
  let iters=0, total=orig.length;
  clearInterval(el._sc);
  el._sc=setInterval(()=>{
    el.textContent=orig.split('').map((c,i)=>{
      if(c===' ') return ' ';
      if(i<iters) return orig[i];
      return GC[Math.floor(Math.random()*GC.length)];
    }).join('');
    iters+=.7;
    if(iters>=total){ el.textContent=orig; clearInterval(el._sc); }
  },28);
}

// Effect: border pulse on element
function fx_border(el){
  const colors=['#00d4ff','#7b2fff','#ff3366','#00ff99','#ff9900'];
  const c=pick(colors);
  const orig=el.style.boxShadow||'';
  el.style.boxShadow=`0 0 16px ${c}, 0 0 40px ${c}66, inset 0 0 10px ${c}22`;
  el.style.borderColor=c;
  setTimeout(()=>{ el.style.boxShadow=orig; el.style.borderColor=''; },200+rnd(0,200));
}

// Effect: scanline overlay burst on element
function fx_scanlines(el){
  const ov=document.createElement('div');
  ov.style.cssText='position:absolute;inset:0;z-index:999;pointer-events:none;background:repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.25) 2px,rgba(0,0,0,0.25) 4px);animation:scanRoll .4s linear';
  el.style.position='relative'; el.appendChild(ov);
  setTimeout(()=>ov.remove(),400);
}

// Effect: whole-page glitch burst (slices + full shake)
function fx_bigburst(intens){
  glitchSlices(intens||1.4);
  if(coin(.5)) setTimeout(()=>glitchSlices((intens||1.4)*.7),120);
}

// Effect: RGB split of entire page
function fx_rgbPage(intens){
  intens=(intens||1)*I;
  document.body.style.filter=`contrast(${1+intens*.3}) saturate(${1+intens*.5})`;
  const wr=document.getElementById('wrapper');
  if(wr){ wr.style.transition='none'; wr.style.textShadow=`${rnd(-4,4)*intens}px 0 rgba(255,0,80,.4),${rnd(-4,4)*intens}px 0 rgba(0,212,255,.4)`; }
  setTimeout(()=>{ document.body.style.filter=''; if(wr){ wr.style.textShadow=''; } },80+rnd(0,60));
}

// Effect: quick white/cyan flash
function fx_flash(){
  const fl=document.createElement('div');
  const cols=['rgba(0,212,255,0.08)','rgba(123,47,255,0.08)','rgba(255,255,255,0.05)','rgba(255,0,80,0.06)'];
  fl.style.cssText=`position:fixed;inset:0;z-index:9989;pointer-events:none;background:${pick(cols)}`;
  document.body.appendChild(fl);
  setTimeout(()=>fl.remove(), 60+rnd(0,80));
}

// Effect: horizontal tear (a band shifts hard)
function fx_tear(){
  const band=document.createElement('div');
  const topPct=rnd(10,80).toFixed(0);
  const tx=((Math.random()-.5)*80*I).toFixed(0);
  band.style.cssText=`position:fixed;left:0;right:0;top:${topPct}%;height:${rnd(2,8).toFixed(0)}px;z-index:9991;pointer-events:none;background:rgba(0,0,0,.9);transform:translateX(${tx}px);mix-blend-mode:difference`;
  document.body.appendChild(band);
  setTimeout(()=>band.remove(), 80+rnd(0,60));
}

// Pick a RANDOM effect from the pool for "light" interactions
function randomLightFX(el){
  const pool=[
    ()=>glitchSlices(rnd(.2,.6)),
    ()=>fx_chroma(el, rnd(.5,1.2)),
    ()=>fx_shift(el, rnd(.4,1)),
    ()=>fx_flicker(el),
    ()=>fx_border(el),
    ()=>fx_flash(),
    ()=>fx_tear(),
  ];
  pick(pool)();
}

// Pick a RANDOM effect for "medium" interactions (hover confirmed, card hover)
function randomMedFX(el){
  const pool=[
    ()=>glitchSlices(rnd(.5,1.2)),
    ()=>{ fx_chroma(el,rnd(.8,1.8)); glitchSlices(rnd(.3,.7)); },
    ()=>{ fx_shift(el,rnd(.8,1.5)); fx_flash(); },
    ()=>{ fx_scramble(el,400); glitchSlices(.5); },
    ()=>{ fx_border(el); fx_tear(); },
    ()=>fx_bigburst(.8),
    ()=>{ fx_rgbPage(.7); fx_shift(el,.8); },
    ()=>{ fx_invert(el); setTimeout(()=>glitchSlices(.6),80); },
    ()=>fx_scanlines(el),
    ()=>{ fx_tear(); fx_tear(); fx_chroma(el,1.2); },
  ];
  pick(pool)();
}

// Pick a RANDOM effect for "heavy" interactions (click, mousedown)
function randomHeavyFX(el){
  const pool=[
    ()=>{ glitchSlices(rnd(1.2,2)); setTimeout(()=>glitchSlices(.9),110); },
    ()=>{ fx_chroma(el,2); fx_bigburst(1.5); },
    ()=>{ fx_shift(el,2); fx_rgbPage(1.2); glitchSlices(1); },
    ()=>{ fx_scramble(el,500); fx_bigburst(1.2); },
    ()=>{ fx_invert(el); fx_bigburst(1.3); fx_tear(); },
    ()=>{ fx_border(el); glitchSlices(1.8); fx_rgbPage(1); },
    ()=>{ fx_tear(); fx_tear(); fx_tear(); glitchSlices(1.5); },
    ()=>{ fx_flash(); fx_flash(); fx_rgbPage(1.5); fx_scramble(el,400); },
    ()=>{ fx_bigburst(2); setTimeout(()=>fx_bigburst(1),180); },
    ()=>{ fx_chroma(el,2.5); fx_shift(el,2); fx_tear(); fx_flash(); },
  ];
  pick(pool)();
}

/* ─────────────────────────────────────────────
   ATTACH GLITCH TO ALL LINKS
───────────────────────────────────────────── */
(function(){
  if(!VCFG.hoverGlitch && !VCFG.clickGlitch) return;
  document.querySelectorAll('a').forEach(link=>{
    if(VCFG.hoverGlitch){
      link.addEventListener('mouseenter',()=>{
        if(coin(.35*F)) randomLightFX(link);
      });
    }
    if(VCFG.clickGlitch){
      link.addEventListener('mousedown',()=>{
        if(coin(.55*F)) randomMedFX(link);
        if(coin(.05*F) && window._showFakeError) setTimeout(window._showFakeError,350);
      });
    }
  });
})();

/* ─────────────────────────────────────────────
   ATTACH GLITCH TO FEATURE CARDS + PANELS
───────────────────────────────────────────── */
(function(){
  if(!VCFG.cardGlitch) return;
  document.querySelectorAll('.feature-card').forEach(card=>{
    card.addEventListener('mouseenter',()=>{
      if(coin(.8*F)){
        randomMedFX(card);
        const title=card.querySelector('.fc-title');
        if(title && coin(.7)) fx_scramble(title,350);
      }
    });
    card.addEventListener('mousedown',()=>{
      if(coin(.9*F)) randomHeavyFX(card);
    });
  });

  // Panels get subtler treatment
  document.querySelectorAll('.panel').forEach(panel=>{
    panel.addEventListener('mouseenter',()=>{
      if(coin(.18*F)) randomLightFX(panel);
    });
    panel.addEventListener('mousedown',()=>{
      if(coin(.3*F)) randomMedFX(panel);
    });
  });
})();

/* ─────────────────────────────────────────────
   ATTACH GLITCH TO ALL TEXT ELEMENTS
   h1, h2, h3, .panel p, li, badge, etc.
───────────────────────────────────────────── */
(function(){
  const textEls=document.querySelectorAll('h2,h3,.badge,.hbadge,.tagline,.small-note,.announce-ticker-inner');
  textEls.forEach(el=>{
    el.addEventListener('mouseenter',()=>{
      if(coin(.45*F)){
        const r=Math.random();
        if(r<.33) fx_scramble(el, 300);
        else if(r<.66) fx_chroma(el, rnd(.6,1.4));
        else { fx_chroma(el,.8); glitchSlices(.4); }
      }
    });
  });

  // Table rows hover
  document.querySelectorAll('table.downloads tr').forEach(row=>{
    row.addEventListener('mouseenter',()=>{
      if(coin(.25*F)){
        const r=Math.random();
        if(r<.5) glitchSlices(.3);
        else fx_tear();
      }
    });
  });
})();

/* ─────────────────────────────────────────────
   data-glitch LOGO HOVER (scramble + chroma)
───────────────────────────────────────────── */
(function(){
  document.querySelectorAll('[data-glitch]').forEach(el=>{
    const orig=el.textContent;
    el.addEventListener('mouseenter',()=>{
      clearInterval(el._gt); let iters=0;
      el._gt=setInterval(()=>{
        el.textContent=orig.split('').map((c,i)=>{
          if(i<iters) return orig[i];
          if(c===' ') return ' ';
          return GC[Math.floor(Math.random()*GC.length)];
        }).join('');
        iters+=.6; if(iters>=orig.length){ el.textContent=orig; clearInterval(el._gt); }
      },28);
      // Also do a random extra effect
      if(coin(.6)) setTimeout(()=>randomLightFX(el),80);
    });
  });
})();

/* ─────────────────────────────────────────────
   IDLE RANDOM GLITCHES (scheduled)
───────────────────────────────────────────── */
(function(){
  const IDLE_EFFECTS=[
    ()=>glitchSlices(rnd(.4,1)),
    ()=>{ glitchSlices(.6); fx_tear(); },
    ()=>fx_tear(),
    ()=>fx_flash(),
    ()=>fx_rgbPage(.5),
    ()=>{ fx_tear(); fx_tear(); },
  ];
  function sched(){
    const delay=rnd(4000,10000)/F;
    setTimeout(()=>{ pick(IDLE_EFFECTS)(); sched(); },delay);
  }
  sched();
})();

/* ─────────────────────────────────────────────
   CHROMATIC ABERRATION ON LOGO (periodic)
───────────────────────────────────────────── */
(function(){
  if(!VCFG.chromaAb) return;
  const logo=document.querySelector('#logo-text h1');
  if(!logo) return;
  function ab(){
    fx_chroma(logo, rnd(.8,2));
    if(coin(.4)) setTimeout(()=>fx_chroma(logo,rnd(.5,1.2)),120);
    setTimeout(()=>{
      logo.style.textShadow='0 0 10px var(--accent1),0 0 30px rgba(0,180,255,0.3)';
    },160);
  }
  (function s(){ setTimeout(()=>{ ab(); s(); },rnd(3000,7000)/F); })();
})();

/* ─────────────────────────────────────────────
   CRT FLICKER
───────────────────────────────────────────── */
(function(){
  if(!VCFG.crtFlicker) return;
  function flicker(){
    const steps=2+Math.floor(rnd(1,4)); let i=0;
    const t=setInterval(()=>{
      document.body.style.filter=`brightness(${rnd(.78,.96)})`;
      if(++i>=steps){ clearInterval(t); document.body.style.filter=''; }
    },38);
    setTimeout(flicker,rnd(6000,16000)/F);
  }
  setTimeout(flicker,rnd(3000,6000));
})();

/* ─────────────────────────────────────────────
   SIGNAL LOST
───────────────────────────────────────────── */
(function(){
  if(!VCFG.signalLost) return;
  function sl(){
    document.body.style.filter='contrast(200%) brightness(0.3) saturate(0)';
    setTimeout(()=>{ document.body.style.filter='brightness(1.4)'; setTimeout(()=>document.body.style.filter='',55); },80+rnd(0,100));
    setTimeout(sl,rnd(25000,45000)/F);
  }
  setTimeout(sl,rnd(20000,35000));
})();

/* ─────────────────────────────────────────────
   NAVBAR SCRAMBLE
───────────────────────────────────────────── */
(function(){
  if(!VCFG.navScramble) return;
  function gnav(){
    const links=document.querySelectorAll('#navbar a');
    if(!links.length) return;
    const count=coin(.3)?2:1;
    for(let c=0;c<count;c++){
      const el=pick([...links]);
      const orig=el.textContent; let i=0;
      const t=setInterval(()=>{
        el.textContent=orig.split('').map(ch=>ch===' '?' ':GC[Math.floor(Math.random()*GC.length)]).join('');
        if(++i>7){ el.textContent=orig; clearInterval(t); }
      },38);
    }
    // sometimes also do a tear alongside
    if(coin(.4)) fx_tear();
  }
  (function s(){ setTimeout(()=>{ gnav(); s(); },rnd(7000,14000)/F); })();
})();

/* ─────────────────────────────────────────────
   FAKE ERRORS
───────────────────────────────────────────── */
(function(){
  if(!VCFG.fakeErrors) return;

  const ERRORS=[
    {title:'KERNEL PANIC',body:'UNEXPECTED KERNEL MODE TRAP\nSTOP: 0x0000007E\nvidplayer.sys has caused an error.\nDumping memory... [done]\nPress F8 to continue or wait.',bg:'#000080',fg:'#ffffff',type:'bsod'},
    {title:'RUNTIME ERROR',body:'Exception in thread "audio" NullPointerException\n  at vidplayer.core.AudioEngine.tick(line 337)\n  at vidplayer.core.PlaybackThread.run(line 88)\nAttempting recovery...',bg:'#080808',fg:'#cc0000',type:'console'},
    {title:'SYSTEM WARNING',body:'WARNING: vidplayer.exe accessed invalid memory\nAddress: 0xDEADBEEF  Status: RECOVERED\nBuffer reallocated. Continuing...\nThis incident has been logged.',bg:'#0a0f0a',fg:'#ffff00',type:'warning'},
    {title:'CONNECTION LOST',body:'ERR_NETWORK_CHANGED\nFailed to reach assets.vidplayer.hq:443\nRetrying... [1/3]... [2/3]... [3/3] FAILED\nFalling back to local cache.',bg:'#050010',fg:'#00ccff',type:'network'},
    {title:'AUDIO ENGINE',body:'WaveOut device busy — waiting for lock...\nSample rate mismatch: 44100 vs 48000\nResampling via libresample... OK\nBuffer underrun count: 3',bg:'#0f0800',fg:'#ff9900',type:'warning'},
    {title:'CHECKSUM FAIL',body:'CRC32 mismatch: playlist.dat\nExpected: 0xABCDEF12\nGot:      0x00000000\nFile may be corrupted. Rebuilding index...',bg:'#080808',fg:'#ff3366',type:'console'},
    {title:'VIDPLAYER.EXE',body:'Access violation @ 0xFFFFFFFF\nModule: QtCore.dll +0x004A3C\nCorrupted stack frame detected.\nDumping core... [████████░░] 82%',bg:'#050505',fg:'#00ff99',type:'console'},
    {title:'MEMORY LEAK',body:'Heap fragmentation detected.\nAllocated: 2.1 GB / Available: 512 MB\nGarbage collector running...\nFreed: 847 MB  Time: 0.003ms — OK',bg:'#080508',fg:'#cc44ff',type:'warning'},
    {title:'DISK I/O ERROR',body:'Sector read failure on drive C:\\\nLBA: 0x00FF3301  Retry 3/3 FAILED\nFalling back to cached data.\nRun chkdsk /f to repair.',bg:'#050505',fg:'#ffaa00',type:'console'},
    {title:'AUDIO BUFFER',body:'DirectSound buffer underrun x12\nFalling back to WaveOut...\nWaveOut initialised OK\nLatency: 340ms (HIGH)',bg:'#080808',fg:'#00ffcc',type:'warning'},
  ];

  const style=document.createElement('style');
  style.textContent=`
    @keyframes errIn  { from{opacity:0;transform:translateY(-8px) skewX(2deg)} to{opacity:1;transform:none} }
    @keyframes errOut { from{opacity:1} to{opacity:0;transform:skewX(-3deg) scaleX(0.97)} }
    @keyframes scanRoll { from{background-position:0 0} to{background-position:0 400px} }
    .panel-hidden  { opacity:0; transform:translateX(-10px); transition:opacity .4s ease,transform .4s ease }
    .panel-visible { opacity:1; transform:none }
  `;
  document.head.appendChild(style);

  function showError(){
    const e=pick(ERRORS);
    const isBsod=e.type==='bsod';
    const box=document.createElement('div');
    box.style.cssText=[
      'position:fixed',
      isBsod?'inset:0':`top:${rnd(8,55)}%`,
      isBsod?'':`left:${rnd(4,45)}%`,
      'z-index:999990',
      `background:${e.bg}`,
      isBsod?'':'width:390px',
      `border:${isBsod?'none':`1px solid ${e.fg}44`}`,
      `padding:${isBsod?'10% 12%':'16px 18px'}`,
      'font-family:monospace',
      `font-size:${isBsod?'14px':'11px'}`,
      `color:${e.fg}`,
      `box-shadow:${isBsod?'none':`0 0 30px ${e.fg}33`}`,
      'pointer-events:none',
      'animation:errIn .12s ease both',
      'letter-spacing:.5px','line-height:1.75','white-space:pre'
    ].filter(Boolean).join(';');

    const h=document.createElement('div');
    h.style.cssText=`font-weight:700;font-size:${isBsod?'20px':'12px'};margin-bottom:10px;letter-spacing:${isBsod?'3':'1'}px;color:${e.fg}`;
    h.textContent=isBsod?`A problem has been detected.\n\n${e.title}`:` ► [${e.title}]`;

    const b=document.createElement('pre');
    b.style.cssText='margin:0;font-family:inherit;font-size:inherit;white-space:pre-wrap';

    const note=document.createElement('div');
    note.style.cssText=`margin-top:${isBsod?'40':'10'}px;font-size:10px;opacity:.5`;
    note.textContent=isBsod?'Collecting error information (100% complete)\n\nThis window will close automatically.':'// auto-dismiss';

    box.appendChild(h);box.appendChild(b);box.appendChild(note);
    document.body.appendChild(box);

    glitchSlices(isBsod?2.5*I:1.3*I);
    if(isBsod){ const fl=document.createElement('div');
      fl.style.cssText='position:fixed;inset:0;z-index:999989;background:#000088;opacity:.6;pointer-events:none';
      document.body.appendChild(fl); setTimeout(()=>fl.remove(),100); }

    const full=e.body; let ci=0;
    const tw=setInterval(()=>{ b.textContent=full.slice(0,ci+=2); if(ci>full.length) clearInterval(tw); },15);

    const life=isBsod?3200:rnd(3200,4500);
    setTimeout(()=>{
      glitchSlices(.8); box.style.animation='errOut .3s ease forwards';
      setTimeout(()=>box.remove(),320);
    },life);
  }

  window._showFakeError=showError;
  (function s(){ setTimeout(()=>{ showError(); s(); },rnd(18000,38000)/F); })();
})();

/* ─────────────────────────────────────────────
   PAGE TRANSITION WITH GLITCH
───────────────────────────────────────────── */
(function(){
  const ov=document.createElement('div');
  ov.style.cssText='position:fixed;inset:0;z-index:99998;background:rgba(0,8,20,0);pointer-events:none;transition:background .18s';
  document.body.appendChild(ov);

  const msg=document.createElement('div');
  msg.style.cssText='position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);z-index:99999;pointer-events:none;opacity:0;font-family:monospace;font-size:12px;color:#00d4ff;letter-spacing:2px;text-align:center;text-shadow:0 0 8px #00d4ff;line-height:1.9;white-space:pre';
  document.body.appendChild(msg);

  const LINES=['LOADING PAGE...','REDIRECTING...','CHECKSUM OK','INITIALISING MODULE...','DECRYPTING ASSETS...','CACHE HIT','ROUTE RESOLVED','VIDPLAYER.EXE READY','READING DISK...','VERIFYING CRC...','DECOMPRESSING...','ALLOCATING MEMORY...'];

  document.querySelectorAll('a[href]').forEach(link=>{
    const href=link.getAttribute('href');
    if(!href||href.startsWith('#')||href.startsWith('http')||href.startsWith('mailto')||link.target==='_blank') return;
    link.addEventListener('click',e=>{
      e.preventDefault();
      // 3 cascading heavy bursts
      randomHeavyFX(link);
      setTimeout(()=>glitchSlices(1.6),100);
      setTimeout(()=>glitchSlices(1.0),220);
      setTimeout(()=>fx_tear(),150);
      ov.style.background='rgba(0,8,20,0.96)';
      msg.style.opacity='1';
      msg.textContent=pick(LINES);
      let fl=0;
      const ft=setInterval(()=>{
        msg.textContent=coin(.5)?pick(LINES):Array.from({length:20},()=>GC[Math.floor(Math.random()*GC.length)]).join('');
        if(++fl>8) clearInterval(ft);
      },55);
      setTimeout(()=>window.location=href,560);
    });
  });

  addEventListener('pageshow',()=>{
    ov.style.background='rgba(0,8,20,0)';
    msg.style.opacity='0';
    setTimeout(()=>glitchSlices(.9),130);
    setTimeout(()=>fx_tear(),200);
  });
})();

/* ─────────────────────────────────────────────
   PANEL ENTRANCE (IntersectionObserver)
───────────────────────────────────────────── */
(function(){
  if(!('IntersectionObserver' in window)) return;
  const obs=new IntersectionObserver(entries=>{
    entries.forEach(e=>{
      if(e.isIntersecting){
        e.target.classList.add('panel-visible');
        // tiny glitch as each panel appears
        if(coin(.5)) setTimeout(()=>glitchSlices(.4),200);
        obs.unobserve(e.target);
      }
    });
  },{threshold:.06});
  document.querySelectorAll('.panel').forEach(p=>{ p.classList.add('panel-hidden'); obs.observe(p); });
})();

/* ─────────────────────────────────────────────
   TICKER TEXT OVERRIDE (from admin)
───────────────────────────────────────────── */
(function(){
  if(!VCFG.ticker) return;
  const ticker=document.querySelector('.announce-ticker-inner');
  if(ticker) ticker.textContent=VCFG.ticker;
})();

/* ─────────────────────────────────────────────
   ANNOUNCE-BAR HOVER
───────────────────────────────────────────── */
(function(){
  const bar=document.querySelector('.announce-bar');
  if(!bar) return;
  bar.addEventListener('mouseenter',()=>{
    if(coin(.5*F)) randomLightFX(bar);
  });
})();
