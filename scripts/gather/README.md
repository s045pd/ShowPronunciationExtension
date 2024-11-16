# Data Gathering Scripts

This folder contains scripts and utilities for gathering pronunciation data from various sources.

## Directory Structure 

## Data Processing Pipeline

### 1. Word List Generation
- Source data: `eng_news_2023_30K-words.txt` from Leipzig Corpora Collection
- URL: https://downloads.wortschatz-leipzig.de/corpora/eng_news_2023_30K.tar.gz
- Format: tab-separated file with frequency and word columns
- Output: `filtered_words.txt` containing valid English words

### 2. Pronunciation Data Collection (`english.py`)
- Scrapes Cambridge Dictionary for IPA pronunciations
- Handles both UK and US pronunciations
- Features:
  - Rate limiting to prevent IP blocks
  - Checkpoint system for resume capability
  - Error handling and logging
  - Progress tracking

### 3. Data Output
- Generates JSON files in `../data/` directory:
  - `pronunciation_data.json`: Main pronunciation database
  - `checkpoint.json`: Progress tracking for scraping
  - Backup files maintained during updates

