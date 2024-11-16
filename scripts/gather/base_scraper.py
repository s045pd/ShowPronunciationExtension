import argparse
import asyncio
import json
import logging
from asyncio import Semaphore
from pathlib import Path
from typing import Any, Dict, List, Optional

import aiohttp
from aiohttp import ClientTimeout
from tqdm import tqdm


class BasePronunciationScraper:
    def __init__(
        self,
        name: str,
        concurrent_limit: int = 5,
        chunk_size: int = 10,
        retry_attempts: int = 3,
        retry_delay: int = 5,
    ):
        self.name = name
        self.data_dir = Path("../../data/processed")
        self.data_dir.mkdir(exist_ok=True)
        self.semaphore = Semaphore(concurrent_limit)
        self.timeout = ClientTimeout(total=30, connect=10, sock_read=10)
        self.retry_attempts = retry_attempts
        self.retry_delay = retry_delay
        self.chunk_size = chunk_size

        # 设置日志
        logging.basicConfig(
            filename=f"{name}_scraping.log",
            level=logging.INFO,
            format="%(asctime)s - %(levelname)s - %(message)s",
        )

    def load_checkpoint(self) -> Dict[str, Any]:
        """加载检查点"""
        checkpoint_file = self.data_dir / f"{self.name}_checkpoint.json"
        if checkpoint_file.exists():
            with open(checkpoint_file, "r") as f:
                return json.load(f)
        return {"last_word": "", "processed_count": 0}

    def save_checkpoint(self, word: str, count: int) -> None:
        """保存检查点"""
        with open(self.data_dir / f"{self.name}_checkpoint.json", "w") as f:
            json.dump({"last_word": word, "processed_count": count}, f)

    async def get_pronunciation(
        self, session: aiohttp.ClientSession, word: str
    ) -> Optional[Dict[str, Any]]:
        """获取发音数据的抽象方法"""
        raise NotImplementedError("Subclasses must implement get_pronunciation method")

    async def process_word_batch(
        self, session: aiohttp.ClientSession, words: List[str]
    ) -> Dict[str, Dict[str, Any]]:
        """处理一批单词"""
        tasks = [self.get_pronunciation(session, word) for word in words]
        results = await asyncio.gather(*tasks)
        return {result["word"]: result for result in results if result is not None}

    async def process_word_list(
        self, input_file: str = "filtered_words.txt"
    ) -> Dict[str, Dict[str, Any]]:
        """处理单词列表"""
        checkpoint = self.load_checkpoint()
        last_word = checkpoint["last_word"]

        output_file = self.data_dir / f"{self.name}_pronunciation_data.json"
        pronunciations = (
            json.load(open(output_file, "r")) if output_file.exists() else {}
        )

        with open(input_file, "r") as f:
            words = [line.strip() for line in f]

        start_index = words.index(last_word) + 1 if last_word in words else 0

        remaining_words = [w for w in words[start_index:] if w not in pronunciations]

        async with aiohttp.ClientSession() as session:
            for i in tqdm(
                range(0, len(remaining_words), self.chunk_size),
                desc=f"Processing {self.name}",
            ):
                batch = remaining_words[i : i + self.chunk_size]
                batch_results = await self.process_word_batch(session, batch)
                pronunciations.update(batch_results)

                if batch_results:
                    await self._save_data(
                        pronunciations, batch[-1], len(pronunciations)
                    )

                await asyncio.sleep(0.5)

        return pronunciations

    async def complete_missing_data(self, data_file: Optional[str] = None) -> None:
        """补全缺失的发音数据"""
        if not data_file:
            data_file = f"{self.name}_pronunciation_data.json"

        data_path = self.data_dir / data_file
        if not data_path.exists():
            logging.error(f"Data file not found: {data_path}")
            return

        with open(data_path, "r") as f:
            data = json.load(f)

        missing_words = self.find_missing_words(data)
        if not missing_words:
            logging.info("No missing data found")
            return

        logging.info(f"Found {len(missing_words)} words with missing data")
        await self.process_specific_words(missing_words, data_path)

    def find_missing_words(self, data: Dict[str, Dict[str, Any]]) -> List[str]:
        """查找缺失数据的单词 - 由子类实现具体的检查逻辑"""
        raise NotImplementedError("Subclasses must implement find_missing_words method")

    async def process_specific_words(self, words: List[str], output_file: Path) -> None:
        """处理特定的单词列表"""
        async with aiohttp.ClientSession() as session:
            for i in tqdm(
                range(0, len(words), self.chunk_size),
                desc="Processing missing words",
            ):
                batch = words[i : i + self.chunk_size]
                results = await self.process_word_batch(session, batch)

                if results:
                    # 更新现有数据
                    with open(output_file, "r") as f:
                        data = json.load(f)
                    data.update(results)
                    with open(output_file, "w") as f:
                        json.dump(data, f, indent=2)

                await asyncio.sleep(0.5)

    async def _save_data(
        self, data: Dict[str, Dict[str, Any]], last_word: str, count: int
    ) -> None:
        """保存数据和检查点"""
        with open(self.data_dir / f"{self.name}_pronunciation_data.json", "w") as f:
            json.dump(data, f, indent=2)

        self.save_checkpoint(last_word, count)

        if count % 100 == 0:
            backup_file = (
                self.data_dir / f"{self.name}_pronunciation_data_backup_{count}.json"
            )
            with open(backup_file, "w") as f:
                json.dump(data, f, indent=2)

    async def generate_pronunciation_json(
        self, input_file: Optional[str] = None, accent: str = "us"
    ) -> None:
        """生成用于插件的发音JSON文件"""
        if not input_file:
            input_file = f"{self.name}_pronunciation_data.json"

        data_path = self.data_dir / input_file
        if not data_path.exists():
            logging.error(f"Source data file not found: {data_path}")
            return

        # 读取原始数据
        with open(data_path, "r") as f:
            raw_data = json.load(f)

        # 生成简化的发音数据
        pronunciation_data = {}
        for word, details in raw_data.items():
            if details.get(accent):
                pronunciation_data[word] = details[accent]

        # 保存生成的文件
        output_file = self.data_dir / f"{self.name}_{accent}_pronunciations.json"
        with open(output_file, "w") as f:
            json.dump(pronunciation_data, f, indent=2)

        logging.info(
            f"Generated {accent} pronunciation file: {output_file} "
            f"with {len(pronunciation_data)} entries"
        )

    async def retry_missing_data(self, data_file: Optional[str] = None) -> None:
        """重试抓取空数据的单词"""
        if not data_file:
            data_file = f"{self.name}_pronunciation_data.json"

        data_path = self.data_dir / data_file
        if not data_path.exists():
            logging.error(f"Data file not found: {data_path}")
            return

        # 读取现有数据
        with open(data_path, "r") as f:
            data = json.load(f)

        # 找出空数据的单词
        empty_words = []
        for word, details in data.items():
            if self.is_empty_data(details):
                empty_words.append(word)

        if not empty_words:
            logging.info("No empty data found")
            return

        logging.info(f"Found {len(empty_words)} words with empty data")

        # 重试抓取
        async with aiohttp.ClientSession() as session:
            for i in tqdm(
                range(0, len(empty_words), self.chunk_size),
                desc="Retrying empty data",
            ):
                batch = empty_words[i : i + self.chunk_size]
                results = await self.process_word_batch(session, batch)

                if results:
                    # 更新数据
                    data.update(results)
                    # 保存更新后的数据
                    with open(data_path, "w") as f:
                        json.dump(data, f, indent=2)

                await asyncio.sleep(0.5)

    def is_empty_data(self, details: Dict[str, Any]) -> bool:
        """检查数据是否为空 - 由子类实现具体的检查逻辑"""
        raise NotImplementedError("Subclasses must implement is_empty_data method")


def create_argument_parser():
    parser = argparse.ArgumentParser(description="Pronunciation data scraper")
    parser.add_argument(
        "action",
        choices=["scrape", "complete", "generate"],
        help="Action to perform",
    )
    parser.add_argument(
        "--source",
        choices=["cambridge", "merriam-webster"],
        required=True,
        help="Dictionary source",
    )
    parser.add_argument(
        "--input",
        default="filtered_words.txt",
        help="Input word list file",
    )
    parser.add_argument(
        "--concurrent",
        type=int,
        default=5,
        help="Number of concurrent requests",
    )
    return parser
