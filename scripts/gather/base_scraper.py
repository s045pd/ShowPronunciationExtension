import argparse
import asyncio
import json
import logging
from asyncio import Semaphore
from itertools import dropwhile
from pathlib import Path
from typing import Any, Callable, Dict, Generator, List, Optional

import aiohttp
from aiohttp import ClientTimeout
from tqdm import tqdm


def make_chunks(
    data: iter, chunk_size: int, item_func: Optional[Callable[[Any], Any]] = None
) -> Generator[list, Any, None]:
    """
    将数据分批
    """
    chunk = []
    if not item_func:

        def item_func(x):
            return x

    try:
        while True:
            for _ in range(chunk_size):
                chunk.append(item_func(next(data)))
            yield chunk
            chunk = []
    except StopIteration:
        if chunk:
            yield chunk


def item_clean(x):
    """
    默认的item清理函数
    """
    return x.strip()


class BasePronunciationScraper:
    def __init__(
        self,
        name: str,
        concurrent_limit: int = 5,
        chunk_size: int = 10,
        retry_attempts: int = 3,
        retry_delay: int = 5,
        output_file: Optional[str] = None,
    ):
        # 名称
        self.name = name

        # 数据目录
        self.data_dir = Path("../../data/processed")
        self.data_dir.mkdir(exist_ok=True)

        # 并发限制
        self.semaphore = Semaphore(concurrent_limit)
        self.timeout = ClientTimeout(total=30, connect=10, sock_read=10)

        # 重试和批处理
        self.retry_attempts = retry_attempts
        self.retry_delay = retry_delay
        self.chunk_size = chunk_size

        # 文件
        self.checkpoint_file = self.data_dir / f"{self.name}_checkpoint.json"
        self.output_file = self.data_dir / (
            output_file or f"{self.name}_pronunciation_data.json"
        )

        # 日志
        logging.basicConfig(
            filename=f"{self.name}_scraping.log",
            level=logging.INFO,
            format="%(asctime)s - %(levelname)s - %(message)s",
        )

    def load_checkpoint(self) -> Dict[str, Any]:
        """
        加载检查点
        """
        if not self.checkpoint_file.exists():
            return {"last_word": "", "processed_count": 0}

        with self.checkpoint_file.open("r") as f:
            return json.load(f)

    def save_checkpoint(self, word: str, count: int) -> None:
        """
        保存检查点
        """
        with self.checkpoint_file.open("w") as f:
            json.dump({"last_word": word, "processed_count": count}, f)

    async def get_pronunciation(
        self, session: aiohttp.ClientSession, word: str
    ) -> Optional[Dict[str, Any]]:
        """
        获取发音数据的抽象方法
        """
        raise NotImplementedError("子类必须实现 get_pronunciation 方法")

    async def process_word_batch(
        self, session: aiohttp.ClientSession, words: List[str]
    ) -> Dict[str, Dict[str, Any]]:
        """
        处理一批单词,适用于直接输入单词列表
        """
        results = await asyncio.gather(
            *[self.get_pronunciation(session, word) for word in words]
        )
        return {_["word"]: _ for _ in results if _ is not None}

    async def process_word_list(
        self, input_file: str = "filtered_words.txt"
    ) -> Dict[str, Dict[str, Any]]:
        """
        处理单词列表,适用于大量单词抓取
        """

        # 加载检查点和数据
        checkpoint = self.load_checkpoint()
        last_word = checkpoint["last_word"]
        pronunciations = (
            json.load(self.output_file.open("r")) if self.output_file.exists() else {}
        )

        # 读取并处理单词列表
        async with aiohttp.ClientSession() as session:
            with Path(input_file).open("r") as f:

                # 单次循环直接分批处理单词
                for batch in tqdm(
                    make_chunks(
                        data=dropwhile(
                            lambda x: (not last_word or x.strip() == last_word), f
                        ),
                        chunk_size=self.chunk_size,
                        item_func=item_clean,
                    ),
                    desc="Processing words",
                ):
                    # 处理单词批次
                    if batch_results := await self.process_word_batch(session, batch):
                        await self._save_data(
                            data=pronunciations,
                            last_word=batch[-1],
                            count=len(pronunciations),
                        )
                        pronunciations.update(batch_results)

                    await asyncio.sleep(0.1)

        return pronunciations

    async def complete_missing_data(self, data_file: Optional[str] = None) -> None:
        """
        补全缺失的发音数据
        """
        if not data_file:
            data_file = self.output_file

        with data_file.open("r") as f:
            data = json.load(f)

        missing_words = self.find_missing_words(data)
        if not missing_words:
            logging.info("未找到缺失数据")
            return

        logging.info(f"找到 {len(missing_words)} 个缺失数据")
        await self.process_specific_words(missing_words, data_file)

    def find_missing_words(self, data: Dict[str, Dict[str, Any]]) -> List[str]:
        """
        查找缺失数据的单词 - 由子类实现具体的检查逻辑
        """
        raise NotImplementedError("子类必须实现 find_missing_words 方法")

    async def process_specific_words(self, words: List[str], output_file: Path) -> None:
        """
        处理特定的单词列表
        """
        async with aiohttp.ClientSession() as session:
            for i in tqdm(
                range(0, len(words), self.chunk_size),
                desc="Processing missing words",
            ):
                batch = words[i : i + self.chunk_size]
                results = await self.process_word_batch(session, batch)

                if results:
                    # 更新现有数据
                    with output_file.open("r") as f:
                        data = json.load(f)
                    data.update(results)

                    with output_file.open("w") as f:
                        json.dump(data, f, indent=2)

                await asyncio.sleep(0.1)

    async def _save_data(
        self, data: Dict[str, Dict[str, Any]], last_word: str, count: int
    ) -> None:
        """
        保存数据和检查点
        """
        with self.output_file.open("w") as f:
            json.dump(data, f, ensure_ascii=False)
        self.save_checkpoint(last_word, count)

    async def generate_pronunciation_json(
        self, input_file: Optional[str] = None, accent: str = "us"
    ) -> None:
        """
        生成用于插件的发音JSON文件
        """
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
        """
        重试抓取空数据的单词
        """
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
        """
        检查数据是否为空 - 由子类实现具体的检查逻辑
        """
        raise NotImplementedError("子类必须实现 is_empty_data 方法")


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
