(function(){
  const ROOT_SELECTOR='[data-read-aloud-root],.read-aloud-root';
  const SKIP_SELECTOR='[data-no-read-aloud],.no-read-aloud,nav,form,button,input,select,textarea,script,style,noscript,template,dialog,[hidden],[aria-hidden="true"]';
  const CHUNK_SELECTOR='.page-title,.page-subtitle,.page-meta,.dispatch,.sd-box,.notice,blockquote,section h2,section h3,section p,section li,section figcaption,section table tr,.terminal';
  const STORAGE={voice:'tsbArchiveReader.voice',rate:'tsbArchiveReader.rate',follow:'tsbArchiveReader.follow'};
  const state={
    mode:'idle',
    chunks:[],
    index:0,
    session:0,
    utterance:null,
    voices:[],
    highlighted:null,
    media:[],
    timer:0
  };

  function prefGet(key,fallback){
    try{
      const value=window.localStorage.getItem(key);
      return value===null?fallback:value;
    }catch(error){
      return fallback;
    }
  }

  function prefSet(key,value){
    try{
      window.localStorage.setItem(key,value);
    }catch(error){}
  }

  function clamp(value,min,max){
    return Math.min(max,Math.max(min,value));
  }

  function normalize(text){
    return String(text||'').replace(/\s+/g,' ').trim();
  }

  function isHidden(element){
    if(element.hidden||element.getAttribute('aria-hidden')==='true')return true;
    const style=window.getComputedStyle(element);
    if(style.display==='none'||style.visibility==='hidden')return true;
    return element.getClientRects().length===0;
  }

  function textFor(element){
    if(element.matches('tr')){
      return [...element.cells].map(cell=>normalize(cell.innerText||cell.textContent)).filter(Boolean).join('. ');
    }
    return normalize(element.innerText||element.textContent);
  }

  function collectChunks(root){
    const chunks=[];
    const seen=new Set();
    const candidates=[...root.querySelectorAll(CHUNK_SELECTOR)];
    for(const element of candidates){
      if(element.closest(SKIP_SELECTOR))continue;
      if(isHidden(element))continue;
      const groupedAncestor=element.parentElement&&element.parentElement.closest('.sd-box,.notice,.terminal,blockquote');
      if(groupedAncestor&&!element.matches('.sd-box,.notice,.terminal,blockquote'))continue;
      const text=textFor(element);
      if(!text||seen.has(text))continue;
      seen.add(text);
      chunks.push({element,text});
    }
    return chunks;
  }

  function init(){
    const root=document.querySelector(ROOT_SELECTOR);
    if(!root)return;

    const supported=typeof window.speechSynthesis!=='undefined'&&typeof window.SpeechSynthesisUtterance!=='undefined';
    const synth=supported?window.speechSynthesis:null;
    const panel=document.createElement('section');
    panel.className='archive-reader no-read-aloud';
    panel.dataset.noReadAloud='';
    panel.setAttribute('aria-label','Archive audio reader');
    panel.innerHTML=[
      '<div class="archive-reader__head">',
      '<strong>ARCHIVE AUDIO READER</strong>',
      '<span class="archive-reader__status" aria-live="polite">Status: <span data-reader-status>Ready</span></span>',
      '</div>',
      '<div class="archive-reader__grid">',
      '<div class="archive-reader__buttons">',
      '<button type="button" data-reader-start title="Read this archive entry from the beginning" aria-label="Read entry">Read Entry</button>',
      '<button type="button" data-reader-pause title="Pause or resume archive narration" aria-label="Pause narration" disabled>Pause</button>',
      '<button type="button" data-reader-stop title="Stop archive narration" aria-label="Stop narration" disabled>Stop</button>',
      '</div>',
      '<div class="archive-reader__settings">',
      '<label class="archive-reader__field"><span>Voice:</span><select data-reader-voice aria-label="Reader voice"><option value="">System Default</option></select></label>',
      '<label class="archive-reader__field archive-reader__speed"><span>Speed: <output data-reader-speed-output>1.00x</output></span><input data-reader-rate type="range" min="0.75" max="1.5" step="0.05" value="1" aria-label="Reader speed"></label>',
      '<label class="archive-reader__follow"><input data-reader-follow type="checkbox"> Follow current section</label>',
      '</div>',
      '</div>'
    ].join('');

    const insertAfter=root.querySelector('.page-meta')||root.querySelector('.page-subtitle')||root.querySelector('.page-title');
    if(insertAfter)insertAfter.insertAdjacentElement('afterend',panel);
    else root.prepend(panel);

    const mini=document.createElement('div');
    mini.className='archive-reader-mini no-read-aloud';
    mini.dataset.noReadAloud='';
    mini.hidden=true;
    mini.setAttribute('role','region');
    mini.setAttribute('aria-label','Archive audio reader mini controls');
    mini.innerHTML=[
      '<strong>Reader</strong>',
      '<span data-reader-mini-status>Ready</span>',
      '<button type="button" data-reader-mini-pause title="Pause or resume narration" aria-label="Pause narration">Pause</button>',
      '<button type="button" data-reader-mini-stop title="Stop narration" aria-label="Stop narration">Stop</button>'
    ].join('');
    document.body.appendChild(mini);

    const controls={
      start:panel.querySelector('[data-reader-start]'),
      pause:panel.querySelector('[data-reader-pause]'),
      stop:panel.querySelector('[data-reader-stop]'),
      voice:panel.querySelector('[data-reader-voice]'),
      rate:panel.querySelector('[data-reader-rate]'),
      rateOutput:panel.querySelector('[data-reader-speed-output]'),
      follow:panel.querySelector('[data-reader-follow]'),
      status:panel.querySelector('[data-reader-status]'),
      mini,
      miniStatus:mini.querySelector('[data-reader-mini-status]'),
      miniPause:mini.querySelector('[data-reader-mini-pause]'),
      miniStop:mini.querySelector('[data-reader-mini-stop]')
    };

    function setStatus(text){
      controls.status.textContent=text;
      controls.miniStatus.textContent=text;
    }

    function setMiniVisible(visible){
      controls.mini.hidden=!visible;
      document.body.classList.toggle('has-archive-reader-mini',visible);
    }

    function active(){
      return state.mode==='reading'||state.mode==='paused';
    }

    function updateControls(){
      const isActive=active();
      controls.start.textContent=isActive?'Restart Entry':'Read Entry';
      controls.start.setAttribute('aria-label',isActive?'Restart entry':'Read entry');
      controls.pause.disabled=!isActive;
      controls.stop.disabled=!isActive;
      controls.miniPause.disabled=!isActive;
      controls.miniStop.disabled=!isActive;
      const pauseLabel=state.mode==='paused'?'Resume':'Pause';
      controls.pause.textContent=pauseLabel;
      controls.miniPause.textContent=pauseLabel;
      controls.pause.setAttribute('aria-label',state.mode==='paused'?'Resume narration':'Pause narration');
      controls.miniPause.setAttribute('aria-label',state.mode==='paused'?'Resume narration':'Pause narration');
      setMiniVisible(isActive);
    }

    function clearHighlight(){
      if(state.highlighted)state.highlighted.classList.remove('read-aloud-current');
      state.highlighted=null;
    }

    function highlight(element){
      clearHighlight();
      state.highlighted=element;
      element.classList.add('read-aloud-current');
      if(controls.follow.checked){
        element.scrollIntoView({behavior:'smooth',block:'center',inline:'nearest'});
      }
    }

    function selectedVoice(){
      const name=controls.voice.value;
      if(!name)return null;
      return state.voices.find(voice=>voice.name===name)||null;
    }

    function currentRate(){
      return clamp(Number(controls.rate.value)||1,.75,1.5);
    }

    function populateVoices(){
      if(!supported)return;
      const preferred=controls.voice.value||prefGet(STORAGE.voice,'');
      state.voices=synth.getVoices();
      controls.voice.innerHTML='';
      const defaultOption=document.createElement('option');
      defaultOption.value='';
      defaultOption.textContent='System Default';
      controls.voice.appendChild(defaultOption);
      for(const voice of state.voices){
        const option=document.createElement('option');
        option.value=voice.name;
        option.textContent=`${voice.name}${voice.lang?' / '+voice.lang:''}${voice.default?' / Default':''}`;
        controls.voice.appendChild(option);
      }
      if(preferred&&state.voices.some(voice=>voice.name===preferred))controls.voice.value=preferred;
      else controls.voice.value='';
    }

    function pauseActiveMedia(){
      if(state.media.length)return;
      state.media=[...document.querySelectorAll('audio,video')]
        .filter(media=>!media.paused&&!media.ended)
        .map(media=>({media}));
      for(const item of state.media){
        try{item.media.pause();}catch(error){}
      }
    }

    function restoreMedia(){
      const mediaToRestore=state.media;
      state.media=[];
      for(const item of mediaToRestore){
        const media=item.media;
        if(!document.contains(media)||!media.paused||media.ended)continue;
        try{
          const playResult=media.play();
          if(playResult&&typeof playResult.catch==='function')playResult.catch(()=>{});
        }catch(error){}
      }
    }

    function finishReading(){
      state.mode='finished';
      state.utterance=null;
      clearHighlight();
      restoreMedia();
      setStatus('Finished');
      updateControls();
    }

    function failReading(){
      state.mode='idle';
      state.utterance=null;
      clearHighlight();
      restoreMedia();
      setStatus('Speech synthesis error');
      updateControls();
    }

    function speakCurrent(session){
      state.timer=0;
      if(session!==state.session||state.mode!=='reading')return;
      if(state.index>=state.chunks.length){
        finishReading();
        return;
      }
      const chunk=state.chunks[state.index];
      highlight(chunk.element);
      setStatus(`Reading section ${state.index+1} of ${state.chunks.length}`);
      const utterance=new SpeechSynthesisUtterance(chunk.text);
      utterance.rate=currentRate();
      utterance.voice=selectedVoice();
      utterance.onend=function(){
        if(session!==state.session||state.mode!=='reading')return;
        state.utterance=null;
        state.index+=1;
        window.setTimeout(()=>speakCurrent(session),80);
      };
      utterance.onerror=function(){
        if(session!==state.session||state.mode!=='reading')return;
        failReading();
      };
      state.utterance=utterance;
      synth.speak(utterance);
    }

    function startReading(){
      if(!supported)return;
      const chunks=collectChunks(root);
      if(!chunks.length){
        setStatus('No readable article text found');
        return;
      }
      state.session+=1;
      const session=state.session;
      window.clearTimeout(state.timer);
      synth.cancel();
      clearHighlight();
      pauseActiveMedia();
      state.chunks=chunks;
      state.index=0;
      state.mode='reading';
      setStatus(`Reading section 1 of ${chunks.length}`);
      updateControls();
      state.timer=window.setTimeout(()=>speakCurrent(session),80);
    }

    function stopReading(statusText){
      if(!supported)return;
      state.session+=1;
      window.clearTimeout(state.timer);
      state.timer=0;
      synth.cancel();
      state.mode='idle';
      state.utterance=null;
      state.chunks=[];
      state.index=0;
      clearHighlight();
      restoreMedia();
      setStatus(statusText||'Ready');
      updateControls();
    }

    function togglePause(){
      if(!supported||!active())return;
      if(state.mode==='paused'){
        synth.resume();
        state.mode='reading';
        if(!state.utterance&&state.chunks.length){
          window.clearTimeout(state.timer);
          speakCurrent(state.session);
        }
        setStatus(`Reading section ${state.index+1} of ${state.chunks.length}`);
      }else{
        synth.pause();
        state.mode='paused';
        setStatus('Paused');
      }
      updateControls();
    }

    function respeakCurrentChunk(){
      if(!supported||state.mode!=='reading'||!state.chunks.length)return;
      state.session+=1;
      const session=state.session;
      window.clearTimeout(state.timer);
      synth.cancel();
      state.timer=window.setTimeout(()=>speakCurrent(session),80);
    }

    const savedRate=clamp(Number(prefGet(STORAGE.rate,'1'))||1,.75,1.5);
    controls.rate.value=String(savedRate);
    controls.rateOutput.textContent=savedRate.toFixed(2)+'x';
    controls.follow.checked=prefGet(STORAGE.follow,'false')==='true';

    if(!supported){
      panel.classList.add('is-unavailable');
      controls.start.disabled=true;
      controls.pause.disabled=true;
      controls.stop.disabled=true;
      controls.voice.disabled=true;
      controls.rate.disabled=true;
      controls.follow.disabled=true;
      setStatus('Speech synthesis is not supported by this browser');
      return;
    }

    populateVoices();
    if(typeof synth.addEventListener==='function')synth.addEventListener('voiceschanged',populateVoices);
    else synth.onvoiceschanged=populateVoices;

    controls.start.addEventListener('click',startReading);
    controls.pause.addEventListener('click',togglePause);
    controls.stop.addEventListener('click',()=>stopReading('Ready'));
    controls.miniPause.addEventListener('click',togglePause);
    controls.miniStop.addEventListener('click',()=>stopReading('Ready'));
    controls.voice.addEventListener('change',()=>{
      prefSet(STORAGE.voice,controls.voice.value);
      respeakCurrentChunk();
    });
    controls.rate.addEventListener('input',()=>{
      const rate=currentRate();
      controls.rateOutput.textContent=rate.toFixed(2)+'x';
      prefSet(STORAGE.rate,String(rate));
    });
    controls.rate.addEventListener('change',respeakCurrentChunk);
    controls.follow.addEventListener('change',()=>prefSet(STORAGE.follow,String(controls.follow.checked)));
    window.addEventListener('pagehide',()=>stopReading('Ready'));
    window.addEventListener('beforeunload',()=>stopReading('Ready'));
    window.addEventListener('pageshow',event=>{
      if(event.persisted)stopReading('Ready');
    });
    updateControls();
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
})();
