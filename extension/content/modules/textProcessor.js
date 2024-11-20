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

// 处理文本的主函数
async function processText(element, settings) {
    console.debug('%c[Text Processing] 处理文本元素:', 'color: #9C27B0', element);
    // 检查元素是否已处理过或是否是发音提示元素
    if (element.classList.contains('pronunciation-processed')) {
        console.debug('%c[Text Processing] 元素已处理过，跳过', 'color: #9C27B0');
        return;
    }
    if (element.classList.contains('pronunciation-tooltip')) {
        console.debug('%c[Text Processing] 元素是发音提示，跳过', 'color: #9C27B0');
        return;
    }
    if (element.classList.contains('word-text')) {
        console.debug('%c[Text Processing] 元素是单词文本，跳过', 'color: #9C27B0');
        return;
    }

    const text = element.textContent.trim();
    if (!text) {
        console.debug('%c[Text Processing] 文本为空，跳过', 'color: #9C27B0');
        return;
    }

    // 检测文本语言并验证是否启用该语言
    const language = detectLanguage(text);
    if (!language) {
        console.warn('%c[Text Processing] 未检测到语言，跳过', 'color: #9C27B0');
        return;
    }
    if (!settings.enabledLanguages[language]) {
        console.warn('%c[Text Processing] 语言未启用:', 'color: #9C27B0', language);
        return;
    }

    // 根据不同语言调用相应的处理函数
    console.debug('%c[Text Processing] 开始处理语言:', 'color: #9C27B0', language);
    await processLanguageText(element, text, settings, language);
}

// 统一处理不同语言的文本
async function processLanguageText(element, text, settings, language) {
    const logColors = {
        english: '#673AB7',
        japanese: '#E91E63', 
        korean: '#795548'
    };
    
    console.debug(`%c[${language} Processing] 处理${language}文本:`, `color: ${logColors[language]}`, text);
    
    const container = document.createElement('span');
    container.className = 'pronunciation-container pronunciation-processed';
    container.setAttribute('data-language', language);

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
        (settings.accent.english.uk ? 'uk' : 'us') : 
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
        
        const wordSpan = createWordSpan(word, pronunciation);
        container.appendChild(wordSpan);
        
        // 英语单词间添加空格
        if (language === 'english') {
            container.appendChild(document.createTextNode(' '));
        }
    }

    element.replaceWith(container);
    console.debug(`%c[${language} Processing] ${language}文本处理完成`, `color: ${logColors[language]}`);
}

// Alt键悬停处理函数
async function handleHover(event) {
    const target = event.target;
    console.debug('%c[Hover] 处悬停', 'color: #3F51B5');
    console.debug('%c[Hover] 鼠标移动事件:', 'color: #3F51B5');
    console.debug('%c[Hover] 目标文本长度:', 'color: #3F51B5', target.textContent.length);
    console.debug('%c[Hover] 目标元素最近文本:', 'color: #3F51B5', target.closest('p, span, article, section'));

    // 如果是发音提示元素或其祖先元素，则不处理
    if (target.classList.contains('pronunciation-tooltip')) {
        console.debug('%c[Hover] 目标是发音提示元素，跳过', 'color: #3F51B5');
        return;
    }
    if (target.closest('.pronunciation-tooltip')) {
        console.debug('%c[Hover] 目标是发音提示元素的后代，跳过', 'color: #3F51B5');
        return;
    }
    if (target.classList.contains('word-text')) {
        console.debug('%c[Hover] 目标是word-text元素，跳过', 'color: #3F51B5');
        return;
    }
    if (target.closest('.word-text')) {
        console.debug('%c[Hover] 目标是word-text元素的后代，跳过', 'color: #3F51B5');
        return;
    }

    // 如果已经处理过，则移除处理
    if (target.classList.contains('pronunciation-processed')) {
        console.debug('%c[Hover] 目标已处理过，移除处理', 'color: #3F51B5');
        const originalText = target.getAttribute('data-original-text');
        if (originalText) {
            const textNode = document.createTextNode(originalText);
            target.parentNode.replaceChild(textNode, target);
        }
        return;
    }

    const text = target.innerText.trim();
    if (!text) {
        console.debug('%c[Hover] 目标文本为空，跳过', 'color: #3F51B5');
        return;
    }

    // 创建发音容器
    const container = document.createElement('span');
    container.className = 'pronunciation-container pronunciation-processed';
    container.setAttribute('data-original-text', text);

    // 将文本分割为字符数组
    const characters = Array.from(text);
    console.debug('%c[Hover] 处理文本字符:', 'color: #3F51B5', characters.length, '个');
    
    // 处理每个字符
    for (let i = 0; i < characters.length; i++) {
        const char = characters[i];
        
        // 跳过空白字符和标点符号
        if (/[\s\p{P}]/u.test(char)) {
            console.debug('%c[Hover] 跳过空白字符或标点:', 'color: #3F51B5', char);
            container.appendChild(document.createTextNode(char));
            continue;
        }

        // 检测字符语言
        const charLanguage = detectLanguage(char);
        if (!charLanguage) {
            console.warn('%c[Hover] 未检测到字符语言:', 'color: #3F51B5', char);
            container.appendChild(document.createTextNode(char));
            continue;
        }
        if (!globalSettings.enabledLanguages?.[charLanguage]) {
            console.warn('%c[Hover] 字符语言未启用:', 'color: #3F51B5', charLanguage);
            container.appendChild(document.createTextNode(char));
            continue;
        }

        let pronunciation = '';
        
        // 根据语言获取发音
        if (charLanguage === 'english') {
            console.debug('%c[Hover] 处理英语字符', 'color: #3F51B5');
            // 对英语单词进行完整处理
            let word = '';
            let j = i;
            while (j < characters.length && /[a-zA-Z]/.test(characters[j])) {
                word += characters[j];
                j++;
            }
            
            const accentType = globalSettings.accent.english;
            pronunciation = await pronunciationService.getPronunciation(
                word.toLowerCase(),
                'english',
                accentType
            );
            
            i = j - 1;
            const wordSpan = createWordSpan(word, pronunciation);
            container.appendChild(wordSpan);
            
        } else {
            console.debug('%c[Hover] 处理其他语言字符:', 'color: #3F51B5', charLanguage);
            // 其他语言逐字符处理
            pronunciation = await pronunciationService.getPronunciation(
                char,
                charLanguage,
                'standard'
            );
            
            const charSpan = createWordSpan(char, pronunciation);
            container.appendChild(charSpan);
        }
    }

    target.parentNode.replaceChild(container, target);
    console.debug('%c[Hover] Alt键悬停处理完成', 'color: #3F51B5');
} 