#!/usr/bin/env python3
import asyncio
from pathlib import Path
from scrapers import CambridgeScraper, MerriamWebsterScraper, JishoScraper, NaverScraper


async def process_language(language: str):
    """处理特定语言的缺失单词"""
    input_file = Path("temp") / f"{language}_missing_words.txt"
    if not input_file.exists():
        return

    scraper_map = {
        "english": [CambridgeScraper, MerriamWebsterScraper],
        "japanese": [JishoScraper],
        "korean": [NaverScraper],
    }

    scrapers = scraper_map.get(language, [])
    for scraper_class in scrapers:
        scraper = scraper_class()
        await scraper.process_word_list(str(input_file))


async def main():
    languages = ["english", "japanese", "korean"]
    for lang in languages:
        await process_language(lang)


if __name__ == "__main__":
    asyncio.run(main())
