import { createWordSpan } from '../../content/modules/domHandler';

describe('DOM Handler', () => {
  beforeEach(() => {
    // Reset globalSettings before each test
    global.globalSettings = {
      enablePhoneticColor: true,
      accent: {
        english: {
          uk: false
        }
      }
    };
  });

  test('should create word span with pronunciation', () => {
    const word = 'test';
    const pronunciation = 'tɛst';
    const span = createWordSpan(word, pronunciation);

    expect(span.className).toBe('word-container');
    expect(span.querySelector('.pronunciation-tooltip')).toBeTruthy();
    expect(span.querySelector('.word-text').textContent).toBe(word);
  });

  test('should create word span without pronunciation', () => {
    const word = 'test';
    const span = createWordSpan(word, null);

    expect(span.className).toBe('word-container');
    expect(span.querySelector('.pronunciation-tooltip')).toBeFalsy();
    expect(span.querySelector('.word-text').textContent).toBe(word);
  });

  test('should apply phonetic colors when enabled', () => {
    const word = 'test';
    const pronunciation = 'tɛst';
    const span = createWordSpan(word, pronunciation);
    const phoneticSpans = span.querySelectorAll('.pronunciation-tooltip span');

    expect(phoneticSpans.length).toBeGreaterThan(0);
    expect(phoneticSpans[0].style.color).toBeTruthy();
  });
}); 