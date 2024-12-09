import { processText, tryExpandWord } from '../../content/modules/textProcessor';

describe('Text Processor', () => {
  beforeEach(() => {
    // Mock global settings
    global.globalSettings = {
      enabledLanguages: {
        english: true,
        japanese: true,
        korean: true
      }
    };
  });

  test('should not process already processed elements', async () => {
    const element = document.createElement('div');
    element.classList.add('pronunciation-processed');
    element.textContent = 'test';

    await processText(element, global.globalSettings);
    expect(element.classList.contains('pronunciation-processed')).toBe(true);
    expect(element.innerHTML).toBe('test');
  });

  test('should expand English words correctly', async () => {
    const parentElement = document.createElement('div');
    parentElement.textContent = 'testing word expansion';
    const element = document.createElement('span');
    element.textContent = 'test';
    parentElement.appendChild(element);

    const expandedWord = await tryExpandWord('test', element, true);
    expect(expandedWord).toBe('testing');
  });
}); 