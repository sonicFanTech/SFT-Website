(function () {
  const header = document.querySelector("[data-aero-header]");
  const menuButton = document.getElementById("menuBtn");
  const siteNav = document.getElementById("siteNav");

  if (header && menuButton && siteNav) {
    menuButton.addEventListener("click", function () {
      const isOpen = header.classList.toggle("is-open");
      menuButton.setAttribute("aria-expanded", String(isOpen));
    });

    siteNav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        header.classList.remove("is-open");
        menuButton.setAttribute("aria-expanded", "false");
      });
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        header.classList.remove("is-open");
        menuButton.setAttribute("aria-expanded", "false");
      }
    });
  }

  document.querySelectorAll("[data-year]").forEach(function (element) {
    element.textContent = new Date().getFullYear();
  });

  function relativeTimeFromDate(dateString) {
    if (!dateString || dateString === "NA") {
      return "N/A";
    }

    const date = new Date(dateString + "T00:00:00");
    if (Number.isNaN(date.getTime())) {
      return dateString;
    }

    const now = new Date();
    const days = Math.floor((now - date) / 86400000);

    if (days <= 0) {
      return "today";
    }

    if (days === 1) {
      return "yesterday";
    }

    if (days < 7) {
      return days + " days ago";
    }

    if (days < 30) {
      const weeks = Math.floor(days / 7);
      return weeks + " week" + (weeks === 1 ? "" : "s") + " ago";
    }

    if (days < 365) {
      const months = Math.floor(days / 30);
      return months + " month" + (months === 1 ? "" : "s") + " ago";
    }

    const years = Math.floor(days / 365);
    return years + " year" + (years === 1 ? "" : "s") + " ago";
  }

  document.querySelectorAll(".rel-time").forEach(function (element) {
    const dateString = (element.dataset.date || "").trim();
    const relative = relativeTimeFromDate(dateString);
    element.textContent = dateString && dateString !== "NA" ? relative + " (" + dateString + ")" : relative;
    element.title = dateString;
  });

  /*
    Background music playlist:
    - Put royalty-free or original files in assets/audio/.
    - Register them here with title, artist, file, and source/license note.
    - Do not use files from Site/ and do not add copyrighted commercial music.

    Example:
    const aeroPlaylist = [
      {
        title: "Glass Morning Loop",
        artist: "sonic Fan Tech",
        file: "assets/audio/glass-morning-loop.mp3",
        source: "Original loop, 2026"
      }
    ];
  */
  const aeroPlaylist = [
    {
      title: "Aqua (Frutiger Aero Chillwave)",
      artist: "9JackJack8",
      file: "assets/audio/frutiger-aero/01-aqua-frutiger-aero-chillwave.mp3",
      source: "Pixabay Content License"
    },
    {
      title: "Aquatic Ambience (Frutiger Aero Chill)",
      artist: "9JackJack8",
      file: "assets/audio/frutiger-aero/02-aquatic-ambience-frutiger-aero-chill.mp3",
      source: "Pixabay Content License"
    },
    {
      title: "Risesun on Mars (Day 1)",
      artist: "DayNigthMorning",
      file: "assets/audio/frutiger-aero/03-risesun-on-mars-day-1.mp3",
      source: "Pixabay Content License"
    },
    {
      title: "Neon Nostalgia",
      artist: "DMassaIII",
      file: "assets/audio/frutiger-aero/04-neon-nostalgia.mp3",
      source: "Pixabay Content License"
    },
    {
      title: "Frutiger aero",
      artist: "Mewwwwwww",
      file: "assets/audio/frutiger-aero/05-frutiger-aero-tropical.mp3",
      source: "Pixabay Content License"
    }
  ];

  const player = document.querySelector("[data-music-player]");
  if (!player) {
    return;
  }

  const audio = player.querySelector("[data-music-audio]");
  const playButton = player.querySelector("[data-music-play]");
  const pauseButton = player.querySelector("[data-music-pause]");
  const prevButton = player.querySelector("[data-music-prev]");
  const nextButton = player.querySelector("[data-music-next]");
  const muteButton = player.querySelector("[data-music-mute]");
  const volume = player.querySelector("[data-music-volume]");
  const trackLabel = player.querySelector("[data-music-track]");
  const artistLabel = player.querySelector("[data-music-artist]");
  const sourceLabel = player.querySelector("[data-music-source]");
  let trackCountLabel = player.querySelector("[data-music-count]");
  const progressFill = player.querySelector("[data-music-progress]");
  const progressTime = player.querySelector("[data-music-time]");
  const visualizer = player.querySelector("[data-music-visualizer]");
  const volumeKey = "sftAeroMusicVolume";
  const mutedKey = "sftAeroMusicMuted";
  const selectedKey = "sftAeroMusicSelectedTrack";
  const timeKey = "sftAeroMusicCurrentTime";
  const wasPlayingKey = "sftAeroMusicWasPlaying";
  let currentIndex = clampIndex(Number(window.localStorage.getItem(selectedKey)) || 0);
  let isLoaded = false;
  let lastSavedAt = 0;
  let resumeAttempted = false;
  let pendingSeekTime = Number(window.localStorage.getItem(timeKey)) || 0;
  const shouldResumePlayback = window.localStorage.getItem(wasPlayingKey) === "true";

  if (!trackCountLabel) {
    trackCountLabel = document.createElement("span");
    trackCountLabel.className = "music-source";
    trackCountLabel.setAttribute("data-music-count", "");
    const musicMeta = player.querySelector(".music-meta");
    if (musicMeta) {
      musicMeta.insertBefore(trackCountLabel, sourceLabel || null);
    }
  }

  function clampIndex(index) {
    if (!aeroPlaylist.length) {
      return 0;
    }

    if (!Number.isFinite(index)) {
      return 0;
    }

    return Math.min(aeroPlaylist.length - 1, Math.max(0, index));
  }

  function formatTime(seconds) {
    if (!Number.isFinite(seconds) || seconds < 0) {
      return "0:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remaining = Math.floor(seconds % 60).toString().padStart(2, "0");
    return minutes + ":" + remaining;
  }

  function setText(element, text) {
    if (element) {
      element.textContent = text;
    }
  }

  function setPlaying(isPlaying) {
    if (visualizer) {
      visualizer.classList.toggle("is-playing", isPlaying);
    }
  }

  function setProgress() {
    const duration = Number.isFinite(audio.duration) ? audio.duration : 0;
    const current = Number.isFinite(audio.currentTime) ? audio.currentTime : 0;
    const percent = duration > 0 ? Math.min(100, Math.max(0, (current / duration) * 100)) : 0;

    if (progressFill) {
      progressFill.style.width = percent + "%";
    }

    setText(progressTime, formatTime(current) + " / " + formatTime(duration));
  }

  function savePlaybackSnapshot(isPlayingOverride) {
    if (!isLoaded) {
      return;
    }

    const duration = Number.isFinite(audio.duration) ? audio.duration : 0;
    let current = Number.isFinite(audio.currentTime) ? audio.currentTime : 0;

    if (duration > 0 && current >= duration - 0.4) {
      current = 0;
    }

    window.localStorage.setItem(selectedKey, String(currentIndex));
    window.localStorage.setItem(timeKey, String(Math.max(0, current)));

    if (typeof isPlayingOverride === "boolean") {
      window.localStorage.setItem(wasPlayingKey, String(isPlayingOverride));
    }
  }

  function savePlaybackTimeSoon() {
    const now = Date.now();
    if (now - lastSavedAt < 750) {
      return;
    }

    lastSavedAt = now;
    savePlaybackSnapshot();
  }

  function applySavedTime(time) {
    const duration = Number.isFinite(audio.duration) ? audio.duration : 0;
    const safeTime = Number.isFinite(time) ? Math.max(0, time) : 0;

    try {
      if (!safeTime || (duration > 0 && safeTime >= duration - 0.4)) {
        audio.currentTime = 0;
      } else {
        audio.currentTime = safeTime;
      }
    } catch (error) {
      return false;
    }

    setProgress();
    return true;
  }

  function attemptPlayback() {
    if (!isLoaded) {
      return;
    }

    window.localStorage.setItem(wasPlayingKey, "true");
    const playAttempt = audio.play();
    if (playAttempt && typeof playAttempt.catch === "function") {
      playAttempt.catch(function () {
        setText(sourceLabel, "Playback is ready. Press Play if the browser blocks auto-start.");
        setPlaying(false);
      });
    }
  }

  function applyStoredPrefs() {
    const savedVolume = Number(window.localStorage.getItem(volumeKey));
    const normalizedVolume = Number.isFinite(savedVolume) ? Math.min(1, Math.max(0, savedVolume)) : 0.55;
    audio.volume = normalizedVolume;
    audio.muted = window.localStorage.getItem(mutedKey) === "true";

    if (volume) {
      volume.value = String(Math.round(audio.volume * 100));
    }

    if (muteButton) {
      muteButton.textContent = audio.muted ? "On" : "Mute";
      muteButton.setAttribute("aria-pressed", String(audio.muted));
      muteButton.title = audio.muted ? "Unmute" : "Mute";
    }
  }

  function showNoTracks() {
    isLoaded = false;
    audio.removeAttribute("src");
    audio.load();
    setText(trackLabel, "No track registered");
    setText(artistLabel, "Add music in assets/js/aero-site.js");
    setText(trackCountLabel, "0 / 0");
    setText(sourceLabel, "Use assets/audio/ for your own royalty-free files.");
    setProgress();
    setPlaying(false);
  }

  function loadTrack(index, options) {
    const settings = options || {};
    if (!aeroPlaylist.length) {
      showNoTracks();
      return false;
    }

    currentIndex = clampIndex(index);
    const track = aeroPlaylist[currentIndex];
    isLoaded = Boolean(track && track.file);

    if (!isLoaded) {
      showNoTracks();
      return false;
    }

    audio.src = track.file;
    audio.load();
    setText(trackLabel, track.title || "Untitled track");
    setText(artistLabel, track.artist || "Unknown artist");
    setText(trackCountLabel, currentIndex + 1 + " / " + aeroPlaylist.length);
    setText(sourceLabel, track.source || "No source note");
    window.localStorage.setItem(selectedKey, String(currentIndex));
    if (!settings.restoreTime) {
      pendingSeekTime = 0;
      window.localStorage.setItem(timeKey, "0");
    }
    setProgress();
    setPlaying(false);

    let restored = false;
    function restoreOnce() {
      if (restored) {
        return;
      }

      if (settings.restoreTime) {
        const canSeekNow = !pendingSeekTime || audio.readyState >= 1;
        if (!canSeekNow || !applySavedTime(pendingSeekTime)) {
          return;
        }
      }

      restored = true;
      if (settings.resume && !resumeAttempted) {
        resumeAttempted = true;
        window.setTimeout(attemptPlayback, 80);
      }
    }

    audio.addEventListener("loadedmetadata", restoreOnce, { once: true });
    window.setTimeout(restoreOnce, 250);
    return true;
  }

  function changeTrack(direction) {
    if (!aeroPlaylist.length) {
      showNoTracks();
      return;
    }

    const nextIndex = (currentIndex + direction + aeroPlaylist.length) % aeroPlaylist.length;
    const shouldContinue = !audio.paused;
    loadTrack(nextIndex, { restoreTime: false, resume: shouldContinue });
  }

  applyStoredPrefs();
  loadTrack(currentIndex, { restoreTime: true, resume: shouldResumePlayback });

  if (playButton) {
    playButton.addEventListener("click", function () {
      if (!isLoaded) {
        showNoTracks();
        return;
      }

      attemptPlayback();
    });
  }

  if (pauseButton) {
    pauseButton.addEventListener("click", function () {
      savePlaybackSnapshot(false);
      audio.pause();
    });
  }

  if (prevButton) {
    prevButton.addEventListener("click", function () {
      changeTrack(-1);
    });
  }

  if (nextButton) {
    nextButton.addEventListener("click", function () {
      changeTrack(1);
    });
  }

  if (muteButton) {
    muteButton.addEventListener("click", function () {
      audio.muted = !audio.muted;
      window.localStorage.setItem(mutedKey, String(audio.muted));
      muteButton.textContent = audio.muted ? "On" : "Mute";
      muteButton.setAttribute("aria-pressed", String(audio.muted));
      muteButton.title = audio.muted ? "Unmute" : "Mute";
    });
  }

  if (volume) {
    volume.addEventListener("input", function () {
      const value = Math.min(100, Math.max(0, Number(volume.value)));
      audio.volume = value / 100;
      window.localStorage.setItem(volumeKey, String(audio.volume));
    });
  }

  audio.addEventListener("play", function () {
    savePlaybackSnapshot(true);
    setPlaying(true);
  });

  audio.addEventListener("pause", function () {
    savePlaybackSnapshot();
    setPlaying(false);
  });

  audio.addEventListener("ended", function () {
    setPlaying(false);
    savePlaybackSnapshot(true);
    changeTrack(1);
  });

  audio.addEventListener("timeupdate", function () {
    setProgress();
    savePlaybackTimeSoon();
  });
  audio.addEventListener("durationchange", setProgress);

  window.addEventListener("pagehide", function () {
    savePlaybackSnapshot(isLoaded && !audio.paused);
  });

  window.addEventListener("beforeunload", function () {
    savePlaybackSnapshot(isLoaded && !audio.paused);
  });

  audio.addEventListener("error", function () {
    setText(trackLabel, "Track file missing");
    setText(artistLabel, "The playlist entry exists, but the file did not load.");
    setPlaying(false);
    setProgress();
  });
})();
