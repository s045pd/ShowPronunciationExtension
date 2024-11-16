import asyncio
import argparse
from scrapers import CambridgeScraper, MerriamWebsterScraper
from base_scraper import create_argument_parser


async def main():
    parser = create_argument_parser()
    args = parser.parse_args()

    scraper_map = {
        "cambridge": CambridgeScraper,
        "merriam-webster": MerriamWebsterScraper,
    }

    scraper_class = scraper_map.get(args.source)
    if not scraper_class:
        raise ValueError(f"Unknown source: {args.source}")

    scraper = scraper_class(args.concurrent)

    if args.action == "scrape":
        await scraper.process_word_list(args.input)
    elif args.action == "complete":
        await scraper.complete_missing_data()
    elif args.action == "retry":
        await scraper.retry_missing_data()
    elif args.action == "generate":
        await scraper.generate_pronunciation_json(
            input_file=args.input, accent=args.accent
        )


if __name__ == "__main__":
    asyncio.run(main())
