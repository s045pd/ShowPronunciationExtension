import { handleSelectedText } from '../../../content/modules/events/onSelect';

describe('Selection Handler', () => {
  beforeEach(() => {
    // Mock global settings
    global.globalSettings = {
      selection: {
        enabled: true
      }
    };

    // Mock window.getSelection
    window.getSelection = jest.fn();
  });

  test('should not process when selection is disabled', () => {
    global.globalSettings.selection.enabled = false;
    const event = new MouseEvent('mouseup');
    
    handleSelectedText(event);
    expect(window.getSelection).not.toHaveBeenCalled();
  });

  test('should process selected text', () => {
    const mockSelection = {
      toString: () => 'test text',
      getRangeAt: jest.fn().mockReturnValue({
        commonAncestorContainer: document.createElement('div'),
        extractContents: jest.fn(),
        insertNode: jest.fn()
      }),
      removeAllRanges: jest.fn()
    };

    window.getSelection.mockReturnValue(mockSelection);
    const event = new MouseEvent('mouseup');
    
    handleSelectedText(event);
    expect(mockSelection.getRangeAt).toHaveBeenCalled();
  });
}); 