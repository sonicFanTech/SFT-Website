// Roxzned Setup Designer — Web Demo (separated JS)
// Goal: make everything feel interactive, while staying safe in-browser.

const $ = (id) => document.getElementById(id);
const q = (sel, root=document) => root.querySelector(sel);
const qa = (sel, root=document) => Array.from(root.querySelectorAll(sel));

const STORAGE_KEY = "rsd_webdemo_v1";

// -----------------------------
// Demo state + history
// -----------------------------
let ui = {
  showLineNumbers: true,
  zoom: 1,
  wizardHidden: false,
  lightMode: false,
};

let project = null;

let selectedPageIndex = 0;
let selectedWidgetId = null;

// undo/redo
let history = [];
let histIndex = -1;
let liveChanging = false;

function deepClone(o){ return JSON.parse(JSON.stringify(o)); }
function clamp(n, a, b){ return Math.max(a, Math.min(b, n)); }
function safeNum(v, fallback=0){
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}
function snap(n, step){
  return Math.round(n / step) * step;
}
function gridStep(){ return $("showGrid")?.checked ? 20 : 1; }

function toast(html){
  const t = $("toast");
  t.innerHTML = html;
  t.style.display = "block";
  clearTimeout(toast._tm);
  toast._tm = setTimeout(()=> t.style.display = "none", 2200);
}

// -----------------------------
// Default template
// -----------------------------
function defaultProject(){
  return {
    app_name: "Vidplayer",
    version: "2.0.9.1",
    publisher: "sonic Fan Tech",
    default_install_dir: "%LOCALAPPDATA%\\VidPlayer",
    source_folder: "E:/Projects/Project USB/VS Code/Python/Roxzned Setup installer Designer/Source/data",
    payload_zip: "E:/Projects/Project USB/VS Code/Python/Roxzned Setup installer Designer/Source/payload.zip",
    license_text: "put EULA Here",
    pages: [
      {
        title: "Welcome",
        role: "welcome",
        bgColor: "#151515",
        bgImage: "",
        widgets: [
          { id:"w1", type:"Label", name:"lblTitle", text:"Welcome to the Setup Wizard for Vidplayer v2.0.9.1", x:24, y:24, w:520, h:36, font:10, bold:false, fg:"#ffffff", bg:"#00000000" },
          { id:"w2", type:"Label", name:"lblBody", text:"This Setup Wizard will setup and install Vidplayer onto your computer, Press the next Button to start", x:24, y:74, w:680, h:50, font:10, bold:false, fg:"#ffffff", bg:"#00000000" },
        ]
      },
      {
        title: "License Agreement",
        role: "license",
        bgColor: "#151515",
        bgImage: "",
        widgets: [
          { id:"w3", type:"Label", name:"lblLic", text:"Please read the license agreement below:", x:24, y:24, w:380, h:24, font:10, bold:true, fg:"#ffffff", bg:"#00000000" },
          { id:"w4", type:"Label", name:"lblHint", text:"(Demo) The real installer shows a scrollable license box here.", x:24, y:56, w:520, h:24, font:10, bold:false, fg:"#cfcfcf", bg:"#00000000" },
          { id:"w5", type:"CheckBox", name:"chkAgree", text:"I accept the agreement", x:24, y:98, w:260, h:20, font:10, bold:false, fg:"#ffffff", bg:"#00000000", checked:false }
        ]
      },
      {
        title: "Choose Install Location",
        role: "path",
        bgColor: "#151515",
        bgImage: "",
        widgets: [
          { id:"w6", type:"Label", name:"lblPath", text:"Choose where you want to install the program:", x:24, y:24, w:420, h:24, font:10, bold:true, fg:"#ffffff", bg:"#00000000" },
          { id:"w7", type:"EditBox", name:"txtPath", text:"%LOCALAPPDATA%\\VidPlayer", x:24, y:60, w:420, h:26, font:10, bold:false, fg:"#ffffff", bg:"#111111" },
          { id:"w8", type:"Button", name:"btnSetPath", text:"Set Path", x:454, y:60, w:92, h:26, font:10, bold:false, fg:"#ffffff", bg:"#232323" },
          { id:"w9", type:"CheckBox", name:"chkDesktop", text:"Make Desktop shortcut", x:24, y:100, w:220, h:20, font:10, bold:false, fg:"#ffffff", bg:"#00000000", checked:true },
        ]
      },
      {
        title: "Installing",
        role: "installing",
        bgColor: "#151515",
        bgImage: "",
        widgets: [
          { id:"w10", type:"Label", name:"lblInst", text:"Installing...", x:24, y:24, w:200, h:24, font:10, bold:true, fg:"#ffffff", bg:"#00000000" },
          { id:"w11", type:"Label", name:"lblInst2", text:"(Demo) Files will be packed + extracted here.", x:24, y:54, w:380, h:24, font:10, bold:false, fg:"#cfcfcf", bg:"#00000000" }
        ]
      },
      {
        title: "Finish",
        role: "finish",
        bgColor: "#151515",
        bgImage: "",
        widgets: [
          { id:"w12", type:"Label", name:"lblDone", text:"Setup is complete.", x:24, y:24, w:220, h:24, font:10, bold:true, fg:"#ffffff", bg:"#00000000" },
          { id:"w13", type:"CheckBox", name:"chkLaunch", text:"Launch Vidplayer", x:24, y:60, w:200, h:20, font:10, bold:false, fg:"#ffffff", bg:"#00000000", checked:true }
        ]
      }
    ]
  };
}

// -----------------------------
// Load / Save (localStorage)
// -----------------------------
function loadFromStorage(){
  try{
    const raw = localStorage.getItem(STORAGE_KEY);
    if(!raw) return null;
    const parsed = JSON.parse(raw);
    if(!parsed || !parsed.project) return null;
    project = parsed.project;
    ui = Object.assign(ui, parsed.ui || {});
    selectedPageIndex = clamp(parsed.selectedPageIndex ?? 0, 0, project.pages.length-1);
    selectedWidgetId = parsed.selectedWidgetId ?? (project.pages[selectedPageIndex]?.widgets?.[0]?.id ?? null);
    return true;
  }catch(e){
    return null;
  }
}

let saveTm = null;
function saveToStorageDebounced(){
  clearTimeout(saveTm);
  saveTm = setTimeout(()=>{
    try{
      const payload = { project, ui, selectedPageIndex, selectedWidgetId };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    }catch(e){ /* ignore */ }
  }, 250);
}

// -----------------------------
// History
// -----------------------------
function historySnapshot(){
  return JSON.stringify({ project, ui, selectedPageIndex, selectedWidgetId });
}
function historyApply(snapshot){
  const s = JSON.parse(snapshot);
  project = s.project;
  ui = Object.assign(ui, s.ui || {});
  selectedPageIndex = clamp(s.selectedPageIndex ?? 0, 0, project.pages.length-1);
  selectedWidgetId = s.selectedWidgetId ?? (project.pages[selectedPageIndex]?.widgets?.[0]?.id ?? null);
  syncAllFromState();
  renderAll();
}
function historyPush(){
  if(liveChanging) return; // don't push during live drag/resize
  const snap = historySnapshot();
  if(histIndex >= 0 && history[histIndex] === snap) return;
  history = history.slice(0, histIndex+1);
  history.push(snap);
  if(history.length > 60) history.shift();
  histIndex = history.length - 1;
}
function undo(){
  if(histIndex <= 0){ toast("<b>Undo</b>: nothing to undo."); return; }
  histIndex -= 1;
  historyApply(history[histIndex]);
  toast("<b>Undo</b>");
}
function redo(){
  if(histIndex >= history.length - 1){ toast("<b>Redo</b>: nothing to redo."); return; }
  histIndex += 1;
  historyApply(history[histIndex]);
  toast("<b>Redo</b>");
}

// -----------------------------
// Getters
// -----------------------------
function getPage(){ return normalizePage(project.pages[selectedPageIndex]); }
function getWidget(){
  const p = getPage();
  return p.widgets.find(w => w.id === selectedWidgetId) || null;
}

function applyCheckboxTargets(w){
  if(!w || w.type !== "CheckBox") return;
  const act = w.action || {};
  if(act.type !== "toggleTargets") return;

  const p = getPage();
  const map = new Map((p.widgets || []).map(x => [x.id, x]));
  const targets = (act.targets || []);
  targets.forEach(id=>{
    const t = map.get(id);
    if(!t) return;
    // enable when checked, disable when unchecked
    t.enabled = !!w.checked;
  });
}


function normalizeWidget(w){
  if(w.visible === undefined) w.visible = true;
  if(w.locked === undefined) w.locked = false;
  return w;
}
function normalizePage(p){
  p.widgets.forEach(normalizeWidget);
  return p;
}

// -----------------------------
// Menus (now hover-switchable while open)
// -----------------------------
const menus = () => qa(".menu");
function closeMenus(){ menus().forEach(m => m.classList.remove("open")); }
function anyMenuOpen(){ return menus().some(m => m.classList.contains("open")); }

function initMenus(){
  menus().forEach(m => {
    m.addEventListener("click", (e)=>{
      e.stopPropagation();
      const was = m.classList.contains("open");
      closeMenus();
      if(!was) m.classList.add("open");
    });

    m.addEventListener("mouseenter", ()=>{
      if(anyMenuOpen()){
        closeMenus();
        m.classList.add("open");
      }
    });

    qa(".dd-item", m).forEach(it => {
      it.addEventListener("click", (e)=>{
        e.stopPropagation();
        closeMenus();
        const act = it.dataset.act;
        if(act) handleAction(act);
      });
    });
  });

  document.addEventListener("click", closeMenus);
}

// -----------------------------
// Renderers
// -----------------------------
function renderPageList(){
  const list = $("pageList");
  list.innerHTML = "";
  project.pages.forEach((p, idx)=>{
    const el = document.createElement("div");
    el.className = "pageItem" + (idx === selectedPageIndex ? " active" : "");
    el.textContent = p.title;
    el.addEventListener("click", ()=>{
      selectedPageIndex = idx;
      selectedWidgetId = getPage().widgets[0]?.id ?? null;
      syncPageFields();
      renderAll();
      historyPush();
      saveToStorageDebounced();
    });
    list.appendChild(el);
  });
}


function renderElementList(){
  const box = $("elementList");
  if(!box) return;
  const p = getPage();
  box.innerHTML = "";

  p.widgets.forEach((w, idx)=>{
    normalizeWidget(w);
    const row = document.createElement("div");
    row.className = "elementItem" + (w.id === selectedWidgetId ? " active" : "");
    row.dataset.id = w.id;

    const left = document.createElement("div");
    left.className = "elementMeta";

    const type = document.createElement("div");
    type.className = "elementType";
    type.textContent = w.type;

    const name = document.createElement("div");
    name.className = "elementName";
    const label = (w.name ? w.name : "(unnamed)") + (w.text ? " — " + w.text : "");
    name.textContent = label;

    left.appendChild(type);
    left.appendChild(name);

    const btns = document.createElement("div");
    btns.className = "elementBtns";

    const eye = document.createElement("div");
    eye.className = "iconBtn " + (w.visible ? "on" : "off");
    eye.title = w.visible ? "Hide" : "Show";
    eye.textContent = "👁";
    eye.addEventListener("click", (ev)=>{
      ev.stopPropagation();
      w.visible = !w.visible;
      renderElementList();
      renderCanvas();
      updateCode(false);
      historyPush();
      saveToStorageDebounced();
      toast("<b>Visibility</b>: " + (w.visible ? "Shown" : "Hidden"));
    });

    const lock = document.createElement("div");
    lock.className = "iconBtn " + (w.locked ? "on" : "off");
    lock.title = w.locked ? "Unlock" : "Lock";
    lock.textContent = "🔒";
    lock.addEventListener("click", (ev)=>{
      ev.stopPropagation();
      w.locked = !w.locked;
      renderElementList();
      renderCanvas();
      updateCode(false);
      historyPush();
      saveToStorageDebounced();
      toast("<b>Lock</b>: " + (w.locked ? "Locked" : "Unlocked"));
    });

    btns.appendChild(eye);
    btns.appendChild(lock);

    row.appendChild(left);
    row.appendChild(btns);

    row.addEventListener("click", ()=>{
      selectWidget(w.id);
      renderElementList();
    });

    row.addEventListener("dblclick", ()=>{
      const newName = prompt("Rename widget (Name):", w.name || "");
      if(newName === null) return;
      w.name = newName.trim();
      syncWidgetFields();
      renderElementList();
      renderCanvas();
      updateCode(false);
      historyPush();
      saveToStorageDebounced();
    });

    box.appendChild(row);
  });
}
function renderCanvas(){
  const canvas = $("canvas");
  const p = getPage();

  // background
  canvas.classList.toggle("gridOn", $("showGrid").checked);
  canvas.style.backgroundColor = p.bgColor || "#151515";
  canvas.style.background = (p.bgColor || "#151515");
  canvas.style.background = (p.bgColor || "#151515");
  if(p.bgImage){
    canvas.style.backgroundImage = `url('${p.bgImage}')`;
    canvas.style.backgroundSize = "cover";
    canvas.style.backgroundPosition = "center";
  }else{
    canvas.style.backgroundImage = "";
  }

  canvas.innerHTML = "";

  p.widgets.forEach((w, idx) => {
    normalizeWidget(w);
    if(w.visible === false) return;
    const el = document.createElement("div");
    el.className = "widget" + (w.id === selectedWidgetId ? " selected" : "");
    el.dataset.id = w.id;

    el.style.left = w.x + "px";
    el.style.top  = w.y + "px";
    el.style.width = w.w + "px";
    el.style.height = w.h + "px";
    el.style.fontSize = w.font + "px";
    el.style.fontWeight = w.bold ? "700" : "400";
    el.style.color = w.fg || "#fff";

    if(w.type === "Button") el.classList.add("btnW");
    if(w.type === "Image") el.classList.add("imgW");

    if(w.bg && w.bg !== "#00000000") el.style.background = w.bg;

    // content per widget type
    if(w.type === "CheckBox"){
      el.style.cursor = "pointer";
      el.innerHTML = `<label style="display:flex; align-items:center; gap:8px; cursor:pointer;">
        <input type="checkbox" ${w.checked ? "checked" : ""} style="accent-color: var(--accent2);" />
        <span>${escapeHtml(w.text)}</span>
      </label>`;
      q("input", el).addEventListener("click", (ev)=>{
        ev.stopPropagation();
        w.checked = ev.target.checked;
        syncWidgetFields();
        updateCode(true);
        historyPush();
        saveToStorageDebounced();
      });
    } else if (w.type === "EditBox"){
      el.style.cursor = "text";
      el.innerHTML = `<input ${w.enabled===false ? "disabled" : ""} value="${escapeAttr(w.text)}" style="width:100%; height:100%; background:#111; border:1px solid #3a3a3a; border-radius:4px; color:#f0f0f0; padding:4px 6px; font-family:var(--font); font-size:inherit;" />`;
      q("input", el).disabled = (w.enabled === false);
      q("input", el).addEventListener("input", (ev)=>{
        w.text = ev.target.value;
        if(selectedWidgetId === w.id) $("wText").value = w.text;
        updateCode(false);
        saveToStorageDebounced();
      });
      q("input", el).addEventListener("change", ()=>{ historyPush(); });
    } else if (w.type === "Image"){
      // If user picked an image, show it; otherwise show placeholder
      const src = w.src || "";
      el.innerHTML = src
        ? `<img alt="" src="${escapeAttr(src)}" style="width:100%; height:100%; object-fit:contain; display:block;">`
        : `<div style="width:100%; height:100%; display:grid; place-items:center; color:#bdbdbd; font-family:var(--mono); font-size:12px;">(Image)</div>`;
    } else {
      el.textContent = w.text;
    }

    // select on click
    el.addEventListener("click", (ev)=>{
      ev.stopPropagation();
      selectWidget(w.id);
    });

    // right-click context menu on a widget
    el.addEventListener("contextmenu", (ev)=>{
      ev.preventDefault();
      ev.stopPropagation();
      selectWidget(w.id);
      const r = $("canvas").getBoundingClientRect();
      closeMenus();
      showCtx(ev.clientX, ev.clientY, ev.clientX - r.left, ev.clientY - r.top);
    });

    // drag
    el.addEventListener("mousedown", (ev)=>startDrag(ev, w, el));

    // widget-specific actions
    if(w.type === "Button"){
      el.addEventListener("dblclick", (ev)=>{
        ev.stopPropagation();
        // demo: Set Path button can "pick folder"
        if(w.name === "btnSetPath"){
          pickFolderForPathWidget(w);
        }else{
          toast("<b>Button</b> double-click (demo).");
        }
      });
    }

    // selected => show resize handles
    if(w.id === selectedWidgetId){
      addHandles(el, w);
    }

    canvas.appendChild(el);
  });

  // click empty canvas => deselect
  canvas.addEventListener("click", ()=>{
    selectedWidgetId = null;
    syncWidgetFields();
    renderCanvas();
    renderElementList();
    updateCode(false);
    saveToStorageDebounced();
  }, { once:true });
}

function addHandles(el, w){
  const dirs = ["nw","n","ne","e","se","s","sw","w"];
  dirs.forEach(dir=>{
    const h = document.createElement("div");
    h.className = "handle " + dir;
    h.dataset.dir = dir;
    h.addEventListener("mousedown", (ev)=>startResize(ev, w, dir));
    el.appendChild(h);
  });
}

function renderAll(){
  renderPageList();
  renderElementList();
  renderCanvas();
  syncWidgetFields();
  updateCode(true);
}

// -----------------------------
// Sync fields
// -----------------------------
function syncAllFromState(){
  // ui classes
  document.body.classList.toggle("wizardHidden", !!ui.wizardHidden);
  document.body.classList.toggle("lightMode", !!ui.lightMode);
  setZoom(ui.zoom, false);
}

function syncProjectFields(){
  $("appName").value = project.app_name;
  $("appVer").value = project.version;
  $("publisher").value = project.publisher;
  $("defaultDir").value = project.default_install_dir;
  $("sourceFolder").value = project.source_folder;
  $("payloadZip").value = project.payload_zip;
  $("licenseText").value = project.license_text;
}

function syncPageFields(){
  const p = getPage();
  $("pageTitle").value = p.title;
  $("pageRole").value = p.role;
  $("bgColor").value = p.bgColor;
  $("bgImage").value = p.bgImage;
}

function selectWidget(id){
  selectedWidgetId = id;
  syncWidgetFields();
  renderCanvas();
  renderElementList();
  updateCode(false);
  saveToStorageDebounced();
}

function disableProps(disabled){
  const ids = ["wName","wText","wX","wY","wW","wH","wFont","wBold","wFg","wBg","wChecked","wEnabled","wAction","wActionUrl","wActionTargets","pickFg","pickWBg"];
  ids.forEach(id=>{ $(id).disabled = disabled; });
  $("selHint").textContent = disabled ? "Select a widget to edit" : "Editing: " + (getWidget()?.name || "");
}

function syncWidgetFields(){
  const w = getWidget();
  if(!w){
    $("wType").value = "-";
    $("wName").value = "";
    $("wText").value = "";
    $("wX").value = 0;
    $("wY").value = 0;
    $("wW").value = 0;
    $("wH").value = 0;
    $("wFont").value = 10;
    $("wBold").checked = false;
    $("wFg").value = "#ffffff";
    $("wBg").value = "#00000000";
    $("wChecked").checked = false;
    disableProps(true);
    return;
  }

  disableProps(false);

  $("wType").value = w.type;
  $("wName").value = w.name || "";
  $("wText").value = w.text || "";
  $("wX").value = w.x;
  $("wY").value = w.y;
  $("wW").value = w.w;
  $("wH").value = w.h;
  $("wFont").value = w.font;
  $("wBold").checked = !!w.bold;
  $("wFg").value = w.fg || "#ffffff";
  $("wBg").value = w.bg || "#00000000";
  $("wChecked").checked = !!w.checked;
  $("wEnabled").checked = (w.enabled !== false);

  // Action UI
  if(widgetSupportsAction(w)){
    const act = getWidgetAction(w);
    $("wAction").value = act.type || "none";
    $("wActionUrl").value = act.url || "";
    populateActionTargets();
    // restore selected targets
    const tgt = new Set((act.targets || []));
    Array.from($("wActionTargets").options).forEach(o=>{ o.selected = tgt.has(o.value); });
    showActionParams($("wAction").value);
  }else{
    $("wAction").value = "none";
    $("wActionUrl").value = "";
    $("wActionTargets").innerHTML = "";
    showActionParams("none");
  }

  // checkbox-only field UX
  $("wChecked").disabled = (w.type !== "CheckBox");
}

// -----------------------------
// Dragging
// -----------------------------
let drag = null;

function startDrag(ev, w, el){
  // don't drag while resizing, and don't drag when clicking inside input
  if(ev.target && ev.target.tagName === "INPUT") return;
  if(ev.target && ev.target.classList?.contains("handle")) return;

  ev.preventDefault();
  ev.stopPropagation();
  selectWidget(w.id);
  if(w.locked){ toast('<b>Locked</b>: unlock in Objects/Elements list to move/resize.'); return; }

  const canvas = $("canvas");
  const r = canvas.getBoundingClientRect();
  const startX = ev.clientX;
  const startY = ev.clientY;

  drag = { w, el, r, startX, startY, ox:w.x, oy:w.y };
  liveChanging = true;

  document.addEventListener("mousemove", onDrag);
  document.addEventListener("mouseup", endDrag);
}

function onDrag(ev){
  if(!drag) return;
  const step = gridStep();
  const { w, r, startX, startY, ox, oy } = drag;
  const dx = ev.clientX - startX;
  const dy = ev.clientY - startY;

  let nx = Math.round(ox + dx);
  let ny = Math.round(oy + dy);

  nx = snap(nx, step);
  ny = snap(ny, step);

  nx = clamp(nx, 0, Math.max(0, Math.floor(r.width - 10)));
  ny = clamp(ny, 0, Math.max(0, Math.floor(r.height - 10)));

  w.x = nx;
  w.y = ny;
  drag.el.style.left = nx + "px";
  drag.el.style.top  = ny + "px";

  $("wX").value = nx;
  $("wY").value = ny;
  updateCode(false);
  saveToStorageDebounced();
}

function endDrag(){
  if(!drag) return;
  drag = null;
  liveChanging = false;
  document.removeEventListener("mousemove", onDrag);
  document.removeEventListener("mouseup", endDrag);
  historyPush();
  saveToStorageDebounced();
  updateCode(true);
}

// -----------------------------
// Resizing
// -----------------------------
let resize = null;

function startResize(ev, w, dir){
  ev.preventDefault();
  ev.stopPropagation();
  selectWidget(w.id);
  if(w.locked){ toast('<b>Locked</b>: unlock in Objects/Elements list to move/resize.'); return; }

  const canvas = $("canvas");
  const r = canvas.getBoundingClientRect();

  resize = {
    w,
    dir,
    r,
    startX: ev.clientX,
    startY: ev.clientY,
    ox: w.x, oy: w.y, ow: w.w, oh: w.h
  };
  liveChanging = true;

  document.addEventListener("mousemove", onResize);
  document.addEventListener("mouseup", endResize);
}

function onResize(ev){
  if(!resize) return;
  const step = gridStep();
  const { w, dir, startX, startY, ox, oy, ow, oh, r } = resize;
  const dx = ev.clientX - startX;
  const dy = ev.clientY - startY;

  let x = ox, y = oy, ww = ow, hh = oh;

  const left = dir.includes("w");
  const right = dir.includes("e");
  const top = dir.includes("n");
  const bottom = dir.includes("s");

  if(left){
    x = ox + dx;
    ww = ow - dx;
  }
  if(right){
    ww = ow + dx;
  }
  if(top){
    y = oy + dy;
    hh = oh - dy;
  }
  if(bottom){
    hh = oh + dy;
  }

  // snap + min size
  x = snap(x, step);
  y = snap(y, step);
  ww = snap(ww, step);
  hh = snap(hh, step);

  ww = Math.max(20, ww);
  hh = Math.max(16, hh);

  // keep inside canvas
  x = clamp(x, 0, Math.max(0, Math.floor(r.width - 10)));
  y = clamp(y, 0, Math.max(0, Math.floor(r.height - 10)));

  w.x = x;
  w.y = y;
  w.w = ww;
  w.h = hh;

  $("wX").value = x;
  $("wY").value = y;
  $("wW").value = ww;
  $("wH").value = hh;

  renderCanvas();
  renderElementList();
  updateCode(false);
  saveToStorageDebounced();
}

function endResize(){
  if(!resize) return;
  resize = null;
  liveChanging = false;
  document.removeEventListener("mousemove", onResize);
  document.removeEventListener("mouseup", endResize);
  historyPush();
  saveToStorageDebounced();
  updateCode(true);
}

// -----------------------------
// Code generation (demo)
// -----------------------------
function escapeAttr(s){
  return String(s).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}
function escapeHtml(s){
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function buildProjectObject(){
  return {
    app_name: project.app_name,
    version: project.version,
    publisher: project.publisher,
    default_install_dir: project.default_install_dir,
    source_folder: project.source_folder,
    payload_zip: project.payload_zip,
    license_text: project.license_text,
    pages: project.pages.map(p => ({
      title: p.title,
      role: p.role,
      bg: { color: p.bgColor, image: p.bgImage },
      items: p.widgets.map(w => {
        const base = {
          type: w.type,
          name: w.name,
          text: w.text,
          x: w.x, y: w.y, w: w.w, h: w.h,
          extra: { font_size: w.font, bold: !!w.bold, fg: w.fg, bg: w.bg }
        };
        if(w.type === "CheckBox") base.extra.checked = !!w.checked;
        if(w.type === "Image" && w.src) base.extra.src = w.src;
        return base;
      })
    }))
  };
}

function toPythonCode(obj){
  const json = JSON.stringify(obj, null, 2);
  return `# Auto-generated by Roxzned Setup Designer
# This is a standalone installer script. Compile it with PyInstaller if you want.
# Requires: PySide6

import os
import sys
import json
import zipfile
import traceback

from PySide6.QtCore import Qt, Signal, QThread
from PySide6.QtWidgets import (
    QApplication, QWizard, QWizardPage, QLabel, QLineEdit, QPushButton, QHBoxLayout,
    QVBoxLayout, QTextEdit, QCheckBox, QFileDialog, QMessageBox, QProgressBar, QWidget
)

PROJECT = ${json}

# (Demo) Real build will generate full UI + install/uninstall logic.
# • Pages: Welcome / License / Path / Installing / Finish
# • Widgets: Text, Button, CheckBox, Image, EditBox
# • Actions: Back/Next/Close/Open URL/Set Path
# • Packing: payload.zip -> install dir

if __name__ == '__main__':
    print('Demo: generated script preview only')
`;
}

function renderLineNumbers(text){
  const lines = text.split(/\n/);
  const ln = lines.map((_, i)=> String(i+1).padStart(2,' ') ).join("\n");
  $("ln").textContent = ln;
  $("ln").style.display = ui.showLineNumbers ? "block" : "none";
  $("lnChip").textContent = "Line numbers: " + (ui.showLineNumbers ? "ON" : "OFF");
  $("codeRow").style.gridTemplateColumns = ui.showLineNumbers ? "52px 1fr" : "1fr";
}

function updateCode(full=true){
  const py = toPythonCode(buildProjectObject());
  $("code").textContent = py;
  if(full) renderLineNumbers(py);
  // Live-update installer preview if open
  if(typeof inst !== 'undefined' && inst.open) renderInstaller(false);
}

// -----------------------------
// Download helpers
// -----------------------------
function downloadText(filename, text){
  const blob = new Blob([text], {type:"text/plain;charset=utf-8"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(()=> URL.revokeObjectURL(url), 800);
}

async function copyToClipboard(text){
  try{
    await navigator.clipboard.writeText(text);
    toast("<b>Copied</b> to clipboard.");
  }catch(e){
    toast("<b>Copy</b> failed (browser blocked).");
  }
}

// -----------------------------
// File pickers (browser-limited)
// -----------------------------
function pickFile(inputEl){
  return new Promise((resolve)=>{
    inputEl.value = "";
    inputEl.onchange = ()=> resolve(inputEl.files && inputEl.files[0] ? inputEl.files[0] : null);
    inputEl.click();
  });
}
async function pickFolder(){
  // folderPick returns multiple "files". We'll take first folder name if possible.
  const inputEl = $("folderPick");
  inputEl.value = "";
  return new Promise((resolve)=>{
    inputEl.onchange = ()=>{
      const files = inputEl.files ? Array.from(inputEl.files) : [];
      const first = files[0];
      if(!first) return resolve(null);
      // webkitRelativePath gives "folder/file.ext"
      const rel = first.webkitRelativePath || "";
      const folder = rel.split("/")[0] || "SelectedFolder";
      resolve(folder);
    };
    inputEl.click();
  });
}

async function pickImageAsDataURL(){
  const file = await pickFile($("filePickImage"));
  if(!file) return null;
  const reader = new FileReader();
  return new Promise((resolve)=>{
    reader.onload = ()=> resolve(reader.result);
    reader.readAsDataURL(file);
  });
}

// -----------------------------
// Actions
// -----------------------------
function handleAction(act){
  switch(act){
    case "newProject": newProject(); break;
    case "openProject": openProject(); break;
    case "saveProject": saveProject(); break;
    case "exportInstaller": exportInstaller(); break;
    case "exportUninstaller": exportUninstaller(); break;

    case "toggleWizard":
      ui.wizardHidden = !ui.wizardHidden;
      document.body.classList.toggle("wizardHidden", ui.wizardHidden);
      saveToStorageDebounced();
      toast("<b>Wizard Maker</b>: " + (ui.wizardHidden ? "Hidden" : "Shown"));
      break;

    case "toggleDark":
      ui.lightMode = !ui.lightMode;
      document.body.classList.toggle("lightMode", ui.lightMode);
      saveToStorageDebounced();
      toast("<b>Theme</b>: " + (ui.lightMode ? "Light (demo)" : "Dark"));
      break;

    case "toggleLineNumbers":
      ui.showLineNumbers = !ui.showLineNumbers;
      updateCode(true);
      saveToStorageDebounced();
      toast("<b>Line numbers</b>: " + (ui.showLineNumbers ? "ON" : "OFF"));
      break;

    case "toggleGrid":
      $("showGrid").checked = !$("showGrid").checked;
      renderCanvas();
      saveToStorageDebounced();
      toast("<b>Grid</b>: " + ($("showGrid").checked ? "ON (snap)" : "OFF"));
      break;

    case "zoomIn": setZoom(ui.zoom + 0.08); break;
    case "zoomOut": setZoom(ui.zoom - 0.08); break;
    case "resetZoom": setZoom(1); break;

    case "build": openBuild(); break;

    case "runInstaller": openInstaller(); break;

    case "undo": undo(); break;
    case "redo": redo(); break;

    case "addWidget": openAddWidget(); break;
    case "dupWidget": dupWidget(); break;
    case "upWidget": moveWidget(-1); break;
    case "downWidget": moveWidget(1); break;
    case "deleteWidget": deleteSelectedWidget(); break;

    case "bringFront": bringToFront(); break;
    case "sendBack": sendToBack(); break;

    case "help": openHelp(); break;
    case "about": openAbout(); break;

    case "browseSource": browseSource(); break;
    case "browsePayload": browsePayload(); break;
    case "browseBg": browseBg(); break;

    case "browseInstaller": toast("<b>Browse</b> (demo): choose a .py file name in your editor."); break;
    case "browseOut": toast("<b>Browse</b> (demo): output folder is simulated in-browser."); break;
    case "browseIcon": browseIcon(); break;
    case "browseMPayload": browseMPayload(); break;

    case "copyCode": copyToClipboard($("code").textContent || ""); break;

    default:
      toast("<b>Action</b> not wired: " + act);
  }
}

// -----------------------------
// Zoom
// -----------------------------
function setZoom(z, announce=true){
  ui.zoom = clamp(z, 0.75, 1.25);
  $("appRoot").style.transform = `scale(${ui.zoom})`;
  $("appRoot").style.transformOrigin = "top left";
  document.body.style.height = (100/ui.zoom) + "vh";
  saveToStorageDebounced();
  if(announce) toast(`<b>Zoom</b> ${Math.round(ui.zoom*100)}%`);
}

// -----------------------------
// Project ops (save/open/export)
// -----------------------------
function newProject(){
  if(!confirm("Reset the demo project to defaults?")) return;
  project = defaultProject();
  selectedPageIndex = 0;
  selectedWidgetId = project.pages[0].widgets[0]?.id ?? null;
  syncAllFromState();
  syncProjectFields();
  syncPageFields();
  renderAll();
  renderElementList();
  historyPush();
  saveToStorageDebounced();
  toast("<b>New Project</b> created.");
}

async function openProject(){
  const file = await pickFile($("fileOpenProject"));
  if(!file) return;
  const text = await file.text();
  try{
    const parsed = JSON.parse(text);

    // Accept both "project only" or full save payload
    if(parsed.pages && parsed.app_name){
      project = parsed;
    }else if(parsed.project && parsed.project.pages){
      project = parsed.project;
      ui = Object.assign(ui, parsed.ui || {});
      selectedPageIndex = clamp(parsed.selectedPageIndex ?? 0, 0, project.pages.length-1);
      selectedWidgetId = parsed.selectedWidgetId ?? (project.pages[selectedPageIndex]?.widgets?.[0]?.id ?? null);
    }else{
      throw new Error("Not a valid RSD demo project JSON.");
    }

    syncAllFromState();
    syncProjectFields();
    syncPageFields();
    renderAll();
    historyPush();
    saveToStorageDebounced();
    toast("<b>Project opened</b>: " + escapeHtml(file.name));
  }catch(e){
    toast("<b>Open failed</b>: invalid JSON.");
  }
}

function saveProject(){
  // Save a full payload so browser UI prefs/selection persist if re-opened
  const payload = { project, ui, selectedPageIndex, selectedWidgetId };
  downloadText(`${project.app_name || "RSD_Project"}.json`, JSON.stringify(payload, null, 2));
  toast("<b>Saved</b> project JSON.");
}

function exportInstaller(){
  const py = $("code").textContent || "";
  downloadText(`${project.app_name || "installer"}_installer.py`, py);
  toast("<b>Exported</b> installer code (.py).");
}

function exportUninstaller(){
  const stub = `# Auto-generated by Roxzned Setup Designer (demo)\n# Uninstaller stub\n\nif __name__ == '__main__':\n    print('Demo uninstaller')\n`;
  downloadText(`${project.app_name || "installer"}_uninstaller.py`, stub);
  toast("<b>Exported</b> uninstaller stub (.py).");
}

// -----------------------------
// Page ops
// -----------------------------
function addPage(){
  const name = prompt("New page name:", "New Page");
  if(!name) return;
  project.pages.push({ title:name, role:"custom", bgColor:"#151515", bgImage:"", widgets:[] });
  selectedPageIndex = project.pages.length - 1;
  selectedWidgetId = null;
  syncPageFields();
  renderAll();
  historyPush();
  saveToStorageDebounced();
  toast("<b>Page</b> added: " + escapeHtml(name));
}

function dupPage(){
  const p = getPage();
  const copy = deepClone(p);
  copy.title = p.title + " (Copy)";
  copy.widgets.forEach(w => w.id = w.id + "_c" + Math.floor(Math.random()*9999));
  project.pages.splice(selectedPageIndex + 1, 0, copy);
  selectedPageIndex += 1;
  selectedWidgetId = copy.widgets[0]?.id ?? null;
  syncPageFields();
  renderAll();
  historyPush();
  saveToStorageDebounced();
  toast("<b>Page</b> duplicated.");
}

function delPage(){
  if(project.pages.length <= 1){ toast("Can't delete the last page."); return; }
  const p = getPage();
  if(!confirm(`Delete page "${p.title}"?`)) return;
  project.pages.splice(selectedPageIndex, 1);
  selectedPageIndex = clamp(selectedPageIndex, 0, project.pages.length-1);
  selectedWidgetId = getPage().widgets[0]?.id ?? null;
  syncPageFields();
  renderAll();
  historyPush();
  saveToStorageDebounced();
  toast("<b>Page</b> deleted.");
}

function movePage(dir){
  const i = selectedPageIndex;
  const j = i + dir;
  if(j < 0 || j >= project.pages.length) return;
  const tmp = project.pages[i];
  project.pages[i] = project.pages[j];
  project.pages[j] = tmp;
  selectedPageIndex = j;
  syncPageFields();
  renderAll();
  historyPush();
  saveToStorageDebounced();
}

// -----------------------------
// Widget ops
// -----------------------------

function moveWidget(dir){
  const w = getWidget();
  if(!w) return toast("No widget selected.");
  const p = getPage();
  const i = p.widgets.findIndex(x => x.id === w.id);
  const j = i + dir;
  if(j < 0 || j >= p.widgets.length) return;
  const tmp = p.widgets[i];
  p.widgets[i] = p.widgets[j];
  p.widgets[j] = tmp;
  renderAll();
  historyPush();
  saveToStorageDebounced();
  toast("<b>Reorder</b>: moved " + (dir < 0 ? "up" : "down") + ".");
}

function dupWidget(){
  const w = getWidget();
  if(!w) return toast("No widget selected.");
  const p = getPage();
  const i = p.widgets.findIndex(x => x.id === w.id);
  const copy = deepClone(w);
  copy.id = w.id + "_c" + Math.floor(Math.random()*9999);
  copy.name = (w.name || "widget") + "_copy";
  copy.x = w.x + 20;
  copy.y = w.y + 20;
  normalizeWidget(copy);
  p.widgets.splice(i + 1, 0, copy);
  selectedWidgetId = copy.id;
  renderAll();
  historyPush();
  saveToStorageDebounced();
  toast("<b>Widget</b> duplicated.");
}
function openAddWidget(){
  $("addWidgetBack").style.display = "flex";
  $("addWidgetBack").setAttribute("aria-hidden","false");
  // auto name
  $("awName").value = "widget_" + Math.floor(Math.random()*1000);
  $("awText").value = "New Widget";
  toast("<b>Add Widget</b> window opened.");
}

function closeAddWidget(){
  $("addWidgetBack").style.display = "none";
  $("addWidgetBack").setAttribute("aria-hidden","true");
}

function doAddWidget(){
  const t = $("awType").value.trim();
  const name = $("awName").value.trim() || (t.toLowerCase() + "_1");
  const text = $("awText").value;
  const w = safeNum($("awW").value, 320);
  const h = safeNum($("awH").value, 24);

  const p = getPage();
  const id = "w" + Math.floor(Math.random()*100000);
  const widget = {
    id,
    type: t,
    name,
    text,
    x: 24, y: 140,
    w: w,
    h: h,
    font: 10,
    bold: false,
    fg: "#ffffff",
    bg: (t === "EditBox") ? "#111111" : "#00000000"
  };
  if(t === "CheckBox") widget.checked = false;
  if(t === "Image") widget.src = "";
  widget.visible = true;
  widget.locked = false;

  p.widgets.push(widget);
  selectedWidgetId = widget.id;
  renderAll();
  historyPush();
  saveToStorageDebounced();
  closeAddWidget();
  toast("<b>Widget</b> added: " + escapeHtml(t));
}

function deleteSelectedWidget(){
  const w = getWidget();
  if(!w){ toast("No widget selected."); return; }
  const p = getPage();
  const idx = p.widgets.findIndex(x => x.id === w.id);
  if(idx >= 0) p.widgets.splice(idx, 1);
  selectedWidgetId = p.widgets[0]?.id ?? null;
  renderAll();
  historyPush();
  saveToStorageDebounced();
  toast("<b>Widget</b> deleted.");
}

function bringToFront(){
  const w = getWidget();
  if(!w) return toast("No widget selected.");
  const p = getPage();
  p.widgets = p.widgets.filter(x => x.id !== w.id);
  p.widgets.push(w);
  renderAll();
  historyPush();
  saveToStorageDebounced();
  toast("<b>Bring to Front</b>");
}

function sendToBack(){
  const w = getWidget();
  if(!w) return toast("No widget selected.");
  const p = getPage();
  p.widgets = p.widgets.filter(x => x.id !== w.id);
  p.widgets.unshift(w);
  renderAll();
  historyPush();
  saveToStorageDebounced();
  toast("<b>Send to Back</b>");
}

// -----------------------------
// Browse / Pickers
// -----------------------------
async function browseSource(){
  const folder = await pickFolder();
  if(!folder) return;
  project.source_folder = folder + "/";
  $("sourceFolder").value = project.source_folder;
  historyPush();
  saveToStorageDebounced();
  updateCode(false);
  toast("<b>Source folder</b>: " + escapeHtml(folder));
}

async function browsePayload(){
  const file = await pickFile($("filePickZip"));
  if(!file) return;
  project.payload_zip = file.name;
  $("payloadZip").value = project.payload_zip;
  historyPush();
  saveToStorageDebounced();
  updateCode(false);
  toast("<b>Payload</b>: " + escapeHtml(file.name));
}

async function browseBg(){
  const dataUrl = await pickImageAsDataURL();
  if(!dataUrl) return;
  const p = getPage();
  p.bgImage = dataUrl;
  $("bgImage").value = "(selected image)";
  renderCanvas();
  historyPush();
  saveToStorageDebounced();
  updateCode(false);
  toast("<b>Background image</b> applied.");
}

async function browseIcon(){
  const file = await pickFile($("filePickIcon"));
  if(!file) return;
  $("mIcon").value = file.name;
  toast("<b>Icon</b>: " + escapeHtml(file.name));
}

async function browseMPayload(){
  const file = await pickFile($("filePickZip"));
  if(!file) return;
  $("mPayload").value = file.name;
  toast("<b>Payload</b>: " + escapeHtml(file.name));
}

async function pickFolderForPathWidget(w){
  const folder = await pickFolder();
  if(!folder) return;
  w.text = "%LOCALAPPDATA%\\" + folder;
  if(selectedWidgetId === w.id) $("wText").value = w.text;
  renderCanvas();
  historyPush();
  saveToStorageDebounced();
  updateCode(false);
  toast("<b>Set Path</b>: " + escapeHtml(w.text));
}

// -----------------------------
// Build modal
// -----------------------------
function openBuild(){
  $("modalBack").style.display = "flex";
  $("modalBack").setAttribute("aria-hidden","false");
  toast("<b>Build</b> window opened.");
  // pre-fill installer name
  $("mInstaller").value = (project.app_name || "installer") + "_installer.py";
  $("mPayload").value = project.payload_zip || "payload.zip";
}
function closeBuild(){
  $("modalBack").style.display = "none";
  $("modalBack").setAttribute("aria-hidden","true");
}
function simulateBuild(){
  const log = $("buildLog");
  const onefile = $("mOneFile").checked;
  const noconsole = $("mNoConsole").checked;
  const clean = $("mClean").checked;
  const addData = $("mAddData").checked;

  const cmd = [
    "pyinstaller",
    onefile ? "--onefile" : "",
    noconsole ? "--noconsole" : "",
    clean ? "--clean" : "",
    $("mIcon").value ? `--icon "${$("mIcon").value}"` : "",
    addData ? `--add-data "${$("mPayload").value};."` : "",
    `"${$("mInstaller").value}"`
  ].filter(Boolean).join(" ");

  log.textContent = "[Demo] Starting PyInstaller…\n\n";
  log.textContent += "Command:\n" + cmd + "\n\n";

  const steps = [
    "Collecting modules…",
    "Analyzing dependencies…",
    addData ? `Bundling ${$("mPayload").value} (--add-data)…` : "Skipping add-data…",
    onefile ? "Building onefile (--onefile)…" : "Building onedir…",
    noconsole ? "Windowed mode (--noconsole)…" : "Console mode…",
    "Finalizing EXE…",
    `Done! (demo) Output would appear in: ${$("mOut").value || "dist/"}`
  ];
  let i = 0;
  const tm = setInterval(()=>{
    log.textContent += steps[i] + "\n";
    log.scrollTop = log.scrollHeight;
    i++;
    if(i >= steps.length){ clearInterval(tm); }
  }, 260);
}



// -----------------------------
// Installer Preview (Wizard)
// -----------------------------
let inst = {
  open: false,
  pageIndex: 0,
  installing: false,
  progress: 0,
  timer: null,
};

function openInstaller(){
  inst.open = true;

  let idx = project.pages.findIndex(p => (p.role || "").toLowerCase() === "welcome");
  if(idx < 0) idx = 0;
  inst.pageIndex = clamp(idx, 0, project.pages.length-1);

  $("instBack").style.display = "flex";
  $("instBack").setAttribute("aria-hidden","false");

  renderInstaller(true);
  toast("<b>Installer Preview</b> opened.");
}

function closeInstaller(){
  inst.open = false;
  inst.installing = false;
  inst.progress = 0;
  if(inst.timer){ clearInterval(inst.timer); inst.timer = null; }

  $("instBack").style.display = "none";
  $("instBack").setAttribute("aria-hidden","true");
}

function installerPages(){
  return project.pages || [];
}
function instPage(){
  const pages = installerPages();
  inst.pageIndex = clamp(inst.pageIndex, 0, Math.max(0, pages.length-1));
  return pages[inst.pageIndex] || null;
}

function renderInstaller(resetInstallState=false){
  if(!inst.open) return;
  const p = instPage();
  if(!p) return;

  $("instTitle").textContent = `Run Installer — ${project.app_name || "App"} ${project.version || ""}`.trim();
  $("instHeaderTitle").textContent = `${project.app_name || "Setup"} Setup Wizard`;
  $("instHeaderSub").textContent = `Page ${inst.pageIndex+1} of ${installerPages().length} • Role: ${(p.role||"custom")}`;

  const role = (p.role || "").toLowerCase();

  const canvas = $("instPageCanvas");
  canvas.style.backgroundColor = p.bgColor || "#151515";
  canvas.style.background = (p.bgColor || "#151515");
  canvas.style.background = (p.bgColor || "#151515");
  if(p.bgImage){
    canvas.style.backgroundImage = `url('${p.bgImage}')`;
    canvas.style.backgroundSize = "cover";
    canvas.style.backgroundPosition = "center";
  }else{
    canvas.style.backgroundImage = "";
  }

  canvas.innerHTML = "";

  // apply checkbox target rules before drawing
  applyCheckboxTargetsInInstaller(p);

  (p.widgets || []).forEach((w)=>{
    const el = document.createElement("div");
    el.className = "instWidget" + (w.type === "Button" ? " btnW" : "") + (w.type === "Image" ? " imgW" : "");
    if(w.enabled === false) el.classList.add("disabled");
    el.style.left = (w.x || 0) + "px";
    el.style.top  = (w.y || 0) + "px";
    el.style.width  = (w.w || 120) + "px";
    el.style.height = (w.h || 24) + "px";
    el.style.fontSize = (w.font || 10) + "px";
    el.style.fontWeight = w.bold ? "700" : "400";
    el.style.color = w.fg || "#fff";
    if(w.bg && w.bg !== "#00000000") el.style.background = w.bg;

    if(w.type === "CheckBox"){
      el.innerHTML = `<label class="instChk">
        <input type="checkbox" ${w.checked ? "checked" : ""} />
        <span>${escapeHtml(w.text || "")}</span>
      </label>`;
      q("input", el).addEventListener("change", (ev)=>{
        w.checked = ev.target.checked;
        if(selectedWidgetId === w.id) $("wChecked").checked = w.checked;
  
        saveToStorageDebounced();
      });
    } else if (w.type === "EditBox"){
      el.innerHTML = `<input type="text" value="${escapeAttr(w.text || "")}" />`;
      q("input", el).disabled = (w.enabled === false);
      q("input", el).addEventListener("input", (ev)=>{
        w.text = ev.target.value;
        if(selectedWidgetId === w.id) $("wText").value = w.text;
        saveToStorageDebounced();
      });
    } else if (w.type === "Button"){
      el.textContent = w.text || "Button";
      el.addEventListener("click", async ()=>{
        // If disabled, do nothing
        if(w.enabled === false) return;
        // Run mapped action first
        if(executeInstallerAction(w)) return;

        // Fallback: demo "Browse" behavior
        const label = (w.text || "").toLowerCase();
        const name = (w.name || "").toLowerCase();
        if(label.includes("browse") || name.includes("browse") || name.includes("path")){
          const folder = await pickFolder();
          if(!folder) return;
          const edit = (p.widgets || []).find(x => x.type === "EditBox");
          if(edit){
            edit.text = "%LOCALAPPDATA%\\" + folder;
            if(selectedWidgetId === edit.id) $("wText").value = edit.text;
            renderCanvas();
            saveToStorageDebounced();
            toast("<b>Installer</b>: path set.");
            renderInstaller(false);
          }else{
            toast("<b>Installer</b>: no EditBox found on this page.");
          }
        }else{
          toast("<b>Installer</b>: button clicked.");
        }

      });
    } else if (w.type === "Image"){
      const src = w.src || "";
      el.innerHTML = src
        ? `<img alt="" src="${escapeAttr(src)}" style="width:100%; height:100%; object-fit:contain; display:block;">`
        : `<div style="width:100%; height:100%; display:grid; place-items:center; color:#bdbdbd; font-family:var(--mono); font-size:12px;">(Image)</div>`;
    } else {
      el.textContent = w.text || "";
    }

    canvas.appendChild(el);
  });

  const progWrap = $("instProgressWrap");
  if(role === "installing"){
    progWrap.style.display = "block";
    if(resetInstallState){
      startInstallSimulation();
    }else{
      setInstallUI(inst.progress);
    }
  }else{
    progWrap.style.display = "none";
    if(inst.timer){ clearInterval(inst.timer); inst.timer = null; }
    inst.installing = false;
    inst.progress = 0;
  }
}



function executeInstallerAction(w){
  const act = (w && w.action) ? w.action : { type:"none" };
  const type = (act.type || "none");

  if(type === "prev"){
    inst.pageIndex = clamp(inst.pageIndex - 1, 0, installerPages().length-1);
    renderInstaller(true);
    return true;
  }
  if(type === "next"){
    inst.pageIndex = clamp(inst.pageIndex + 1, 0, installerPages().length-1);
    renderInstaller(true);
    return true;
  }
  if(type === "close"){
    closeInstaller();
    return true;
  }
  if(type === "openUrl"){
    const url = (act.url || "").trim();
    if(!url){
      toast("<b>Action</b>: missing URL.");
      return true;
    }
    window.open(url, "_blank", "noopener");
    return true;
  }
  if(type === "startInstall"){
    // jump to installing page if present
    const idx = project.pages.findIndex(p => (p.role||"").toLowerCase() === "installing");
    if(idx >= 0){
      inst.pageIndex = idx;
      renderInstaller(true);
    }else{
      // show progress inline anyway
      const progWrap = $("instProgressWrap");
      progWrap.style.display = "block";
      startInstallSimulation();
    }
    return true;
  }
  return false;
}

function applyCheckboxTargetsInInstaller(p){
  (p.widgets || []).forEach(w=>{
    if(w.type === "CheckBox" && w.action && w.action.type === "toggleTargets"){
      applyCheckboxTargets(w);
    }
  });
}

function startInstallSimulation(){
  inst.installing = true;
  inst.progress = 0;
  setInstallUI(0);

  if(inst.timer){ clearInterval(inst.timer); inst.timer = null; }

  const log = $("instLog");
  log.textContent = "[Demo] Starting install...\n";

  const steps = [
    "Validating project settings…",
    "Packing payload…",
    "Extracting files…",
    "Writing shortcuts…",
    "Finalizing…"
  ];
  let stepIdx = 0;

  inst.timer = setInterval(()=>{
    inst.progress = clamp(inst.progress + (6 + Math.random()*7), 0, 100);
    setInstallUI(inst.progress);

    if(inst.progress > (stepIdx+1)*20 && stepIdx < steps.length){
      log.textContent += steps[stepIdx] + "\n";
      log.scrollTop = log.scrollHeight;
      stepIdx += 1;
    }

    if(inst.progress >= 100){
      clearInterval(inst.timer);
      inst.timer = null;
      inst.installing = false;
      log.textContent += "Done! (demo)\n";
      log.scrollTop = log.scrollHeight;
      toast("<b>Installer</b>: finished (demo).");

    }
  }, 260);
}

function setInstallUI(pct){
  $("instProgressPct").textContent = `${Math.round(pct)}%`;
  $("instPfill").style.width = `${pct}%`;
  $("instProgressLabel").textContent = pct >= 100 ? "Installed." : "Installing…";
}

function wireInstallerModal(){
  $("closeInstX").addEventListener("click", closeInstaller);
  $("instBack").addEventListener("click", (e)=>{ if(e.target.id === "instBack") closeInstaller(); });
  document.addEventListener("keydown", (e)=>{ if(inst && inst.open && e.key === "Escape") closeInstaller(); });
}


// -----------------------------
// About modal
// -----------------------------
function openAbout(){
  $("aboutBack").style.display = "flex";
  $("aboutBack").setAttribute("aria-hidden","false");
}
function closeAbout(){
  $("aboutBack").style.display = "none";
  $("aboutBack").setAttribute("aria-hidden","true");
}

// -----------------------------
// Help modal
// -----------------------------
function openHelp(){
  $("helpBack").style.display = "flex";
  $("helpBack").setAttribute("aria-hidden","false");
}
function closeHelp(){
  $("helpBack").style.display = "none";
  $("helpBack").setAttribute("aria-hidden","true");
}

// -----------------------------
// Color picker helper
// -----------------------------
function hookColorPicker(button, input, onPick){
  const c = document.createElement("input");
  c.type = "color";
  c.style.position = "fixed";
  c.style.left = "-9999px";
  document.body.appendChild(c);

  button.addEventListener("click", ()=>{
    const v = (input.value || "").trim();
    if(/^#[0-9a-fA-F]{6}$/.test(v)) c.value = v;
    c.click();
  });

  c.addEventListener("input", ()=>{
    input.value = c.value;
    onPick(c.value);
  });
}


// -----------------------------
// Objects / Elements palette + right-click context menu
// -----------------------------
const ctxState = { clientX: 0, clientY: 0, canvasX: 0, canvasY: 0 };

function hideCtx(){
  const ctx = $("ctx");
  if(!ctx) return;
  ctx.style.display = "none";
}

function showCtx(clientX, clientY, canvasX, canvasY){
  const ctx = $("ctx");
  if(!ctx) return;

  ctxState.clientX = clientX;
  ctxState.clientY = clientY;
  ctxState.canvasX = canvasX;
  ctxState.canvasY = canvasY;

  const hasSel = !!getWidget();
  qa('[data-ctx="delete"],[data-ctx="duplicate"],[data-act="bringFront"],[data-act="sendBack"]', ctx)
    .forEach(el => el.classList.toggle("disabled", !hasSel));

  ctx.style.display = "block";
  ctx.style.left = "0px";
  ctx.style.top  = "0px";

  requestAnimationFrame(()=>{
    const pad = 8;
    const r = ctx.getBoundingClientRect();
    let left = clientX;
    let top  = clientY;

    if(left + r.width > window.innerWidth - pad) left = window.innerWidth - pad - r.width;
    if(top + r.height > window.innerHeight - pad) top = window.innerHeight - pad - r.height;

    left = Math.max(pad, left);
    top  = Math.max(pad, top);

    ctx.style.left = left + "px";
    ctx.style.top  = top + "px";
  });
}

async function addWidgetAt(type, x, y){
  const p = getPage();
  const canvas = $("canvas");
  const rect = canvas.getBoundingClientRect();

  const step = gridStep();
  const nx = snap(clamp(Math.round(x), 0, Math.max(0, Math.floor(rect.width - 20))), step);
  const ny = snap(clamp(Math.round(y), 0, Math.max(0, Math.floor(rect.height - 20))), step);

  const id = "w" + Math.floor(Math.random()*1000000);

  // defaults
  let widget = {
    id,
    type,
    name: (type.toLowerCase() + "_" + Math.floor(Math.random()*1000)),
    text: "",
    x: nx, y: ny,
    w: 240,
    h: 24,
    font: 10,
    bold: false,
    fg: "#ffffff",
    bg: "#00000000",
    enabled: true,
    action: { type: "none" }
  };

  if(type === "Label"){
    widget.text = "New Label";
    widget.w = 260; widget.h = 24;
  }else if(type === "Button"){
    widget.text = "Button";
    widget.w = 120; widget.h = 28;
    widget.bg = "#232323";
    widget.action = { type: "none" };
  }else if(type === "CheckBox"){
    widget.text = "CheckBox";
    widget.w = 220; widget.h = 20;
    widget.checked = false;
    widget.action = { type: "none", targets: [] };
  }else if(type === "EditBox"){
    widget.text = "";
    widget.w = 260; widget.h = 26;
    widget.bg = "#111111";
  }else if(type === "Image"){
    widget.text = "";
    widget.w = 180; widget.h = 120;
    widget.src = "";
    // prompt user to pick an image right away
    const dataUrl = await pickImageAsDataURL();
    if(dataUrl) widget.src = dataUrl;
  }else{
    widget.text = type;
  }

  // keep inside canvas after sizing
  widget.x = clamp(widget.x, 0, Math.max(0, Math.floor(rect.width - widget.w)));
  widget.y = clamp(widget.y, 0, Math.max(0, Math.floor(rect.height - widget.h)));
  widget.x = snap(widget.x, step);
  widget.y = snap(widget.y, step);

  p.widgets.push(widget);
  selectedWidgetId = widget.id;

  syncWidgetFields();
  renderAll();
  historyPush();
  saveToStorageDebounced();

  toast(`<b>Added</b> ${escapeHtml(type)}.`);
}

function duplicateSelectedWidget(){
  const w = getWidget();
  if(!w) return toast("No widget selected.");
  const p = getPage();
  const copy = deepClone(w);
  copy.id = "w" + Math.floor(Math.random()*1000000);
  copy.name = (copy.name || "widget") + "_copy";
  copy.x = snap(copy.x + 20, gridStep());
  copy.y = snap(copy.y + 20, gridStep());
  p.widgets.push(copy);
  selectedWidgetId = copy.id;
  renderAll();
  historyPush();
  saveToStorageDebounced();
  toast("<b>Duplicated</b> widget.");
}

function initElementPalette(){
  const list = $("elementList");
  if(!list) return;

  qa("[data-el]", list).forEach(el => {
    el.addEventListener("dragstart", (e)=>{
      e.dataTransfer.setData("text/rsd-element", el.dataset.el);
      e.dataTransfer.effectAllowed = "copy";
    });

    // double-click to add at a reasonable spot (center-ish)
    el.addEventListener("dblclick", async ()=>{
      const canvas = $("canvas");
      const r = canvas.getBoundingClientRect();
      await addWidgetAt(el.dataset.el, r.width * 0.35, r.height * 0.35);
    });
  });
}

function initCanvasDnD(){
  const canvas = $("canvas");
  if(!canvas) return;

  canvas.addEventListener("dragover", (e)=>{
    if(e.dataTransfer && Array.from(e.dataTransfer.types || []).includes("text/rsd-element")){
      e.preventDefault();
      e.dataTransfer.dropEffect = "copy";
    }
  });

  canvas.addEventListener("drop", async (e)=>{
    const type = e.dataTransfer?.getData("text/rsd-element");
    if(!type) return;
    e.preventDefault();

    const r = canvas.getBoundingClientRect();
    const x = e.clientX - r.left;
    const y = e.clientY - r.top;
    hideCtx();
    await addWidgetAt(type, x, y);
  });
}

function initContextMenu(){
  const ctx = $("ctx");
  const canvas = $("canvas");
  if(!ctx || !canvas) return;

  document.addEventListener("click", (e)=>{
    if(e.target.closest && e.target.closest("#ctx")) return;
    hideCtx();
  });
  window.addEventListener("resize", hideCtx);
  window.addEventListener("scroll", hideCtx, true);

  // right-click on empty canvas
  canvas.addEventListener("contextmenu", (e)=>{
    e.preventDefault();
    const r = canvas.getBoundingClientRect();
    const cx = e.clientX - r.left;
    const cy = e.clientY - r.top;
    // if not on a widget element, deselect
    if(!e.target.closest || !e.target.closest(".widget")){
      selectedWidgetId = null;
      syncWidgetFields();
      renderCanvas();
    }
    closeMenus();
    showCtx(e.clientX, e.clientY, cx, cy);
  });

  // click actions within context menu
  ctx.addEventListener("click", async (e)=>{
    const item = e.target.closest(".ctxItem");
    if(!item) return;

    // handle existing actions
    const act = item.dataset.act;
    if(act){
      hideCtx();
      handleAction(act);
      return;
    }

    const mode = item.dataset.ctx;
    if(mode === "add"){
      const type = item.dataset.type;
      hideCtx();
      await addWidgetAt(type, ctxState.canvasX, ctxState.canvasY);
      return;
    }

    if(mode === "delete"){
      hideCtx();
      deleteSelectedWidget();
      return;
    }

    if(mode === "duplicate"){
      hideCtx();
      duplicateSelectedWidget();
      return;
    }
  });

  // esc hides ctx too (already handled, but this helps if focus is elsewhere)
  document.addEventListener("keydown", (e)=>{
    if(e.key === "F5"){
      e.preventDefault();
      openInstaller();
      return;
    }

    if(e.key === "Escape") hideCtx();
  });
}



function normalizeHexColor(v){
  let s = (v || "").trim();
  if(!s) return "";
  // allow 6 hex digits without '#'
  if(/^[0-9a-fA-F]{6}$/.test(s)) s = "#" + s;
  if(/^#[0-9a-fA-F]{6}$/.test(s)) return s.toLowerCase();
  // allow CSS named colors too
  return s;
}

function widgetSupportsAction(w){
  if(!w) return false;
  return (w.type === "Button" || w.type === "CheckBox");
}

function getWidgetAction(w){
  if(!w) return { type:"none" };
  return w.action || { type:"none" };
}

function setWidgetAction(w, action){
  if(!w) return;
  w.action = action || { type:"none" };
}

function showActionParams(type){
  // URL fields
  qa(".actionParam").forEach(el => { el.style.display = "none"; });
  if(type === "openUrl"){
    qa(".actionUrl").forEach(el => { el.style.display = ""; });
  }else if(type === "toggleTargets"){
    qa(".actionTargets").forEach(el => { el.style.display = ""; });
  }
}

function populateActionTargets(){
  const sel = $("wActionTargets");
  if(!sel) return;
  const p = getPage();
  const w = getWidget();
  const allowed = (p.widgets || []).filter(x =>
    (x.id !== (w && w.id)) && (x.type === "Button" || x.type === "CheckBox")
  );

  const prevSelected = new Set(Array.from(sel.selectedOptions || []).map(o=>o.value));
  sel.innerHTML = "";
  allowed.forEach(x=>{
    const opt = document.createElement("option");
    opt.value = x.id;
    opt.textContent = `${x.type}: ${x.name || x.id}`;
    sel.appendChild(opt);
  });

  // keep selection if possible
  Array.from(sel.options).forEach(opt=>{
    if(prevSelected.has(opt.value)) opt.selected = true;
  });
}

// -----------------------------
// Wiring
// -----------------------------
function wireInputs(){
  // Toolbar + links
  qa("[data-act]").forEach(el=>{
    if(el.classList.contains("dd-item")) return; // menu items are handled elsewhere
    el.addEventListener("click", (e)=>{
      const act = el.dataset.act;
      if(!act) return;
      e.preventDefault();
      handleAction(act);
    });
  });

  // Project fields
  $("appName").addEventListener("input", ()=>{ project.app_name = $("appName").value; updateCode(false); saveToStorageDebounced(); });
  $("appVer").addEventListener("input", ()=>{ project.version = $("appVer").value; updateCode(false); saveToStorageDebounced(); });
  $("publisher").addEventListener("input", ()=>{ project.publisher = $("publisher").value; updateCode(false); saveToStorageDebounced(); });
  $("defaultDir").addEventListener("input", ()=>{ project.default_install_dir = $("defaultDir").value; updateCode(false); saveToStorageDebounced(); });
  $("sourceFolder").addEventListener("input", ()=>{ project.source_folder = $("sourceFolder").value; updateCode(false); saveToStorageDebounced(); });
  $("payloadZip").addEventListener("input", ()=>{ project.payload_zip = $("payloadZip").value; updateCode(false); saveToStorageDebounced(); });
  $("licenseText").addEventListener("input", ()=>{ project.license_text = $("licenseText").value; updateCode(false); saveToStorageDebounced(); });

  // Page fields
  $("pageTitle").addEventListener("input", ()=>{
    getPage().title = $("pageTitle").value;
    renderPageList();
    updateCode(false);
    saveToStorageDebounced();
  });
  $("pageTitle").addEventListener("change", ()=> historyPush());

  $("pageRole").addEventListener("change", ()=>{ getPage().role = $("pageRole").value; updateCode(false); historyPush(); saveToStorageDebounced(); });

  $("bgColor").addEventListener("input", ()=>{
    const v = normalizeHexColor($("bgColor").value);
    $("bgColor").value = v || $("bgColor").value;
    getPage().bgColor = v || $("bgColor").value;
    renderCanvas();
    updateCode(false);
    saveToStorageDebounced();
  });
  $("bgColor").addEventListener("change", ()=> historyPush());
$("bgImage").addEventListener("input", ()=>{
    // allow paste URL/data:
    getPage().bgImage = $("bgImage").value.trim();
    renderCanvas();
    updateCode(false);
    saveToStorageDebounced();
  });
  $("bgImage").addEventListener("change", ()=> historyPush());

  $("showGrid").addEventListener("change", ()=>{ renderCanvas(); saveToStorageDebounced(); });

  // Page buttons
  q('[data-act="addPage"]').addEventListener("click", addPage);
  q('[data-act="dupPage"]').addEventListener("click", dupPage);
  q('[data-act="delPage"]').addEventListener("click", delPage);
  q('[data-act="upPage"]').addEventListener("click", ()=>movePage(-1));
  q('[data-act="downPage"]').addEventListener("click", ()=>movePage(1));

  // Widget props binds
  function bind(id, fn){
    $(id).addEventListener("input", fn);
    $(id).addEventListener("change", ()=>{ fn(); historyPush(); });
  }

  bind("wName", ()=>{ const w=getWidget(); if(!w) return; w.name=$("wName").value; renderCanvas(); updateCode(false); saveToStorageDebounced(); });
  bind("wText", ()=>{ const w=getWidget(); if(!w) return; w.text=$("wText").value; renderCanvas(); updateCode(false); saveToStorageDebounced(); });

  bind("wX", ()=>{ const w=getWidget(); if(!w) return; w.x=snap(safeNum($("wX").value,w.x), gridStep()); renderCanvas(); updateCode(false); saveToStorageDebounced(); });
  bind("wY", ()=>{ const w=getWidget(); if(!w) return; w.y=snap(safeNum($("wY").value,w.y), gridStep()); renderCanvas(); updateCode(false); saveToStorageDebounced(); });
  bind("wW", ()=>{ const w=getWidget(); if(!w) return; w.w=Math.max(20, snap(safeNum($("wW").value,w.w), gridStep())); renderCanvas(); updateCode(false); saveToStorageDebounced(); });
  bind("wH", ()=>{ const w=getWidget(); if(!w) return; w.h=Math.max(16, snap(safeNum($("wH").value,w.h), gridStep())); renderCanvas(); updateCode(false); saveToStorageDebounced(); });

  bind("wFont", ()=>{ const w=getWidget(); if(!w) return; w.font=Math.max(6, safeNum($("wFont").value,w.font)); renderCanvas(); updateCode(false); saveToStorageDebounced(); });

  $("wBold").addEventListener("change", ()=>{ const w=getWidget(); if(!w) return; w.bold=$("wBold").checked; renderCanvas(); updateCode(false); historyPush(); saveToStorageDebounced(); });

  bind("wFg", ()=>{ const w=getWidget(); if(!w) return; w.fg=$("wFg").value; renderCanvas(); updateCode(false); saveToStorageDebounced(); });
  bind("wBg", ()=>{ const w=getWidget(); if(!w) return; w.bg=$("wBg").value; renderCanvas(); updateCode(false); saveToStorageDebounced(); });

  $("wChecked").addEventListener("change", ()=>{ const w=getWidget(); if(!w) return; w.checked=$("wChecked").checked; renderCanvas(); updateCode(false); historyPush(); saveToStorageDebounced(); });
  $("wEnabled").addEventListener("change", ()=>{ const w=getWidget(); if(!w) return; w.enabled = $("wEnabled").checked; renderCanvas(); updateCode(false); historyPush(); saveToStorageDebounced(); });

  $("wAction").addEventListener("change", ()=>{ const w=getWidget(); if(!w) return;
    const t = $("wAction").value;
    showActionParams(t);

    if(w.type === "Button"){
      if(t === "openUrl") w.action = { type:"openUrl", url: $("wActionUrl").value || "" };
      else if(t === "prev") w.action = { type:"prev" };
      else if(t === "next") w.action = { type:"next" };
      else if(t === "close") w.action = { type:"close" };
      else if(t === "startInstall") w.action = { type:"startInstall" };
      else w.action = { type:"none" };
    }else if(w.type === "CheckBox"){
      if(t === "toggleTargets"){
        const targets = Array.from($("wActionTargets").selectedOptions || []).map(o=>o.value);
        w.action = { type:"toggleTargets", targets };
        applyCheckboxTargets(w);
      }else{
        w.action = { type:"none" };
      }
    }
    renderCanvas();
    updateCode(false);
    historyPush();
    saveToStorageDebounced();
  });

  $("wActionUrl").addEventListener("input", ()=>{ const w=getWidget(); if(!w) return;
    if(w.type === "Button" && $("wAction").value === "openUrl"){
      w.action = { type:"openUrl", url: $("wActionUrl").value };
      updateCode(false);
      saveToStorageDebounced();
    }
  });
  $("wActionUrl").addEventListener("change", ()=> historyPush());

  $("wActionTargets").addEventListener("change", ()=>{ const w=getWidget(); if(!w) return;
    if(w.type === "CheckBox" && $("wAction").value === "toggleTargets"){
      const targets = Array.from($("wActionTargets").selectedOptions || []).map(o=>o.value);
      w.action = { type:"toggleTargets", targets };
      applyCheckboxTargets(w);
      renderCanvas();
      updateCode(false);
      historyPush();
      saveToStorageDebounced();
    }
  });


  // Color pickers
  hookColorPicker($("pickBg"), $("bgColor"), (v)=>{ getPage().bgColor = v; renderCanvas(); updateCode(false); historyPush(); saveToStorageDebounced(); });
  hookColorPicker($("pickFg"), $("wFg"), (v)=>{ const w=getWidget(); if(!w) return; w.fg = v; renderCanvas(); updateCode(false); historyPush(); saveToStorageDebounced(); });
  hookColorPicker($("pickWBg"), $("wBg"), (v)=>{ const w=getWidget(); if(!w) return; w.bg = v; renderCanvas(); updateCode(false); historyPush(); saveToStorageDebounced(); });

  // Modals
  $("closeModal").addEventListener("click", closeBuild);

  // Installer preview modal
  wireInstallerModal();
  $("closeModalX").addEventListener("click", closeBuild);
  $("modalBack").addEventListener("click", (e)=>{ if(e.target.id === "modalBack") closeBuild(); });
  $("doBuild").addEventListener("click", simulateBuild);

  $("closeAddWidget").addEventListener("click", closeAddWidget);
  $("closeAddWidgetX").addEventListener("click", closeAddWidget);
  $("addWidgetBack").addEventListener("click", (e)=>{ if(e.target.id === "addWidgetBack") closeAddWidget(); });
  $("doAddWidget").addEventListener("click", doAddWidget);

  $("closeHelp").addEventListener("click", closeHelp);

  // About modal
  $("closeAbout").addEventListener("click", closeAbout);
  $("closeAboutX").addEventListener("click", closeAbout);
  $("aboutBack").addEventListener("click", (e)=>{ if(e.target.id === "aboutBack") closeAbout(); });
  $("closeHelpX").addEventListener("click", closeHelp);
  $("helpBack").addEventListener("click", (e)=>{ if(e.target.id === "helpBack") closeHelp(); });

  // keyboard shortcuts + nudging
  document.addEventListener("keydown", (e)=>{
    if(e.key === "F5"){
      e.preventDefault();
      openInstaller();
      return;
    }

    if(e.key === "Escape"){
      closeMenus(); closeBuild(); closeAddWidget(); closeHelp(); closeAbout();
    }

    // Nudge selected widget with arrow keys
    const w = getWidget();
    if(w && ["ArrowLeft","ArrowRight","ArrowUp","ArrowDown"].includes(e.key)){
      e.preventDefault();
      const step = e.shiftKey ? 10 : 1;
      const s = $("showGrid").checked ? 20 : step;
      const delta = $("showGrid").checked ? 20 : step;

      if(e.key === "ArrowLeft") w.x = Math.max(0, w.x - delta);
      if(e.key === "ArrowRight") w.x = w.x + delta;
      if(e.key === "ArrowUp") w.y = Math.max(0, w.y - delta);
      if(e.key === "ArrowDown") w.y = w.y + delta;
      w.x = snap(w.x, gridStep());
      w.y = snap(w.y, gridStep());

      syncWidgetFields();
      renderCanvas();
      updateCode(false);
      saveToStorageDebounced();
      clearTimeout(wireInputs._nudgeTm);
      wireInputs._nudgeTm = setTimeout(()=> historyPush(), 180);
    }

    const ctrl = e.ctrlKey || e.metaKey;
    if(!ctrl) return;

    const k = e.key.toLowerCase();
    if(k === "s"){ e.preventDefault(); saveProject(); }
    if(k === "o"){ e.preventDefault(); openProject(); }
    if(k === "n"){ e.preventDefault(); newProject(); }
    if(k === "b"){ e.preventDefault(); openBuild(); }
    if(k === "w"){ e.preventDefault(); handleAction("toggleWizard"); }
    if(k === "d"){ e.preventDefault(); handleAction("toggleDark"); }
    if(k === "l"){ e.preventDefault(); handleAction("toggleLineNumbers"); }
    if(k === "g"){ e.preventDefault(); handleAction("toggleGrid"); }
    if(k === "e" && !e.shiftKey){ e.preventDefault(); exportInstaller(); }
    if(k === "e" && e.shiftKey){ e.preventDefault(); exportUninstaller(); }
    if(k === "z"){ e.preventDefault(); undo(); }
    if(k === "y"){ e.preventDefault(); redo(); }
    if(e.key === "0"){ e.preventDefault(); handleAction("resetZoom"); }
    if(e.key === "=" || e.key === "+"){ e.preventDefault(); handleAction("zoomIn"); }
    if(e.key === "-"){ e.preventDefault(); handleAction("zoomOut"); }

    if(e.key === "]"){ e.preventDefault(); bringToFront(); }
    if(e.key === "["){ e.preventDefault(); sendToBack(); }
  });
}

// -----------------------------
// Init
// -----------------------------
function init(){
  // menus
  initMenus();

  // state load
  const ok = loadFromStorage();
  if(!ok){
    project = defaultProject();
    selectedPageIndex = 0;
    selectedWidgetId = project.pages[0].widgets[0]?.id ?? null;
  }

  syncAllFromState();
  syncProjectFields();
  syncPageFields();

  renderAll();
  wireInputs();

  // Elements palette + drag/drop + right-click menu
  initElementPalette();
  initCanvasDnD();
  initContextMenu();

  // start history
  historyPush();

  toast("<b>Web Demo</b> loaded — click around, drag & resize widgets!");
}

init();
