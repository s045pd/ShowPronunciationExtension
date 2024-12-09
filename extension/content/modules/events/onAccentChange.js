


function handleAccentUpdate(request) {
    console.debug('%c[Settings] 更新英语口音:', 'color: #FF5722', request.accentType);
    globalSettings.accent.english = request.accentType;
    // Find all elements with phonetic transcriptions and update them
    const phoneticElements = document.querySelectorAll('[data-accent]');
    phoneticElements.forEach(async (element) => {
        console.debug('%c[Settings] 更新口音:', 'color: #FF5722', element);
        const word = element.dataset.origin;
        if (word) {
            try {
                // Fetch new phonetic based on updated accent
                const newPhonetic = await pronunciationService.getPronunciation(word, 'english', request.accentType);
                if (newPhonetic) {
                    element.textContent = newPhonetic;
                }
            } catch (error) {
                console.error(`Failed to update phonetic for word: ${word}`, error);
            }
        }
    });
}