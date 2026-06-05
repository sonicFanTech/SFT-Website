from __future__ import annotations

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
