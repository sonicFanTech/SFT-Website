from __future__ import annotations

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
