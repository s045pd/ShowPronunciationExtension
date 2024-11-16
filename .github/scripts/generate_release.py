#!/usr/bin/env python3
import json
from pathlib import Path
from datetime import datetime


def generate_release_files():
    """生成发布文件"""
    data_dir = Path("data")
    release_dir = Path("release")
    release_dir.mkdir(exist_ok=True)

    # 合并所有发音数据
    pronunciations = {"english": {}, "japanese": {}, "korean": {}}

    # 处理英语发音
    for source in ["cambridge", "merriam_webster"]:
        file_path = data_dir / f"{source}_pronunciation_data.json"
        if file_path.exists():
            with open(file_path, "r", encoding="utf-8") as f:
                data = json.load(f)
                pronunciations["english"].update(data)

    # 处理日语发音
    jisho_file = data_dir / "jisho_pronunciation_data.json"
    if jisho_file.exists():
        with open(jisho_file, "r", encoding="utf-8") as f:
            pronunciations["japanese"] = json.load(f)

    # 处理韩语发音
    naver_file = data_dir / "naver_pronunciation_data.json"
    if naver_file.exists():
        with open(naver_file, "r", encoding="utf-8") as f:
            pronunciations["korean"] = json.load(f)

    # 保存发布文件
    for lang, data in pronunciations.items():
        output_file = release_dir / f"{lang}_pronunciations.json"
        with open(output_file, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2, ensure_ascii=False)

    # 生成更新日志
    changelog = f"""# Pronunciation Data Update ({datetime.now().strftime('%Y-%m-%d')})

## Statistics
- English words: {len(pronunciations['english'])}
- Japanese words: {len(pronunciations['japanese'])}
- Korean words: {len(pronunciations['korean'])}

## Changes
- Updated pronunciation database
- Added new words from user submissions
- Fixed missing pronunciations
"""

    with open(release_dir / "CHANGELOG.md", "w", encoding="utf-8") as f:
        f.write(changelog)


if __name__ == "__main__":
    generate_release_files()
