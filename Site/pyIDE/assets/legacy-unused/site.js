(() => {
  const THEME_KEY = "pyide_site_theme";
  const LANG_KEY = "pyide_site_lang";
  const REL_TAG = "v1.2.0";
  const GH_BASE = `https://github.com/sonicFanTech/pyIDE/releases/download/${REL_TAG}/`;

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

  const shotAssets = {
    main: {
      en: "assets/screenshots/language/EN/1.png",
      ar: "assets/screenshots/language/AR/main-window-AR.png",
      fr: "assets/screenshots/language/FR/1.png",
      de: "assets/screenshots/language/DE/1.png",
      he: "assets/screenshots/language/HE/1.png",
      it: "assets/screenshots/language/IT/1.png",
      ja: "assets/screenshots/language/JA/1.png"
    },
    line_numbers: { en: "assets/screenshots/language/EN/2.png" },
    find_replace: { en: "assets/screenshots/language/EN/3.png" },
    project_manager: { en: "assets/screenshots/language/EN/4.png" },
    recent_files: { en: "assets/screenshots/language/EN/5.png" },
    interpreter: { en: "assets/screenshots/language/EN/6.png" },
    external_console: { en: "assets/screenshots/language/EN/7.png" },
    compiler: { en: "assets/screenshots/language/EN/8.png" },
    settings: {
      en: "assets/screenshots/language/EN/9.png",
      ar: "assets/screenshots/language/AR/Settings-AR.png"
    },
    autocomplete: { en: "assets/screenshots/language/EN/10.png" },
    tools_menu: { en: "assets/screenshots/language/EN/11.png" },
    syntax_output: { en: "assets/screenshots/language/EN/12.png" },
    external_manager: { en: "assets/screenshots/language/EN/3rd_Party_EC_Man.png" }
  };

  const T = {
    en: {
      nav_overview: "Overview",
      nav_features: "Features",
      nav_ai: "AI Assistant",
      nav_recode: "C++ Recode",
      nav_screenshots: "Screenshots",
      nav_shortcuts: "Shortcuts",
      nav_downloads: "Downloads",
      nav_faq: "FAQ",
      nav_github: "GitHub",
      lang_label: "Language",
      theme_label: "Theme",
      theme_auto: "Auto",
      theme_dark: "Dark",
      theme_light: "Light",
      menu_label: "Open navigation menu",
      hero_badge: "pyIDE v2.0 - Currently in Development",
      hero_title: "pyIDE is being rebuilt.",
      hero_lead: "A native C++ recode of the SFT Python IDE - with a faster desktop foundation, a redesigned development workflow, and an experimental built-in AI Desktop Assistant.",
      cta_features: "Explore v2.0 Features",
      cta_ai: "View AI Desktop Assistant",
      cta_legacy: "Download Legacy Version",
      cta_github: "View on GitHub",
      concept_caption: "v2.0 interface concept - decorative website illustration, not a screenshot",
      notice_title: "Development status",
      notice_text: "The C++ version of pyIDE is actively being developed. The older Python version remains available as a legacy download while the new desktop architecture, editor tools, project controls, and AI Assistant are built and tested.",
      tag_legacy: "Legacy v1 Available",
      tag_recode: "v2.0 C++ Recode Active",
      tag_ai: "AI Assistant Experimental",
      tag_windows: "Windows Desktop App",
      overview_kicker: "Overview",
      overview_title: "A practical Windows IDE growing into a larger desktop development project",
      overview_lead: "SFT pyIDE began as a lightweight but practical Python IDE. pyIDE v2.0 keeps that approachable workflow in mind while rebuilding the application as a stronger native desktop tool.",
      legacy_title: "Legacy Python Version",
      recode_title: "C++ Recode: pyIDE v2.0",
      features_kicker: "Feature map",
      features_title: "Legacy workflow, v2.0 direction, and honest status labels",
      features_lead: "The site separates what the older Python version already supports from what the C++ recode is working toward.",
      workflow_kicker: "Editor workflow",
      workflow_title: "A practical desktop coding workflow",
      workflow_lead: "The original pyIDE focused on files, tabs, running scripts, and everyday editing. The recode is intended to preserve that shape while making room for deeper editor tooling.",
      run_kicker: "Run and build",
      run_title: "Run code the way your project needs",
      run_lead: "The legacy workflow supports both integrated output and real terminal windows. v2.0 should preserve and improve these paths as the recode matures.",
      advanced_kicker: "Advanced tools",
      advanced_title: "Debugging and smarter editor systems",
      advanced_lead: "Advanced IDE features are presented with careful status labels so planned work is not mistaken for completed v2.0 functionality.",
      ai_kicker: "Experimental - In Development",
      ai_title: "AI Desktop Assistant",
      ai_lead: "pyIDE v2.0 is being designed with an optional built-in AI Desktop Assistant that can use carefully scoped pyIDE tools to understand the active project, inspect editor state, and assist with development tasks.",
      permission_title: "You decide when pyIDE control is allowed",
      permission_text: "AI project controls are designed to require the Allow pyIDE Control option, stay inside the active project folder, and reject path traversal attempts such as ../.",
      tools_title: "Project-aware tools currently being tested",
      usecases_title: "AI use cases",
      safety_title: "Designed around scoped access",
      recode_kicker: "C++ recode",
      recode_why_title: "Why rebuild pyIDE in C++?",
      recode_why_lead: "The original Python version proved the core workflow. The C++ rewrite is meant to provide a stronger long-term desktop foundation without discarding the practical editor habits that made pyIDE useful.",
      roadmap_kicker: "Roadmap",
      roadmap_title: "Development phases without fake dates",
      roadmap_lead: "The roadmap uses broad phases and status labels instead of release dates, percentages, or unsupported completion claims.",
      shots_kicker: "Screenshots",
      shots_title: "Real screenshots are labeled as legacy",
      shots_lead: "The current image assets show the Legacy Python Version. New v2.0 screenshots will be added only when real recode screenshots are available.",
      v2_shots_title: "C++ Recode Screenshots",
      v2_shots_notice: "New v2.0 screenshots will be added as the recode progresses.",
      ai_shots_title: "AI Desktop Assistant visuals",
      ai_shots_notice: "No real AI Assistant screenshots were found in the local assets. This page uses code-style diagrams and clearly labeled concept panels instead.",
      shortcuts_kicker: "Reference",
      shortcuts_title: "Legacy keyboard shortcuts",
      shortcuts_lead: "These shortcuts are confirmed for the Legacy Python Version. v2.0 bindings should be updated here only when they are verified.",
      downloads_kicker: "Downloads",
      downloads_title: "Legacy download now, v2.0 when ready",
      downloads_lead: "The older Python/PySide6 edition remains available while the C++ recode is developed.",
      legacy_download_title: "Legacy Python Version",
      legacy_download_text: "The earlier Python/PySide6 edition remains available while the new C++ recode is developed.",
      download_setup: "Download Legacy Setup",
      source_link: "Source on GitHub",
      releases_link: "Releases",
      download_note: "Legacy version - available now",
      v2_download_title: "pyIDE v2.0 C++ Recode",
      v2_download_text: "The C++ recode is currently in development. A public download will be added when a build is ready to share.",
      v2_disabled: "v2.0 Download - Not Available Yet",
      faq_kicker: "Questions",
      faq_title: "FAQ",
      faq_lead: "Straight answers about the legacy version, the C++ recode, and the experimental AI Desktop Assistant.",
      lb_close: "Close",
      footer_note: "pyIDE v2.0 is currently in development.",
      selected_installer: "Selected installer",
      status_legacy: "Available in Legacy v1",
      status_working: "Working in v2.0 Development Build",
      status_development: "In Development",
      status_planned: "Planned",
      status_experimental: "Experimental",
      status_legacy_download: "Legacy Download",
      shot_main: "Main window",
      shot_main_desc: "Tabs, project tree, interpreter selector, and output panel",
      shot_lines: "Line numbers",
      shot_lines_desc: "Legacy editor gutter",
      shot_find: "Find and replace",
      shot_find_desc: "Search and replacement dialog",
      shot_project: "Project manager",
      shot_project_desc: "Project tree with file actions",
      shot_recent: "Recent files",
      shot_recent_desc: "Recent-file history menu",
      shot_interpreter: "Interpreter manager",
      shot_interpreter_desc: "Python interpreter selection",
      shot_console: "External console",
      shot_console_desc: "Run mode selection",
      shot_compiler: "Compiler workflow",
      shot_compiler_desc: "Legacy PyInstaller helper",
      shot_settings: "Settings",
      shot_settings_desc: "Theme, autosave, recent files, and autocomplete",
      shot_autocomplete: "Autocomplete",
      shot_autocomplete_desc: "Legacy completion popup",
      shot_tools: "Tools menu",
      shot_tools_desc: "Syntax check, compiler, and interpreter tools",
      shot_syntax: "Syntax check output",
      shot_syntax_desc: "py_compile diagnostics in the output panel",
      shot_external_manager: "External console manager",
      shot_external_manager_desc: "Custom external console configuration"
    },
    ar: {
      nav_overview: "نظرة عامة",
      nav_features: "الميزات",
      nav_ai: "المساعد الذكي",
      nav_recode: "إعادة كتابة C++",
      nav_screenshots: "لقطات الشاشة",
      nav_shortcuts: "الاختصارات",
      nav_downloads: "التنزيلات",
      nav_faq: "الأسئلة الشائعة",
      nav_github: "GitHub",
      lang_label: "اللغة",
      theme_label: "السمة",
      theme_auto: "تلقائي",
      theme_dark: "داكن",
      theme_light: "فاتح",
      hero_badge: "pyIDE v2.0 - قيد التطوير حاليا",
      hero_title: "تتم إعادة بناء pyIDE.",
      hero_lead: "إعادة كتابة أصلية بلغة C++ لبيئة SFT Python IDE مع أساس سطح مكتب أسرع، وسير عمل مطور، ومساعد AI Desktop Assistant تجريبي مدمج.",
      cta_features: "استكشاف ميزات v2.0",
      cta_ai: "عرض AI Desktop Assistant",
      cta_legacy: "تنزيل الإصدار القديم",
      cta_github: "عرض على GitHub",
      notice_title: "حالة التطوير",
      notice_text: "إصدار C++ من pyIDE قيد التطوير النشط، ويبقى إصدار Python القديم متاحا كتنزيل legacy.",
      tag_legacy: "Legacy v1 متاح",
      tag_recode: "إعادة كتابة v2.0 نشطة",
      tag_ai: "AI Assistant تجريبي",
      tag_windows: "تطبيق Windows",
      overview_title: "بيئة Windows عملية تتحول إلى مشروع سطح مكتب أكبر",
      overview_lead: "بدأ SFT pyIDE كبيئة Python خفيفة وعملية. يهدف pyIDE v2.0 إلى الحفاظ على ذلك مع أساس C++ أقوى.",
      features_title: "سير عمل الإصدار القديم واتجاه v2.0 مع حالات واضحة",
      workflow_title: "سير عمل عملي لكتابة الكود",
      run_title: "شغل الكود بالطريقة التي يحتاجها مشروعك",
      advanced_title: "تصحيح وأدوات تحرير أذكى",
      ai_title: "AI Desktop Assistant",
      ai_lead: "يتم تصميم pyIDE v2.0 مع مساعد اختياري يستخدم أدوات pyIDE محدودة النطاق لفهم المشروع النشط وحالة المحرر.",
      permission_title: "أنت تقرر متى يسمح بتحكم pyIDE",
      permission_text: "أدوات الذكاء الاصطناعي مصممة لتتطلب خيار Allow pyIDE Control، وأن تبقى داخل مجلد المشروع النشط، وأن ترفض محاولات ../.",
      recode_why_title: "لماذا إعادة بناء pyIDE بلغة C++؟",
      roadmap_title: "مراحل تطوير بدون تواريخ وهمية",
      shots_title: "اللقطات الحقيقية موسومة كإصدار قديم",
      v2_shots_notice: "ستضاف لقطات v2.0 الجديدة مع تقدم إعادة الكتابة.",
      shortcuts_title: "اختصارات الإصدار القديم",
      downloads_title: "تنزيل legacy الآن، وv2.0 عند الجاهزية",
      legacy_download_title: "Legacy Python Version",
      download_setup: "تنزيل إعداد Legacy",
      source_link: "المصدر على GitHub",
      releases_link: "الإصدارات",
      v2_disabled: "تنزيل v2.0 - غير متاح بعد",
      faq_title: "الأسئلة الشائعة",
      lb_close: "إغلاق",
      selected_installer: "المثبت المحدد",
      status_legacy: "متاح في Legacy v1",
      status_working: "يعمل في بنية تطوير v2.0",
      status_development: "قيد التطوير",
      status_planned: "مخطط",
      status_experimental: "تجريبي",
      status_legacy_download: "تنزيل Legacy"
    },
    fr: {
      nav_overview: "Aperçu",
      nav_features: "Fonctionnalités",
      nav_ai: "Assistant IA",
      nav_recode: "Recode C++",
      nav_screenshots: "Captures",
      nav_shortcuts: "Raccourcis",
      nav_downloads: "Téléchargements",
      nav_faq: "FAQ",
      nav_github: "GitHub",
      lang_label: "Langue",
      theme_label: "Thème",
      theme_auto: "Auto",
      theme_dark: "Sombre",
      theme_light: "Clair",
      hero_badge: "pyIDE v2.0 - en développement",
      hero_title: "pyIDE est en cours de reconstruction.",
      hero_lead: "Un recodage natif en C++ de l'IDE Python SFT, avec une base desktop plus rapide, un workflow repensé et un AI Desktop Assistant expérimental intégré.",
      cta_features: "Explorer les fonctions v2.0",
      cta_ai: "Voir AI Desktop Assistant",
      cta_legacy: "Télécharger la version legacy",
      cta_github: "Voir sur GitHub",
      notice_title: "État du développement",
      notice_text: "La version C++ de pyIDE est en développement actif. L'ancienne version Python reste disponible comme téléchargement legacy.",
      tag_legacy: "Legacy v1 disponible",
      tag_recode: "Recode C++ v2.0 actif",
      tag_ai: "Assistant IA expérimental",
      tag_windows: "Application Windows",
      overview_title: "Un IDE Windows pratique qui devient un projet desktop plus ambitieux",
      overview_lead: "SFT pyIDE a commencé comme un IDE Python léger et utile. pyIDE v2.0 garde ce workflow tout en reconstruisant l'application sur une base C++ plus solide.",
      features_title: "Workflow legacy, direction v2.0 et statuts honnêtes",
      workflow_title: "Un workflow de codage desktop pratique",
      run_title: "Exécuter le code selon les besoins du projet",
      advanced_title: "Débogage et outils d'édition plus intelligents",
      ai_title: "AI Desktop Assistant",
      ai_lead: "pyIDE v2.0 est conçu avec un assistant IA optionnel qui utilise des outils pyIDE strictement cadrés pour comprendre le projet actif et l'état de l'éditeur.",
      permission_title: "Vous décidez quand le contrôle pyIDE est autorisé",
      permission_text: "Les contrôles IA doivent dépendre de l'option Allow pyIDE Control, rester dans le projet actif et rejeter les chemins comme ../.",
      recode_why_title: "Pourquoi reconstruire pyIDE en C++ ?",
      roadmap_title: "Phases de développement sans fausses dates",
      shots_title: "Les vraies captures sont indiquées comme legacy",
      v2_shots_notice: "De nouvelles captures v2.0 seront ajoutées quand le recodage progressera.",
      shortcuts_title: "Raccourcis legacy",
      downloads_title: "Téléchargement legacy maintenant, v2.0 quand prêt",
      legacy_download_title: "Legacy Python Version",
      download_setup: "Télécharger le setup legacy",
      source_link: "Source sur GitHub",
      releases_link: "Versions",
      v2_disabled: "Téléchargement v2.0 - pas encore disponible",
      faq_title: "FAQ",
      lb_close: "Fermer",
      selected_installer: "Installeur sélectionné",
      status_legacy: "Disponible dans Legacy v1",
      status_working: "Fonctionne dans le build de développement v2.0",
      status_development: "En développement",
      status_planned: "Prévu",
      status_experimental: "Expérimental",
      status_legacy_download: "Téléchargement legacy"
    },
    de: {
      nav_overview: "Überblick",
      nav_features: "Funktionen",
      nav_ai: "KI-Assistent",
      nav_recode: "C++ Recode",
      nav_screenshots: "Screenshots",
      nav_shortcuts: "Kurzbefehle",
      nav_downloads: "Downloads",
      nav_faq: "FAQ",
      nav_github: "GitHub",
      lang_label: "Sprache",
      theme_label: "Theme",
      theme_auto: "Auto",
      theme_dark: "Dunkel",
      theme_light: "Hell",
      hero_badge: "pyIDE v2.0 - derzeit in Entwicklung",
      hero_title: "pyIDE wird neu gebaut.",
      hero_lead: "Ein nativer C++-Recode der SFT Python IDE mit stärkerer Desktop-Basis, überarbeitetem Workflow und experimentellem integriertem AI Desktop Assistant.",
      cta_features: "v2.0 Funktionen ansehen",
      cta_ai: "AI Desktop Assistant ansehen",
      cta_legacy: "Legacy-Version laden",
      cta_github: "Auf GitHub ansehen",
      notice_title: "Entwicklungsstatus",
      notice_text: "Die C++-Version von pyIDE wird aktiv entwickelt. Die ältere Python-Version bleibt als Legacy-Download verfügbar.",
      tag_legacy: "Legacy v1 verfügbar",
      tag_recode: "v2.0 C++ Recode aktiv",
      tag_ai: "AI Assistant experimentell",
      tag_windows: "Windows Desktop-App",
      overview_title: "Eine praktische Windows-IDE wächst zu einem größeren Desktop-Projekt",
      overview_lead: "SFT pyIDE begann als leichte Python-IDE. pyIDE v2.0 behält den Workflow bei und baut die App auf einer stärkeren C++-Basis neu auf.",
      features_title: "Legacy-Workflow, v2.0-Richtung und ehrliche Statuslabels",
      workflow_title: "Ein praktischer Desktop-Coding-Workflow",
      run_title: "Code so ausführen, wie dein Projekt es braucht",
      advanced_title: "Debugging und intelligentere Editor-Systeme",
      ai_title: "AI Desktop Assistant",
      ai_lead: "pyIDE v2.0 wird mit einem optionalen KI-Assistenten entwickelt, der begrenzte pyIDE-Tools für Projekt- und Editor-Kontext nutzt.",
      permission_title: "Du entscheidest, wann pyIDE-Steuerung erlaubt ist",
      permission_text: "KI-Projektsteuerung soll Allow pyIDE Control erfordern, im aktiven Projekt bleiben und Pfade wie ../ ablehnen.",
      recode_why_title: "Warum pyIDE in C++ neu bauen?",
      roadmap_title: "Entwicklungsphasen ohne erfundene Termine",
      shots_title: "Echte Screenshots sind als Legacy markiert",
      v2_shots_notice: "Neue v2.0-Screenshots werden hinzugefügt, wenn der Recode voranschreitet.",
      shortcuts_title: "Legacy-Tastenkürzel",
      downloads_title: "Legacy jetzt, v2.0 wenn bereit",
      legacy_download_title: "Legacy Python Version",
      download_setup: "Legacy-Setup laden",
      source_link: "Quellcode auf GitHub",
      releases_link: "Releases",
      v2_disabled: "v2.0 Download - noch nicht verfügbar",
      faq_title: "FAQ",
      lb_close: "Schließen",
      selected_installer: "Ausgewählter Installer",
      status_legacy: "In Legacy v1 verfügbar",
      status_working: "Funktioniert im v2.0 Development Build",
      status_development: "In Entwicklung",
      status_planned: "Geplant",
      status_experimental: "Experimentell",
      status_legacy_download: "Legacy Download"
    },
    he: {
      nav_overview: "סקירה",
      nav_features: "תכונות",
      nav_ai: "עוזר AI",
      nav_recode: "שכתוב C++",
      nav_screenshots: "צילומי מסך",
      nav_shortcuts: "קיצורים",
      nav_downloads: "הורדות",
      nav_faq: "שאלות נפוצות",
      nav_github: "GitHub",
      lang_label: "שפה",
      theme_label: "ערכת נושא",
      theme_auto: "אוטומטי",
      theme_dark: "כהה",
      theme_light: "בהיר",
      hero_badge: "pyIDE v2.0 - בפיתוח",
      hero_title: "pyIDE נבנה מחדש.",
      hero_lead: "שכתוב C++ מקורי של SFT Python IDE עם בסיס שולחני חזק יותר, workflow מחודש ו-AI Desktop Assistant ניסיוני מובנה.",
      cta_features: "הצגת תכונות v2.0",
      cta_ai: "הצגת AI Desktop Assistant",
      cta_legacy: "הורדת גרסת Legacy",
      cta_github: "הצגה ב-GitHub",
      notice_title: "מצב פיתוח",
      notice_text: "גרסת C++ של pyIDE בפיתוח פעיל. גרסת Python הישנה נשארת זמינה כהורדת Legacy.",
      tag_legacy: "Legacy v1 זמין",
      tag_recode: "שכתוב C++ v2.0 פעיל",
      tag_ai: "AI Assistant ניסיוני",
      tag_windows: "יישום Windows",
      overview_title: "IDE מעשי ל-Windows שהופך לפרויקט שולחני גדול יותר",
      overview_lead: "SFT pyIDE התחיל כ-IDE Python קל ומעשי. pyIDE v2.0 שומר על הזרימה ובונה בסיס C++ חזק יותר.",
      features_title: "Workflow ישן, כיוון v2.0 ותוויות סטטוס ברורות",
      workflow_title: "זרימת עבודה מעשית לכתיבת קוד",
      run_title: "הרצת קוד לפי צורכי הפרויקט",
      advanced_title: "דיבוג וכלי עריכה חכמים יותר",
      ai_title: "AI Desktop Assistant",
      ai_lead: "pyIDE v2.0 מתוכנן עם עוזר AI אופציונלי המשתמש בכלי pyIDE מוגבלים להבנת הפרויקט הפעיל ומצב העורך.",
      permission_title: "אתם מחליטים מתי שליטת pyIDE מותרת",
      permission_text: "כלי AI אמורים לדרוש Allow pyIDE Control, להישאר בפרויקט הפעיל ולדחות נתיבים כמו ../.",
      recode_why_title: "למה לבנות את pyIDE מחדש ב-C++?",
      roadmap_title: "שלבי פיתוח בלי תאריכים מומצאים",
      shots_title: "צילומים אמיתיים מסומנים כ-Legacy",
      v2_shots_notice: "צילומי v2.0 יתווספו ככל שהשכתוב יתקדם.",
      shortcuts_title: "קיצורי Legacy",
      downloads_title: "Legacy עכשיו, v2.0 כשיהיה מוכן",
      legacy_download_title: "Legacy Python Version",
      download_setup: "הורדת התקנת Legacy",
      source_link: "מקור ב-GitHub",
      releases_link: "גרסאות",
      v2_disabled: "הורדת v2.0 - עדיין לא זמינה",
      faq_title: "שאלות נפוצות",
      lb_close: "סגור",
      selected_installer: "מתקין נבחר",
      status_legacy: "זמין ב-Legacy v1",
      status_working: "עובד בבניית פיתוח v2.0",
      status_development: "בפיתוח",
      status_planned: "מתוכנן",
      status_experimental: "ניסיוני",
      status_legacy_download: "הורדת Legacy"
    },
    it: {
      nav_overview: "Panoramica",
      nav_features: "Funzioni",
      nav_ai: "Assistente IA",
      nav_recode: "Recode C++",
      nav_screenshots: "Screenshot",
      nav_shortcuts: "Scorciatoie",
      nav_downloads: "Download",
      nav_faq: "FAQ",
      nav_github: "GitHub",
      lang_label: "Lingua",
      theme_label: "Tema",
      theme_auto: "Auto",
      theme_dark: "Scuro",
      theme_light: "Chiaro",
      hero_badge: "pyIDE v2.0 - in sviluppo",
      hero_title: "pyIDE viene ricostruito.",
      hero_lead: "Un recode nativo in C++ dell'IDE Python SFT, con base desktop più solida, workflow ridisegnato e AI Desktop Assistant sperimentale integrato.",
      cta_features: "Esplora funzioni v2.0",
      cta_ai: "Vedi AI Desktop Assistant",
      cta_legacy: "Scarica versione legacy",
      cta_github: "Vedi su GitHub",
      notice_title: "Stato di sviluppo",
      notice_text: "La versione C++ di pyIDE è in sviluppo attivo. La vecchia versione Python resta disponibile come download legacy.",
      tag_legacy: "Legacy v1 disponibile",
      tag_recode: "Recode C++ v2.0 attivo",
      tag_ai: "AI Assistant sperimentale",
      tag_windows: "App desktop Windows",
      overview_title: "Un IDE Windows pratico che cresce in un progetto desktop più ampio",
      overview_lead: "SFT pyIDE è nato come IDE Python leggero e pratico. pyIDE v2.0 mantiene quel flusso e ricostruisce l'app su una base C++ più forte.",
      features_title: "Workflow legacy, direzione v2.0 e stati chiari",
      workflow_title: "Un flusso desktop pratico per scrivere codice",
      run_title: "Esegui codice come richiede il progetto",
      advanced_title: "Debug e strumenti editor più intelligenti",
      ai_title: "AI Desktop Assistant",
      ai_lead: "pyIDE v2.0 viene progettato con un assistente IA opzionale che usa strumenti pyIDE limitati al progetto attivo e allo stato dell'editor.",
      permission_title: "Decidi tu quando il controllo pyIDE è consentito",
      permission_text: "I controlli IA devono richiedere Allow pyIDE Control, restare nel progetto attivo e rifiutare percorsi come ../.",
      recode_why_title: "Perché ricostruire pyIDE in C++?",
      roadmap_title: "Fasi di sviluppo senza date inventate",
      shots_title: "Gli screenshot reali sono etichettati come legacy",
      v2_shots_notice: "Nuovi screenshot v2.0 saranno aggiunti con l'avanzare del recode.",
      shortcuts_title: "Scorciatoie legacy",
      downloads_title: "Legacy ora, v2.0 quando pronto",
      legacy_download_title: "Legacy Python Version",
      download_setup: "Scarica setup legacy",
      source_link: "Sorgente su GitHub",
      releases_link: "Release",
      v2_disabled: "Download v2.0 - non ancora disponibile",
      faq_title: "FAQ",
      lb_close: "Chiudi",
      selected_installer: "Installer selezionato",
      status_legacy: "Disponibile in Legacy v1",
      status_working: "Funziona nella build di sviluppo v2.0",
      status_development: "In sviluppo",
      status_planned: "Pianificato",
      status_experimental: "Sperimentale",
      status_legacy_download: "Download legacy"
    },
    ja: {
      nav_overview: "概要",
      nav_features: "機能",
      nav_ai: "AIアシスタント",
      nav_recode: "C++再構築",
      nav_screenshots: "スクリーンショット",
      nav_shortcuts: "ショートカット",
      nav_downloads: "ダウンロード",
      nav_faq: "FAQ",
      nav_github: "GitHub",
      lang_label: "言語",
      theme_label: "テーマ",
      theme_auto: "自動",
      theme_dark: "ダーク",
      theme_light: "ライト",
      hero_badge: "pyIDE v2.0 - 開発中",
      hero_title: "pyIDEは再構築中です。",
      hero_lead: "SFT Python IDEをネイティブC++で作り直し、より強いデスクトップ基盤、再設計された開発ワークフロー、実験的なAI Desktop Assistantを目指します。",
      cta_features: "v2.0機能を見る",
      cta_ai: "AI Desktop Assistantを見る",
      cta_legacy: "Legacy版をダウンロード",
      cta_github: "GitHubで見る",
      notice_title: "開発状況",
      notice_text: "pyIDEのC++版は現在開発中です。古いPython版はLegacyダウンロードとして利用できます。",
      tag_legacy: "Legacy v1利用可",
      tag_recode: "v2.0 C++再構築中",
      tag_ai: "AI Assistant実験中",
      tag_windows: "Windowsデスクトップアプリ",
      overview_title: "実用的なWindows IDEから、より大きなデスクトップ開発プロジェクトへ",
      overview_lead: "SFT pyIDEは軽量で実用的なPython IDEとして始まりました。pyIDE v2.0はその流れを保ちつつ、より強いC++基盤へ移行します。",
      features_title: "Legacyの流れ、v2.0の方向性、正直な状態ラベル",
      workflow_title: "実用的なデスクトップコーディング",
      run_title: "プロジェクトに合う方法でコードを実行",
      advanced_title: "デバッグとより賢いエディタ機能",
      ai_title: "AI Desktop Assistant",
      ai_lead: "pyIDE v2.0では、アクティブなプロジェクトとエディタ状態を理解するために制限されたpyIDEツールを使う任意のAIアシスタントを設計中です。",
      permission_title: "pyIDE制御を許可するタイミングはユーザーが決めます",
      permission_text: "AI制御はAllow pyIDE Controlを必要とし、アクティブプロジェクト内に限定され、../のような経路脱出を拒否する設計です。",
      recode_why_title: "なぜpyIDEをC++で再構築するのか？",
      roadmap_title: "架空の日付を使わない開発フェーズ",
      shots_title: "実際の画像はLegacyとして表示",
      v2_shots_notice: "v2.0の実画像は再構築が進んだ段階で追加されます。",
      shortcuts_title: "Legacyショートカット",
      downloads_title: "今はLegacy、v2.0は準備できてから",
      legacy_download_title: "Legacy Python Version",
      download_setup: "Legacyセットアップをダウンロード",
      source_link: "GitHubソース",
      releases_link: "リリース",
      v2_disabled: "v2.0ダウンロード - まだ利用不可",
      faq_title: "FAQ",
      lb_close: "閉じる",
      selected_installer: "選択されたインストーラー",
      status_legacy: "Legacy v1で利用可",
      status_working: "v2.0開発ビルドで動作",
      status_development: "開発中",
      status_planned: "予定",
      status_experimental: "実験的",
      status_legacy_download: "Legacyダウンロード"
    },
    ko: {
      nav_overview: "개요",
      nav_features: "기능",
      nav_ai: "AI Assistant",
      nav_recode: "C++ 재작성",
      nav_screenshots: "스크린샷",
      nav_shortcuts: "단축키",
      nav_downloads: "다운로드",
      nav_faq: "FAQ",
      nav_github: "GitHub",
      lang_label: "언어",
      theme_label: "테마",
      theme_auto: "자동",
      theme_dark: "어둡게",
      theme_light: "밝게",
      hero_badge: "pyIDE v2.0 - 개발 중",
      hero_title: "pyIDE가 새로 만들어지고 있습니다.",
      hero_lead: "SFT Python IDE를 네이티브 C++로 재작성하여 더 강한 데스크톱 기반, 새 개발 흐름, 실험적 AI Desktop Assistant를 준비합니다.",
      cta_features: "v2.0 기능 보기",
      cta_ai: "AI Desktop Assistant 보기",
      cta_legacy: "Legacy 버전 다운로드",
      cta_github: "GitHub에서 보기",
      notice_title: "개발 상태",
      notice_text: "pyIDE C++ 버전은 활발히 개발 중입니다. 이전 Python 버전은 Legacy 다운로드로 계속 제공됩니다.",
      tag_legacy: "Legacy v1 사용 가능",
      tag_recode: "v2.0 C++ 재작성 진행 중",
      tag_ai: "AI Assistant 실험적",
      tag_windows: "Windows 데스크톱 앱",
      overview_title: "실용적인 Windows IDE가 더 큰 데스크톱 개발 프로젝트로 성장 중",
      overview_lead: "SFT pyIDE는 가볍고 실용적인 Python IDE로 시작했습니다. pyIDE v2.0은 그 흐름을 유지하며 더 강한 C++ 기반으로 이동합니다.",
      features_title: "Legacy 워크플로, v2.0 방향, 명확한 상태 라벨",
      workflow_title: "실용적인 데스크톱 코딩 흐름",
      run_title: "프로젝트에 맞게 코드 실행",
      advanced_title: "디버깅과 더 똑똑한 편집 도구",
      ai_title: "AI Desktop Assistant",
      ai_lead: "pyIDE v2.0은 활성 프로젝트와 편집기 상태를 이해하기 위해 범위가 제한된 pyIDE 도구를 사용하는 선택적 AI Assistant를 설계 중입니다.",
      permission_title: "pyIDE 제어 허용 여부는 사용자가 결정합니다",
      permission_text: "AI 제어는 Allow pyIDE Control 옵션을 요구하고 활성 프로젝트 안에 머물며 ../ 같은 경로 탈출을 거부하도록 설계됩니다.",
      recode_why_title: "왜 pyIDE를 C++로 다시 만들까요?",
      roadmap_title: "가짜 날짜 없는 개발 단계",
      shots_title: "실제 스크린샷은 Legacy로 표시",
      v2_shots_notice: "v2.0 실제 스크린샷은 재작성 진행에 따라 추가됩니다.",
      shortcuts_title: "Legacy 단축키",
      downloads_title: "지금은 Legacy, v2.0은 준비되면",
      legacy_download_title: "Legacy Python Version",
      download_setup: "Legacy 설치 파일 다운로드",
      source_link: "GitHub 소스",
      releases_link: "릴리스",
      v2_disabled: "v2.0 다운로드 - 아직 없음",
      faq_title: "FAQ",
      lb_close: "닫기",
      selected_installer: "선택된 설치 파일",
      status_legacy: "Legacy v1에서 사용 가능",
      status_working: "v2.0 개발 빌드에서 작동",
      status_development: "개발 중",
      status_planned: "예정",
      status_experimental: "실험적",
      status_legacy_download: "Legacy 다운로드"
    },
    pl: {
      nav_overview: "Opis",
      nav_features: "Funkcje",
      nav_ai: "Asystent AI",
      nav_recode: "Recode C++",
      nav_screenshots: "Zrzuty",
      nav_shortcuts: "Skróty",
      nav_downloads: "Pobieranie",
      nav_faq: "FAQ",
      nav_github: "GitHub",
      lang_label: "Język",
      theme_label: "Motyw",
      theme_auto: "Auto",
      theme_dark: "Ciemny",
      theme_light: "Jasny",
      hero_badge: "pyIDE v2.0 - w rozwoju",
      hero_title: "pyIDE jest przebudowywany.",
      hero_lead: "Natywny recode C++ IDE SFT Python z mocniejszą podstawą desktopową, przeprojektowanym workflow i eksperymentalnym AI Desktop Assistant.",
      cta_features: "Zobacz funkcje v2.0",
      cta_ai: "Zobacz AI Desktop Assistant",
      cta_legacy: "Pobierz wersję legacy",
      cta_github: "Zobacz na GitHub",
      notice_title: "Status rozwoju",
      notice_text: "Wersja C++ pyIDE jest aktywnie rozwijana. Starsza wersja Python pozostaje dostępna jako pobranie legacy.",
      tag_legacy: "Legacy v1 dostępny",
      tag_recode: "Recode C++ v2.0 aktywny",
      tag_ai: "AI Assistant eksperymentalny",
      tag_windows: "Aplikacja Windows",
      overview_title: "Praktyczne IDE Windows rozwija się w większy projekt desktopowy",
      overview_lead: "SFT pyIDE zaczynał jako lekkie praktyczne IDE Python. pyIDE v2.0 zachowuje ten przepływ i przechodzi na mocniejszą bazę C++.",
      features_title: "Workflow legacy, kierunek v2.0 i jasne statusy",
      workflow_title: "Praktyczny desktopowy workflow kodowania",
      run_title: "Uruchamiaj kod tak, jak potrzebuje projekt",
      advanced_title: "Debugowanie i inteligentniejsze narzędzia edytora",
      ai_title: "AI Desktop Assistant",
      ai_lead: "pyIDE v2.0 jest projektowany z opcjonalnym asystentem AI używającym ograniczonych narzędzi pyIDE do kontekstu projektu i edytora.",
      permission_title: "Ty decydujesz, kiedy sterowanie pyIDE jest dozwolone",
      permission_text: "Kontrola AI ma wymagać Allow pyIDE Control, pozostać w aktywnym projekcie i odrzucać ścieżki typu ../.",
      recode_why_title: "Dlaczego przebudować pyIDE w C++?",
      roadmap_title: "Fazy rozwoju bez zmyślonych dat",
      shots_title: "Prawdziwe zrzuty są oznaczone jako legacy",
      v2_shots_notice: "Nowe zrzuty v2.0 zostaną dodane wraz z postępem recode.",
      shortcuts_title: "Skróty legacy",
      downloads_title: "Legacy teraz, v2.0 gdy będzie gotowe",
      legacy_download_title: "Legacy Python Version",
      download_setup: "Pobierz instalator legacy",
      source_link: "Źródło na GitHub",
      releases_link: "Wydania",
      v2_disabled: "Pobieranie v2.0 - jeszcze niedostępne",
      faq_title: "FAQ",
      lb_close: "Zamknij",
      selected_installer: "Wybrany instalator",
      status_legacy: "Dostępne w Legacy v1",
      status_working: "Działa w buildzie rozwojowym v2.0",
      status_development: "W rozwoju",
      status_planned: "Planowane",
      status_experimental: "Eksperymentalne",
      status_legacy_download: "Pobranie legacy"
    },
    pt: {
      nav_overview: "Visão geral",
      nav_features: "Recursos",
      nav_ai: "Assistente IA",
      nav_recode: "Recode C++",
      nav_screenshots: "Capturas",
      nav_shortcuts: "Atalhos",
      nav_downloads: "Downloads",
      nav_faq: "FAQ",
      nav_github: "GitHub",
      lang_label: "Idioma",
      theme_label: "Tema",
      theme_auto: "Auto",
      theme_dark: "Escuro",
      theme_light: "Claro",
      hero_badge: "pyIDE v2.0 - em desenvolvimento",
      hero_title: "pyIDE está sendo reconstruído.",
      hero_lead: "Um recode nativo em C++ do SFT Python IDE, com base desktop mais forte, fluxo redesenhado e AI Desktop Assistant experimental integrado.",
      cta_features: "Explorar recursos v2.0",
      cta_ai: "Ver AI Desktop Assistant",
      cta_legacy: "Baixar versão legacy",
      cta_github: "Ver no GitHub",
      notice_title: "Status de desenvolvimento",
      notice_text: "A versão C++ do pyIDE está em desenvolvimento ativo. A versão Python antiga continua disponível como download legacy.",
      tag_legacy: "Legacy v1 disponível",
      tag_recode: "Recode C++ v2.0 ativo",
      tag_ai: "AI Assistant experimental",
      tag_windows: "App desktop Windows",
      overview_title: "Uma IDE Windows prática crescendo para um projeto desktop maior",
      overview_lead: "SFT pyIDE começou como uma IDE Python leve e prática. pyIDE v2.0 mantém esse fluxo e reconstrói o app sobre uma base C++ mais forte.",
      features_title: "Workflow legacy, direção v2.0 e rótulos de status honestos",
      workflow_title: "Um fluxo desktop prático para codificar",
      run_title: "Execute código do jeito que o projeto precisa",
      advanced_title: "Depuração e sistemas de editor mais inteligentes",
      ai_title: "AI Desktop Assistant",
      ai_lead: "pyIDE v2.0 está sendo projetado com um assistente IA opcional que usa ferramentas pyIDE com escopo restrito para entender projeto e editor ativos.",
      permission_title: "Você decide quando o controle pyIDE é permitido",
      permission_text: "Os controles IA devem exigir Allow pyIDE Control, ficar no projeto ativo e rejeitar caminhos como ../.",
      recode_why_title: "Por que reconstruir pyIDE em C++?",
      roadmap_title: "Fases de desenvolvimento sem datas falsas",
      shots_title: "Capturas reais são marcadas como legacy",
      v2_shots_notice: "Novas capturas v2.0 serão adicionadas conforme o recode avançar.",
      shortcuts_title: "Atalhos legacy",
      downloads_title: "Legacy agora, v2.0 quando estiver pronto",
      legacy_download_title: "Legacy Python Version",
      download_setup: "Baixar setup legacy",
      source_link: "Fonte no GitHub",
      releases_link: "Releases",
      v2_disabled: "Download v2.0 - ainda não disponível",
      faq_title: "FAQ",
      lb_close: "Fechar",
      selected_installer: "Instalador selecionado",
      status_legacy: "Disponível no Legacy v1",
      status_working: "Funciona no build de desenvolvimento v2.0",
      status_development: "Em desenvolvimento",
      status_planned: "Planejado",
      status_experimental: "Experimental",
      status_legacy_download: "Download legacy"
    },
    ru: {
      nav_overview: "Обзор",
      nav_features: "Функции",
      nav_ai: "AI Assistant",
      nav_recode: "C++-перепись",
      nav_screenshots: "Скриншоты",
      nav_shortcuts: "Горячие клавиши",
      nav_downloads: "Загрузки",
      nav_faq: "FAQ",
      nav_github: "GitHub",
      lang_label: "Язык",
      theme_label: "Тема",
      theme_auto: "Авто",
      theme_dark: "Темная",
      theme_light: "Светлая",
      hero_badge: "pyIDE v2.0 - в разработке",
      hero_title: "pyIDE перестраивается.",
      hero_lead: "Нативная C++-перепись SFT Python IDE с более сильной desktop-основой, новым рабочим процессом и экспериментальным AI Desktop Assistant.",
      cta_features: "Смотреть функции v2.0",
      cta_ai: "Смотреть AI Desktop Assistant",
      cta_legacy: "Скачать legacy-версию",
      cta_github: "Открыть GitHub",
      notice_title: "Статус разработки",
      notice_text: "C++-версия pyIDE активно разрабатывается. Старая Python-версия остается доступной как legacy-загрузка.",
      tag_legacy: "Legacy v1 доступна",
      tag_recode: "v2.0 C++ активен",
      tag_ai: "AI Assistant экспериментальный",
      tag_windows: "Windows desktop app",
      overview_title: "Практичная Windows IDE растет в более крупный desktop-проект",
      overview_lead: "SFT pyIDE начиналась как легкая практичная Python IDE. pyIDE v2.0 сохраняет этот подход и переходит на более сильную C++-основу.",
      features_title: "Legacy workflow, направление v2.0 и честные статусы",
      workflow_title: "Практичный desktop workflow для кода",
      run_title: "Запускайте код так, как нужно проекту",
      advanced_title: "Отладка и более умные инструменты редактора",
      ai_title: "AI Desktop Assistant",
      ai_lead: "pyIDE v2.0 проектируется с опциональным AI Assistant, использующим ограниченные инструменты pyIDE для активного проекта и состояния редактора.",
      permission_title: "Вы решаете, когда разрешено управление pyIDE",
      permission_text: "AI-контроль должен требовать Allow pyIDE Control, оставаться в активном проекте и отклонять пути вроде ../.",
      recode_why_title: "Зачем перестраивать pyIDE на C++?",
      roadmap_title: "Фазы разработки без выдуманных дат",
      shots_title: "Реальные скриншоты помечены как legacy",
      v2_shots_notice: "Новые скриншоты v2.0 будут добавлены по мере развития recode.",
      shortcuts_title: "Legacy горячие клавиши",
      downloads_title: "Legacy сейчас, v2.0 когда готово",
      legacy_download_title: "Legacy Python Version",
      download_setup: "Скачать legacy setup",
      source_link: "Исходники на GitHub",
      releases_link: "Релизы",
      v2_disabled: "Скачать v2.0 - пока недоступно",
      faq_title: "FAQ",
      lb_close: "Закрыть",
      selected_installer: "Выбранный установщик",
      status_legacy: "Доступно в Legacy v1",
      status_working: "Работает в development build v2.0",
      status_development: "В разработке",
      status_planned: "Планируется",
      status_experimental: "Экспериментально",
      status_legacy_download: "Legacy-загрузка"
    },
    es: {
      nav_overview: "Resumen",
      nav_features: "Funciones",
      nav_ai: "Asistente IA",
      nav_recode: "Recode C++",
      nav_screenshots: "Capturas",
      nav_shortcuts: "Atajos",
      nav_downloads: "Descargas",
      nav_faq: "FAQ",
      nav_github: "GitHub",
      lang_label: "Idioma",
      theme_label: "Tema",
      theme_auto: "Auto",
      theme_dark: "Oscuro",
      theme_light: "Claro",
      hero_badge: "pyIDE v2.0 - en desarrollo",
      hero_title: "pyIDE se está reconstruyendo.",
      hero_lead: "Un recode nativo en C++ del IDE Python de SFT, con una base de escritorio más sólida, un flujo rediseñado y un AI Desktop Assistant experimental integrado.",
      cta_features: "Explorar funciones v2.0",
      cta_ai: "Ver AI Desktop Assistant",
      cta_legacy: "Descargar versión legacy",
      cta_github: "Ver en GitHub",
      notice_title: "Estado de desarrollo",
      notice_text: "La versión C++ de pyIDE está en desarrollo activo. La versión Python anterior sigue disponible como descarga legacy.",
      tag_legacy: "Legacy v1 disponible",
      tag_recode: "Recode C++ v2.0 activo",
      tag_ai: "AI Assistant experimental",
      tag_windows: "App de escritorio Windows",
      overview_title: "Un IDE práctico para Windows que crece hacia un proyecto de escritorio más grande",
      overview_lead: "SFT pyIDE comenzó como un IDE Python ligero y práctico. pyIDE v2.0 conserva ese flujo mientras reconstruye la app sobre una base C++ más fuerte.",
      features_title: "Flujo legacy, dirección v2.0 y estados honestos",
      workflow_title: "Un flujo práctico de codificación de escritorio",
      run_title: "Ejecuta código como tu proyecto lo necesita",
      advanced_title: "Depuración y sistemas de edición más inteligentes",
      ai_title: "AI Desktop Assistant",
      ai_lead: "pyIDE v2.0 se diseña con un asistente IA opcional que usa herramientas pyIDE de alcance limitado para entender el proyecto activo y el estado del editor.",
      permission_title: "Tú decides cuándo se permite el control de pyIDE",
      permission_text: "Los controles IA deben requerir Allow pyIDE Control, quedarse dentro del proyecto activo y rechazar rutas como ../.",
      recode_why_title: "¿Por qué reconstruir pyIDE en C++?",
      roadmap_title: "Fases de desarrollo sin fechas falsas",
      shots_title: "Las capturas reales están etiquetadas como legacy",
      v2_shots_notice: "Las nuevas capturas v2.0 se añadirán conforme avance el recode.",
      shortcuts_title: "Atajos legacy",
      downloads_title: "Legacy ahora, v2.0 cuando esté listo",
      legacy_download_title: "Legacy Python Version",
      download_setup: "Descargar setup legacy",
      source_link: "Fuente en GitHub",
      releases_link: "Versiones",
      v2_disabled: "Descarga v2.0 - aún no disponible",
      faq_title: "FAQ",
      lb_close: "Cerrar",
      selected_installer: "Instalador seleccionado",
      status_legacy: "Disponible en Legacy v1",
      status_working: "Funciona en build de desarrollo v2.0",
      status_development: "En desarrollo",
      status_planned: "Planeado",
      status_experimental: "Experimental",
      status_legacy_download: "Descarga legacy"
    },
    tr: {
      nav_overview: "Genel bakış",
      nav_features: "Özellikler",
      nav_ai: "AI Assistant",
      nav_recode: "C++ yeniden yazım",
      nav_screenshots: "Ekran görüntüleri",
      nav_shortcuts: "Kısayollar",
      nav_downloads: "İndirmeler",
      nav_faq: "SSS",
      nav_github: "GitHub",
      lang_label: "Dil",
      theme_label: "Tema",
      theme_auto: "Otomatik",
      theme_dark: "Koyu",
      theme_light: "Açık",
      hero_badge: "pyIDE v2.0 - geliştirme aşamasında",
      hero_title: "pyIDE yeniden inşa ediliyor.",
      hero_lead: "SFT Python IDE'nin yerel C++ recode sürümü; daha güçlü masaüstü temeli, yeniden tasarlanmış iş akışı ve deneysel AI Desktop Assistant ile geliştiriliyor.",
      cta_features: "v2.0 özelliklerini incele",
      cta_ai: "AI Desktop Assistant'ı gör",
      cta_legacy: "Legacy sürümü indir",
      cta_github: "GitHub'da gör",
      notice_title: "Geliştirme durumu",
      notice_text: "pyIDE'nin C++ sürümü aktif olarak geliştiriliyor. Eski Python sürümü legacy indirme olarak kullanılabilir.",
      tag_legacy: "Legacy v1 mevcut",
      tag_recode: "v2.0 C++ recode aktif",
      tag_ai: "AI Assistant deneysel",
      tag_windows: "Windows masaüstü uygulaması",
      overview_title: "Pratik bir Windows IDE daha büyük bir masaüstü geliştirme projesine dönüşüyor",
      overview_lead: "SFT pyIDE hafif ve pratik bir Python IDE olarak başladı. pyIDE v2.0 bu akışı koruyup daha güçlü bir C++ temeli kuruyor.",
      features_title: "Legacy iş akışı, v2.0 yönü ve dürüst durum etiketleri",
      workflow_title: "Pratik bir masaüstü kodlama akışı",
      run_title: "Kodu projenin ihtiyaç duyduğu şekilde çalıştır",
      advanced_title: "Hata ayıklama ve daha akıllı editör sistemleri",
      ai_title: "AI Desktop Assistant",
      ai_lead: "pyIDE v2.0, aktif projeyi ve editör durumunu anlamak için kapsamı sınırlı pyIDE araçlarını kullanan isteğe bağlı bir AI Assistant ile tasarlanıyor.",
      permission_title: "pyIDE kontrolüne ne zaman izin verileceğine siz karar verirsiniz",
      permission_text: "AI kontrolleri Allow pyIDE Control seçeneğini gerektirmeli, aktif proje içinde kalmalı ve ../ gibi yolları reddetmelidir.",
      recode_why_title: "pyIDE neden C++ ile yeniden yapılıyor?",
      roadmap_title: "Sahte tarih olmadan geliştirme aşamaları",
      shots_title: "Gerçek ekran görüntüleri legacy olarak etiketlenir",
      v2_shots_notice: "Yeni v2.0 ekran görüntüleri recode ilerledikçe eklenecek.",
      shortcuts_title: "Legacy kısayollar",
      downloads_title: "Legacy şimdi, v2.0 hazır olduğunda",
      legacy_download_title: "Legacy Python Version",
      download_setup: "Legacy kurulumu indir",
      source_link: "GitHub kaynağı",
      releases_link: "Sürümler",
      v2_disabled: "v2.0 indirme - henüz yok",
      faq_title: "SSS",
      lb_close: "Kapat",
      selected_installer: "Seçili kurulum",
      status_legacy: "Legacy v1'de mevcut",
      status_working: "v2.0 geliştirme derlemesinde çalışıyor",
      status_development: "Geliştirme aşamasında",
      status_planned: "Planlandı",
      status_experimental: "Deneysel",
      status_legacy_download: "Legacy indirme"
    }
  };

  function normalizeLang(input) {
    if (!input) return "en";
    const short = String(input).toLowerCase().split("-")[0];
    return installers[short] ? short : "en";
  }

  function autoLang() {
    return normalizeLang(navigator.language || navigator.userLanguage || "en");
  }

  function tr(lang, key) {
    return (T[lang] && T[lang][key]) || T.en[key] || "";
  }

  function applyI18n(lang) {
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      const value = tr(lang, key);
      if (value) el.textContent = value;
    });

    document.querySelectorAll("[data-i18n-html]").forEach((el) => {
      const key = el.getAttribute("data-i18n-html");
      const value = tr(lang, key);
      if (value) el.innerHTML = value;
    });
  }

  function updateDownloads(lang) {
    const fname = installers[lang] || installers.en;
    const url = GH_BASE + encodeURIComponent(fname);
    const button = document.getElementById("legacyDownload");
    const note = document.getElementById("downloadNote");

    if (button) button.href = url;
    if (note) note.textContent = `${tr(lang, "selected_installer")}: ${fname}`;
  }

  function updateScreenshots(lang) {
    document.querySelectorAll("[data-shot]").forEach((card) => {
      const key = card.getAttribute("data-shot");
      const img = card.querySelector("img");
      const asset = shotAssets[key] || {};
      const src = asset[lang] || asset.en;

      if (!src || !img) return;
      card.dataset.full = src;
      img.src = src;
      img.alt = `${tr(lang, card.getAttribute("data-title-key")) || card.getAttribute("data-fallback-title") || "pyIDE screenshot"} - ${tr(lang, "status_legacy")}`;
    });
  }

  function setLanguage(choice, persist = true) {
    const lang = choice === "auto" ? autoLang() : normalizeLang(choice);
    document.documentElement.lang = lang;
    document.documentElement.dir = rtlLangs.has(lang) ? "rtl" : "ltr";
    applyI18n(lang);
    updateDownloads(lang);
    updateScreenshots(lang);

    const select = document.getElementById("languageSelect");
    if (select) select.value = choice === "auto" ? "auto" : lang;
    if (persist) localStorage.setItem(LANG_KEY, choice === "auto" ? "auto" : lang);
  }

  const mql = window.matchMedia("(prefers-color-scheme: light)");

  function applyTheme(choice, persist = true) {
    const resolved = choice === "auto" ? (mql.matches ? "light" : "dark") : choice;
    document.documentElement.dataset.theme = resolved;
    document.documentElement.dataset.themeMode = choice;

    const select = document.getElementById("themeSelect");
    if (select) select.value = choice;
    if (persist) localStorage.setItem(THEME_KEY, choice);
  }

  function initTheme() {
    const saved = localStorage.getItem(THEME_KEY) || "auto";
    applyTheme(saved, false);
    const select = document.getElementById("themeSelect");
    if (select) select.addEventListener("change", () => applyTheme(select.value));
    mql.addEventListener("change", () => {
      const current = localStorage.getItem(THEME_KEY) || "auto";
      if (current === "auto") applyTheme("auto", false);
    });
  }

  function initLanguage() {
    const params = new URLSearchParams(location.search);
    const fromUrl = params.get("lang");
    const saved = localStorage.getItem(LANG_KEY);
    setLanguage(fromUrl || saved || "auto", false);

    const select = document.getElementById("languageSelect");
    if (select) select.addEventListener("change", () => setLanguage(select.value));
  }

  function initMenu() {
    const button = document.getElementById("menuToggle");
    const nav = document.getElementById("primaryNav");
    if (!button || !nav) return;

    function setOpen(open) {
      nav.classList.toggle("open", open);
      button.setAttribute("aria-expanded", String(open));
    }

    button.addEventListener("click", () => setOpen(!nav.classList.contains("open")));
    nav.addEventListener("click", (event) => {
      if (event.target.closest("a")) setOpen(false);
    });
    document.addEventListener("click", (event) => {
      if (!nav.classList.contains("open")) return;
      if (!nav.contains(event.target) && !button.contains(event.target)) setOpen(false);
    });
    window.addEventListener("keydown", (event) => {
      if (event.key === "Escape") setOpen(false);
    });
  }

  function initLightbox() {
    const lb = document.getElementById("lightbox");
    const img = document.getElementById("lightboxImg");
    const cap = document.getElementById("lightboxCaption");
    const close = document.getElementById("lightboxClose");
    if (!lb || !img || !cap || !close) return;

    let lastFocus = null;

    function open(card) {
      lastFocus = document.activeElement;
      const src = card.dataset.full;
      const title = tr(document.documentElement.lang, card.getAttribute("data-title-key")) || card.getAttribute("data-fallback-title") || "";
      const desc = tr(document.documentElement.lang, card.getAttribute("data-desc-key")) || card.getAttribute("data-fallback-desc") || "";
      img.src = src;
      img.alt = title;
      cap.textContent = desc ? `${title} - ${desc}` : title;
      lb.classList.add("open");
      lb.setAttribute("aria-hidden", "false");
      close.focus();
    }

    function closeLb() {
      lb.classList.remove("open");
      lb.setAttribute("aria-hidden", "true");
      img.removeAttribute("src");
      img.alt = "";
      cap.textContent = "";
      if (lastFocus && typeof lastFocus.focus === "function") lastFocus.focus();
    }

    document.querySelectorAll(".shot-card").forEach((card) => {
      card.addEventListener("click", () => open(card));
    });

    close.addEventListener("click", closeLb);
    lb.addEventListener("click", (event) => {
      if (event.target === lb) closeLb();
    });
    window.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && lb.classList.contains("open")) closeLb();
    });
  }

  function initActiveNav() {
    const links = Array.from(document.querySelectorAll(".nav-link[href^='#']"));
    const sections = links
      .map((link) => document.querySelector(link.getAttribute("href")))
      .filter(Boolean);

    if (!("IntersectionObserver" in window) || sections.length === 0) return;

    const observer = new IntersectionObserver((entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visible) return;
      links.forEach((link) => {
        const active = link.getAttribute("href") === `#${visible.target.id}`;
        if (active) link.setAttribute("aria-current", "true");
        else link.removeAttribute("aria-current");
      });
    }, { rootMargin: "-30% 0px -58% 0px", threshold: [0.08, 0.2, 0.5] });

    sections.forEach((section) => observer.observe(section));
  }

  function initAnchors() {
    document.querySelectorAll('a[href^="#"]').forEach((link) => {
      link.addEventListener("click", (event) => {
        const id = link.getAttribute("href");
        if (!id || id === "#") return;
        const target = document.querySelector(id);
        if (!target) return;
        event.preventDefault();
        const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        target.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "start" });
        history.pushState(null, "", id);
      });
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("year").textContent = String(new Date().getFullYear());
    initTheme();
    initLanguage();
    initMenu();
    initLightbox();
    initActiveNav();
    initAnchors();
  });
})();
