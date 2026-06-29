const header = document.querySelector('[data-header]');
const nav = document.querySelector('[data-nav]');
const menuToggle = document.querySelector('[data-menu-toggle]');
const musicToggle = document.querySelector('[data-music-toggle]');
const audio = document.querySelector('[data-bg-audio]');

function updateHeader() {
  if (!header) return;
  header.classList.toggle('is-scrolled', window.scrollY > 24);
}

updateHeader();
window.addEventListener('scroll', updateHeader, { passive: true });

if (menuToggle && nav) {
  menuToggle.addEventListener('click', () => {
    const open = nav.classList.toggle('is-open');
    menuToggle.textContent = open ? 'Close' : 'Menu';
  });

  nav.addEventListener('click', event => {
    if (event.target.matches('a')) {
      nav.classList.remove('is-open');
      menuToggle.textContent = 'Menu';
    }
  });
}

if (musicToggle && audio) {
  const savedMusic = localStorage.getItem('utMusic') === 'on';

  function setMusicState(isPlaying) {
    musicToggle.classList.toggle('is-playing', isPlaying);
    musicToggle.textContent = isPlaying ? 'Music: On' : 'Music: Off';
    localStorage.setItem('utMusic', isPlaying ? 'on' : 'off');
  }

  setMusicState(false);

  if (savedMusic) {
    audio.volume = 0.38;
  }

  musicToggle.addEventListener('click', async () => {
    try {
      audio.volume = 0.38;
      if (audio.paused) {
        await audio.play();
        setMusicState(true);
      } else {
        audio.pause();
        setMusicState(false);
      }
    } catch (error) {
      setMusicState(false);
    }
  });
}
