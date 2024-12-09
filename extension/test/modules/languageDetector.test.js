import { detectLanguage } from '../../content/modules/languageDetector';

describe('Language Detector', () => {
  test('should detect English text', () => {
    expect(detectLanguage('Hello')).toBe('english');
    expect(detectLanguage('World')).toBe('english');
  });

  test('should detect Japanese text', () => {
    expect(detectLanguage('こんにちは')).toBe('japanese');
    expect(detectLanguage('ひらがな')).toBe('japanese');
  });

  test('should detect Korean text', () => {
    expect(detectLanguage('안녕하세요')).toBe('korean');
    expect(detectLanguage('한글')).toBe('korean');
  });

  test('should return unknown for unsupported text', () => {
    expect(detectLanguage('123')).toBe('unknown');
    expect(detectLanguage('!@#')).toBe('unknown');
  });
}); 