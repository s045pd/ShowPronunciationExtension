# Multi-language Pronunciation Helper

A Chrome extension that provides pronunciation guides for multiple languages including English, Chinese, Japanese, and Korean.

## Features

- **Multi-language Support**
  - English (with IPA phonetic notation)
  - Chinese (中文)
  - Japanese (日本語)
  - Korean (한국어)

- **Smart Language Detection**
  - Automatically detects the language of selected text
  - Prevents double-processing of already processed text
  - Handles mixed language content

- **User Interface**
  - Clean popup interface for language selection
  - Toggle different language support on/off
  - Settings persist across browser sessions

- **Text Processing**
  - Process entire pages or selected text
  - Hover-based pronunciation display
  - Non-intrusive visual design

## Installation

1. Clone this repository or download the ZIP file
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked" and select the extension directory

## Usage

1. Click the extension icon in your Chrome toolbar
2. Select which languages you want to enable
3. Click "添加发音提示" to process the current page
4. Alternatively, select any text to see its pronunciation

## Project Structure

### Key Components

- **manifest.json**: Chrome extension configuration and permissions
- **popup.html/js**: User interface for language selection and settings
- **content.js**: Core functionality for text processing and pronunciation display
- **styles.css**: Styling for pronunciation tooltips and highlights
- **pronunciations/**: 
  - **gather.ipynb**: Data processing pipeline for creating pronunciation dictionaries
  - **index.js**: Manages versioning and data file locations
  - Language-specific directories contain pronunciation data in JSON format

### Data Sources

#### English Pronunciation Data
- Source: [Leipzig Corpora Collection](https://wortschatz.uni-leipzig.de/en/download/English)
- Dataset: English News Corpus (2012)
- Format: Word frequency lists with IPA transcriptions
- Processing: Cleaned and normalized using gather.ipynb

#### Chinese Data
- Pinyin data derived from CC-CEDICT
- Includes tone marks and simplified/traditional character mappings

#### Japanese Data
- Kana readings based on official 常用漢字表 (Jōyō kanji) list
- Romaji conversions follow Modified Hepburn system

#### Korean Data
- Hangul pronunciation rules from National Institute of Korean Language
- Romanization follows Revised Romanization of Korean system

### Data Processing

The gather.ipynb notebook handles:
1. Data download and extraction
2. Cleaning and normalization
3. IPA conversion for English words
4. JSON file generation for extension use
5. Validation and testing of pronunciation data

### File Size Considerations
- English pronunciation data is split into frequency-based chunks
- Only most common words (top 20,000) are included by default
- Additional word packs can be downloaded on demand

</file>
