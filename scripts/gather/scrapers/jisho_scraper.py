# 日语发音爬虫示例
import logging
import asyncio
from bs4 import BeautifulSoup
from typing import Dict, Any, List, Optional
from ..base_scraper import BasePronunciationScraper


class JishoScraper(BasePronunciationScraper):
    def __init__(self, concurrent_limit: int = 5):
        super().__init__("jisho", concurrent_limit)
        self.base_url = "https://jisho.org/word/"
        self.wiktionary_url = "https://en.wiktionary.org/wiki/"

    async def get_pronunciation(self, session, word: str) -> Optional[Dict[str, Any]]:
        url = f"{self.base_url}{word}"

        async with self.semaphore:
            for attempt in range(self.retry_attempts):
                try:
                    # 首先从Jisho获取假名
                    async with session.get(
                        url, headers=self.headers, timeout=self.timeout
                    ) as response:
                        if response.status != 200:
                            continue

                        html = await response.text()
                        soup = BeautifulSoup(html, "html.parser")

                        # 获取假名读音
                        kana = soup.find("span", class_="furigana")
                        if not kana:
                            return None

                        kana_text = kana.text.strip()

                        # 从Wiktionary获取IPA
                        ipa = await self._get_ipa_from_wiktionary(session, kana_text)

                        return {
                            "word": word,
                            "kana": kana_text,
                            "ipa": ipa or "",
                            "romaji": self._to_romaji(kana_text),
                        }

                except Exception as e:
                    if attempt == self.retry_attempts - 1:
                        logging.error(f"Error processing {word}: {str(e)}")
                    await asyncio.sleep(self.retry_delay)

            return None

    async def _get_ipa_from_wiktionary(self, session, kana: str) -> Optional[str]:
        """从Wiktionary获取IPA发音"""
        url = f"{self.wiktionary_url}{kana}#Japanese"

        try:
            async with session.get(
                url, headers=self.headers, timeout=self.timeout
            ) as response:
                if response.status != 200:
                    return None

                html = await response.text()
                soup = BeautifulSoup(html, "html.parser")

                # 查找日语发音部分
                jp_section = soup.find("span", {"id": "Japanese"})
                if not jp_section:
                    return None

                # 获取IPA
                ipa_span = jp_section.find_next("span", class_="IPA")
                if ipa_span:
                    return ipa_span.text.strip()

        except Exception as e:
            logging.error(f"Error getting IPA for {kana}: {str(e)}")
            return None

        return None

    def _to_romaji(self, kana: str) -> str:
        """将假名转换为罗马字"""
        # TODO: 实现假名到罗马字的转换
        # 可以使用pykakasi或其他库
        return kana

    def find_missing_words(self, data: Dict[str, Dict[str, Any]]) -> List[str]:
        return [
            word
            for word, details in data.items()
            if not details.get("kana")
            or not details.get("ipa")
            or not details.get("romaji")
        ]

    def is_empty_data(self, details: Dict[str, Any]) -> bool:
        """检查数据是否为空"""
        return (
            not details.get("kana", "").strip()
            or not details.get("ipa", "").strip()
            or not details.get("romaji", "").strip()
        )
