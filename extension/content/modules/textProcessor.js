// 尝试扩展单词范围获取完整单词
async function tryExpandWord(word, element, isFirst) {
    console.debug('%c[Word Processing] 尝试扩展单词:', 'color: #FF9800', word, isFirst ? '向前' : '向后');
    const parentText = element.parentElement?.textContent || '';
    if (!parentText) {
        console.warn('%c[Word Processing] 未找到父元素文本', 'color: #FF9800');
        return word;
    }

    const wordIndex = isFirst ? 
        parentText.indexOf(word) :
        parentText.lastIndexOf(word);
    
    if (wordIndex === -1) {
        console.warn('%c[Word Processing] 在父元素文本中未找到单词', 'color: #FF9800');
        return word;
    }

    let extendedWord = word;
    
    if (isFirst) {
        let startIndex = wordIndex;
        while (startIndex > 0 && /[a-zA-Z]/.test(parentText[startIndex - 1])) {
            startIndex--;
        }
        extendedWord = parentText.slice(startIndex, wordIndex + word.length);
    } else {
        let endIndex = wordIndex + word.length;
        while (endIndex < parentText.length && /[a-zA-Z]/.test(parentText[endIndex])) {
            endIndex++;
        }
        extendedWord = parentText.slice(wordIndex, endIndex);
    }
    
    console.debug('%c[Word Processing] 扩展后的单词:', 'color: #FF9800', extendedWord);
    return extendedWord;
}



// 扩展英文选择范围
async function expandEnglishSelection(range, selectedText) {
    console.debug('%c[Selection] 处理英文选中文本', 'color: #009688');
    const words = selectedText.split(/[\s\p{P}]+/u).filter(word => word.length > 0);
    
    if (words.length > 0) {
        const firstWord = words[0];
        const lastWord = words[words.length - 1];
        
        // 扩展首尾单词
        const expandedFirstWord = await tryExpandWord(firstWord, range.startContainer, true);
        const expandedLastWord = await tryExpandWord(lastWord, range.endContainer, false);


        // 更新range的起始和结束位置
        if (expandedFirstWord !== firstWord) {
            console.debug('%c[Selection] 更新首单词:', 'color: #009688', expandedFirstWord);
            const startOffset = range.startContainer.textContent.indexOf(expandedFirstWord);
            range.setStart(range.startContainer, startOffset);
        }
        
        if (expandedLastWord !== lastWord) {
            console.debug('%c[Selection] 更新尾单词:', 'color: #009688', expandedLastWord);
            const endOffset = range.endContainer.textContent.indexOf(expandedLastWord) + expandedLastWord.length;
            range.setEnd(range.endContainer, endOffset);
        }
    }
}



// 处理文本的主函数
async function processText(element,language) {
    console.debug('%c[Text Processing] 处理文本元素:', 'color: #9C27B0', element);
  
    if (!globalSettings.enabledLanguages[language]) {
        console.warn('%c[Text Processing] 语言未启用:', 'color: #9C27B0', language);
        return;
    }

    // 根据不同语言调用相应的处理函数
    console.debug('%c[Text Processing] 开始处理语言:', 'color: #9C27B0', language);
    await processLanguageText(element, text, language);
}

// 统一处理不同语言的文本
async function processLanguageText(element, text, language) {
    const logColors = {
        english: '#673AB7',
        japanese: '#E91E63', 
        korean: '#795548'
    };
    
    console.debug(`%c[${language} Processing] 处理${language}文本:`, `color: ${logColors[language]}`, text);
    
    const container = document.createElement('span');
    container.className = 'pronunciation-container';
    container.dataset.language = language;

    // 根据语言选择分词方式
    let words;
    if (language === 'english') {
        words = text.split(/\s+/);
    } else if (language === 'japanese') {
        // 使用日语分词规则
        words = text.split(/(?<=[\u3001\u3002])|(?<=[\u4e00-\u9fff])|(?<=[\u3040-\u309f])|(?<=[\u30a0-\u30ff])/);
    } else if (language === 'korean') {
        // 使用韩语分词规则
        words = text.split(/(?<=[\uac00-\ud7af])|(?<=[\u1100-\u11ff])|(?<=[\u3130-\u318f])/);
    }

    // 过滤空字符串
    words = words.filter(word => word.trim());

    // 获取发音设置
    const accentType = language === 'english' ? 
        (globalSettings.accent.english.uk ? 'uk' : 'us') : 
        'standard';

    // 处理每个单词
    for (const word of words) {
        const pronunciation = await pronunciationService.getPronunciation(
            language === 'english' ? word.toLowerCase() : word,
            language,
            accentType
        );
        
        if (!pronunciation) {
            console.warn(`%c[${language} Processing] 未找到发音:`, `color: ${logColors[language]}`, word);
        }
        
        const wordSpan = createWordSpan(word, language, accentType, pronunciation);
        container.appendChild(wordSpan);
        
        // 英语单词间添加空格
        if (language === 'english') {
            container.appendChild(document.createTextNode(' '));
        }
    }

    // element.replaceWith(container);
    // element.innerHTML = '';
    // element.appendChild(container);
    element.innerHTML = container.innerHTML;
    console.debug(`%c[${language} Processing] ${language}文本处理完成`, `color: ${logColors[language]}`);
}

