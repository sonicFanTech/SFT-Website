(() => {
  const homeScenes = [
    {
      background: "Assets/images/Backgrounds/StartRoom.png",
      layout: {
        "char-flowey": [29, 73, 1.7],
        "char-sans": [45, 78, 2.25],
        "char-papyrus": [56, 74, 2.05],
        "char-toriel": [83, 67, 1.42],
        "char-asgore": [70, 61, 1.52],
        "char-undyne": [17, 64, 1.08]
      }
    },
    {
      background: "Assets/images/Backgrounds/SnowyTown.png",
      layout: {
        "char-flowey": [17, 74, 1.72],
        "char-sans": [31, 79, 2.25],
        "char-papyrus": [44, 75, 2.05],
        "char-toriel": [61, 69, 1.42],
        "char-asgore": [77, 63, 1.52],
        "char-undyne": [89, 65, 1.08]
      }
    },
    {
      background: "Assets/images/Backgrounds/OkdTown.png",
      layout: {
        "char-flowey": [77, 74, 1.72],
        "char-sans": [18, 79, 2.25],
        "char-papyrus": [31, 75, 2.05],
        "char-toriel": [50, 69, 1.42],
        "char-asgore": [67, 63, 1.52],
        "char-undyne": [85, 65, 1.08]
      }
    },
    {
      background: "Assets/images/Backgrounds/TheSurfaces.png",
      layout: {
        "char-flowey": [85, 74, 1.72],
        "char-sans": [22, 79, 2.25],
        "char-papyrus": [36, 75, 2.05],
        "char-toriel": [55, 69, 1.42],
        "char-asgore": [70, 63, 1.52],
        "char-undyne": [11, 66, 1.08]
      }
    }
  ];

  const dogFrames = [
    "Assets/images/Animation/HomePage_TobyFoxDog/spr_tinypomwalk_0.png",
    "Assets/images/Animation/HomePage_TobyFoxDog/spr_tinypomwalk_1.png"
  ];

  const saveFrames = [
    "Assets/images/Animation/SAVE_p_Sparkle/spr_savepoint_0.png",
    "Assets/images/Animation/SAVE_p_Sparkle/spr_savepoint_1.png"
  ];

  const storage = {
    get(key) {
      try { return localStorage.getItem(key); } catch (_) { return null; }
    },
    set(key, value) {
      try { localStorage.setItem(key, value); } catch (_) {}
    }
  };

  const bootLayer = document.getElementById("bootLayer");
  const bootSplashA = document.getElementById("bootSplashA");
  const bootSplashB = document.getElementById("bootSplashB");
  const bootSwapSound = document.getElementById("bootSwapSound");
  const moveSound = document.getElementById("moveSound");
  const selectSound = document.getElementById("selectSound");
  const errorSound = document.getElementById("errorSound");
  const noticeDialog = document.getElementById("noticeDialog");
  const noticeButtons = document.querySelectorAll("#noticeButton, [data-open-notice='true']");
  const routeViews = Array.from(document.querySelectorAll(".app-view"));
  const routeLinks = Array.from(document.querySelectorAll("[data-route-link]"));
  const dogSprite = document.getElementById("dogSprite");
  const saveSparkles = Array.from(document.querySelectorAll(".save-sparkle"));

  let audioUnlocked = false;
  let bootFinished = false;
  let bootTimers = [];

  const playSound = (sound) => {
    if (!sound) return;
    try {
      sound.currentTime = 0;
      const result = sound.play();
      if (result && typeof result.catch === "function") result.catch(() => {});
    } catch (_) {}
  };

  const unlockAudio = () => {
    audioUnlocked = true;
  };

  const pickDifferentIndex = (length, key) => {
    const last = Number(storage.get(key));
    let index = Math.floor(Math.random() * length);
    if (length > 1 && Number.isFinite(last) && index === last) {
      index = (index + 1 + Math.floor(Math.random() * (length - 1))) % length;
    }
    storage.set(key, String(index));
    return index;
  };

  const applyHomeScene = () => {
    const sceneIndex = pickDifferentIndex(homeScenes.length, "sft-under-home-scene");
    const scene = homeScenes[sceneIndex];
    document.documentElement.style.setProperty("--bg-img", `url("${scene.background}")`);
    document.documentElement.style.setProperty("--scene-img", `url("${scene.background}")`);

    Object.entries(scene.layout).forEach(([id, values]) => {
      const el = document.getElementById(id);
      if (!el) return;
      el.style.left = `${values[0]}%`;
      el.style.top = `${values[1]}%`;
      el.style.setProperty("--char-scale", values[2]);
    });
  };

  const normalizeRoute = (hash) => {
    const clean = (hash || "").replace(/^#/, "").trim();
    const allowed = new Set(routeViews.map((view) => view.dataset.route));
    return allowed.has(clean) ? clean : "home";
  };

  const setActiveRouteLink = (route) => {
    routeLinks.forEach((link) => {
      link.classList.toggle("is-active", link.dataset.routeLink === route);
    });
  };

  const showRoute = (route) => {
    routeViews.forEach((view) => {
      view.classList.toggle("active", view.dataset.route === route);
    });
    setActiveRouteLink(route);
    if (route === "home") {
      applyHomeScene();
    }
    window.scrollTo({ top: 0, behavior: "auto" });
  };

  const handleRoute = () => {
    const route = normalizeRoute(location.hash);
    if (!location.hash) {
      history.replaceState(null, "", "#home");
    }
    showRoute(route);
    const titles = {
      home: "SFT UNDERTALE Mods DB",
      mods: "SFT UNDERTALE Mods DB - Mod List",
      "mod-settings-plus": "SFT UNDERTALE Mods DB - UNDERTALE Settings+",
      "mod-undertale-debug-menu-port": "SFT UNDERTALE Mods DB - UNDERTALE Debug Menu Port",
      install: "SFT UNDERTALE Mods DB - Install",
      controls: "SFT UNDERTALE Mods DB - Controls",
      credits: "SFT UNDERTALE Mods DB - Credits"
    };
    document.title = titles[route] || "SFT UNDERTALE Mods DB";
  };

  const openNotice = () => {
    unlockAudio();
    playSound(errorSound);
    if (typeof noticeDialog?.showModal === "function") {
      noticeDialog.showModal();
    } else {
      alert("Use the script with a legally owned copy of UNDERTALE. Keep a clean backup of your original data.win so you can restore the game at any time.");
    }
  };

  noticeButtons.forEach((button) => {
    button.addEventListener("click", openNotice);
  });

  document.querySelectorAll(".sound-hover").forEach((el) => {
    el.addEventListener("mouseenter", () => audioUnlocked && playSound(moveSound));
    el.addEventListener("focus", () => audioUnlocked && playSound(moveSound));
  });

  document.querySelectorAll(".sound-click").forEach((el) => {
    el.addEventListener("click", () => {
      unlockAudio();
      playSound(selectSound);
    });
  });

  const closeBoot = () => {
    if (bootFinished) return;
    bootFinished = true;
    bootTimers.forEach((timer) => clearTimeout(timer));
    bootTimers = [];
    bootLayer?.classList.add("is-closed");
    window.setTimeout(() => bootLayer?.remove(), 820);
  };

  const runBootSequence = () => {
    if (!bootLayer || !bootSplashA || !bootSplashB) return;
    bootSplashA.classList.add("is-active");
    bootSplashB.classList.remove("is-active");

    bootTimers.push(window.setTimeout(() => {
      unlockAudio();
      playSound(bootSwapSound);
      bootSplashA.classList.remove("is-active");
      bootSplashB.classList.add("is-active");
    }, 2000));

    bootTimers.push(window.setTimeout(() => {
      closeBoot();
    }, 3350));
  };

  if (bootLayer) {
    bootLayer.addEventListener("click", closeBoot);
    window.addEventListener("keydown", (event) => {
      if (!bootLayer || bootFinished) return;
      if (["Enter", " ", "Spacebar"].includes(event.key)) {
        event.preventDefault();
        closeBoot();
      }
    });
    runBootSequence();
  }

  let dogFrame = 0;
  window.setInterval(() => {
    dogFrame = (dogFrame + 1) % dogFrames.length;
    if (dogSprite) dogSprite.src = dogFrames[dogFrame];
  }, 180);

  let saveFrame = 0;
  window.setInterval(() => {
    saveFrame = (saveFrame + 1) % saveFrames.length;
    saveSparkles.forEach((sparkle) => {
      sparkle.src = saveFrames[saveFrame];
    });
  }, 260);
  handleRoute();

  window.addEventListener("hashchange", handleRoute);
  window.addEventListener("pageshow", (event) => {
    if (event.persisted && normalizeRoute(location.hash) === "home") {
      applyHomeScene();
    }
  });
})();
