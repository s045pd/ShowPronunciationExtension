# 在根目录运行 python .github/scripts/fetcher/cn.py
import json
import requests
from pathlib import Path
from itertools import dropwhile


def build_tree(chars, pinyin):
    """Build a nested dictionary tree from characters and pinyin."""
    current = {}
    node = current

    # Build the tree structure for characters
    for i, char in enumerate(chars[:-1]):
        if char not in node:
            node[char] = {}
        node = node[char]

    # Add the last character with pinyin
    last_char = chars[-1]
    if last_char not in node:
        node[last_char] = {}

    # Add pinyin list to the leaf node using "_" key
    node[last_char]["_"] = pinyin

    return current


def merge_trees(tree1, tree2):
    """Recursively merge two trees."""
    for key, value in tree2.items():
        if key not in tree1:
            tree1[key] = value
        elif isinstance(value, dict) and isinstance(tree1[key], dict):
            merge_trees(tree1[key], value)
    return tree1


def fetch_pinyin_data():
    # Create raw/raw/cn directory if it doesn't exist
    raw_dir = Path("raw/raw/cn")
    raw_dir.mkdir(parents=True, exist_ok=True)

    # Download the raw pinyin data for phrases
    phrase_url = "https://raw.githubusercontent.com/mozillazg/phrase-pinyin-data/master/large_pinyin.txt"
    phrase_response = requests.get(phrase_url)
    phrase_response.raise_for_status()

    # Download the raw pinyin data for single characters
    char_url = "https://raw.githubusercontent.com/mozillazg/pinyin-data/27dc54a206326e0d8d91428010325f50f614508d/pinyin.txt"
    char_response = requests.get(char_url)
    char_response.raise_for_status()

    # Process the phrase data into a tree structure
    pinyin_tree = {}
    for index, line in dropwhile(
        lambda x: x[0] in [0, 1], enumerate(phrase_response.text.splitlines())
    ):
        if not line.strip():
            continue

        parts = line.split(": ")
        if len(parts) != 2:
            continue

        chars, pinyin = parts
        chars = chars.strip()
        pinyin = pinyin.strip()

        # Build tree for current word and merge with existing tree
        current_tree = build_tree(chars, pinyin)
        pinyin_tree = merge_trees(pinyin_tree, current_tree)

    # Process the single character data
    for line in char_response.text.splitlines():
        if line.startswith("#") or not line.strip():
            continue

        # Parse the line (format: U+XXXX: pīnyīn  # 字)
        parts = line.split("#")[0].strip().split(":")
        if len(parts) != 2:
            continue

        unicode_point, pinyin = parts
        unicode_point = unicode_point.strip()
        pinyin = pinyin.strip()

        # Convert unicode point to character
        try:
            char = chr(int(unicode_point.replace("U+", ""), 16))
            # Create a tree for single character with its pinyin
            current_tree = {char: {"_": pinyin.split(",")}}
            pinyin_tree = merge_trees(pinyin_tree, current_tree)
        except ValueError:
            continue

    # Create extension data directory if it doesn't exist
    data_dir = Path("extension/data/cn")
    data_dir.mkdir(parents=True, exist_ok=True)

    # Save as JSON
    output_file = data_dir / "data.json"
    with output_file.open("w", encoding="utf-8") as f:
        json.dump(pinyin_tree, f, ensure_ascii=False)


if __name__ == "__main__":
    fetch_pinyin_data()
