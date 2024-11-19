from scripts.gather.base_scraper import make_chunks


def test_make_chunks_basic():
    # Test basic functionality with a list of numbers
    data = iter([1, 2, 3, 4, 5])
    chunks = list(make_chunks(data, chunk_size=2))
    assert chunks == [[1, 2], [3, 4], [5]]


def test_make_chunks_with_item_func():
    # Test with a custom item_func that doubles the numbers
    data = iter([1, 2, 3, 4])
    chunks = list(make_chunks(data, chunk_size=2, item_func=lambda x: x * 2))
    assert chunks == [[2, 4], [6, 8]]


def test_make_chunks_empty_input():
    # Test with empty input
    data = iter([])
    chunks = list(make_chunks(data, chunk_size=2))
    assert chunks == []


def test_make_chunks_chunk_size_larger_than_data():
    # Test when chunk_size is larger than data length
    data = iter([1, 2, 3])
    chunks = list(make_chunks(data, chunk_size=5))
    assert chunks == [[1, 2, 3]]


def test_make_chunks_string_input():
    # Test with string input
    data = iter(["a", "b", "c", "d"])
    chunks = list(make_chunks(data, chunk_size=3))
    assert chunks == [["a", "b", "c"], ["d"]]
