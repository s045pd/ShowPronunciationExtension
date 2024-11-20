function createWordSpan(word, pronunciation) {
    console.debug('%c[DOM] 创建单词span:', 'color: #607D8B', word, pronunciation);
    const span = document.createElement('span');
    span.className = 'word-container';
    
    if (pronunciation) {
        const tooltip = document.createElement('span');
        tooltip.className = 'pronunciation-tooltip';
        
        if (globalSettings.enablePhoneticColor) {
            // 直接逐字符匹配音标
            const phonemes = pronunciation.split('');
            phonemes.forEach(phoneme => {
                const phoneticSpan = document.createElement('span');
                phoneticSpan.textContent = phoneme;
                
                // 根据当前使用的口音选择对应的音标映射
                const currentVowel = globalSettings.accent.english.uk ? vowel : us_vowel;
                const currentConstant = globalSettings.accent.english.uk ? constant : us_constant;
                
                // 如果找到匹配的音标就设置颜色和提示，否则保持默认样式
                if (currentVowel[phoneme]) {
                    phoneticSpan.style.color = currentVowel[phoneme].color;
                    phoneticSpan.title = currentVowel[phoneme].description;
                } else if (currentConstant[phoneme]) {
                    phoneticSpan.style.color = currentConstant[phoneme].color;
                    // 如果有背景色，则设置背景色，使用更小的内边距
                    if (currentConstant[phoneme].backgroundColor) {
                        phoneticSpan.style.backgroundColor = currentConstant[phoneme].backgroundColor;
                        phoneticSpan.style.padding = '0 1px';  // 从 2px 减小到 1px
                        phoneticSpan.style.borderRadius = '1px';  // 从 2px 减小到 1px
                        phoneticSpan.style.margin = '0';  // 移除可能的外边距
                    }
                    phoneticSpan.title = currentConstant[phoneme].description;
                }
                
                tooltip.appendChild(phoneticSpan);
            });
        } else {
            tooltip.textContent = pronunciation;
        }
        
        span.appendChild(tooltip);
    } else {
        console.warn('%c[DOM] 无发音提示', 'color: #607D8B');
    }
    
    const textSpan = document.createElement('span');
    textSpan.className = 'word-text';
    textSpan.textContent = word;
    span.appendChild(textSpan);

    return span;
}

function IsTargetValid(target) {
    if (!target) {
        console.debug('%c[Validation] 目标为空', 'color: #3F51B5');
        return false;
    }
    const tagName = target.tagName;
    const text = target.textContent.trim();

    if (!text) {
        console.debug('%c[Validation] 目标文本为空', 'color: #3F51B5');
        return false;
    }
    if (['BODY', 'HTML'].includes(tagName)) {
        console.debug('%c[Validation] 目标为BODY或HTML', 'color: #3F51B5');
        return false;
    }
    if (tagName === 'DIV' && text.trim().length > 1000) {
        console.debug('%c[Validation] 目标为DIV且文本长度大于1000', 'color: #3F51B5');
        return false;
    }
    return true;
} 