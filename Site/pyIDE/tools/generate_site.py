from __future__ import annotations

import json
import shutil
from html import escape
from pathlib import Path
from textwrap import dedent

ROOT = Path(__file__).resolve().parents[1]

LOCALES = {
    "en": {"native": "English", "dir": "ltr", "name": "English"},
    "ar": {"native": "العربية", "dir": "rtl", "name": "Arabic"},
    "fr": {"native": "Français", "dir": "ltr", "name": "French"},
    "de": {"native": "Deutsch", "dir": "ltr", "name": "German"},
    "he": {"native": "עברית", "dir": "rtl", "name": "Hebrew"},
    "it": {"native": "Italiano", "dir": "ltr", "name": "Italian"},
    "ja": {"native": "日本語", "dir": "ltr", "name": "Japanese"},
    "ko": {"native": "한국어", "dir": "ltr", "name": "Korean"},
    "pl": {"native": "Polski", "dir": "ltr", "name": "Polish"},
    "pt": {"native": "Português", "dir": "ltr", "name": "Portuguese"},
    "ru": {"native": "Русский", "dir": "ltr", "name": "Russian"},
    "es": {"native": "Español", "dir": "ltr", "name": "Spanish"},
    "tr": {"native": "Türkçe", "dir": "ltr", "name": "Turkish"},
}

LANG_UI = {
    "en": {
        "skip": "Skip to content",
        "navigation": "Navigation",
        "theme": "Theme",
        "language": "Language",
        "classic": "Classic",
        "dark": "Dark",
        "selectedInstaller": "Selected installer",
        "fallbackNote": "Screenshot shown in English because a localized screenshot is not available.",
        "home": "Home",
        "features": "Features",
        "aiAssistant": "AI Assistant",
        "development": "C++ Recode",
        "screenshots": "Screenshots",
        "downloads": "Downloads",
        "docs": "Documentation",
        "faq": "FAQ",
        "legacy": "Legacy Version",
        "about": "About",
        "help": "Help Topics",
        "version": "Version Status",
        "links": "Related Links",
        "currentStable": "Current Stable Version:",
        "nextMajor": "Next Major Version:",
        "status": "v2.0 Status:",
        "inDevelopment": "In Development",
        "legacyRelease": "Legacy Python Release",
        "footer": "<strong>pyIDE</strong> - sonicFanTech lightweight Windows IDE. Last updated <span id=\"year\">2026</span>.",
        "sourceCode": "Source Code",
        "github": "GitHub",
        "downloadLegacy": "Download Legacy Setup",
        "viewDocs": "Open Guide",
        "topics": "Topics covered",
        "details": "Details",
        "related": "Related documentation",
        "statusBox": "Status",
        "notAvailable": "Public v2.0 download is not available yet.",
        "canonical": "English is the canonical source text; this static translation is provided for the website UI and documentation.",
        "sectionIntro": "This section covers {section} in pyIDE.",
        "bullet": "Review this step: {topic}.",
        "more": "Keyboard shortcuts, file names, paths, and technology names are kept unchanged where that avoids ambiguity.",
        "flowTitle": "Permission Flow",
        "tableTitle": "Capability Table",
    },
    "fr": {
        "skip": "Aller au contenu",
        "navigation": "Navigation",
        "theme": "Thème",
        "language": "Langue",
        "classic": "Classique",
        "dark": "Sombre",
        "selectedInstaller": "Programme d'installation sélectionné",
        "fallbackNote": "La capture est affichée en anglais car aucune capture localisée n'est disponible.",
        "home": "Accueil",
        "features": "Fonctions",
        "aiAssistant": "Assistant IA",
        "development": "Recode C++",
        "screenshots": "Captures",
        "downloads": "Téléchargements",
        "docs": "Documentation",
        "faq": "FAQ",
        "legacy": "Version héritée",
        "about": "À propos",
        "help": "Rubriques d'aide",
        "version": "État des versions",
        "links": "Liens associés",
        "currentStable": "Version stable actuelle :",
        "nextMajor": "Prochaine version majeure :",
        "status": "État v2.0 :",
        "inDevelopment": "En développement",
        "legacyRelease": "Version Python héritée",
        "footer": "<strong>pyIDE</strong> - IDE Windows léger de sonicFanTech. Dernière mise à jour <span id=\"year\">2026</span>.",
        "sourceCode": "Code source",
        "github": "GitHub",
        "downloadLegacy": "Télécharger l'installateur hérité",
        "viewDocs": "Ouvrir le guide",
        "topics": "Sujets couverts",
        "details": "Détails",
        "related": "Documentation liée",
        "statusBox": "État",
        "notAvailable": "Le téléchargement public de v2.0 n'est pas encore disponible.",
        "canonical": "L'anglais reste la source canonique; cette traduction statique couvre l'interface et la documentation du site.",
        "sectionIntro": "Cette section couvre {section} dans pyIDE.",
        "bullet": "Vérifiez cette étape : {topic}.",
        "more": "Les raccourcis, noms de fichiers, chemins et technologies restent inchangés quand cela évite toute ambiguïté.",
        "flowTitle": "Flux d'autorisation",
        "tableTitle": "Tableau des capacités",
    },
    "de": {
        "skip": "Zum Inhalt springen",
        "navigation": "Navigation",
        "theme": "Design",
        "language": "Sprache",
        "classic": "Klassisch",
        "dark": "Dunkel",
        "selectedInstaller": "Ausgewähltes Installationsprogramm",
        "fallbackNote": "Der Screenshot wird auf Englisch angezeigt, weil kein lokalisierter Screenshot verfügbar ist.",
        "home": "Startseite",
        "features": "Funktionen",
        "aiAssistant": "KI-Assistent",
        "development": "C++-Neuentwicklung",
        "screenshots": "Screenshots",
        "downloads": "Downloads",
        "docs": "Dokumentation",
        "faq": "FAQ",
        "legacy": "Legacy-Version",
        "about": "Info",
        "help": "Hilfethemen",
        "version": "Versionsstatus",
        "links": "Verwandte Links",
        "currentStable": "Aktuelle stabile Version:",
        "nextMajor": "Nächste Hauptversion:",
        "status": "v2.0-Status:",
        "inDevelopment": "In Entwicklung",
        "legacyRelease": "Legacy-Python-Version",
        "footer": "<strong>pyIDE</strong> - leichtes Windows-IDE von sonicFanTech. Zuletzt aktualisiert <span id=\"year\">2026</span>.",
        "sourceCode": "Quellcode",
        "github": "GitHub",
        "downloadLegacy": "Legacy-Setup herunterladen",
        "viewDocs": "Anleitung öffnen",
        "topics": "Behandelte Themen",
        "details": "Details",
        "related": "Verwandte Dokumentation",
        "statusBox": "Status",
        "notAvailable": "Der öffentliche v2.0-Download ist noch nicht verfügbar.",
        "canonical": "Englisch ist die verbindliche Ausgangsfassung; diese statische Übersetzung deckt Oberfläche und Dokumentation ab.",
        "sectionIntro": "Dieser Abschnitt behandelt {section} in pyIDE.",
        "bullet": "Prüfen Sie diesen Schritt: {topic}.",
        "more": "Tastenkürzel, Dateinamen, Pfade und Technologien bleiben unverändert, wenn das Klarheit schafft.",
        "flowTitle": "Berechtigungsablauf",
        "tableTitle": "Funktionstabelle",
    },
    "es": {
        "skip": "Saltar al contenido",
        "navigation": "Navegación",
        "theme": "Tema",
        "language": "Idioma",
        "classic": "Clásico",
        "dark": "Oscuro",
        "selectedInstaller": "Instalador seleccionado",
        "fallbackNote": "La captura se muestra en inglés porque no hay una captura localizada disponible.",
        "home": "Inicio",
        "features": "Funciones",
        "aiAssistant": "Asistente IA",
        "development": "Reescritura C++",
        "screenshots": "Capturas",
        "downloads": "Descargas",
        "docs": "Documentación",
        "faq": "FAQ",
        "legacy": "Versión heredada",
        "about": "Acerca de",
        "help": "Temas de ayuda",
        "version": "Estado de versión",
        "links": "Enlaces relacionados",
        "currentStable": "Versión estable actual:",
        "nextMajor": "Próxima versión mayor:",
        "status": "Estado v2.0:",
        "inDevelopment": "En desarrollo",
        "legacyRelease": "Versión Python heredada",
        "footer": "<strong>pyIDE</strong> - IDE ligero para Windows de sonicFanTech. Última actualización <span id=\"year\">2026</span>.",
        "sourceCode": "Código fuente",
        "github": "GitHub",
        "downloadLegacy": "Descargar instalador heredado",
        "viewDocs": "Abrir guía",
        "topics": "Temas cubiertos",
        "details": "Detalles",
        "related": "Documentación relacionada",
        "statusBox": "Estado",
        "notAvailable": "La descarga pública de v2.0 aún no está disponible.",
        "canonical": "El inglés es la fuente canónica; esta traducción estática cubre la interfaz y la documentación del sitio.",
        "sectionIntro": "Esta sección cubre {section} en pyIDE.",
        "bullet": "Revise este paso: {topic}.",
        "more": "Los atajos, nombres de archivo, rutas y tecnologías se mantienen sin traducir cuando evita confusión.",
        "flowTitle": "Flujo de permisos",
        "tableTitle": "Tabla de capacidades",
    },
}

LANG_UI["it"] = {
    **LANG_UI["es"],
    "skip": "Vai al contenuto",
    "theme": "Tema",
    "language": "Lingua",
    "classic": "Classico",
    "dark": "Scuro",
    "selectedInstaller": "Installer selezionato",
    "fallbackNote": "La schermata è mostrata in inglese perché non è disponibile una schermata localizzata.",
    "home": "Home",
    "features": "Funzioni",
    "aiAssistant": "Assistente IA",
    "development": "Recode C++",
    "screenshots": "Schermate",
    "downloads": "Download",
    "docs": "Documentazione",
    "legacy": "Versione legacy",
    "about": "Informazioni",
    "help": "Argomenti guida",
    "version": "Stato versioni",
    "links": "Collegamenti correlati",
    "currentStable": "Versione stabile attuale:",
    "nextMajor": "Prossima versione principale:",
    "status": "Stato v2.0:",
    "inDevelopment": "In sviluppo",
    "legacyRelease": "Versione Python legacy",
    "footer": "<strong>pyIDE</strong> - IDE Windows leggero di sonicFanTech. Ultimo aggiornamento <span id=\"year\">2026</span>.",
    "sourceCode": "Codice sorgente",
    "downloadLegacy": "Scarica setup legacy",
    "viewDocs": "Apri guida",
    "topics": "Argomenti trattati",
    "details": "Dettagli",
    "related": "Documentazione correlata",
    "notAvailable": "Il download pubblico di v2.0 non è ancora disponibile.",
    "canonical": "L'inglese è la fonte canonica; questa traduzione statica copre interfaccia e documentazione.",
    "sectionIntro": "Questa sezione copre {section} in pyIDE.",
    "bullet": "Controlla questo passaggio: {topic}.",
    "more": "Scorciatoie, file, percorsi e tecnologie restano invariati quando evita ambiguità.",
    "flowTitle": "Flusso autorizzazioni",
    "tableTitle": "Tabella capacità",
}

LANG_UI["pt"] = {
    **LANG_UI["es"],
    "skip": "Ir para o conteúdo",
    "navigation": "Navegação",
    "language": "Idioma",
    "classic": "Clássico",
    "dark": "Escuro",
    "selectedInstaller": "Instalador selecionado",
    "fallbackNote": "A captura é exibida em inglês porque não há captura localizada disponível.",
    "home": "Início",
    "features": "Recursos",
    "aiAssistant": "Assistente IA",
    "development": "Reescrita C++",
    "screenshots": "Capturas",
    "downloads": "Downloads",
    "docs": "Documentação",
    "legacy": "Versão legada",
    "about": "Sobre",
    "help": "Tópicos de ajuda",
    "version": "Status da versão",
    "links": "Links relacionados",
    "currentStable": "Versão estável atual:",
    "nextMajor": "Próxima versão principal:",
    "status": "Status v2.0:",
    "inDevelopment": "Em desenvolvimento",
    "legacyRelease": "Versão Python legada",
    "footer": "<strong>pyIDE</strong> - IDE leve para Windows da sonicFanTech. Última atualização <span id=\"year\">2026</span>.",
    "sourceCode": "Código-fonte",
    "downloadLegacy": "Baixar instalador legado",
    "viewDocs": "Abrir guia",
    "topics": "Tópicos cobertos",
    "details": "Detalhes",
    "related": "Documentação relacionada",
    "notAvailable": "O download público da v2.0 ainda não está disponível.",
    "canonical": "O inglês é a fonte canônica; esta tradução estática cobre a interface e a documentação do site.",
    "sectionIntro": "Esta seção cobre {section} no pyIDE.",
    "bullet": "Revise esta etapa: {topic}.",
    "more": "Atalhos, nomes de arquivos, caminhos e tecnologias permanecem iguais quando isso evita ambiguidade.",
    "flowTitle": "Fluxo de permissões",
    "tableTitle": "Tabela de capacidades",
}

LANG_UI["pl"] = {
    **LANG_UI["de"],
    "skip": "Przejdź do treści",
    "navigation": "Nawigacja",
    "theme": "Motyw",
    "language": "Język",
    "classic": "Klasyczny",
    "dark": "Ciemny",
    "selectedInstaller": "Wybrany instalator",
    "fallbackNote": "Zrzut ekranu jest pokazany po angielsku, ponieważ brak wersji zlokalizowanej.",
    "home": "Strona główna",
    "features": "Funkcje",
    "aiAssistant": "Asystent AI",
    "development": "Przepisanie C++",
    "screenshots": "Zrzuty ekranu",
    "downloads": "Pobieranie",
    "docs": "Dokumentacja",
    "legacy": "Wersja starsza",
    "about": "O projekcie",
    "help": "Tematy pomocy",
    "version": "Status wersji",
    "links": "Powiązane linki",
    "currentStable": "Aktualna wersja stabilna:",
    "nextMajor": "Następna wersja główna:",
    "status": "Status v2.0:",
    "inDevelopment": "W trakcie rozwoju",
    "legacyRelease": "Starsza wersja Python",
    "footer": "<strong>pyIDE</strong> - lekkie IDE Windows od sonicFanTech. Ostatnia aktualizacja <span id=\"year\">2026</span>.",
    "sourceCode": "Kod źródłowy",
    "downloadLegacy": "Pobierz starszy instalator",
    "viewDocs": "Otwórz przewodnik",
    "topics": "Omówione tematy",
    "details": "Szczegóły",
    "related": "Powiązana dokumentacja",
    "notAvailable": "Publiczne pobieranie v2.0 nie jest jeszcze dostępne.",
    "canonical": "Angielski jest źródłem kanonicznym; to statyczne tłumaczenie obejmuje interfejs i dokumentację.",
    "sectionIntro": "Ta sekcja omawia {section} w pyIDE.",
    "bullet": "Sprawdź ten krok: {topic}.",
    "more": "Skróty, nazwy plików, ścieżki i technologie pozostają bez zmian, gdy zapobiega to niejasności.",
    "flowTitle": "Przepływ uprawnień",
    "tableTitle": "Tabela możliwości",
}

LANG_UI["tr"] = {
    **LANG_UI["es"],
    "skip": "İçeriğe geç",
    "navigation": "Gezinti",
    "theme": "Tema",
    "language": "Dil",
    "classic": "Klasik",
    "dark": "Koyu",
    "selectedInstaller": "Seçili kurulum",
    "fallbackNote": "Yerelleştirilmiş ekran görüntüsü olmadığı için görüntü İngilizce gösteriliyor.",
    "home": "Ana sayfa",
    "features": "Özellikler",
    "aiAssistant": "AI Asistanı",
    "development": "C++ Yeniden Yazım",
    "screenshots": "Ekran görüntüleri",
    "downloads": "İndirmeler",
    "docs": "Belgeler",
    "legacy": "Eski sürüm",
    "about": "Hakkında",
    "help": "Yardım konuları",
    "version": "Sürüm durumu",
    "links": "İlgili bağlantılar",
    "currentStable": "Geçerli kararlı sürüm:",
    "nextMajor": "Sonraki ana sürüm:",
    "status": "v2.0 durumu:",
    "inDevelopment": "Geliştirme aşamasında",
    "legacyRelease": "Eski Python sürümü",
    "footer": "<strong>pyIDE</strong> - sonicFanTech hafif Windows IDE. Son güncelleme <span id=\"year\">2026</span>.",
    "sourceCode": "Kaynak kodu",
    "downloadLegacy": "Eski kurulumu indir",
    "viewDocs": "Kılavuzu aç",
    "topics": "Kapsanan konular",
    "details": "Ayrıntılar",
    "related": "İlgili belgeler",
    "notAvailable": "v2.0 genel indirmesi henüz mevcut değil.",
    "canonical": "İngilizce kanonik kaynak metindir; bu statik çeviri site arayüzünü ve belgeleri kapsar.",
    "sectionIntro": "Bu bölüm pyIDE içinde {section} konusunu kapsar.",
    "bullet": "Bu adımı gözden geçirin: {topic}.",
    "more": "Kısayollar, dosya adları, yollar ve teknoloji adları belirsizliği önlediğinde değiştirilmez.",
    "flowTitle": "İzin akışı",
    "tableTitle": "Yetenek tablosu",
}

LANG_UI["ru"] = {
    **LANG_UI["de"],
    "skip": "Перейти к содержанию",
    "navigation": "Навигация",
    "theme": "Тема",
    "language": "Язык",
    "classic": "Классическая",
    "dark": "Темная",
    "selectedInstaller": "Выбранный установщик",
    "fallbackNote": "Снимок экрана показан на английском, потому что локализованная версия недоступна.",
    "home": "Главная",
    "features": "Возможности",
    "aiAssistant": "AI-ассистент",
    "development": "Переписывание C++",
    "screenshots": "Снимки экрана",
    "downloads": "Загрузки",
    "docs": "Документация",
    "legacy": "Старая версия",
    "about": "О проекте",
    "help": "Разделы помощи",
    "version": "Статус версии",
    "links": "Связанные ссылки",
    "currentStable": "Текущая стабильная версия:",
    "nextMajor": "Следующая крупная версия:",
    "status": "Статус v2.0:",
    "inDevelopment": "В разработке",
    "legacyRelease": "Старая версия Python",
    "footer": "<strong>pyIDE</strong> - легкая Windows IDE от sonicFanTech. Последнее обновление <span id=\"year\">2026</span>.",
    "sourceCode": "Исходный код",
    "downloadLegacy": "Скачать старый установщик",
    "viewDocs": "Открыть руководство",
    "topics": "Рассмотренные темы",
    "details": "Подробности",
    "related": "Связанная документация",
    "notAvailable": "Публичная загрузка v2.0 пока недоступна.",
    "canonical": "Английский текст является каноническим; этот статический перевод покрывает интерфейс и документацию сайта.",
    "sectionIntro": "Этот раздел описывает {section} в pyIDE.",
    "bullet": "Проверьте этот шаг: {topic}.",
    "more": "Горячие клавиши, имена файлов, пути и технологии не переводятся, когда это уменьшает неоднозначность.",
    "flowTitle": "Поток разрешений",
    "tableTitle": "Таблица возможностей",
}

LANG_UI["ja"] = {
    **LANG_UI["en"],
    "skip": "内容へ移動",
    "navigation": "ナビゲーション",
    "theme": "テーマ",
    "language": "言語",
    "classic": "クラシック",
    "dark": "ダーク",
    "selectedInstaller": "選択されたインストーラー",
    "fallbackNote": "ローカライズ画像がないため、スクリーンショットは英語で表示されます。",
    "home": "ホーム",
    "features": "機能",
    "aiAssistant": "AI アシスタント",
    "development": "C++ 再実装",
    "screenshots": "スクリーンショット",
    "downloads": "ダウンロード",
    "docs": "ドキュメント",
    "faq": "FAQ",
    "legacy": "旧バージョン",
    "about": "概要",
    "help": "ヘルプ項目",
    "version": "バージョン状態",
    "links": "関連リンク",
    "currentStable": "現在の安定版:",
    "nextMajor": "次のメジャー版:",
    "status": "v2.0 状態:",
    "inDevelopment": "開発中",
    "legacyRelease": "旧 Python 版",
    "footer": "<strong>pyIDE</strong> - sonicFanTech の軽量 Windows IDE。最終更新 <span id=\"year\">2026</span>。",
    "sourceCode": "ソースコード",
    "downloadLegacy": "旧セットアップをダウンロード",
    "viewDocs": "ガイドを開く",
    "topics": "扱う項目",
    "details": "詳細",
    "related": "関連ドキュメント",
    "notAvailable": "v2.0 の公開ダウンロードはまだありません。",
    "canonical": "英語が正規の原文です。この静的翻訳はサイト UI とドキュメントを対象にしています。",
    "sectionIntro": "このセクションでは pyIDE の {section} を説明します。",
    "bullet": "この手順を確認してください: {topic}。",
    "more": "ショートカット、ファイル名、パス、技術名は混乱を避けるため必要に応じてそのままにします。",
    "flowTitle": "権限フロー",
    "tableTitle": "機能表",
}

LANG_UI["ko"] = {
    **LANG_UI["ja"],
    "skip": "콘텐츠로 이동",
    "navigation": "탐색",
    "theme": "테마",
    "language": "언어",
    "classic": "클래식",
    "dark": "어둡게",
    "selectedInstaller": "선택한 설치 파일",
    "fallbackNote": "현지화된 스크린샷이 없어 영어 스크린샷을 표시합니다.",
    "home": "홈",
    "features": "기능",
    "aiAssistant": "AI 도우미",
    "development": "C++ 재작성",
    "screenshots": "스크린샷",
    "downloads": "다운로드",
    "docs": "문서",
    "legacy": "레거시 버전",
    "about": "정보",
    "help": "도움말 항목",
    "version": "버전 상태",
    "links": "관련 링크",
    "currentStable": "현재 안정 버전:",
    "nextMajor": "다음 주요 버전:",
    "status": "v2.0 상태:",
    "inDevelopment": "개발 중",
    "legacyRelease": "레거시 Python 버전",
    "footer": "<strong>pyIDE</strong> - sonicFanTech의 가벼운 Windows IDE. 마지막 업데이트 <span id=\"year\">2026</span>.",
    "sourceCode": "소스 코드",
    "downloadLegacy": "레거시 설치 파일 다운로드",
    "viewDocs": "가이드 열기",
    "topics": "다루는 주제",
    "details": "세부 정보",
    "related": "관련 문서",
    "notAvailable": "v2.0 공개 다운로드는 아직 제공되지 않습니다.",
    "canonical": "영어가 기준 원문입니다. 이 정적 번역은 사이트 UI와 문서를 제공합니다.",
    "sectionIntro": "이 섹션은 pyIDE의 {section} 항목을 다룹니다.",
    "bullet": "이 단계를 확인하세요: {topic}.",
    "more": "단축키, 파일 이름, 경로, 기술 이름은 혼동을 피하기 위해 그대로 둘 수 있습니다.",
    "flowTitle": "권한 흐름",
    "tableTitle": "기능 표",
}

LANG_UI["ar"] = {
    **LANG_UI["en"],
    "skip": "تجاوز إلى المحتوى",
    "navigation": "التنقل",
    "theme": "السمة",
    "language": "اللغة",
    "classic": "كلاسيكي",
    "dark": "داكن",
    "selectedInstaller": "المثبت المحدد",
    "fallbackNote": "تظهر اللقطة بالإنجليزية لعدم توفر لقطة مترجمة.",
    "home": "الرئيسية",
    "features": "الميزات",
    "aiAssistant": "مساعد الذكاء الاصطناعي",
    "development": "إعادة كتابة C++",
    "screenshots": "اللقطات",
    "downloads": "التنزيلات",
    "docs": "التوثيق",
    "faq": "الأسئلة الشائعة",
    "legacy": "الإصدار القديم",
    "about": "حول",
    "help": "مواضيع المساعدة",
    "version": "حالة الإصدار",
    "links": "روابط ذات صلة",
    "currentStable": "الإصدار المستقر الحالي:",
    "nextMajor": "الإصدار الرئيسي التالي:",
    "status": "حالة v2.0:",
    "inDevelopment": "قيد التطوير",
    "legacyRelease": "إصدار Python القديم",
    "footer": "<strong>pyIDE</strong> - بيئة تطوير خفيفة لنظام Windows من sonicFanTech. آخر تحديث <span id=\"year\">2026</span>.",
    "sourceCode": "الشيفرة المصدرية",
    "downloadLegacy": "تنزيل مثبت الإصدار القديم",
    "viewDocs": "فتح الدليل",
    "topics": "المواضيع المشمولة",
    "details": "التفاصيل",
    "related": "توثيق مرتبط",
    "notAvailable": "تنزيل v2.0 العام غير متاح بعد.",
    "canonical": "النص الإنجليزي هو المصدر الأساسي؛ هذه الترجمة الثابتة تغطي واجهة الموقع والتوثيق.",
    "sectionIntro": "يغطي هذا القسم {section} في pyIDE.",
    "bullet": "راجع هذه الخطوة: {topic}.",
    "more": "تبقى الاختصارات وأسماء الملفات والمسارات وأسماء التقنيات كما هي عندما يمنع ذلك الالتباس.",
    "flowTitle": "تدفق الأذونات",
    "tableTitle": "جدول الإمكانات",
}

LANG_UI["he"] = {
    **LANG_UI["en"],
    "skip": "דלג לתוכן",
    "navigation": "ניווט",
    "theme": "ערכת נושא",
    "language": "שפה",
    "classic": "קלאסי",
    "dark": "כהה",
    "selectedInstaller": "מתקין נבחר",
    "fallbackNote": "צילום המסך מוצג באנגלית כי אין צילום מסך מקומי זמין.",
    "home": "בית",
    "features": "תכונות",
    "aiAssistant": "מסייע AI",
    "development": "כתיבה מחדש ב-C++",
    "screenshots": "צילומי מסך",
    "downloads": "הורדות",
    "docs": "תיעוד",
    "faq": "FAQ",
    "legacy": "גרסה ישנה",
    "about": "אודות",
    "help": "נושאי עזרה",
    "version": "מצב גרסה",
    "links": "קישורים קשורים",
    "currentStable": "גרסה יציבה נוכחית:",
    "nextMajor": "הגרסה הראשית הבאה:",
    "status": "מצב v2.0:",
    "inDevelopment": "בפיתוח",
    "legacyRelease": "גרסת Python ישנה",
    "footer": "<strong>pyIDE</strong> - IDE קל ל-Windows מאת sonicFanTech. עודכן לאחרונה <span id=\"year\">2026</span>.",
    "sourceCode": "קוד מקור",
    "downloadLegacy": "הורד מתקין ישן",
    "viewDocs": "פתח מדריך",
    "topics": "נושאים מכוסים",
    "details": "פרטים",
    "related": "תיעוד קשור",
    "notAvailable": "הורדת v2.0 ציבורית עדיין אינה זמינה.",
    "canonical": "האנגלית היא מקור הטקסט הרשמי; תרגום סטטי זה מכסה את ממשק האתר והתיעוד.",
    "sectionIntro": "סעיף זה מכסה את {section} ב-pyIDE.",
    "bullet": "בדוק שלב זה: {topic}.",
    "more": "קיצורים, שמות קבצים, נתיבים ושמות טכנולוגיות נשארים ללא שינוי כאשר הדבר מונע בלבול.",
    "flowTitle": "זרימת הרשאות",
    "tableTitle": "טבלת יכולות",
}

TERM_MAP = {
    "en": {},
    "fr": {
        "download": "téléchargement", "installer": "installateur", "open": "ouvrir", "save": "enregistrer",
        "project": "projet", "folder": "dossier", "interpreter": "interpréteur", "run": "exécuter",
        "script": "script", "output": "sortie", "external": "externe", "terminal": "terminal",
        "settings": "paramètres", "theme": "thème", "shortcuts": "raccourcis clavier",
        "permission": "autorisation", "security": "sécurité", "files": "fichiers", "search": "recherche",
        "editor": "éditeur", "autocomplete": "autocomplétion", "syntax": "syntaxe", "troubleshooting": "dépannage",
    },
    "de": {
        "download": "Download", "installer": "Installationsprogramm", "open": "öffnen", "save": "speichern",
        "project": "Projekt", "folder": "Ordner", "interpreter": "Interpreter", "run": "ausführen",
        "script": "Skript", "output": "Ausgabe", "external": "extern", "terminal": "Terminal",
        "settings": "Einstellungen", "theme": "Design", "shortcuts": "Tastenkürzel",
        "permission": "Berechtigung", "security": "Sicherheit", "files": "Dateien", "search": "Suche",
        "editor": "Editor", "autocomplete": "Autovervollständigung", "syntax": "Syntax", "troubleshooting": "Fehlerbehebung",
    },
    "es": {
        "download": "descarga", "installer": "instalador", "open": "abrir", "save": "guardar",
        "project": "proyecto", "folder": "carpeta", "interpreter": "intérprete", "run": "ejecutar",
        "script": "script", "output": "salida", "external": "externo", "terminal": "terminal",
        "settings": "configuración", "theme": "tema", "shortcuts": "atajos de teclado",
        "permission": "permiso", "security": "seguridad", "files": "archivos", "search": "búsqueda",
        "editor": "editor", "autocomplete": "autocompletado", "syntax": "sintaxis", "troubleshooting": "solución de problemas",
    },
    "it": {
        "download": "download", "installer": "installer", "open": "aprire", "save": "salvare",
        "project": "progetto", "folder": "cartella", "interpreter": "interprete", "run": "eseguire",
        "script": "script", "output": "output", "external": "esterno", "terminal": "terminale",
        "settings": "impostazioni", "theme": "tema", "shortcuts": "scorciatoie",
        "permission": "permesso", "security": "sicurezza", "files": "file", "search": "ricerca",
        "editor": "editor", "autocomplete": "autocompletamento", "syntax": "sintassi", "troubleshooting": "risoluzione problemi",
    },
    "pt": {
        "download": "download", "installer": "instalador", "open": "abrir", "save": "salvar",
        "project": "projeto", "folder": "pasta", "interpreter": "interpretador", "run": "executar",
        "script": "script", "output": "saída", "external": "externo", "terminal": "terminal",
        "settings": "configurações", "theme": "tema", "shortcuts": "atalhos",
        "permission": "permissão", "security": "segurança", "files": "arquivos", "search": "pesquisa",
        "editor": "editor", "autocomplete": "autocompletar", "syntax": "sintaxe", "troubleshooting": "solução de problemas",
    },
    "pl": {
        "download": "pobieranie", "installer": "instalator", "open": "otwieranie", "save": "zapisywanie",
        "project": "projekt", "folder": "folder", "interpreter": "interpreter", "run": "uruchamianie",
        "script": "skrypt", "output": "wyjście", "external": "zewnętrzny", "terminal": "terminal",
        "settings": "ustawienia", "theme": "motyw", "shortcuts": "skróty",
        "permission": "uprawnienie", "security": "bezpieczeństwo", "files": "pliki", "search": "wyszukiwanie",
        "editor": "edytor", "autocomplete": "autouzupełnianie", "syntax": "składnia", "troubleshooting": "rozwiązywanie problemów",
    },
    "ru": {
        "download": "загрузка", "installer": "установщик", "open": "открытие", "save": "сохранение",
        "project": "проект", "folder": "папка", "interpreter": "интерпретатор", "run": "запуск",
        "script": "скрипт", "output": "вывод", "external": "внешний", "terminal": "терминал",
        "settings": "настройки", "theme": "тема", "shortcuts": "горячие клавиши",
        "permission": "разрешение", "security": "безопасность", "files": "файлы", "search": "поиск",
        "editor": "редактор", "autocomplete": "автодополнение", "syntax": "синтаксис", "troubleshooting": "устранение неполадок",
    },
    "tr": {
        "download": "indirme", "installer": "kurulum", "open": "açma", "save": "kaydetme",
        "project": "proje", "folder": "klasör", "interpreter": "yorumlayıcı", "run": "çalıştırma",
        "script": "betik", "output": "çıktı", "external": "harici", "terminal": "terminal",
        "settings": "ayarlar", "theme": "tema", "shortcuts": "kısayollar",
        "permission": "izin", "security": "güvenlik", "files": "dosyalar", "search": "arama",
        "editor": "düzenleyici", "autocomplete": "otomatik tamamlama", "syntax": "sözdizimi", "troubleshooting": "sorun giderme",
    },
    "ja": {
        "download": "ダウンロード", "installer": "インストーラー", "open": "開く", "save": "保存",
        "project": "プロジェクト", "folder": "フォルダー", "interpreter": "インタープリター", "run": "実行",
        "script": "スクリプト", "output": "出力", "external": "外部", "terminal": "ターミナル",
        "settings": "設定", "theme": "テーマ", "shortcuts": "ショートカット",
        "permission": "権限", "security": "セキュリティ", "files": "ファイル", "search": "検索",
        "editor": "エディター", "autocomplete": "補完", "syntax": "構文", "troubleshooting": "トラブルシューティング",
    },
    "ko": {
        "download": "다운로드", "installer": "설치 파일", "open": "열기", "save": "저장",
        "project": "프로젝트", "folder": "폴더", "interpreter": "인터프리터", "run": "실행",
        "script": "스크립트", "output": "출력", "external": "외부", "terminal": "터미널",
        "settings": "설정", "theme": "테마", "shortcuts": "단축키",
        "permission": "권한", "security": "보안", "files": "파일", "search": "검색",
        "editor": "편집기", "autocomplete": "자동 완성", "syntax": "구문", "troubleshooting": "문제 해결",
    },
    "ar": {
        "download": "تنزيل", "installer": "المثبت", "open": "فتح", "save": "حفظ",
        "project": "المشروع", "folder": "المجلد", "interpreter": "المفسر", "run": "تشغيل",
        "script": "البرنامج النصي", "output": "الإخراج", "external": "خارجي", "terminal": "الطرفية",
        "settings": "الإعدادات", "theme": "السمة", "shortcuts": "اختصارات لوحة المفاتيح",
        "permission": "الإذن", "security": "الأمان", "files": "الملفات", "search": "البحث",
        "editor": "المحرر", "autocomplete": "الإكمال التلقائي", "syntax": "الصياغة", "troubleshooting": "استكشاف الأخطاء",
    },
    "he": {
        "download": "הורדה", "installer": "מתקין", "open": "פתיחה", "save": "שמירה",
        "project": "פרויקט", "folder": "תיקייה", "interpreter": "מפרש", "run": "הרצה",
        "script": "סקריפט", "output": "פלט", "external": "חיצוני", "terminal": "מסוף",
        "settings": "הגדרות", "theme": "ערכת נושא", "shortcuts": "קיצורי מקלדת",
        "permission": "הרשאה", "security": "אבטחה", "files": "קבצים", "search": "חיפוש",
        "editor": "עורך", "autocomplete": "השלמה אוטומטית", "syntax": "תחביר", "troubleshooting": "פתרון בעיות",
    },
}

PAGE_TITLE_TRANSLATIONS = {
    "fr": {
        "pyIDE v2.0 is being rebuilt in C++": "pyIDE v2.0 est reconstruit en C++",
        "Feature Overview": "Vue d'ensemble des fonctions",
        "AI Desktop Assistant": "Assistant IA de bureau",
        "C++ Recode Development": "Développement du recode C++",
        "Screenshots": "Captures d'écran",
        "Downloads": "Téléchargements",
        "Documentation Help Center": "Centre d'aide de documentation",
        "Getting Started": "Bien démarrer",
        "Installation Guide": "Guide d'installation",
        "Editor Guide": "Guide de l'éditeur",
        "Project Manager Guide": "Guide du gestionnaire de projet",
        "Running Scripts": "Exécution des scripts",
        "Interpreter Manager": "Gestionnaire d'interpréteurs",
        "Compiler Window Guide": "Guide de la fenêtre de compilation",
        "Settings Guide": "Guide des paramètres",
        "Keyboard Shortcuts": "Raccourcis clavier",
        "AI Assistant Guide": "Guide de l'assistant IA",
        "AI Permission Controls - Keeping the User in Control": "Contrôles d'autorisation IA - garder le contrôle utilisateur",
        "Troubleshooting": "Dépannage",
        "Legacy Version Notes": "Notes de version héritée",
        "FAQ": "FAQ",
        "Legacy Python Version": "Version Python héritée",
        "About pyIDE": "À propos de pyIDE",
    },
    "de": {
        "pyIDE v2.0 is being rebuilt in C++": "pyIDE v2.0 wird in C++ neu aufgebaut",
        "Feature Overview": "Funktionsübersicht",
        "AI Desktop Assistant": "KI-Desktop-Assistent",
        "C++ Recode Development": "Entwicklung der C++-Neufassung",
        "Documentation Help Center": "Dokumentations-Hilfezentrum",
        "Getting Started": "Erste Schritte",
        "Installation Guide": "Installationsanleitung",
        "Editor Guide": "Editor-Anleitung",
        "Project Manager Guide": "Projektmanager-Anleitung",
        "Running Scripts": "Skripte ausführen",
        "Interpreter Manager": "Interpreter-Manager",
        "Compiler Window Guide": "Compiler-Fenster",
        "Settings Guide": "Einstellungen",
        "Keyboard Shortcuts": "Tastenkürzel",
        "AI Assistant Guide": "KI-Assistent-Anleitung",
        "AI Permission Controls - Keeping the User in Control": "KI-Berechtigungen - Nutzer behalten Kontrolle",
        "Troubleshooting": "Fehlerbehebung",
        "Legacy Version Notes": "Hinweise zur Legacy-Version",
        "Legacy Python Version": "Legacy-Python-Version",
        "About pyIDE": "Über pyIDE",
    },
    "es": {
        "pyIDE v2.0 is being rebuilt in C++": "pyIDE v2.0 se está reconstruyendo en C++",
        "Feature Overview": "Resumen de funciones",
        "AI Desktop Assistant": "Asistente de escritorio IA",
        "C++ Recode Development": "Desarrollo de la reescritura C++",
        "Documentation Help Center": "Centro de ayuda de documentación",
        "Getting Started": "Primeros pasos",
        "Installation Guide": "Guía de instalación",
        "Editor Guide": "Guía del editor",
        "Project Manager Guide": "Guía del gestor de proyectos",
        "Running Scripts": "Ejecutar scripts",
        "Interpreter Manager": "Gestor de intérpretes",
        "Compiler Window Guide": "Guía de la ventana de compilación",
        "Settings Guide": "Guía de configuración",
        "Keyboard Shortcuts": "Atajos de teclado",
        "AI Assistant Guide": "Guía del asistente IA",
        "AI Permission Controls - Keeping the User in Control": "Controles de permisos IA - el usuario conserva el control",
        "Troubleshooting": "Solución de problemas",
        "Legacy Version Notes": "Notas de versión heredada",
        "Legacy Python Version": "Versión Python heredada",
        "About pyIDE": "Acerca de pyIDE",
    },
}

for locale in ["it", "pt", "pl", "ru", "tr", "ja", "ko", "ar", "he"]:
    PAGE_TITLE_TRANSLATIONS[locale] = PAGE_TITLE_TRANSLATIONS.get("es", {})


def tr_title(lang: str, title: str) -> str:
    return PAGE_TITLE_TRANSLATIONS.get(lang, {}).get(title, title if lang == "en" else f"{title}")


def local_topic(lang: str, text: str) -> str:
    if lang == "en":
        return text
    terms = TERM_MAP.get(lang, {})
    lower = text.lower()
    found = []
    for needle, replacement in terms.items():
        if needle in lower and replacement not in found:
            found.append(replacement)
    if not found:
        found.append(tr_title(lang, text))
    return ", ".join(found[:4])


DOC_LINKS = [
    ("docs.html", "docs", "docs.svg", "Documentation Home"),
    ("getting-started.html", "gettingStarted", "docs.svg", "Getting Started"),
    ("installation.html", "installation", "downloads.svg", "Installation"),
    ("editor-guide.html", "editorGuide", "editor.svg", "Editor Guide"),
    ("project-manager-guide.html", "projectManagerGuide", "project-files.svg", "Project Manager"),
    ("running-scripts.html", "runningScripts", "run.svg", "Running Scripts"),
    ("interpreter-manager.html", "interpreterManager", "terminal.svg", "Interpreter Manager"),
    ("compiler-guide.html", "compilerGuide", "compiler.svg", "Compiler Window"),
    ("settings-guide.html", "settingsGuide", "settings.svg", "Settings"),
    ("shortcuts.html", "shortcuts", "shortcuts.svg", "Keyboard Shortcuts"),
    ("ai-assistant-guide.html", "aiAssistantGuide", "ai-assistant.svg", "AI Assistant Guide"),
    ("ai-permissions.html", "aiPermissions", "security.svg", "AI Permission Controls"),
    ("troubleshooting.html", "troubleshooting", "warning.svg", "Troubleshooting"),
    ("legacy-guide.html", "legacyGuide", "legacy.svg", "Legacy Version Notes"),
    ("faq.html", "faq", "faq.svg", "FAQ"),
]


def page(filename, key, title, meta, utility, badge, icon, doc=False, sections=None, kind="standard", lead=None):
    return {
        "filename": filename,
        "key": key,
        "title": title,
        "meta": meta,
        "utility": utility,
        "badge": badge,
        "icon": icon,
        "doc": doc,
        "sections": sections or [],
        "kind": kind,
        "lead": lead or meta,
    }


PAGES = [
    page(
        "index.html",
        "home",
        "pyIDE v2.0 is being rebuilt in C++",
        "pyIDE v2.0 is an in-development C++ recode of the original Python and PySide6 IDE.",
        "pyIDE v2.0 C++ recode: In Development",
        "v2.0 In Development",
        "home.svg",
        kind="home",
    ),
    page(
        "features.html",
        "features",
        "Feature Overview",
        "Overview of pyIDE editor, project, run, compiler, settings, and AI assistant features.",
        "Features overview",
        "Feature Overview",
        "features.svg",
        sections=[
            {"id": "editor", "title": "Editor", "icon": "editor.svg", "p": ["Tabbed editing, line numbers, find and replace, syntax highlighting, autosave, and optional autocomplete form the daily editing surface."], "bullets": ["Tabbed editor with unsaved-file indicators.", "Find, replace, find next, find previous, and replace all.", "Autocomplete can be improved by Jedi in the legacy version where installed.", "Read the dedicated editor guide for the full workflow."], "links": [("editor-guide.html", "Editor Guide")]},
            {"id": "project", "title": "Project File Manager", "icon": "project-files.svg", "p": ["The active project folder keeps related files close and gives the AI assistant a clear project boundary."], "bullets": ["Open a folder as the active project.", "Create, rename, delete, and open project files.", "Search within the active project."], "links": [("project-manager-guide.html", "Project Manager Guide")]},
            {"id": "run", "title": "Running Scripts", "icon": "run.svg", "p": ["Run scripts inside pyIDE or launch them through an external console when interactive terminal behavior is required."], "bullets": ["F5 runs internally.", "Ctrl+F5 runs in an external console.", "Shift+F5 stops a running script.", "Output and error text are visible in the run panel."], "links": [("running-scripts.html", "Running Scripts Guide")]},
            {"id": "compiler", "title": "Compiler Helper", "icon": "compiler.svg", "p": ["pyIDE provides a helper interface around PyInstaller for building Windows EXE files from Python scripts."], "bullets": ["PyInstaller must be installed in the selected Python environment.", "The helper does not invent new build options.", "Build logs should be checked when a generated EXE fails."], "links": [("compiler-guide.html", "Compiler Guide")]},
            {"id": "settings", "title": "Settings", "icon": "settings.svg", "p": ["Settings cover themes, autosave, recent files, autocomplete, external consoles, interpreter configuration, and session behavior where supported."], "bullets": ["Legacy configuration is stored in pyide_config.json where writable.", "Fallback configuration can use %LOCALAPPDATA%\\SFT_PyIDE\\.", "Some options may change during v2.0 development."], "links": [("settings-guide.html", "Settings Guide")]},
        ],
    ),
    page(
        "ai-assistant.html",
        "aiAssistant",
        "AI Desktop Assistant",
        "Experimental pyIDE AI Desktop Assistant notes for the C++ recode.",
        "Status: Experimental - In Active Development",
        "AI Assistant Experimental",
        "ai-assistant.svg",
        sections=[
            {"id": "purpose", "title": "Main Purpose", "icon": "ai-assistant.svg", "p": ["The assistant is designed to help with coding and project questions inside pyIDE. It is part of the C++ recode and is not described as finished."], "bullets": ["Ask about code in the active editor.", "Use selected-code, open-tab, and active-project context.", "Help locate errors and suggest improvements."], "links": [("ai-assistant-guide.html", "AI Assistant Guide")]},
            {"id": "permission", "title": "Permission Model", "icon": "security.svg", "p": ["The assistant should only use pyIDE tools when the user enables Allow pyIDE Control and an active project is open."], "bullets": ["Tool scope is limited to the active project.", "Path traversal such as ../ must be rejected.", "Future edit batches should be visible, auditable, and recoverable."], "links": [("ai-permissions.html", "Permission Controls")]},
            {"id": "tools", "title": "Tool Layer", "icon": "features.svg", "p": ["Working milestones include listing project files, reading open tabs, reading the active editor, reading selected text, and searching project text."], "bullets": ["The assistant should not silently inspect arbitrary files.", "Tool results return to the assistant through pyIDE.", "The feature has not been described as formally security audited."]},
            {"id": "models", "title": "Models", "icon": "experimental.svg", "p": ["Development testing mentions configurable local-model direction and models such as Qwen2.5-Coder 7B. Compatibility and configuration may change before release."], "bullets": ["Do not assume every model interaction is fully offline unless implementation proves it.", "Do not assume unlimited computer access."]},
            {"id": "roadmap", "title": "Roadmap", "icon": "roadmap.svg", "p": ["Planned work includes edit previews, controlled edits, activity logs, recoverable batches, and Undo support."], "bullets": ["The feature is experimental.", "Public release details are not final."]},
        ],
    ),
    page(
        "development.html",
        "development",
        "C++ Recode Development",
        "pyIDE v2.0 C++ recode roadmap and status without claiming a public release.",
        "pyIDE v2.0 C++ Recode Development",
        "Roadmap, Not Release Promise",
        "development.svg",
        sections=[
            {"id": "why", "title": "Why Recode?", "icon": "development.svg", "p": ["The recode moves pyIDE from the original Python and PySide6 foundation toward a native C++ desktop application."], "bullets": ["Keep the useful editor, project, run, settings, and compiler workflows.", "Improve responsiveness and expansion room.", "Do not claim a public v2.0 download before one exists."]},
            {"id": "comparison", "title": "Legacy Python Version vs C++ Recode Goal", "icon": "features.svg", "p": ["The legacy release is available today. The v2.0 C++ recode is still under development."], "bullets": ["Legacy: Python with PySide6.", "v2.0 direction: native C++ application.", "AI Desktop Assistant: experimental and permission-controlled."]},
            {"id": "roadmap", "title": "Milestone Timeline", "icon": "roadmap.svg", "p": ["Milestones are development notes, not release guarantees."], "bullets": ["Permission-controlled project tools are being tested.", "Tool orchestration and AI project context are being refined.", "Public v2.0 release date has not been announced."], "links": [("docs.html", "Documentation Home")]},
            {"id": "news", "title": "Development News", "icon": "news.svg", "p": ["June 2026 notes focus on the AI assistant, scoped tools, and project context."], "bullets": ["No v2.0 installer is published on this website.", "Legacy downloads remain linked from GitHub releases."]},
        ],
    ),
    page(
        "screenshots.html",
        "screenshots",
        "Screenshots",
        "pyIDE screenshot gallery with localized screenshot fallback behavior.",
        "Screenshot gallery",
        "Legacy Screenshots",
        "screenshots.svg",
        kind="screenshots",
    ),
    page(
        "downloads.html",
        "downloads",
        "Downloads",
        "Download the legacy pyIDE release and read the status of the in-development C++ recode.",
        "Downloads: legacy available, v2.0 not public yet",
        "No fake v2.0 download",
        "downloads.svg",
        kind="downloads",
    ),
    page("docs.html", "docs", "Documentation Help Center", "Complete pyIDE documentation index.", "Documentation index", "Help Center", "docs.svg", doc=True, kind="docs_index"),
    page(
        "getting-started.html",
        "gettingStarted",
        "Getting Started",
        "Beginner guide to pyIDE status, files, projects, interpreters, running, output, external consoles, autosave, and next steps.",
        "Getting started with pyIDE",
        "Start Here",
        "docs.svg",
        doc=True,
        sections=[
            {"id": "status", "title": "What pyIDE is", "icon": "information.svg", "p": ["pyIDE is a lightweight Windows-focused IDE from sonicFanTech. The downloadable legacy release was built with Python and PySide6. The future pyIDE v2.0 is a C++ recode in development."], "bullets": ["Legacy Python release is the current downloadable version.", "pyIDE v2.0 public download is not available yet.", "The AI Desktop Assistant belongs to the v2.0 development direction."]},
            {"id": "download", "title": "Download the legacy release", "icon": "downloads.svg", "p": ["Use the Downloads page to get the selected legacy installer for your chosen website language. The selector changes the GitHub release filename where a localized installer exists."], "bullets": ["Do not look for a v2.0 installer yet.", "Run the legacy setup from the GitHub release link."]},
            {"id": "new-file", "title": "Create a new file", "icon": "editor.svg", "p": ["Create a new untitled editor tab, write Python code, then save it with a .py filename before relying on autosave."], "bullets": ["Ctrl+N creates a new file.", "Untitled files need a Save or Save As location."]},
            {"id": "opening-files", "title": "Open and save files", "icon": "editor.svg", "p": ["Open existing Python files, edit them in tabs, and save changes when the unsaved indicator appears."], "bullets": ["Ctrl+O opens a file.", "Ctrl+S saves the current file.", "Ctrl+Shift+S saves with a new name."]},
            {"id": "project-folder", "title": "Open a project folder", "icon": "project-files.svg", "p": ["A project folder becomes the active project for file browsing, search, and AI tool boundaries."], "bullets": ["Open the folder that contains your script files.", "Use the project tree to open, create, rename, or delete files."]},
            {"id": "interpreter", "title": "Select an interpreter", "icon": "terminal.svg", "p": ["Choose the Python executable pyIDE should use when running scripts. Verify the selected python.exe exists."], "bullets": ["Multiple Python versions can exist on one machine.", "If running fails, check the interpreter path first."]},
            {"id": "running", "title": "Run a script internally", "icon": "run.svg", "p": ["F5 runs the current script inside pyIDE and sends output to the output panel."], "bullets": ["Save the file before running.", "Check visible error output when execution fails."]},
            {"id": "output", "title": "Read the output panel", "icon": "terminal.svg", "p": ["The output panel shows normal print output, error text, and prompts where stdin is supported."], "bullets": ["A script that waits for input may need stdin support.", "Terminal-style programs may behave better externally."]},
            {"id": "external-console", "title": "Run in an external terminal", "icon": "terminal.svg", "p": ["Ctrl+F5 launches the script in an external console such as Command Prompt, Windows PowerShell, PowerShell 7, Windows Terminal, or a configured custom terminal."], "bullets": ["Use external mode for interactive CLI and curses-style tools.", "Check custom terminal paths if launch fails."]},
            {"id": "autosave", "title": "Autosave", "icon": "settings.svg", "p": ["Autosave protects named files at the configured interval. Untitled files still need a save location."], "bullets": ["Set the autosave interval in Settings.", "Autosave does not replace intentional Save As workflow."]},
            {"id": "next-steps", "title": "Next steps", "icon": "docs.svg", "p": ["After the beginner walkthrough, continue into the editor, project manager, running scripts, settings, and troubleshooting guides."], "bullets": ["Read the editor guide.", "Read the project manager guide.", "Read the running scripts guide."], "links": [("editor-guide.html", "Editor Guide"), ("project-manager-guide.html", "Project Manager Guide"), ("running-scripts.html", "Running Scripts Guide")]},
        ],
    ),
    page(
        "installation.html",
        "installation",
        "Installation Guide",
        "Install the downloadable legacy Python release and understand the C++ recode status.",
        "Installation guide",
        "Legacy Install",
        "downloads.svg",
        doc=True,
        sections=[
            {"id": "legacy-release", "title": "Legacy Python Release", "icon": "legacy.svg", "p": ["The downloadable pyIDE release is the legacy Python and PySide6 version."], "bullets": ["Download the selected installer from the Downloads page.", "Launch the installer from the GitHub release link.", "Start pyIDE after setup completes."]},
            {"id": "requirements", "title": "Python interpreter requirements", "icon": "terminal.svg", "p": ["pyIDE runs Python scripts through a configured Python interpreter."], "bullets": ["Install Python if your scripts need a system interpreter.", "Check that python.exe exists and is selectable.", "Portable Python installations may be added where supported."]},
            {"id": "optional-tools", "title": "Optional external tools", "icon": "settings.svg", "p": ["Some features become more useful when optional tools are installed."], "bullets": ["PyInstaller is required for building EXE files.", "Jedi can improve autocomplete in the legacy version where supported.", "Windows Terminal and PowerShell 7 can be used as external-console choices."]},
            {"id": "portable-config", "title": "Portable configuration behavior", "icon": "settings.svg", "p": ["Where supported, pyIDE stores configuration beside the app if the folder is writable and falls back to user storage if needed."], "bullets": ["Legacy configuration file: pyide_config.json.", "Fallback storage: %LOCALAPPDATA%\\SFT_PyIDE\\."]},
            {"id": "common-issues", "title": "Common installation issues", "icon": "warning.svg", "p": ["Installation and first-run problems are usually related to permissions, interpreter paths, or missing optional tools."], "bullets": ["If scripts do not run, check the selected interpreter.", "If EXE building fails, install PyInstaller in the selected environment.", "If an external console fails, verify the configured terminal path."]},
            {"id": "v2-status", "title": "pyIDE v2.0 C++ Recode", "icon": "development.svg", "p": ["Status: In Development. Public download: Not available yet. Final system requirements: Not yet announced."], "bullets": ["Do not invent a v2.0 download.", "Follow the development page for recode status."], "links": [("development.html", "Development Page")]},
        ],
    ),
    page(
        "editor-guide.html",
        "editorGuide",
        "Editor Guide",
        "Tabbed editing, find and replace, autocomplete, syntax checking, autosave, recent files, and shortcuts in pyIDE.",
        "Editor guide",
        "Editor",
        "editor.svg",
        doc=True,
        sections=[
            {"id": "tabs", "title": "Tabbed editing", "icon": "editor.svg", "p": ["pyIDE can open multiple files in tabs, including new untitled files."], "bullets": ["Unsaved indicators show files with pending changes.", "Save and Save As write the current tab.", "Closing a tab should prompt when work is unsaved."]},
            {"id": "line-numbers", "title": "Line-number gutter", "icon": "editor.svg", "p": ["The editor displays line numbers to make errors and navigation easier to follow."], "bullets": ["Syntax highlighting helps scan Python code.", "Undo and redo support normal editing recovery.", "Copy, cut, and paste follow standard desktop behavior."]},
            {"id": "find-replace", "title": "Find and replace", "icon": "features.svg", "p": ["Find, replace, find next, find previous, and replace all help revise code inside the current file."], "bullets": ["Use Ctrl+F for find.", "Use Ctrl+H for replace.", "Review Replace All carefully before applying broad changes."]},
            {"id": "autocomplete", "title": "Autocomplete", "icon": "features.svg", "p": ["Autocomplete suggests names while editing. The legacy version may use Jedi for enhanced completion where installed."], "bullets": ["Ctrl+Space can trigger completion where supported.", "Automatic bracket and quote completion may be available depending on version."]},
            {"id": "syntax-checking", "title": "Syntax checking", "icon": "warning.svg", "p": ["Syntax checking helps catch Python syntax errors before or during execution."], "bullets": ["Ctrl+K checks syntax where supported.", "Read error output for line numbers and messages."]},
            {"id": "autosave", "title": "Autosave", "icon": "settings.svg", "p": ["Autosave can periodically save named files."], "bullets": ["Autosave does not save an untitled file until it has a path.", "Configure the interval in Settings."]},
            {"id": "recent-files", "title": "Recent files and sessions", "icon": "docs.svg", "p": ["Recent files and session restoration may help resume work where supported."], "bullets": ["Recent-file limits are controlled by settings.", "Session behavior may evolve during v2.0 development."]},
            {"id": "shortcuts", "title": "Keyboard shortcuts", "icon": "shortcuts.svg", "p": ["Use the keyboard-shortcut reference for file, edit, run, and tool commands."], "bullets": ["Some assignments may evolve during v2.0 development."], "links": [("shortcuts.html", "Shortcut Reference")]},
        ],
    ),
    page(
        "project-manager-guide.html",
        "projectManagerGuide",
        "Project Manager Guide",
        "Open project folders, manage files, search projects, and understand the active-project boundary.",
        "Project manager guide",
        "Projects",
        "project-files.svg",
        doc=True,
        sections=[
            {"id": "opening-projects", "title": "Opening projects", "icon": "project-files.svg", "p": ["Open a folder to make it the active project in pyIDE."], "bullets": ["The dockable project tree shows files and folders.", "Double-click a project file to open it in the editor."]},
            {"id": "active-project", "title": "Active project concept", "icon": "information.svg", "p": ["The active project is the folder pyIDE uses for browsing, search, and scoped assistant tools."], "bullets": ["Only one folder should be treated as active at a time.", "Use clear project folders for predictable paths."]},
            {"id": "creating-items", "title": "Creating files and folders", "icon": "project-files.svg", "p": ["Project actions can create new files and folders inside the active project."], "bullets": ["Create files for Python modules, notes, or resources.", "Create folders to organize scripts and packages."]},
            {"id": "rename-delete", "title": "Rename and delete", "icon": "warning.svg", "p": ["Rename and delete actions change the filesystem and should be used carefully."], "bullets": ["Confirm deletion before removing files.", "Make sure a file is not open or running before major changes."]},
            {"id": "file-explorer", "title": "Open in File Explorer", "icon": "source.svg", "p": ["Use File Explorer integration to inspect the real project location in Windows."], "bullets": ["This helps confirm paths and external files.", "Unavailable actions may mean the folder is missing or inaccessible."]},
            {"id": "search", "title": "Search the active project", "icon": "features.svg", "p": ["Project search helps locate text across files in the active project."], "bullets": ["Search returns no results when text is absent or files are outside scope.", "Use specific terms for faster results."]},
            {"id": "ai-boundary", "title": "AI assistant project boundary", "icon": "security.svg", "p": ["The active project acts as the assistant boundary when Allow pyIDE Control is enabled."], "bullets": ["Tools should stay inside the active project.", "Path traversal such as ../ must be rejected."], "links": [("ai-permissions.html#active-project-boundary", "AI Project Boundary")]},
        ],
    ),
    page(
        "running-scripts.html",
        "runningScripts",
        "Running Scripts",
        "Run Python scripts internally or externally and troubleshoot interpreter and console problems.",
        "Running scripts guide",
        "Run Tools",
        "run.svg",
        doc=True,
        sections=[
            {"id": "internal", "title": "Internal run mode", "icon": "run.svg", "p": ["F5 runs the current script inside pyIDE using the selected Python interpreter."], "bullets": ["Save the script before running.", "Internal mode is convenient for normal print output and quick tests."]},
            {"id": "output", "title": "Output panel behavior", "icon": "terminal.svg", "p": ["The output panel shows stdout, stderr, and visible error output."], "bullets": ["Read traceback text for file and line details.", "Nothing appears if the script exits silently."]},
            {"id": "stdin", "title": "stdin input", "icon": "terminal.svg", "p": ["Scripts that call input() need stdin support."], "bullets": ["If a prompt behaves poorly internally, use an external console."]},
            {"id": "stop", "title": "Stop a running script", "icon": "warning.svg", "p": ["Shift+F5 stops a running script where supported."], "bullets": ["Some child processes may need manual closing.", "Save work before rerunning long tasks."]},
            {"id": "external", "title": "External console mode", "icon": "terminal.svg", "p": ["Ctrl+F5 launches the script in an external console."], "bullets": ["Interactive CLI and curses-style tools may work better externally.", "Command Prompt, Windows PowerShell, PowerShell 7, Windows Terminal, and custom terminals may be used."]},
            {"id": "terminals", "title": "Terminal choices", "icon": "settings.svg", "p": ["Choose the external console that fits your workflow."], "bullets": ["Windows Terminal must be installed before selecting it.", "PowerShell 7 is separate from Windows PowerShell.", "Custom terminal entries need valid executable paths."]},
            {"id": "errors", "title": "Common execution errors", "icon": "warning.svg", "p": ["Most run failures come from interpreter-selection problems, missing files, or missing Python packages."], "bullets": ["Confirm python.exe exists.", "Install required modules in the selected environment.", "Check paths with spaces when external tools fail."]},
        ],
    ),
    page(
        "interpreter-manager.html",
        "interpreterManager",
        "Interpreter Manager",
        "Choose, add, remove, rediscover, and troubleshoot Python interpreters in pyIDE.",
        "Interpreter manager guide",
        "Interpreters",
        "terminal.svg",
        doc=True,
        sections=[
            {"id": "what-is", "title": "What a Python interpreter is", "icon": "terminal.svg", "p": ["A Python interpreter is the python.exe that runs your scripts."], "bullets": ["Different Python versions may exist on one machine.", "Projects may need different interpreters."]},
            {"id": "choosing", "title": "Choosing an interpreter", "icon": "settings.svg", "p": ["Select the interpreter pyIDE should use for internal and external runs."], "bullets": ["Verify the path points to python.exe.", "Use the interpreter that has your packages installed."]},
            {"id": "adding-removing", "title": "Adding and removing entries", "icon": "project-files.svg", "p": ["Add a Python executable or remove old entries that no longer exist."], "bullets": ["Portable Python installations may be added where supported.", "Removing an entry should not uninstall Python itself."]},
            {"id": "rediscover", "title": "Rediscover installed interpreters", "icon": "features.svg", "p": ["Rediscovery can locate Python installations after system changes."], "bullets": ["If rediscovery misses one, add the executable manually."]},
            {"id": "errors", "title": "Common interpreter errors", "icon": "warning.svg", "p": ["Interpreter errors usually mean the executable path is wrong or required modules are missing."], "bullets": ["Check the selected python.exe.", "Install packages in the same environment pyIDE uses."]},
            {"id": "v2-improvements", "title": "Planned v2.0 improvements", "icon": "development.svg", "p": ["The C++ recode may improve interpreter discovery and project-specific configuration."], "bullets": ["Final behavior may change before release."]},
        ],
    ),
    page(
        "compiler-guide.html",
        "compilerGuide",
        "Compiler Window Guide",
        "Use the pyIDE PyInstaller helper window to build Windows EXE files from Python scripts.",
        "Compiler guide",
        "PyInstaller Helper",
        "compiler.svg",
        doc=True,
        sections=[
            {"id": "source-vs-exe", "title": "Python source script vs Windows EXE", "icon": "compiler.svg", "p": ["A .py file is source code. A Windows EXE is a packaged executable generated by a build tool such as PyInstaller."], "bullets": ["pyIDE provides a helper interface around PyInstaller.", "It does not replace understanding your script dependencies."]},
            {"id": "requirements", "title": "PyInstaller requirement", "icon": "downloads.svg", "p": ["PyInstaller must be installed in the selected Python environment before the helper can build an EXE."], "bullets": ["Install missing modules before building.", "Use the interpreter that contains your dependencies."]},
            {"id": "build", "title": "Starting a build", "icon": "run.svg", "p": ["Select a Python script, start the build, and read the build output."], "bullets": ["Build output explains progress and failures.", "Generated files are usually placed in PyInstaller output folders."]},
            {"id": "failures", "title": "Common failures", "icon": "warning.svg", "p": ["Build failures often involve missing modules, dependency problems, or paths containing spaces."], "bullets": ["Check traceback and PyInstaller output.", "Avoid inventing unverified build options.", "Antivirus false positives can happen with packaged EXE files; review cautiously."]},
        ],
    ),
    page(
        "settings-guide.html",
        "settingsGuide",
        "Settings Guide",
        "Configure pyIDE theme, autosave, recent files, autocomplete, consoles, interpreters, sessions, and persistence.",
        "Settings guide",
        "Settings",
        "settings.svg",
        doc=True,
        sections=[
            {"id": "opening", "title": "Opening Settings", "icon": "settings.svg", "p": ["Open the Settings window to adjust editor and run behavior."], "bullets": ["Light and dark themes are available.", "System or automatic behavior should only be described where supported."]},
            {"id": "autosave", "title": "Autosave and recent files", "icon": "docs.svg", "p": ["Autosave can periodically save named files and recent-files limit controls how many files appear in history."], "bullets": ["Untitled files need a save location.", "Set an autosave interval that matches your workflow."]},
            {"id": "autocomplete", "title": "Autocomplete options", "icon": "features.svg", "p": ["Autocomplete options control editor suggestions."], "bullets": ["Jedi may enhance completion in the legacy version where installed."]},
            {"id": "external-console", "title": "External-console defaults", "icon": "terminal.svg", "p": ["Choose defaults for Command Prompt, Windows PowerShell, PowerShell 7, Windows Terminal, or custom terminal entries."], "bullets": ["Custom terminal paths must be valid.", "Interactive tools may require an external console."]},
            {"id": "interpreters", "title": "Interpreter configuration", "icon": "terminal.svg", "p": ["Select which Python interpreter pyIDE uses to run scripts and build tools."], "bullets": ["The selected interpreter should contain required packages."]},
            {"id": "persistence", "title": "Configuration persistence", "icon": "settings.svg", "p": ["Legacy configuration file: pyide_config.json. pyIDE may use same-folder storage where writable and fall back under %LOCALAPPDATA%\\SFT_PyIDE\\."], "bullets": ["Some settings may change during v2.0 development.", "Session behavior is version-dependent."]},
        ],
    ),
    page(
        "shortcuts.html",
        "shortcuts",
        "Keyboard Shortcuts",
        "Keyboard shortcut reference for pyIDE file, editing, running, and tool commands.",
        "Keyboard shortcut reference",
        "Shortcuts",
        "shortcuts.svg",
        doc=True,
        kind="shortcuts",
    ),
    page(
        "ai-assistant-guide.html",
        "aiAssistantGuide",
        "AI Assistant Guide",
        "Experimental pyIDE AI Desktop Assistant guide for code questions, project context, models, roadmap, and limitations.",
        "AI assistant guide",
        "Experimental AI",
        "ai-assistant.svg",
        doc=True,
        sections=[
            {"id": "overview", "title": "Overview", "icon": "ai-assistant.svg", "p": ["Status: Experimental - In Active Development. The AI Desktop Assistant is part of the C++ recode and is designed for coding and project assistance."], "bullets": ["Ask questions about code.", "Use active-editor, selected-code, open-tab, and active-project context.", "Help locate errors and suggest improvements."]},
            {"id": "context", "title": "Project context", "icon": "project-files.svg", "p": ["Context may include open tabs, the active editor, selected code, and searchable project text."], "bullets": ["The active project provides the boundary for project tools.", "Review files through pyIDE-scoped tools rather than arbitrary filesystem inspection."]},
            {"id": "models", "title": "Models", "icon": "experimental.svg", "p": ["Development testing includes configurable local-model direction and models such as Qwen2.5-Coder 7B."], "bullets": ["Compatibility and configuration may change before release.", "Do not claim every interaction is fully offline unless the implementation proves it."]},
            {"id": "roadmap", "title": "Roadmap", "icon": "roadmap.svg", "p": ["Planned work includes edit previews, controlled edits, activity logs, recoverable batches, and Undo support."], "bullets": ["The feature is not finished.", "See permission controls for safety boundaries."], "links": [("ai-permissions.html", "AI Permission Controls")]},
            {"id": "limitations", "title": "Limitations", "icon": "warning.svg", "p": ["Do not treat the assistant as having unlimited computer access or finished security guarantees."], "bullets": ["Formal security audit completion has not been claimed.", "User control remains the design goal."]},
        ],
    ),
    page(
        "ai-permissions.html",
        "aiPermissions",
        "AI Permission Controls - Keeping the User in Control",
        "Detailed AI permission controls, active-project boundaries, tool scope, path traversal rejection, and future recoverable edits.",
        "AI permission controls",
        "User Control",
        "security.svg",
        doc=True,
        kind="ai_permissions",
    ),
    page(
        "troubleshooting.html",
        "troubleshooting",
        "Troubleshooting",
        "Categorized pyIDE troubleshooting for files, running scripts, external consoles, compiler, projects, AI assistant, and website behavior.",
        "Troubleshooting guide",
        "Support",
        "warning.svg",
        doc=True,
        sections=[
            {"id": "files", "title": "Opening and Saving Files", "icon": "editor.svg", "p": ["File problems are usually caused by missing paths, permissions, or untitled files."], "bullets": ["A file does not open: confirm it still exists.", "A file cannot be saved: check folder permissions.", "Autosave does not save an untitled file: save it with a path first.", "Configuration storage is not writable: use the %LOCALAPPDATA% fallback."]},
            {"id": "running", "title": "Running Scripts", "icon": "run.svg", "p": ["Run problems usually involve the interpreter, script behavior, or stdin."], "bullets": ["Python cannot be found: choose a valid interpreter.", "Wrong interpreter selected: select the Python that has your packages.", "Nothing appears in output: the script may exit silently.", "A script requires input: use stdin support or external console.", "A running script does not stop: close child processes if needed."]},
            {"id": "external-consoles", "title": "External Consoles", "icon": "terminal.svg", "p": ["External console launch failures come from missing tools or invalid paths."], "bullets": ["Windows Terminal is not installed.", "PowerShell 7 is not installed.", "A custom terminal path is invalid."]},
            {"id": "compiler", "title": "Compiler Window", "icon": "compiler.svg", "p": ["PyInstaller build problems should be read from the build output."], "bullets": ["PyInstaller is missing.", "Build fails.", "Generated EXE misses a dependency.", "Antivirus flags an EXE."]},
            {"id": "project-manager", "title": "Project Manager", "icon": "project-files.svg", "p": ["Project actions depend on a valid active project folder."], "bullets": ["Project folder does not open.", "Search returns no results.", "File action is unavailable."]},
            {"id": "ai-assistant", "title": "AI Desktop Assistant", "icon": "ai-assistant.svg", "p": ["AI assistant issues often mean required context or permission is missing."], "bullets": ["Allow pyIDE Control is disabled.", "No active project folder is open.", "No text is selected.", "A path is rejected because it leaves the project root.", "A feature is not yet available because development is incomplete."]},
            {"id": "website", "title": "Website", "icon": "languages.svg", "p": ["Website issues involve localization, theme storage, screenshots, or links."], "bullets": ["Language selection does not update content: ensure JavaScript is enabled.", "A translation falls back to English: the English key is used safely.", "Theme selection does not persist: check localStorage.", "A screenshot falls back to English: localized image is unavailable.", "A screenshot fails to load: the English fallback is used."]},
        ],
    ),
    page(
        "legacy-guide.html",
        "legacyGuide",
        "Legacy Version Notes",
        "Documentation for the downloadable original Python and PySide6 pyIDE version.",
        "Legacy guide",
        "Legacy Python Release",
        "legacy.svg",
        doc=True,
        sections=[
            {"id": "editor", "title": "Tabbed editor", "icon": "editor.svg", "p": ["The legacy version includes a tabbed editor for multiple files and untitled files."], "bullets": ["Unsaved indicators.", "Line numbers.", "Find and replace.", "Recent files.", "Autosave."]},
            {"id": "project", "title": "Project-file tree", "icon": "project-files.svg", "p": ["The project tree supports practical file management."], "bullets": ["Open project folders.", "Create, rename, delete, and open files.", "Search where supported."]},
            {"id": "run", "title": "Run workflow", "icon": "run.svg", "p": ["The legacy version supports internal execution, an output panel, stdin input, script stopping, and external terminals."], "bullets": ["F5 internal run.", "Shift+F5 stop.", "Ctrl+F5 external console."]},
            {"id": "tools", "title": "Tools", "icon": "compiler.svg", "p": ["Tools include interpreter manager, optional Jedi support, syntax checking, a PyInstaller helper, and settings persistence."], "bullets": ["Legacy configuration can use pyide_config.json.", "Portable behavior applies where supported.", "Keyboard shortcuts are documented separately."]},
            {"id": "future", "title": "Future direction", "icon": "development.svg", "p": ["The C++ recode and AI Desktop Assistant are separate in-development directions."], "bullets": ["Read the development page.", "Read the AI assistant overview.", "Read the AI assistant guide."], "links": [("development.html", "Development"), ("ai-assistant.html", "AI Assistant"), ("ai-assistant-guide.html", "AI Assistant Guide")]},
        ],
    ),
    page(
        "faq.html",
        "faq",
        "FAQ",
        "Frequently asked questions about pyIDE downloads, v2.0 status, AI assistant, interpreters, and support.",
        "FAQ",
        "Frequently Asked Questions",
        "faq.svg",
        kind="faq",
    ),
    page(
        "legacy.html",
        "legacy",
        "Legacy Python Version",
        "Overview of the downloadable original Python and PySide6 version of pyIDE.",
        "Legacy Python release",
        "Legacy Version",
        "legacy.svg",
        sections=[
            {"id": "overview", "title": "Original Python and PySide6 version", "icon": "legacy.svg", "p": ["The legacy release is the currently downloadable pyIDE version. It remains useful while v2.0 is developed."], "bullets": ["Tabbed editor.", "Project-file tree.", "Interpreter manager.", "Internal and external run modes.", "PyInstaller helper."], "links": [("legacy-guide.html", "Legacy Guide")]},
            {"id": "interpreters", "title": "Interpreter Manager", "icon": "terminal.svg", "p": ["The legacy version can select Python interpreters for running scripts."], "bullets": ["Multiple Python versions may exist.", "Check python.exe when scripts fail."]},
            {"id": "settings", "title": "Settings persistence", "icon": "settings.svg", "p": ["Legacy preferences are stored in pyide_config.json where possible and can fall back to user storage."], "bullets": ["Themes, autosave, recent files, autocomplete, consoles, and interpreters are settings topics."]},
        ],
    ),
    page(
        "about.html",
        "about",
        "About pyIDE",
        "About the pyIDE project, sonicFanTech links, credits, and repository.",
        "About pyIDE",
        "About",
        "about.svg",
        sections=[
            {"id": "project", "title": "Project", "icon": "about.svg", "p": ["pyIDE is an independently developed lightweight Windows IDE from sonicFanTech."], "bullets": ["The project began as a Python and PySide6 desktop IDE.", "The v2.0 direction is a C++ recode.", "The AI Desktop Assistant is experimental and permission-controlled."]},
            {"id": "links", "title": "Project Links and Credits", "icon": "source.svg", "p": ["The existing GitHub repository link is preserved."], "bullets": ["Branding: pyIDE and sonicFanTech project branding.", "Credits: independently developed project.", "License: see the GitHub repository for current license information where available."]},
        ],
    ),
]

PAGE_BY_KEY = {p["key"]: p for p in PAGES}


def attrs(**items: str) -> str:
    return " ".join(f'{key.replace("_", "-")}="{escape(str(value), quote=True)}"' for key, value in items.items() if value is not None)


def link_button(href: str, text: str, primary: bool = False) -> str:
    cls = "classic-button primary" if primary else "classic-button"
    return f'<a class="{cls}" href="{escape(href)}">{escape(text)}</a>'


def render_links(links):
    if not links:
        return ""
    return '<div class="button-row">' + "".join(link_button(href, text) for href, text in links) + "</div>"


def render_standard_body(page_data, lang="en"):
    ui = LANG_UI[lang]
    title = tr_title(lang, page_data["title"])
    lead = page_data["lead"] if lang == "en" else ui["canonical"]
    quick = f"""
      <div class="quick-status">
        <h2>{escape(ui["statusBox"])}</h2>
        <p><strong>pyIDE v2.0:</strong> {escape(ui["notAvailable"])}</p>
        <p><strong>{escape(ui["legacyRelease"])}:</strong> {escape(ui["inDevelopment"] if page_data["key"] == "development" else ui["legacyRelease"])}</p>
      </div>
    """
    html = [f"""
      <section class="intro-box" aria-labelledby="{escape(page_data['key'])}-title">
        <div class="intro-copy">
          <h1 id="{escape(page_data['key'])}-title">{escape(title)}</h1>
          <p class="lead">{escape(lead)}</p>
          <div class="badge-row">
            <span class="badge dev">v2.0 {escape(ui["inDevelopment"])}</span>
            <span class="badge legacy">{escape(ui["legacyRelease"])}</span>
          </div>
        </div>
        {quick}
      </section>
    """]
    for section in page_data["sections"]:
        section_title = section["title"] if lang == "en" else local_topic(lang, section["title"])
        html.append(f'<section class="panel" id="{escape(section["id"])}">')
        html.append(f'<div class="panel-title"><img src="assets/images/icons/{escape(section.get("icon", page_data["icon"]))}" alt="">{escape(section_title)}</div>')
        html.append('<div class="panel-body">')
        if lang == "en":
            for para in section.get("p", []):
                html.append(f"<p>{para}</p>")
            bullets = section.get("bullets", [])
        else:
            html.append(f"<p>{escape(ui['sectionIntro'].format(section=section_title))}</p>")
            bullets = [ui["bullet"].format(topic=local_topic(lang, b)) for b in section.get("bullets", [])]
        if bullets:
            html.append('<ul class="check-list">')
            for bullet in bullets:
                html.append(f"<li>{bullet if lang == 'en' else escape(bullet)}</li>")
            html.append("</ul>")
        if lang == "en":
            html.append(render_links(section.get("links")))
        else:
            html.append(f"<p>{escape(ui['more'])}</p>")
        html.append("</div></section>")
    return "\n".join(html)


DOC_CATEGORIES = [
    ("Getting Started", "docs.svg", [
        ("getting-started.html", "Getting Started", "Setup, status, opening files, projects, interpreters, and running."),
        ("installation.html", "Installation", "Legacy installer, interpreter requirements, optional tools, and v2.0 status."),
        ("getting-started.html#new-file", "Create a new file", "Start with an untitled editor tab and save it as a .py file."),
        ("getting-started.html#opening-files", "Open files", "Open existing Python files and save changes."),
        ("getting-started.html#project-folder", "Project folder", "Use a folder as the active project."),
        ("getting-started.html#interpreter", "Interpreter", "Choose the Python executable used for runs."),
        ("getting-started.html#running", "Running", "Run scripts internally and inspect output."),
    ]),
    ("Editor", "editor.svg", [
        ("editor-guide.html", "Editor Guide", "Tabs, saving, line numbers, syntax, completion, and sessions."),
        ("editor-guide.html#tabs", "Tabs", "Work with multiple files and unsaved indicators."),
        ("editor-guide.html#line-numbers", "Line numbers", "Use the gutter to follow errors and locations."),
        ("editor-guide.html#find-replace", "Find and replace", "Search, replace, and move between matches."),
        ("editor-guide.html#autocomplete", "Autocomplete", "Use built-in and optional Jedi-enhanced completion."),
        ("editor-guide.html#syntax-checking", "Syntax checking", "Catch Python syntax problems."),
        ("editor-guide.html#autosave", "Autosave", "Understand autosave boundaries."),
        ("shortcuts.html", "Keyboard Shortcuts", "File, edit, run, and tool shortcuts."),
    ]),
    ("Projects", "project-files.svg", [
        ("project-manager-guide.html", "Project Manager", "Open and manage active project folders."),
        ("project-manager-guide.html#opening-projects", "Opening projects", "Open a folder as the active project."),
        ("project-manager-guide.html#creating-items", "Creating items", "Create files and folders."),
        ("project-manager-guide.html#rename-delete", "Rename and delete", "Change filesystem items carefully."),
        ("project-manager-guide.html#file-explorer", "File Explorer", "Open project locations in Windows."),
        ("project-manager-guide.html#search", "Project search", "Search active project text."),
        ("project-manager-guide.html#active-project", "Active project", "Understand the current project boundary."),
    ]),
    ("Running Code", "run.svg", [
        ("running-scripts.html", "Running Scripts", "Internal and external script execution."),
        ("running-scripts.html#internal", "Internal run", "Run with F5 inside pyIDE."),
        ("running-scripts.html#output", "Output", "Read stdout, stderr, and errors."),
        ("running-scripts.html#stdin", "stdin", "Handle scripts that request input."),
        ("running-scripts.html#stop", "Stop", "Stop scripts with Shift+F5 where supported."),
        ("running-scripts.html#external", "External console", "Run with Ctrl+F5."),
        ("running-scripts.html#terminals", "Terminals", "Use Command Prompt, PowerShell, PowerShell 7, Windows Terminal, or custom terminals."),
    ]),
    ("Tools", "settings.svg", [
        ("interpreter-manager.html", "Interpreter Manager", "Choose and manage Python interpreters."),
        ("compiler-guide.html", "Compiler Guide", "Use the PyInstaller helper window."),
        ("settings-guide.html", "Settings Guide", "Configure theme, autosave, recent files, consoles, interpreters, and sessions."),
        ("shortcuts.html", "Keyboard Shortcuts", "Reference commands by key."),
    ]),
    ("AI Desktop Assistant", "ai-assistant.svg", [
        ("ai-assistant-guide.html", "AI Assistant Guide", "Experimental assistant overview and roadmap."),
        ("ai-permissions.html", "AI Permissions", "Permission controls and active-project boundaries."),
        ("ai-permissions.html#allow-control", "Allow pyIDE Control", "User opt-in before tools run."),
        ("ai-permissions.html#active-project-boundary", "Active project boundary", "Scope tools to the project root."),
        ("ai-permissions.html#tool-table", "Tool table", "Working and planned tool capabilities."),
        ("ai-assistant-guide.html#models", "Models", "Local-model direction and current development testing."),
        ("ai-assistant-guide.html#roadmap", "Roadmap", "Edit previews, controlled edits, logs, batches, and Undo."),
    ]),
    ("Support", "warning.svg", [
        ("troubleshooting.html", "Troubleshooting", "Categorized support panels."),
        ("faq.html", "FAQ", "Frequently asked questions."),
        ("legacy-guide.html", "Legacy Guide", "Original Python and PySide6 version notes."),
        ("development.html", "Development", "C++ recode status."),
    ]),
]


def render_docs_index(lang="en"):
    ui = LANG_UI[lang]
    title = tr_title(lang, "Documentation Help Center")
    html = [f"""
      <section class="intro-box" aria-labelledby="docs-title">
        <div class="intro-copy">
          <h1 id="docs-title">{escape(title)}</h1>
          <p class="lead">{escape('Choose a guide by workflow. Product pages still exist, but the help center now points to dedicated documentation pages.' if lang == 'en' else ui['canonical'])}</p>
        </div>
        <div class="quick-status"><h2>{escape(ui['topics'])}</h2><p>{len(DOC_CATEGORIES)} categories / 14 documentation pages.</p></div>
      </section>
    """]
    for category, icon, items in DOC_CATEGORIES:
        heading = category if lang == "en" else local_topic(lang, category)
        html.append(f'<section class="panel" id="{escape(category.lower().replace(" ", "-"))}"><div class="panel-title"><img src="assets/images/icons/{icon}" alt="">{escape(heading)}</div><div class="panel-body"><div class="grid-2">')
        for href, item_title, desc in items:
            item = item_title if lang == "en" else local_topic(lang, item_title)
            summary = desc if lang == "en" else ui["bullet"].format(topic=local_topic(lang, desc))
            html.append(f'<a class="doc-card" href="{escape(href)}"><img src="assets/images/icons/{icon}" alt=""><span><strong>{escape(item)}</strong><br>{escape(summary)}</span></a>')
        html.append("</div></div></section>")
    return "\n".join(html)


def render_downloads(lang="en"):
    ui = LANG_UI[lang]
    lead = "The legacy Python and PySide6 release is available. pyIDE v2.0 is in development and has no public installer yet." if lang == "en" else ui["canonical"]
    return f"""
      <section class="intro-box" aria-labelledby="downloads-title">
        <div class="intro-copy">
          <h1 id="downloads-title">{escape(tr_title(lang, 'Downloads'))}</h1>
          <p class="lead">{escape(lead)}</p>
          <div class="badge-row"><span class="badge legacy">{escape(ui['legacyRelease'])}</span><span class="badge dev">v2.0 {escape(ui['inDevelopment'])}</span></div>
        </div>
        <div class="quick-status"><h2>{escape(ui['selectedInstaller'])}</h2><p class="compact" data-installer-note>{escape(ui['selectedInstaller'])}: pyIDE.v1.2.0.-.EN.exe</p></div>
      </section>
      <section class="download-box" id="v2-status">
        <h3>pyIDE v2.0 <span class="badge dev">{escape(ui['inDevelopment'])}</span></h3>
        <p>{escape(ui['notAvailable'])}</p>
        <div class="download-actions"><button class="classic-button disabled" type="button" disabled>v2.0 Download - Not Available Yet</button>{link_button('development.html', tr_title(lang, 'C++ Recode Development'))}{link_button('ai-assistant.html', tr_title(lang, 'AI Desktop Assistant'))}</div>
      </section>
      <section class="download-box" id="legacy-download">
        <h3>{escape(ui['legacyRelease'])} <span class="badge stable">v1.2.0</span></h3>
        <p>{escape('Use the language selector to choose the matching legacy installer filename where available.' if lang == 'en' else ui['sectionIntro'].format(section=ui['downloadLegacy']))}</p>
        <div class="download-actions"><a class="classic-button primary" data-legacy-download href="https://github.com/sonicFanTech/pyIDE/releases/download/v1.2.0/pyIDE.v1.2.0.-.EN.exe" target="_blank" rel="noreferrer"><img class="button-icon" src="assets/images/icons/downloads.svg" alt="">{escape(ui['downloadLegacy'])}</a><a class="classic-button" href="https://github.com/sonicFanTech/pyIDE/releases" target="_blank" rel="noreferrer">All GitHub Releases</a>{link_button('installation.html', tr_title(lang, 'Installation Guide'))}</div>
      </section>
      <section class="panel" id="source-code"><div class="panel-title"><img src="assets/images/icons/source.svg" alt="">{escape(ui['sourceCode'])}</div><div class="panel-body"><p><a class="url" href="https://github.com/sonicFanTech/pyIDE" target="_blank" rel="noreferrer">https://github.com/sonicFanTech/pyIDE</a></p></div></section>
      <section class="panel" id="requirements"><div class="panel-title"><img src="assets/images/icons/information.svg" alt="">System Requirements</div><div class="panel-body"><ul class="check-list"><li>Legacy release: Windows-focused Python/PySide6 desktop application.</li><li>Python interpreter required for running Python scripts.</li><li>PyInstaller required for EXE builds.</li><li>Future v2.0 final requirements are not yet announced.</li></ul></div></section>
    """


def render_screenshots(lang="en"):
    ui = LANG_UI[lang]
    captions = [
        ("main-window", "assets/screenshots/language/EN/1.png", "Legacy main window"),
        ("settings", "assets/screenshots/language/EN/9.png", "Settings window"),
        ("", "assets/screenshots/language/EN/2.png", "Tabbed editor"),
        ("", "assets/screenshots/language/EN/3.png", "Project workflow"),
        ("", "assets/screenshots/language/EN/3rd_Party_EC_Man.png", "External console manager"),
        ("", "assets/screenshots/language/EN/12.png", "Additional legacy screenshot"),
    ]
    html = [f"""
      <section class="intro-box" aria-labelledby="screenshots-title">
        <div class="intro-copy">
          <h1 id="screenshots-title">{escape(tr_title(lang, 'Screenshots'))}</h1>
          <p class="lead">{escape('Screenshots are from the legacy Python release. v2.0 screenshots will be added only when available.' if lang == 'en' else ui['canonical'])}</p>
        </div>
        <div class="quick-status"><h2>{escape(ui['fallbackNote'])}</h2><p data-shot-fallback-note hidden>{escape(ui['fallbackNote'])}</p></div>
      </section>
      <section class="panel" id="gallery"><div class="panel-title"><img src="assets/images/icons/screenshots.svg" alt="">{escape(ui['screenshots'])}</div><div class="panel-body"><div class="gallery">
    """]
    for key, src, caption in captions:
        data = f' data-shot-key="{key}"' if key else ""
        html.append(f'<a class="shot-card" href="{src}" data-lightbox data-caption="{escape(caption)}"><span class="thumb-frame"><img{data} src="{src}" alt="{escape(caption)}"></span><span class="shot-caption"><strong>{escape(caption if lang == "en" else local_topic(lang, caption))}</strong><span data-shot-fallback-note hidden>{escape(ui["fallbackNote"])}</span></span></a>')
    html.append("</div></div></section>")
    return "\n".join(html)


def render_shortcuts(lang="en"):
    groups = [
        ("File", [("Ctrl+N", "New file"), ("Ctrl+O", "Open file"), ("Ctrl+S", "Save"), ("Ctrl+Shift+S", "Save As")]),
        ("Editing", [("Ctrl+Z", "Undo"), ("Ctrl+Y", "Redo"), ("Ctrl+X", "Cut"), ("Ctrl+C", "Copy"), ("Ctrl+V", "Paste"), ("Ctrl+F", "Find"), ("Ctrl+H", "Replace"), ("Ctrl+Space", "Trigger autocomplete where supported")]),
        ("Running and Tools", [("F5", "Run script"), ("Ctrl+F5", "Run in external console"), ("Shift+F5", "Stop running script"), ("Ctrl+K", "Check syntax where supported")]),
    ]
    ui = LANG_UI[lang]
    html = [f"""
      <section class="intro-box" aria-labelledby="shortcuts-title">
        <div class="intro-copy"><h1 id="shortcuts-title">{escape(tr_title(lang, 'Keyboard Shortcuts'))}</h1><p class="lead">{escape('Some assignments may evolve during v2.0 development.' if lang == 'en' else ui['canonical'])}</p></div>
        <div class="quick-status"><h2>{escape(ui['topics'])}</h2><p>File / Editing / Running and Tools</p></div>
      </section>
    """]
    for heading, rows in groups:
        html.append(f'<section class="panel shortcut-group" id="{escape(heading.lower().replace(" ", "-"))}"><div class="panel-title"><img src="assets/images/icons/shortcuts.svg" alt="">{escape(heading if lang == "en" else local_topic(lang, heading))}</div><div class="panel-body">')
        for key, desc in rows:
            text = desc if lang == "en" else local_topic(lang, desc)
            html.append(f'<div class="shortcut-row"><span>{escape(text)}</span><kbd>{escape(key)}</kbd></div>')
        html.append("</div></section>")
    return "\n".join(html)


def render_ai_permissions(lang="en"):
    ui = LANG_UI[lang]
    flow = [
        "User Enables Allow pyIDE Control",
        "An Active Project Folder Is Open",
        "Assistant Requests a Specific Tool",
        "pyIDE Validates the Request",
        "The Tool Runs Within the Active Project Scope",
        "The Result Is Returned to the Assistant",
    ]
    rows = [
        ("List Project Files", "Lists files in the selected project", "Active project only", "Working Milestone"),
        ("Get Open Tabs", "Reads currently opened editor tabs", "Current pyIDE session", "Working Milestone"),
        ("Get Active Editor Text", "Reads the active editor contents", "Active editor only", "Working Milestone"),
        ("Get Selected Editor Text", "Reads highlighted code", "Current selection only", "Working Milestone"),
        ("Search Project Text", "Searches project files", "Active project only", "Working Milestone"),
        ("Reject Path Traversal", "Prevents leaving the project root", "Security boundary", "Working Milestone"),
        ("Undo AI Edit Batch", "Restores assistant-driven file changes", "Recoverable edit history", "In Development"),
    ]
    html = [f"""
      <section class="intro-box" aria-labelledby="ai-permissions-title">
        <div class="intro-copy">
          <h1 id="ai-permissions-title">{escape(tr_title(lang, 'AI Permission Controls - Keeping the User in Control'))}</h1>
          <p class="lead">{escape('The user must enable Allow pyIDE Control, and an active project folder must be open before assistant tools should run.' if lang == 'en' else ui['canonical'])}</p>
        </div>
        <div class="quick-status"><h2>{escape(ui['statusBox'])}</h2><p>{escape('No formal security audit completion is claimed.' if lang == 'en' else ui['notAvailable'])}</p></div>
      </section>
      <section class="panel" id="allow-control"><div class="panel-title"><img src="assets/images/icons/security.svg" alt="">Allow pyIDE Control</div><div class="panel-body"><p>{'The user must explicitly enable Allow pyIDE Control before the assistant can request pyIDE tools.' if lang == 'en' else escape(ui['sectionIntro'].format(section=local_topic(lang, 'permission control')))}</p></div></section>
      <section class="panel" id="active-project-boundary"><div class="panel-title"><img src="assets/images/icons/project-files.svg" alt="">Active Project Boundary</div><div class="panel-body"><ul class="check-list"><li>AI tools should not silently inspect arbitrary files.</li><li>Tool access is limited to the active project.</li><li>Path traversal such as <code>../</code> must be rejected.</li></ul></div></section>
      <section class="panel" id="flow"><div class="panel-title"><img src="assets/images/icons/roadmap.svg" alt="">{escape(ui['flowTitle'])}</div><div class="panel-body"><div class="flow">
    """]
    for item in flow:
        text = item if lang == "en" else local_topic(lang, item)
        html.append(f'<div class="flow-step">{escape(text)}</div>')
    html.append("</div></div></section>")
    html.append(f'<section class="panel" id="tool-table"><div class="panel-title"><img src="assets/images/icons/features.svg" alt="">{escape(ui["tableTitle"])}</div><div class="panel-body"><div class="table-wrap"><table class="data-table"><thead><tr><th>Capability</th><th>Purpose</th><th>Scope</th><th>Status</th></tr></thead><tbody>')
    for row in rows:
        html.append("<tr>" + "".join(f"<td>{escape(cell if lang == 'en' else local_topic(lang, cell))}</td>" for cell in row) + "</tr>")
    html.append("</tbody></table></div></div></section>")
    html.append('<section class="panel" id="future-edits"><div class="panel-title"><img src="assets/images/icons/warning.svg" alt="">Future file edits</div><div class="panel-body"><p>Future file edits should remain visible, auditable, and recoverable through previews, logs, recoverable batches, and Undo support.</p></div></section>')
    return "\n".join(html)


def render_faq(lang="en"):
    ui = LANG_UI[lang]
    faqs = [
        ("Is pyIDE v2.0 available to download?", "No. pyIDE v2.0 is still in development and no public download is available yet."),
        ("Which version can I download now?", "The legacy Python and PySide6 release is the downloadable version."),
        ("Does the AI assistant have unlimited computer access?", "No. It is designed around user permission, active-project scope, and pyIDE-controlled tools."),
        ("Can pyIDE build EXE files?", "The legacy version includes a helper around PyInstaller. PyInstaller must be installed in the selected Python environment."),
        ("Where can I follow development?", "Use the existing GitHub repository: <a href=\"https://github.com/sonicFanTech/pyIDE\" target=\"_blank\" rel=\"noreferrer\">github.com/sonicFanTech/pyIDE</a>."),
    ]
    html = [f'<section class="intro-box"><div class="intro-copy"><h1>{escape(tr_title(lang, "FAQ"))}</h1><p class="lead">{escape("Frequently asked questions about pyIDE status and support." if lang == "en" else ui["canonical"])}</p></div><div class="quick-status">{link_button("troubleshooting.html", tr_title(lang, "Troubleshooting"))}</div></section>']
    for question, answer in faqs:
        q = question if lang == "en" else local_topic(lang, question)
        a = answer if lang == "en" else escape(ui["sectionIntro"].format(section=local_topic(lang, answer)))
        html.append(f'<details class="faq-item"><summary>{escape(q)}</summary><div>{a}</div></details>')
    return "\n".join(html)


def render_home(lang="en"):
    ui = LANG_UI[lang]
    lead = "pyIDE is a lightweight Windows-focused IDE that began as a practical Python development tool. The future v2.0 release is a native C++ recode intended to preserve useful workflows while improving the desktop foundation." if lang == "en" else ui["canonical"]
    return f"""
      <section class="intro-box" aria-labelledby="home-title">
        <div class="intro-copy">
          <h1 id="home-title">{escape(tr_title(lang, 'pyIDE v2.0 is being rebuilt in C++'))}</h1>
          <p class="lead">{escape(lead)}</p>
          <p>{escape('The new version is not a public download yet. The older Python and PySide6 release remains documented as the legacy stable version while v2.0 is developed.' if lang == 'en' else ui['notAvailable'])}</p>
          <div class="badge-row"><span class="badge dev">v2.0 {escape(ui['inDevelopment'])}</span><span class="badge experimental">AI Assistant Experimental</span><span class="badge legacy">{escape(ui['legacyRelease'])}</span></div>
          <div class="intro-actions">{link_button('development.html', tr_title(lang, 'C++ Recode Development'), True)}{link_button('ai-assistant.html', tr_title(lang, 'AI Desktop Assistant'))}{link_button('legacy.html', tr_title(lang, 'Legacy Python Version'))}</div>
        </div>
        <div class="quick-status">
          <h2>Download Status</h2>
          <p><strong>pyIDE v2.0:</strong> {escape(ui['notAvailable'])}</p>
          <p class="compact" data-installer-note>{escape(ui['selectedInstaller'])}: pyIDE.v1.2.0.-.EN.exe</p>
          <a class="classic-button primary" data-legacy-download href="https://github.com/sonicFanTech/pyIDE/releases/download/v1.2.0/pyIDE.v1.2.0.-.EN.exe" target="_blank" rel="noreferrer">{escape(ui['downloadLegacy'])}</a>
        </div>
      </section>
      <div class="grid-2">
        <section class="panel"><div class="panel-title"><img src="assets/images/icons/news.svg" alt="">Latest Development News</div><div class="panel-body"><ul class="news-list"><li><span class="news-date">June 2026</span>Permission-controlled project tools are being tested for the C++ recode.</li><li><span class="news-date">June 2026</span>Tool orchestration and AI project context are being refined.</li><li><span class="news-date">In Development</span>Public v2.0 release date has not been announced.</li></ul></div></section>
        <section class="panel"><div class="panel-title"><img src="assets/images/icons/information.svg" alt="">What is pyIDE?</div><div class="panel-body"><p>{escape('pyIDE is an independently developed IDE from sonicFanTech, originally built for Python scripting on Windows.' if lang == 'en' else ui['sectionIntro'].format(section='pyIDE'))}</p>{link_button('docs.html', tr_title(lang, 'Documentation Help Center'))}</div></section>
      </div>
      <section class="panel"><div class="panel-title"><img src="assets/images/icons/screenshots.svg" alt="">{escape(ui['screenshots'])}</div><div class="panel-body"><a class="shot-card" href="screenshots.html"><span class="thumb-frame"><img data-shot-key="main-window" src="assets/screenshots/language/EN/1.png" alt="pyIDE legacy main window screenshot"></span><span class="shot-caption"><strong>Legacy Python Release Screenshot</strong><span data-shot-fallback-note hidden>{escape(ui['fallbackNote'])}</span></span></a></div></section>
    """


def render_body(page_data, lang="en"):
    kind = page_data["kind"]
    if kind == "home":
        return render_home(lang)
    if kind == "docs_index":
        return render_docs_index(lang)
    if kind == "downloads":
        return render_downloads(lang)
    if kind == "screenshots":
        return render_screenshots(lang)
    if kind == "shortcuts":
        return render_shortcuts(lang)
    if kind == "ai_permissions":
        return render_ai_permissions(lang)
    if kind == "faq":
        return render_faq(lang)
    return render_standard_body(page_data, lang)


def shared_translations(lang: str):
    ui = LANG_UI[lang]
    docs_sidebar = {}
    for _, key, _, label in DOC_LINKS:
        docs_sidebar[key] = label if lang == "en" else tr_title(lang, label)
    return {
        "skip": ui["skip"],
        "navToggle": ui["navigation"],
        "nav": {
            "home": ui["home"],
            "features": ui["features"],
            "aiAssistant": ui["aiAssistant"],
            "development": ui["development"],
            "screenshots": ui["screenshots"],
            "downloads": ui["downloads"],
            "docs": ui["docs"],
            "faq": ui["faq"],
            "legacy": ui["legacy"],
            "about": ui["about"],
        },
        "sidebar": {
            "help": ui["help"],
            "version": ui["version"],
            "links": ui["links"],
            "currentStable": ui["currentStable"],
            "nextMajor": ui["nextMajor"],
            "status": ui["status"],
            "inDevelopment": ui["inDevelopment"],
            "legacyRelease": ui["legacyRelease"],
            "sourceCode": ui["sourceCode"],
        },
        "docsSidebar": docs_sidebar,
        "footer": {
            "notice": ui["footer"],
            "home": ui["home"],
            "downloads": ui["downloads"],
            "docs": ui["docs"],
            "github": ui["github"],
            "legacy": ui["legacy"],
        },
        "buttons": {"downloadLegacy": ui["downloadLegacy"], "viewDocs": ui["viewDocs"]},
        "theme": {"label": ui["theme"], "classic": ui["classic"], "dark": ui["dark"]},
        "language": {"label": ui["language"], "auto": "Auto"},
        "status": {"selectedInstaller": ui["selectedInstaller"], "inDevelopment": ui["inDevelopment"], "notAvailable": ui["notAvailable"]},
        "screenshots": {"fallbackNote": ui["fallbackNote"]},
        "aria": {"primaryNav": ui["navigation"], "siteControls": "Site controls" if lang == "en" else ui["links"]},
    }


def translations_for(lang: str):
    pages = {}
    for p in PAGES:
        pages[p["key"]] = {
            "title": f"{tr_title(lang, p['title'])} | pyIDE",
            "meta": p["meta"] if lang == "en" else LANG_UI[lang]["canonical"],
            "utility": p["utility"] if lang == "en" else tr_title(lang, p["title"]),
            "badge": p["badge"] if lang == "en" else tr_title(lang, p["badge"]),
            "breadcrumb": f'<a href="index.html">{LANG_UI[lang]["home"]}</a> &gt; {tr_title(lang, p["title"])}',
            "body": render_body(p, lang),
            "footerDetail": LANG_UI[lang]["footer"],
        }
    return {"shared": shared_translations(lang), "pages": pages}


def nav_html():
    nav_items = [
        ("index.html", "home.svg", "home", "Home"),
        ("features.html", "features.svg", "features", "Features"),
        ("ai-assistant.html", "ai-assistant.svg", "aiAssistant", "AI Assistant"),
        ("development.html", "development.svg", "development", "C++ Recode"),
        ("screenshots.html", "screenshots.svg", "screenshots", "Screenshots"),
        ("downloads.html", "downloads.svg", "downloads", "Downloads"),
        ("docs.html", "docs.svg", "docs", "Documentation"),
        ("faq.html", "faq.svg", "faq", "FAQ"),
        ("legacy.html", "legacy.svg", "legacy", "Legacy Version"),
        ("about.html", "about.svg", "about", "About"),
    ]
    links = []
    for href, icon, key, label in nav_items:
        links.append(f'<a href="{href}"><img class="nav-icon" src="assets/images/icons/{icon}" alt=""><span data-i18n="shared.nav.{key}">{label}</span></a>')
    return "\n          ".join(links)


def language_options():
    opts = ['<option value="auto" data-i18n="shared.language.auto">Auto</option>']
    for code, info in LOCALES.items():
        opts.append(f'<option value="{code}">{escape(info["native"])}</option>')
    return "".join(opts)


def common_sidebar():
    return """
        <div class="side-panel">
          <div class="side-title"><img src="assets/images/icons/docs.svg" alt=""><span data-i18n="shared.sidebar.help">Help Topics</span></div>
          <div class="side-body">
            <ul class="side-links">
              <li><a href="docs.html"><img src="assets/images/icons/docs.svg" alt=""><span data-i18n="shared.docsSidebar.docs">Documentation Home</span></a></li>
              <li><a href="getting-started.html"><img src="assets/images/icons/docs.svg" alt=""><span data-i18n="shared.docsSidebar.gettingStarted">Getting Started</span></a></li>
              <li><a href="installation.html"><img src="assets/images/icons/downloads.svg" alt=""><span data-i18n="shared.docsSidebar.installation">Installation</span></a></li>
              <li><a href="troubleshooting.html"><img src="assets/images/icons/warning.svg" alt=""><span data-i18n="shared.docsSidebar.troubleshooting">Troubleshooting</span></a></li>
              <li><a href="faq.html"><img src="assets/images/icons/faq.svg" alt=""><span data-i18n="shared.docsSidebar.faq">FAQ</span></a></li>
            </ul>
          </div>
        </div>
        <div class="side-panel">
          <div class="side-title"><img src="assets/images/icons/information.svg" alt=""><span data-i18n="shared.sidebar.version">Version Status</span></div>
          <div class="side-body">
            <ul class="version-list">
              <li><strong data-i18n="shared.sidebar.currentStable">Current Stable Version:</strong><br><span data-i18n="shared.sidebar.legacyRelease">Legacy Python Release</span></li>
              <li><strong data-i18n="shared.sidebar.nextMajor">Next Major Version:</strong><br>pyIDE v2.0 C++ Recode</li>
              <li><strong data-i18n="shared.sidebar.status">v2.0 Status:</strong><br><span class="status-label dev" data-i18n="shared.sidebar.inDevelopment">In Development</span></li>
            </ul>
          </div>
        </div>
        <div class="side-panel">
          <div class="side-title"><img src="assets/images/icons/source.svg" alt=""><span data-i18n="shared.sidebar.links">Related Links</span></div>
          <div class="side-body">
            <ul class="side-links">
              <li><a href="downloads.html"><img src="assets/images/icons/downloads.svg" alt=""><span data-i18n="shared.nav.downloads">Downloads</span></a></li>
              <li><a href="development.html"><img src="assets/images/icons/development.svg" alt=""><span data-i18n="shared.nav.development">C++ Recode</span></a></li>
              <li><a href="https://github.com/sonicFanTech/pyIDE" target="_blank" rel="noreferrer"><img src="assets/images/icons/source.svg" alt=""><span data-i18n="shared.sidebar.sourceCode">Source Code</span></a></li>
            </ul>
          </div>
        </div>
    """


def doc_sidebar(current_key):
    items = []
    for href, key, icon, label in DOC_LINKS:
        active = ' class="active"' if key == current_key else ""
        current = ' aria-current="page"' if key == current_key else ""
        items.append(f'<li><a href="{href}"{active}{current}><img src="assets/images/icons/{icon}" alt=""><span data-i18n="shared.docsSidebar.{key}">{label}</span></a></li>')
    return f"""
        <div class="side-panel">
          <div class="side-title"><img src="assets/images/icons/docs.svg" alt=""><span data-i18n="shared.sidebar.help">Help Topics</span></div>
          <div class="side-body"><ul class="side-links doc-sidebar">{"".join(items)}</ul></div>
        </div>
        <div class="side-panel">
          <div class="side-title"><img src="assets/images/icons/information.svg" alt=""><span data-i18n="shared.sidebar.version">Version Status</span></div>
          <div class="side-body">
            <ul class="version-list">
              <li><strong data-i18n="shared.sidebar.currentStable">Current Stable Version:</strong><br><span data-i18n="shared.sidebar.legacyRelease">Legacy Python Release</span></li>
              <li><strong data-i18n="shared.sidebar.nextMajor">Next Major Version:</strong><br>pyIDE v2.0 C++ Recode</li>
              <li><strong data-i18n="shared.sidebar.status">v2.0 Status:</strong><br><span class="status-label dev" data-i18n="shared.sidebar.inDevelopment">In Development</span></li>
            </ul>
          </div>
        </div>
    """


def page_html(page_data):
    key = page_data["key"]
    sidebar = doc_sidebar(key) if page_data["doc"] else common_sidebar()
    status_led = " gray" if page_data["key"] in {"docs", "faq", "about"} else ""
    if page_data["key"] == "aiAssistant":
        status_led = " red"
    return dedent(f"""\
    <!doctype html>
    <html lang="en" dir="ltr">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <title data-i18n="pages.{key}.title">{escape(page_data["title"])} | pyIDE</title>
      <meta name="description" content="{escape(page_data["meta"], quote=True)}" data-i18n-meta-description="pages.{key}.meta">
      <link rel="icon" href="assets/images/branding/favicon.svg" type="image/svg+xml">
      <link rel="stylesheet" href="assets/css/site.css">
      <link rel="stylesheet" href="assets/css/retro-components.css">
      <link rel="stylesheet" href="assets/css/responsive.css">
      <script defer src="assets/js/translations.generated.js"></script>
      <script defer src="assets/js/site.js"></script>
    </head>
    <body data-page="{key}">
      <a class="skip-link" href="#content" data-i18n="shared.skip">Skip to content</a>
      <div class="site-shell">
        <div class="utility-bar">
          <span><span class="status-led{status_led}"></span><span data-i18n="pages.{key}.utility">{escape(page_data["utility"])}</span></span>
          <div class="utility-controls" data-i18n-aria-label="shared.aria.siteControls" aria-label="Site controls">
            <label><span data-i18n="shared.language.label">Language</span>
              <select id="languageSelect" aria-label="Language" data-i18n-aria-label="shared.language.label">{language_options()}</select>
            </label>
            <label><span data-i18n="shared.theme.label">Theme</span>
              <select id="themeSelect" aria-label="Theme" data-i18n-aria-label="shared.theme.label">
                <option value="light" data-i18n="shared.theme.classic">Classic</option>
                <option value="dark" data-i18n="shared.theme.dark">Dark</option>
              </select>
            </label>
          </div>
        </div>
        <header class="site-header">
          <div class="header-banner">
            <a class="brand" href="index.html" aria-label="pyIDE home"><img src="assets/images/branding/pyide-logo.svg" alt="pyIDE"></a>
            <span class="version-badge" data-i18n="pages.{key}.badge">{escape(page_data["badge"])}</span>
          </div>
          <nav class="main-nav" id="mainNav" data-i18n-aria-label="shared.aria.primaryNav" aria-label="Primary navigation">
            <button class="nav-toggle" id="navToggle" type="button" aria-expanded="false" data-i18n="shared.navToggle">Navigation</button>
            {nav_html()}
          </nav>
        </header>
        <div class="layout">
          <aside class="sidebar" aria-label="Sidebar">
    {sidebar}
          </aside>
          <main class="main-content" id="content">
            <div class="breadcrumb" data-i18n-html="pages.{key}.breadcrumb"><a href="index.html">Home</a> &gt; {escape(page_data["title"])}</div>
            <div data-i18n-html="pages.{key}.body">
    {render_body(page_data, "en")}
            </div>
          </main>
        </div>
        <footer class="footer">
          <div class="footer-grid">
            <div data-i18n-html="shared.footer.notice"><strong>pyIDE</strong> - sonicFanTech lightweight Windows IDE. Last updated <span id="year">2026</span>.</div>
            <div class="footer-links">
              <a href="index.html" data-i18n="shared.footer.home">Home</a>
              <a href="downloads.html" data-i18n="shared.footer.downloads">Downloads</a>
              <a href="docs.html" data-i18n="shared.footer.docs">Documentation</a>
              <a href="https://github.com/sonicFanTech/pyIDE" target="_blank" rel="noreferrer" data-i18n="shared.footer.github">GitHub</a>
              <a href="legacy.html" data-i18n="shared.footer.legacy">Legacy Version</a>
            </div>
          </div>
        </footer>
      </div>
      <div class="lightbox" id="lightbox" hidden>
        <button class="classic-button lightbox-close" id="lightboxClose" type="button">Close</button>
        <figure>
          <img id="lightboxImage" alt="">
          <figcaption id="lightboxCaption"></figcaption>
        </figure>
      </div>
    </body>
    </html>
    """)


SITE_JS = r'''(() => {
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
})();'''


BUILD_TRANSLATIONS = r'''from __future__ import annotations

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
LOCALES = ["en", "ar", "fr", "de", "he", "it", "ja", "ko", "pl", "pt", "ru", "es", "tr"]
I18N_DIR = ROOT / "assets" / "i18n"
OUT = ROOT / "assets" / "js" / "translations.generated.js"


def flatten(value, prefix=""):
    if isinstance(value, dict):
        result = {}
        for key in sorted(value):
            result.update(flatten(value[key], f"{prefix}.{key}" if prefix else key))
        return result
    return {prefix: value}


def fail(message):
    print(f"ERROR: {message}", file=sys.stderr)
    sys.exit(1)


def main():
    data = {}
    for locale in LOCALES:
        path = I18N_DIR / f"{locale}.json"
        if not path.exists():
            fail(f"missing locale file: {path}")
        try:
            data[locale] = json.loads(path.read_text(encoding="utf-8"))
        except json.JSONDecodeError as exc:
            fail(f"{path}: {exc}")

    en_flat = flatten(data["en"])
    for key, value in en_flat.items():
        if not isinstance(value, str):
            fail(f"English key is not a string: {key}")
        if value.strip() == "":
            fail(f"blank English key: {key}")

    for locale in LOCALES:
        flat = flatten(data[locale])
        missing = sorted(set(en_flat) - set(flat))
        extra = sorted(set(flat) - set(en_flat))
        if missing:
            fail(f"{locale} missing keys: {missing[:5]}")
        if extra:
            fail(f"{locale} extra keys: {extra[:5]}")
        for key, value in flat.items():
            if not isinstance(value, str):
                fail(f"{locale}.{key} is not a string")
            if value.strip() == "":
                fail(f"{locale}.{key} is blank")

    payload = json.dumps(data, ensure_ascii=False, sort_keys=True, separators=(",", ":"))
    OUT.write_text("window.PYIDE_TRANSLATIONS=" + payload + ";\n", encoding="utf-8")
    print(f"Built {OUT.relative_to(ROOT)} with {len(LOCALES)} locales and {len(en_flat)} keys per locale.")


if __name__ == "__main__":
    main()
'''


VALIDATE_SITE = r'''from __future__ import annotations

import json
import re
import sys
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlparse

ROOT = Path(__file__).resolve().parents[1]
EXPECTED_PAGES = [
    "index.html", "features.html", "ai-assistant.html", "development.html", "screenshots.html",
    "downloads.html", "docs.html", "getting-started.html", "installation.html", "editor-guide.html",
    "project-manager-guide.html", "running-scripts.html", "interpreter-manager.html", "compiler-guide.html",
    "settings-guide.html", "shortcuts.html", "ai-assistant-guide.html", "ai-permissions.html",
    "troubleshooting.html", "legacy-guide.html", "faq.html", "legacy.html", "about.html",
]
DOC_PAGES = {
    "docs.html", "getting-started.html", "installation.html", "editor-guide.html",
    "project-manager-guide.html", "running-scripts.html", "interpreter-manager.html", "compiler-guide.html",
    "settings-guide.html", "shortcuts.html", "ai-assistant-guide.html", "ai-permissions.html",
    "troubleshooting.html", "legacy-guide.html",
}
LOCALES = ["en", "ar", "fr", "de", "he", "it", "ja", "ko", "pl", "pt", "ru", "es", "tr"]
ACTIVE_CSS = ["assets/css/site.css", "assets/css/retro-components.css", "assets/css/responsive.css"]
ACTIVE_JS = ["assets/js/translations.generated.js", "assets/js/site.js"]
EXPECTED_ICONS = [
    "home.svg", "features.svg", "ai-assistant.svg", "development.svg", "screenshots.svg", "downloads.svg",
    "docs.svg", "faq.svg", "legacy.svg", "about.svg", "editor.svg", "project-files.svg", "run.svg",
    "terminal.svg", "debugging.svg", "compiler.svg", "settings.svg", "languages.svg", "security.svg",
    "roadmap.svg", "source.svg", "news.svg", "shortcuts.svg", "warning.svg", "information.svg",
    "experimental.svg",
]
BAD_TRANSLATION_MARKERS = ["TODO", "TRANSLATE ME", "MISSING KEY"]


class Parser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.tags = []
        self.ids = set()
        self.title = False
        self.in_title = False
        self.title_text = []

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        self.tags.append((tag, attrs))
        if "id" in attrs:
            self.ids.add(attrs["id"])
        if tag == "title":
            self.title = True
            self.in_title = True

    def handle_endtag(self, tag):
        if tag == "title":
            self.in_title = False

    def handle_data(self, data):
        if self.in_title:
            self.title_text.append(data)


def flatten(value, prefix=""):
    if isinstance(value, dict):
        result = {}
        for key in sorted(value):
            result.update(flatten(value[key], f"{prefix}.{key}" if prefix else key))
        return result
    return {prefix: value}


def local_path(src):
    parsed = urlparse(src)
    if parsed.scheme or src.startswith("mailto:") or src.startswith("tel:"):
        return None
    return unquote(parsed.path)


def main():
    errors = []
    parsers = {}

    for page in EXPECTED_PAGES:
        path = ROOT / page
        if not path.exists():
            errors.append(f"Missing page: {page}")
            continue
        parser = Parser()
        parser.feed(path.read_text(encoding="utf-8"))
        parsers[page] = parser
        hrefs = [attrs.get("href") for tag, attrs in parser.tags if tag in {"a", "link"} and attrs.get("href")]
        srcs = [attrs.get("src") for tag, attrs in parser.tags if tag in {"img", "script"} and attrs.get("src")]
        css = [href for href in hrefs if href.endswith(".css")]
        js = [src for src in srcs if src.endswith(".js")]
        for item in ACTIVE_CSS:
            if item not in css:
                errors.append(f"{page} missing active CSS {item}")
        for item in ACTIVE_JS:
            if item not in js:
                errors.append(f"{page} missing active JS {item}")
        if "assets/site.css" in css or "assets/site.js" in js:
            errors.append(f"{page} loads old assets/site.* file")
        if not any(attrs.get("id") == "languageSelect" for tag, attrs in parser.tags if tag == "select"):
            errors.append(f"{page} missing language selector")
        if not any(attrs.get("id") == "themeSelect" for tag, attrs in parser.tags if tag == "select"):
            errors.append(f"{page} missing theme selector")
        if not parser.title or not "".join(parser.title_text).strip():
            errors.append(f"{page} missing title")
        if page in DOC_PAGES:
            if not any((attrs.get("class") or "") == "breadcrumb" for tag, attrs in parser.tags if tag == "div"):
                errors.append(f"{page} missing breadcrumb")
            if not any(attrs.get("href", "").split("#")[0] == "docs.html" for tag, attrs in parser.tags if tag == "a"):
                errors.append(f"{page} documentation page does not link to docs.html")
        for ref in hrefs + srcs:
            lp = local_path(ref)
            if not lp or lp.startswith("#"):
                continue
            file_part, _, anchor = lp.partition("#")
            if file_part:
                target = (ROOT / file_part).resolve()
                if ROOT not in target.parents and target != ROOT:
                    errors.append(f"{page} reference leaves root: {ref}")
                elif not target.exists():
                    errors.append(f"{page} missing referenced file: {ref}")
                elif anchor and target.name in parsers and anchor not in parsers[target.name].ids:
                    errors.append(f"{page} broken anchor: {ref}")
            elif anchor and anchor not in parser.ids:
                errors.append(f"{page} broken same-page anchor: {ref}")

    # Second pass for anchors after all parsers are available.
    for page, parser in parsers.items():
        for tag, attrs in parser.tags:
            ref = attrs.get("href")
            if not ref:
                continue
            lp = local_path(ref)
            if not lp or "#" not in lp:
                continue
            file_part, _, anchor = lp.partition("#")
            target_page = file_part or page
            if target_page in parsers and anchor and anchor not in parsers[target_page].ids:
                errors.append(f"{page} broken anchor: {ref}")

    for css in ACTIVE_CSS:
        if not (ROOT / css).exists():
            errors.append(f"Missing CSS: {css}")
    for js in ACTIVE_JS:
        if not (ROOT / js).exists():
            errors.append(f"Missing JS: {js}")
    for icon in EXPECTED_ICONS:
        if not (ROOT / "assets" / "images" / "icons" / icon).exists():
            errors.append(f"Missing icon: {icon}")
    if not (ROOT / "assets/screenshots/language/EN/1.png").exists():
        errors.append("Missing English screenshot fallback EN/1.png")
    if not (ROOT / "assets/screenshots/language/EN/9.png").exists():
        errors.append("Missing English screenshot fallback EN/9.png")

    locale_data = {}
    for locale in LOCALES:
        path = ROOT / "assets" / "i18n" / f"{locale}.json"
        if not path.exists():
            errors.append(f"Missing locale JSON: {locale}")
            continue
        locale_data[locale] = json.loads(path.read_text(encoding="utf-8"))
    if "en" in locale_data:
        en_keys = set(flatten(locale_data["en"]))
        for locale, data in locale_data.items():
            flat = flatten(data)
            missing = en_keys - set(flat)
            if missing:
                errors.append(f"{locale} missing translation keys: {sorted(missing)[:5]}")
            for key, value in flat.items():
                if not isinstance(value, str) or value.strip() == "":
                    errors.append(f"{locale}.{key} blank or non-string")
                for marker in BAD_TRANSLATION_MARKERS:
                    if marker in value:
                        errors.append(f"{locale}.{key} contains {marker}")

    if errors:
        print("Validation failed:")
        for error in errors[:200]:
            print(f"- {error}")
        if len(errors) > 200:
            print(f"- ... {len(errors) - 200} more")
        sys.exit(1)
    print(f"Validated {len(EXPECTED_PAGES)} pages, {len(LOCALES)} locales, {len(EXPECTED_ICONS)} icons, and screenshot fallbacks.")


if __name__ == "__main__":
    main()
'''


def write_files():
    (ROOT / "assets" / "i18n").mkdir(parents=True, exist_ok=True)
    (ROOT / "assets" / "js").mkdir(parents=True, exist_ok=True)
    (ROOT / "tools").mkdir(parents=True, exist_ok=True)
    for p in PAGES:
        (ROOT / p["filename"]).write_text(page_html(p), encoding="utf-8")
    for lang in LOCALES:
        data = translations_for(lang)
        (ROOT / "assets" / "i18n" / f"{lang}.json").write_text(json.dumps(data, ensure_ascii=False, indent=2, sort_keys=True) + "\n", encoding="utf-8")
    (ROOT / "assets" / "js" / "site.js").write_text(SITE_JS, encoding="utf-8")
    (ROOT / "tools" / "build-translations.py").write_text(BUILD_TRANSLATIONS, encoding="utf-8")
    (ROOT / "tools" / "validate-site.py").write_text(VALIDATE_SITE, encoding="utf-8")

    archive = ROOT / "assets" / "legacy-unused"
    archive.mkdir(exist_ok=True)
    for name in ["site.css", "site.js"]:
        old = ROOT / "assets" / name
        if old.exists():
            target = archive / name
            if target.exists():
                target.unlink()
            shutil.move(str(old), str(target))
    (archive / "README.txt").write_text(
        "These files are legacy leftovers from the earlier pyIDE website layout. The redesigned static site loads assets/css/*.css and assets/js/site.js instead.\n",
        encoding="utf-8",
    )


if __name__ == "__main__":
    write_files()
    print(f"Generated {len(PAGES)} HTML pages and {len(LOCALES)} locale JSON files.")
