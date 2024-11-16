#!/usr/bin/env python3
import sys
import re
from pathlib import Path


def detect_language(word):
    """检测单词的语言"""
    if re.match(r'^[a-zA-Z]+$', word):
        return 'english'
    elif re.match(r'[\u4e00-\u9fff]', word):
        return 'chinese'
    elif re.match(r'[\u3040-\u309F\u30A0-\u30FF]', word):
        return 'japanese'
    elif re.match(r'[\uAC00-\uD7A3]', word):
        return 'korean'
    return 'unknown'


def extract_words(issue_body):
    """从issue内容中提取单词"""
    words = {}
    
    # 分行处理issue内容
    for line in issue_body.split('\n'):
        word = line.strip()
        if word:
            lang = detect_language(word)
            if lang != 'unknown':
                words.setdefault(lang, []).append(word)
    
    # 保存到临时文件
    output_dir = Path('temp')
    output_dir.mkdir(exist_ok=True)
    
    for lang, word_list in words.items():
        output_file = output_dir / f"{lang}_missing_words.txt"
        with open(output_file, "w", encoding="utf-8") as f:
            f.write("\n".join(word_list))


if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("Usage: extract_words.py <issue_body>")
        sys.exit(1)
    
    issue_body = sys.argv[1]
    extract_words(issue_body)
