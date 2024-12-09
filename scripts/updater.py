import json
from pathlib import Path
from typing import List
import re
from gather import gather_pronunciation

# Language detection patterns
LANGUAGE_PATTERNS = {
    "english": re.compile(r"^[a-zA-Z\s.,!?\'\"()-]+$"),
    "chinese": re.compile(r"[\u4e00-\u9fff]"),
    "hangul": re.compile(r"[\uAC00-\uD7A3]"),
    "japanese": re.compile(r"[\u3040-\u30FF]"),
}


def detect_language(text: str) -> str:
    """Detect the language of input text"""
    for lang, pattern in LANGUAGE_PATTERNS.items():
        if pattern.search(text):
            return lang
    return "unknown"


def update_pronunciation_data(inputs: List[str]) -> None:
    """Main entry point for the pronunciation data updater"""

    # Get extension data directory path
    extension_dir = Path(__file__).parent.parent / "extension"
    data_dir = extension_dir / "data"

    # Process each input string
    for text in inputs:
        # Detect language
        lang = detect_language(text)
        if lang == "unknown":
            continue

        # Handle different languages
        if lang == "english":
            # Load existing pronunciation data
            uk_data_path = data_dir / "en" / "uk.json"
            us_data_path = data_dir / "en" / "us.json"

            with open(uk_data_path, "r", encoding="utf-8") as f:
                uk_data = json.load(f)
            with open(us_data_path, "r", encoding="utf-8") as f:
                us_data = json.load(f)

            # Check if word exists
            word = text.lower().strip()
            if word not in uk_data or word not in us_data:
                # Gather new pronunciation data
                pron_data = gather_pronunciation(word, "english")
                if pron_data:
                    # Update UK data
                    uk_data[word] = {
                        "ipa": pron_data.get("uk_ipa", ""),
                        "audio": pron_data.get("uk_audio", ""),
                    }
                    # Update US data
                    us_data[word] = {
                        "ipa": pron_data.get("us_ipa", ""),
                        "audio": pron_data.get("us_audio", ""),
                    }

                    # Save updated data
                    with open(uk_data_path, "w", encoding="utf-8") as f:
                        json.dump(uk_data, f, ensure_ascii=False, indent=2)
                    with open(us_data_path, "w", encoding="utf-8") as f:
                        json.dump(us_data, f, ensure_ascii=False, indent=2)

        else:
            # Handle other languages (Japanese, Korean, Chinese)
            lang_map = {"japanese": "ja", "mandarin": "zh", "hangul": "ko"}

            data_path = data_dir / lang_map[lang] / "pronunciations.json"

            with open(data_path, "r", encoding="utf-8") as f:
                lang_data = json.load(f)

            if text not in lang_data:
                # Gather new pronunciation data
                pron_data = gather_pronunciation(text, lang)
                if pron_data:
                    lang_data[text] = {
                        "ipa": pron_data.get("ipa", ""),
                        "audio": pron_data.get("audio", ""),
                    }

                    # Save updated data
                    with open(data_path, "w", encoding="utf-8") as f:
                        json.dump(lang_data, f, ensure_ascii=False, indent=2)
