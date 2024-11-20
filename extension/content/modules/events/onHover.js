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