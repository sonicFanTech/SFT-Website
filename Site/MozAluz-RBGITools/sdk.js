const droneAudio = document.getElementById('drone-audio');
const menuMoveAudio = document.getElementById('menu-move-audio');
const selectAudio = document.getElementById('select-audio');
const audioToggle = document.getElementById('audio-toggle');
const selectorSoul = document.getElementById('selector-soul');
const page = document.querySelector('.ch1-page');
const panels = document.querySelectorAll('.sdk-content');

let audioEnabled = false;
let lastHoverElement = null;
let currentIndex = 0;

function getSelectableItems() {
  return Array.from(document.querySelectorAll('.selectable')).filter((item) => item.offsetParent !== null);
}

function resetAndPlay(sound) {
  if (!sound || !audioEnabled) return;
  try {
    sound.pause();
    sound.currentTime = 0;
    sound.play().catch(() => {});
  } catch (err) {}
}

async function enableAudio() {
  audioEnabled = true;
  if (droneAudio) {
    try {
      droneAudio.volume = 0.55;
      await droneAudio.play();
    } catch (err) {}
  }
  if (audioToggle) {
    audioToggle.textContent = 'AUDIO ON';
    audioToggle.classList.add('audio-on');
  }
}

function disableAudio() {
  audioEnabled = false;
  if (droneAudio) droneAudio.pause();
  if (audioToggle) {
    audioToggle.textContent = 'AUDIO';
    audioToggle.classList.remove('audio-on');
  }
}

function clearSelectedClasses() {
  document.querySelectorAll('.selected').forEach((item) => item.classList.remove('selected'));
}

function getSoulPositionFor(item) {
  const itemRect = item.getBoundingClientRect();
  const pageRect = page.getBoundingClientRect();
  const isSaveSlot = item.classList.contains('save-file');
  const isTopAudio = item.classList.contains('audio-toggle');

  let x;
  let y = itemRect.top - pageRect.top + itemRect.height / 2;

  if (isSaveSlot) {
    x = itemRect.left - pageRect.left + (window.innerWidth <= 620 ? 22 : window.innerWidth <= 900 ? 29 : 55);
  } else if (isTopAudio) {
    x = itemRect.left - pageRect.left - 30;
  } else {
    x = itemRect.left - pageRect.left - 36;
  }

  return { x, y };
}

function moveSoulTo(item, playMoveSound = true) {
  if (!item || !selectorSoul || !page) return;

  const items = getSelectableItems();
  const foundIndex = items.indexOf(item);
  if (foundIndex !== -1) currentIndex = foundIndex;

  clearSelectedClasses();
  item.classList.add('selected');

  if (audioToggle && audioEnabled) audioToggle.classList.add('audio-on');

  const pos = getSoulPositionFor(item);
  selectorSoul.style.left = `${pos.x}px`;
  selectorSoul.style.top = `${pos.y}px`;

  if (playMoveSound) resetAndPlay(menuMoveAudio);
}

function showPanel(panelId) {
  panels.forEach((panel) => {
    panel.hidden = panel.id !== panelId;
  });

  const panel = document.getElementById(panelId);
  if (panel) panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function getCenter(item) {
  const rect = item.getBoundingClientRect();
  return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
}

function moveByDirection(direction) {
  const items = getSelectableItems();
  const current = items[currentIndex] || items[0];
  if (!current) return;

  const currentCenter = getCenter(current);
  let bestItem = null;
  let bestScore = Infinity;

  for (const item of items) {
    if (item === current) continue;

    const center = getCenter(item);
    const dx = center.x - currentCenter.x;
    const dy = center.y - currentCenter.y;

    let valid = false;
    let primary = 0;
    let secondary = 0;

    if (direction === 'up' && dy < -8) {
      valid = true; primary = Math.abs(dy); secondary = Math.abs(dx);
    } else if (direction === 'down' && dy > 8) {
      valid = true; primary = Math.abs(dy); secondary = Math.abs(dx);
    } else if (direction === 'left' && dx < -8) {
      valid = true; primary = Math.abs(dx); secondary = Math.abs(dy);
    } else if (direction === 'right' && dx > 8) {
      valid = true; primary = Math.abs(dx); secondary = Math.abs(dy);
    }

    if (!valid) continue;

    const score = primary + secondary * 0.72;
    if (score < bestScore) {
      bestScore = score;
      bestItem = item;
    }
  }

  if (bestItem) {
    bestItem.focus({ preventScroll: true });
    moveSoulTo(bestItem);
  }
}

function activateCurrent() {
  const items = getSelectableItems();
  const item = items[currentIndex];
  if (!item) return;

  resetAndPlay(selectAudio);

  if (item.classList.contains('save-file')) {
    const panelId = item.dataset.panel;
    if (panelId) showPanel(panelId);
    return;
  }

  if (item.classList.contains('inactive-choice')) return;

  if (item.classList.contains('audio-toggle')) {
    item.click();
    return;
  }

  if (item.tagName.toLowerCase() === 'a') item.click();
}

if (audioToggle) {
  audioToggle.addEventListener('click', () => {
    if (audioEnabled) {
      disableAudio();
    } else {
      enableAudio();
      resetAndPlay(selectAudio);
    }
  });
}

document.querySelectorAll('.selectable').forEach((item) => {
  item.addEventListener('mouseenter', () => {
    if (lastHoverElement !== item) {
      lastHoverElement = item;
      moveSoulTo(item);
    }
  });
  item.addEventListener('focus', () => {
    if (lastHoverElement !== item) {
      lastHoverElement = item;
      moveSoulTo(item);
    }
  });
});

document.querySelectorAll('.select-sound').forEach((item) => {
  item.addEventListener('click', () => {
    if (!audioEnabled) enableAudio();
    resetAndPlay(selectAudio);
  });
});

document.querySelectorAll('.save-file').forEach((slot) => {
  slot.addEventListener('click', () => {
    const panelId = slot.dataset.panel;
    if (panelId) showPanel(panelId);
  });
});

document.querySelectorAll('.inactive-choice').forEach((button) => {
  button.addEventListener('click', (event) => {
    event.preventDefault();
  });
});

document.addEventListener('keydown', (event) => {
  const key = event.key;

  if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Enter', ' '].includes(key)) {
    event.preventDefault();
  }

  if (!audioEnabled && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Enter', ' '].includes(key)) {
    enableAudio();
  }

  if (key === 'ArrowUp') moveByDirection('up');
  else if (key === 'ArrowDown') moveByDirection('down');
  else if (key === 'ArrowLeft') moveByDirection('left');
  else if (key === 'ArrowRight') moveByDirection('right');
  else if (key === 'Enter' || key === ' ') activateCurrent();
});

window.addEventListener('resize', () => {
  const items = getSelectableItems();
  moveSoulTo(items[currentIndex] || items[0], false);
});

window.addEventListener('load', async () => {
  const firstSaveSlot = document.querySelector('.save-file') || getSelectableItems()[0];
  moveSoulTo(firstSaveSlot, false);

  if (!droneAudio) return;

  try {
    droneAudio.volume = 0.55;
    await droneAudio.play();
    audioEnabled = true;
    if (audioToggle) {
      audioToggle.textContent = 'AUDIO ON';
      audioToggle.classList.add('audio-on');
    }
  } catch (err) {
    if (audioToggle) audioToggle.textContent = 'AUDIO';
  }
});
