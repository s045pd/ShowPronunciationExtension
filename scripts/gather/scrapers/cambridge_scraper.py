import logging
import asyncio
from bs4 import BeautifulSoup
from typing import Dict, Any, List, Optional
from ..base_scraper import BasePronunciationScraper


class CambridgeScraper(BasePronunciationScraper):
    def __init__(self, concurrent_limit: int = 5):
        super().__init__("cambridge", concurrent_limit)
        self.base_url = (
            "https://dictionary.cambridge.org/dictionary/english-chinese-simplified/"
        )

    async def get_pronunciation(self, session, word: str) -> Optional[Dict[str, Any]]:
        url = f"{self.base_url}{word}"

        async with self.semaphore:
            for attempt in range(self.retry_attempts):
                try:
                    async with session.get(
                        url, headers=self.headers, timeout=self.timeout
                    ) as response:
                        if response.status != 200:
                            continue

                        html = await response.text()
                        soup = BeautifulSoup(html, "html.parser")

                        uk_pron = soup.find("span", class_="uk dpron-i")
                        us_pron = soup.find("span", class_="us dpron-i")

                        return {
                            "word": word,
                            "uk": (
                                uk_pron.find("span", class_="ipa").text
                                if uk_pron
                                else ""
                            ),
                            "us": (
                                us_pron.find("span", class_="ipa").text
                                if us_pron
                                else ""
                            ),
                        }

                except Exception as e:
                    if attempt == self.retry_attempts - 1:
                        logging.error(f"Error processing {word}: {str(e)}")
                    await asyncio.sleep(self.retry_delay)

            return None

    def find_missing_words(self, data: Dict[str, Dict[str, Any]]) -> List[str]:
        return [
            word
            for word, details in data.items()
            if not details.get("uk") or not details.get("us")
        ]

    def is_empty_data(self, details: Dict[str, Any]) -> bool:
        """检查数据是否为空"""
        return not details.get("uk", "").strip() or not details.get("us", "").strip()
