import logging
import asyncio
from bs4 import BeautifulSoup
from typing import Dict, Any, List, Optional
from ..base_scraper import BasePronunciationScraper


class MerriamWebsterScraper(BasePronunciationScraper):
    def __init__(self, concurrent_limit: int = 5):
        super().__init__("merriam_webster", concurrent_limit)
        self.base_url = "https://www.merriam-webster.com/dictionary/"

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

                        pron_div = soup.find("div", class_="prons-entries-list")
                        if not pron_div:
                            return None

                        ipa_element = pron_div.find("span", class_="pr")
                        if not ipa_element:
                            return None

                        ipa = ipa_element.text.strip()
                        ipa = ipa.replace("\\", "").replace("/", "")

                        return {"word": word, "us": ipa}

                except Exception as e:
                    if attempt == self.retry_attempts - 1:
                        logging.error(f"Error processing {word}: {str(e)}")
                    await asyncio.sleep(self.retry_delay)

            return None

    def find_missing_words(self, data: Dict[str, Dict[str, Any]]) -> List[str]:
        return [word for word, details in data.items() if not details.get("us")]

    def is_empty_data(self, details: Dict[str, Any]) -> bool:
        """检查数据是否为空"""
        return not details.get("us", "").strip()
