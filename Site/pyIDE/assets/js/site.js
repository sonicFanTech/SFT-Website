(() => {
  const THEME_KEY = "pyide_retro_theme";
  const LANG_KEY = "pyide_retro_lang";
  const RELEASE_TAG = "v1.2.0";
  const RELEASE_BASE = "https://github.com/sonicFanTech/pyIDE/releases/download/" + RELEASE_TAG + "/";

  const installers = {
    en: "pyIDE.v1.2.0.-.EN.exe",
    ar: "pyIDE.v1.2.0.-.AR.exe",
    fr: "pyIDE.v1.2.0.-.FR.exe",
    de: "pyIDE.v1.2.0.-.DE.exe",
    he: "pyIDE.v1.2.0.-HE.exe",
    it: "pyIDE.v1.2.0.-.IT.exe",
    ja: "pyIDE.v1.2.0.-.JA.exe",
    ko: "pyIDE.v1.2.0.-.KO.exe",
    pl: "pyIDE.v1.2.0.-.PL.exe",
    pt: "pyIDE.v1.2.0.-PT.exe",
    ru: "pyIDE.v1.2.0.-.RU.exe",
    es: "pyIDE.v1.2.0.-.ES.exe",
    tr: "pyIDE.v1.2.0.-.TR.exe"
  };

  const rtlLangs = new Set(["ar", "he"]);
  const screenshotVariants = {
    "main-window": {
      en: "assets/screenshots/language/EN/1.png",
      ar: "assets/screenshots/language/AR/main-window-AR.png",
      fr: "assets/screenshots/language/FR/1.png",
      de: "assets/screenshots/language/DE/1.png",
      he: "assets/screenshots/language/HE/1.png",
      it: "assets/screenshots/language/IT/1.png",
      ja: "assets/screenshots/language/JA/1.png"
    },
    settings: {
      en: "assets/screenshots/language/EN/9.png",
      ar: "assets/screenshots/language/AR/Settings-AR.png"
    }
  };

  function translations() {
    return window.PYIDE_TRANSLATIONS || {};
  }

  function hasLocale(lang) {
    return Object.prototype.hasOwnProperty.call(translations(), lang);
  }

  function normalizeLang(value) {
    if (!value) return "en";
    const short = String(value).toLowerCase().split("-")[0];
    return hasLocale(short) ? short : "en";
  }

  function getAutoLang() {
    return normalizeLang(navigator.language || navigator.userLanguage || "en");
  }

  function lookup(lang, path) {
    const parts = String(path || "").split(".");
    let value = translations()[lang];
    for (const part of parts) {
      if (!value || typeof value !== "object" || !Object.prototype.hasOwnProperty.call(value, part)) {
        value = undefined;
        break;
      }
      value = value[part];
    }
    if (typeof value === "string" && value.trim() !== "") return value;
    if (lang !== "en") return lookup("en", path);
    return "";
  }

  function setAttrFromKey(node, attrName, key) {
    const value = lookup(currentLang(), key);
    if (value) node.setAttribute(attrName, value);
  }

  let activeLang = "en";

  function currentLang() {
    return activeLang || "en";
  }

  function applyTranslations(lang) {
    activeLang = lang;
    document.querySelectorAll("[data-i18n]").forEach((node) => {
      const value = lookup(lang, node.getAttribute("data-i18n"));
      if (value) node.textContent = value;
    });
    document.querySelectorAll("[data-i18n-html]").forEach((node) => {
      const value = lookup(lang, node.getAttribute("data-i18n-html"));
      if (value) node.innerHTML = value;
    });
    document.querySelectorAll("[data-i18n-title]").forEach((node) => setAttrFromKey(node, "title", node.getAttribute("data-i18n-title")));
    document.querySelectorAll("[data-i18n-alt]").forEach((node) => setAttrFromKey(node, "alt", node.getAttribute("data-i18n-alt")));
    document.querySelectorAll("[data-i18n-placeholder]").forEach((node) => setAttrFromKey(node, "placeholder", node.getAttribute("data-i18n-placeholder")));
    document.querySelectorAll("[data-i18n-aria-label]").forEach((node) => setAttrFromKey(node, "aria-label", node.getAttribute("data-i18n-aria-label")));
    document.querySelectorAll("[data-i18n-meta-description]").forEach((node) => setAttrFromKey(node, "content", node.getAttribute("data-i18n-meta-description")));
  }

  function updateInstaller(lang) {
    const installer = installers[lang] || installers.en;
    const label = lookup(lang, "shared.status.selectedInstaller") || "Selected installer";
    document.querySelectorAll("[data-installer-note]").forEach((node) => {
      node.textContent = label + ": " + installer;
    });
    document.querySelectorAll("[data-legacy-download]").forEach((node) => {
      node.setAttribute("href", RELEASE_BASE + encodeURIComponent(installer));
    });
  }

  function updateScreenshots(lang) {
    let usedFallback = false;
    document.querySelectorAll("[data-shot-key]").forEach((img) => {
      const key = img.getAttribute("data-shot-key");
      const variants = screenshotVariants[key];
      if (!variants) return;
      const src = variants[lang] || variants.en;
      usedFallback = usedFallback || !variants[lang];
      img.src = src;
      const card = img.closest("a[href]");
      if (card) card.setAttribute("href", src);
    });
    document.querySelectorAll("[data-shot-fallback-note]").forEach((node) => {
      node.textContent = lookup(lang, "shared.screenshots.fallbackNote");
      node.hidden = !usedFallback;
    });
  }

  function applyLanguage(choice, persist = true) {
    const lang = choice === "auto" ? getAutoLang() : normalizeLang(choice);
    document.documentElement.lang = lang;
    document.documentElement.dir = rtlLangs.has(lang) ? "rtl" : "ltr";
    applyTranslations(lang);
    updateInstaller(lang);
    updateScreenshots(lang);
    const select = document.getElementById("languageSelect");
    if (select) select.value = choice === "auto" ? "auto" : lang;
    if (persist) localStorage.setItem(LANG_KEY, choice === "auto" ? "auto" : lang);
    refreshYear();
  }

  function applyTheme(choice, persist = true) {
    const theme = choice === "dark" ? "dark" : "light";
    document.documentElement.dataset.theme = theme;
    const select = document.getElementById("themeSelect");
    if (select) select.value = theme;
    if (persist) localStorage.setItem(THEME_KEY, theme);
  }

  function refreshYear() {
    document.querySelectorAll("#year").forEach((year) => {
      year.textContent = String(new Date().getFullYear());
    });
  }

  function initTheme() {
    const saved = localStorage.getItem(THEME_KEY) || "light";
    applyTheme(saved, false);
    const select = document.getElementById("themeSelect");
    if (select) select.addEventListener("change", () => applyTheme(select.value));
  }

  function initLanguage() {
    const saved = localStorage.getItem(LANG_KEY) || "auto";
    applyLanguage(saved, false);
    const select = document.getElementById("languageSelect");
    if (select) select.addEventListener("change", () => applyLanguage(select.value));
  }

  function initNav() {
    const nav = document.getElementById("mainNav");
    const toggle = document.getElementById("navToggle");
    const current = location.pathname.split("/").pop() || "index.html";
    document.querySelectorAll(".main-nav a").forEach((link) => {
      const href = (link.getAttribute("href") || "").split("#")[0];
      if (href === current || (current === "" && href === "index.html")) {
        link.classList.add("active");
        link.setAttribute("aria-current", "page");
      }
    });
    if (nav && toggle) {
      toggle.addEventListener("click", () => {
        const isOpen = nav.classList.toggle("open");
        toggle.setAttribute("aria-expanded", String(isOpen));
      });
    }
  }

  function initLightbox() {
    const overlay = document.getElementById("lightbox");
    const image = document.getElementById("lightboxImage");
    const caption = document.getElementById("lightboxCaption");
    const close = document.getElementById("lightboxClose");
    if (!overlay || !image || !caption || !close) return;
    let lastFocus = null;

    function open(link) {
      lastFocus = document.activeElement;
      const img = link.querySelector("img");
      image.src = link.getAttribute("href");
      image.alt = img ? img.alt : "pyIDE screenshot";
      caption.textContent = link.getAttribute("data-caption") || image.alt;
      overlay.hidden = false;
      close.focus();
    }

    function hide() {
      overlay.hidden = true;
      image.removeAttribute("src");
      caption.textContent = "";
      if (lastFocus && typeof lastFocus.focus === "function") lastFocus.focus();
    }

    document.addEventListener("click", (event) => {
      const link = event.target.closest("[data-lightbox]");
      if (link) {
        event.preventDefault();
        open(link);
        return;
      }
      if (event.target === overlay) hide();
    });
    close.addEventListener("click", hide);
    window.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && !overlay.hidden) hide();
    });
  }

  function initImageFallbacks() {
    document.addEventListener("error", (event) => {
      const img = event.target;
      if (!(img instanceof HTMLImageElement)) return;
      const key = img.getAttribute("data-shot-key");
      if (!key || img.dataset.fallbackApplied === "true") return;
      const fallback = screenshotVariants[key] && screenshotVariants[key].en;
      if (fallback) {
        img.dataset.fallbackApplied = "true";
        img.src = fallback;
      }
    }, true);
  }

  function initFaq() {
    document.querySelectorAll(".faq-item summary").forEach((summary) => {
      summary.setAttribute("role", "button");
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    refreshYear();
    initTheme();
    initLanguage();
    initNav();
    initLightbox();
    initImageFallbacks();
    initFaq();
  });
})();