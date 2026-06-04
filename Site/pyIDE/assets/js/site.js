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

  const labels = {
    en: { nav: "Navigation", theme: "Theme", language: "Language", selected: "Selected installer" },
    ar: { nav: "Navigation", theme: "Theme", language: "Language", selected: "Selected installer" },
    fr: { nav: "Navigation", theme: "Theme", language: "Langue", selected: "Installeur selectionne" },
    de: { nav: "Navigation", theme: "Theme", language: "Sprache", selected: "Ausgewaehlter Installer" },
    he: { nav: "Navigation", theme: "Theme", language: "Language", selected: "Selected installer" },
    it: { nav: "Navigazione", theme: "Tema", language: "Lingua", selected: "Installer selezionato" },
    ja: { nav: "Navigation", theme: "Theme", language: "Language", selected: "Selected installer" },
    ko: { nav: "Navigation", theme: "Theme", language: "Language", selected: "Selected installer" },
    pl: { nav: "Nawigacja", theme: "Motyw", language: "Jezyk", selected: "Wybrany instalator" },
    pt: { nav: "Navegacao", theme: "Tema", language: "Idioma", selected: "Instalador selecionado" },
    ru: { nav: "Navigation", theme: "Theme", language: "Language", selected: "Selected installer" },
    es: { nav: "Navegacion", theme: "Tema", language: "Idioma", selected: "Instalador seleccionado" },
    tr: { nav: "Gezinti", theme: "Tema", language: "Dil", selected: "Secili kurulum" }
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

  function normalizeLang(value) {
    if (!value) return "en";
    const short = String(value).toLowerCase().split("-")[0];
    return Object.prototype.hasOwnProperty.call(installers, short) ? short : "en";
  }

  function getAutoLang() {
    return normalizeLang(navigator.language || navigator.userLanguage || "en");
  }

  function textFor(lang, key) {
    return (labels[lang] && labels[lang][key]) || labels.en[key];
  }

  function applyLanguage(choice, persist = true) {
    const lang = choice === "auto" ? getAutoLang() : normalizeLang(choice);
    document.documentElement.lang = lang;
    document.documentElement.dir = rtlLangs.has(lang) ? "rtl" : "ltr";

    document.querySelectorAll("[data-ui-label]").forEach((node) => {
      const value = textFor(lang, node.getAttribute("data-ui-label"));
      if (value) node.textContent = value;
    });

    document.querySelectorAll("[data-installer-note]").forEach((node) => {
      const installer = installers[lang] || installers.en;
      node.textContent = textFor(lang, "selected") + ": " + installer;
    });

    document.querySelectorAll("[data-legacy-download]").forEach((node) => {
      const installer = installers[lang] || installers.en;
      node.setAttribute("href", RELEASE_BASE + encodeURIComponent(installer));
    });

    document.querySelectorAll("[data-shot-key]").forEach((img) => {
      const key = img.getAttribute("data-shot-key");
      const variants = screenshotVariants[key];
      if (!variants) return;
      img.src = variants[lang] || variants.en;
    });

    const select = document.getElementById("languageSelect");
    if (select) select.value = choice === "auto" ? "auto" : lang;
    if (persist) localStorage.setItem(LANG_KEY, choice === "auto" ? "auto" : lang);
  }

  function applyTheme(choice, persist = true) {
    const theme = choice === "dark" ? "dark" : "light";
    document.documentElement.dataset.theme = theme;
    const select = document.getElementById("themeSelect");
    if (select) select.value = theme;
    if (persist) localStorage.setItem(THEME_KEY, theme);
  }

  function initTheme() {
    const saved = localStorage.getItem(THEME_KEY) || "light";
    applyTheme(saved, false);
    const select = document.getElementById("themeSelect");
    if (select) {
      select.addEventListener("change", () => applyTheme(select.value));
    }
  }

  function initLanguage() {
    const saved = localStorage.getItem(LANG_KEY) || "auto";
    applyLanguage(saved, false);
    const select = document.getElementById("languageSelect");
    if (select) {
      select.addEventListener("change", () => applyLanguage(select.value));
    }
  }

  function initNav() {
    const nav = document.getElementById("mainNav");
    const toggle = document.getElementById("navToggle");
    const current = location.pathname.split("/").pop() || "index.html";

    document.querySelectorAll(".main-nav a").forEach((link) => {
      const href = link.getAttribute("href");
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
      image.src = link.getAttribute("href");
      image.alt = link.querySelector("img") ? link.querySelector("img").alt : "pyIDE screenshot";
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

    document.querySelectorAll("[data-lightbox]").forEach((link) => {
      link.addEventListener("click", (event) => {
        event.preventDefault();
        open(link);
      });
    });

    close.addEventListener("click", hide);
    overlay.addEventListener("click", (event) => {
      if (event.target === overlay) hide();
    });
    window.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && !overlay.hidden) hide();
    });
  }

  function initFaq() {
    document.querySelectorAll(".faq-item summary").forEach((summary) => {
      summary.setAttribute("role", "button");
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    const year = document.getElementById("year");
    if (year) year.textContent = String(new Date().getFullYear());
    initTheme();
    initLanguage();
    initNav();
    initLightbox();
    initFaq();
  });
})();
