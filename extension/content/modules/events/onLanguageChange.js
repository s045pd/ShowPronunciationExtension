// 处理口音切换
async function handleAccentChange(request) {
    console.debug('%c[Settings] 更新英语口音:', 'color: #FF5722', request.accentType);
    
    // 更新全局设置
    globalSettings.accent.english = request.accentType;
    
    // 查找所有英语发音容器
    const englishContainers = document.querySelectorAll('.pronunciation-container[data-language="english"]');
    englishContainers.forEach(async container => {
        const wordText = container.querySelector('.word-text').textContent;
        const pronunciation = await pronunciationService.getPronunciation(
            wordText.toLowerCase(),
            'english',
            request.accentType
        );
        
        if (pronunciation) {
            const newContainer = createWordSpan(wordText, pronunciation);
            // 保持语言标记
            newContainer.setAttribute('data-language', 'english');
            container.replaceWith(newContainer);
        }
    });
}

// 处理音标颜色更新
function handlePhoneticColorUpdate(request) {
    // 更新全局设置
    globalSettings.enablePhoneticColor = request.enablePhoneticColor;
    
    // 查找所有已处理的音标
    const tooltips = document.querySelectorAll('.pronunciation-tooltip');
    tooltips.forEach(tooltip => {
        const container = tooltip.closest('.word-container');
        if (container) {
            const word = container.querySelector('.word-text').textContent;
            const pronunciation = tooltip.textContent;
            
            // 重新创建带有新设置的音标显示
            const newContainer = createWordSpan(word, pronunciation);
            container.replaceWith(newContainer);
        }
    });
}

