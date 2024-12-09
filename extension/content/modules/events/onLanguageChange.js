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
            const newContainer = createWordSpan(wordText, 'english', request.accentType, pronunciation);
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
            const newContainer = createWordSpan(word, 'english', request.accentType, pronunciation);
            container.replaceWith(newContainer);
        }
    });
}

// 处理语言切换
function handleLanguageUpdate(request) {
    console.debug('%c[Settings] 切换语言可见性:', 'color: #FF5722', request.language, request.enabled);
    
    // 更新全局设置
    globalSettings.enabledLanguages[request.language] = request.enabled;
    
    // 查找所有相应语言的容器
    const containers = document.querySelectorAll(`.pronunciation-tooltip[data-language="${request.language}"]`);
    console.debug('%c[Settings] 找到容器数量:', 'color: #FF5722', containers.length);
    
    containers.forEach(container => {
        if (request.enabled) {
            container.classList.remove('pronunciation-hidden');
            console.debug('%c[Settings] 显示容器:', 'color: #FF5722', container);
        } else {
            container.classList.add('pronunciation-hidden');
            console.debug('%c[Settings] 隐藏容器:', 'color: #FF5722', container);
        }
    });
}
