
// 全局设置变量，用于存储用户偏好
let globalSettings = {
    selection: {
        enabled: true,           // 是否启用选择功能
        modifierKey: 'alt'       // 触发键(alt键)
    },
    enabledLanguages: {
        english: true,
        japanese: true,
        korean: true
    },
    accent: {
        english: {
            us: false,
            uk: true
        }
    }
};

// 添加全局变量跟踪鼠标位置
let mousePosition = {
    x: 0,
    y: 0
};

// 语言检测模式定义
const languagePatterns = {
    english: /[a-zA-Z]+/,  // 英语匹配模式
    mandarin: /[\u4e00-\u9fff]/,        // 中文匹配模式
    hangul: /[\uAC00-\uD7A3]/,          // 韩语匹配模式
    japanese: /[\u3040-\u30FF]/,         // 日语匹配模式
};



// 检测文本语言类型的函数
const detectLanguage = text => {
    console.debug('%c[Language Detection] 检测文本语言:', 'color: #2196F3', text);
    for (const [lang, pattern] of Object.entries(languagePatterns)) {
        if (pattern.test(text)) {
            console.debug('%c[Language Detection] 检测到语言:', 'color: #2196F3', lang);
            return lang;
        }
        else{
            console.error(`%c[Language Detection] 未检测到支持的语言: ${text} -> ${pattern.test(text)}`, 'color: #2196F3');
        }
    }
    console.warn('%c[Language Detection] 未检测到支持的语言', 'color: #2196F3');
    return 'unknown';
};



// 发音服务类，用于管理和获取各语言的发音数据
class PronunciationService {
    constructor() {
        console.log('%c[Service] 初始化发音服务', 'color: #4CAF50');
        // 初始化各语言发音数据存储
        this.pronunciationData = {
            english: {
                us: null,        // 美式发音
                uk: null         // 英式发音
            },
            japanese: {
                standard: null   // 标准日语发音
            },
            korean: {
                standard: null   // 标准韩语发音
            }
        };
    }

    // 加载所有语言的发音数据
    async loadPronunciationData() {
        console.log('%c[Service] 开始加载发音数据', 'color: #4CAF50');
        try {
            // 分别加载各语言的发音数据文件
            this.pronunciationData.english.us = await this.fetchJson('data/en/us.json');
            this.pronunciationData.english.uk = await this.fetchJson('data/en/uk.json');
            this.pronunciationData.japanese.standard = await this.fetchJson('data/ja/pronunciations.json');
            this.pronunciationData.korean.standard = await this.fetchJson('data/ko/pronunciations.json');
            console.log('%c[Service] 发音数据加载完成', 'color: #4CAF50');
        } catch (error) {
            console.error('%c[Service Error] 加载发音数据出错:', 'color: #f44336', error);
        }
    }

    // 从指定路径获取JSON数据
    async fetchJson(path) {
        console.debug('%c[Service] 获取JSON数据:', 'color: #4CAF50', path);
        try {
            const response = await fetch(chrome.runtime.getURL(path));
            if (!response.ok) {
                console.error('%c[Service Error] 获取JSON失败:', 'color: #f44336', response.status, response.statusText);
                return null;
            }
            return await response.json();
        } catch (error) {
            console.error('%c[Service Error] 获取JSON出错:', 'color: #f44336', error);
            return null;
        }
    }

    // 获取指定单词的发音
    getPronunciation(word, language, accentType) {
        console.debug('%c[Service] 获取发音:', 'color: #4CAF50', word, language, accentType);
        try {
            const data = this.pronunciationData[language]?.[accentType];
            if (!data) {
                console.warn('%c[Service] 未找到对应语言或口音的发音数据', 'color: #4CAF50');
                return null;
            }
            const pronunciation = data[word];
            if (!pronunciation) {
                console.warn('%c[Service] 未找到单词的发音数据', 'color: #4CAF50');
                return null;
            }
            console.debug('%c[Service] 获取到发音:', 'color: #4CAF50', pronunciation);
            return pronunciation;
        } catch (error) {
            console.error('%c[Service Error] 获取发音数据出错:', 'color: #f44336', error);
            return null;
        }
    }
}

// 创建发音服务的单例实例
const pronunciationService = new PronunciationService();
pronunciationService.loadPronunciationData();

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
        // 向前扩展
        let startIndex = wordIndex;
        while (startIndex > 0 && /[a-zA-Z]/.test(parentText[startIndex - 1])) {
            startIndex--;
        }
        extendedWord = parentText.slice(startIndex, wordIndex + word.length);
    } else {
        // 向后扩展
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
    switch (language) {
        case 'english':
            await processEnglishText(element, text, settings);
            break;
        case 'japanese':
            await processJapaneseText(element, text, settings);
            break;
        case 'korean':
            await processKoreanText(element, text, settings);
            break;
        default:
            console.warn('%c[Text Processing] 不支持的语言类型:', 'color: #9C27B0', language);
    }
}

// 处理英语文本
async function processEnglishText(element, text, settings) {
    console.debug('%c[English Processing] 处理英语文本:', 'color: #673AB7', text);
    const words = text.split(/\s+/);
    const container = document.createElement('span');
    container.className = 'pronunciation-container pronunciation-processed';

    // 确定使用的口音类型
    const accentType = settings.accent.english.uk ? 'uk' : 'us';
    console.debug('%c[English Processing] 使用口音:', 'color: #673AB7', accentType);

    // 处理每个单词
    for (const word of words) {
        console.debug('%c[English Processing] 处理单词:', 'color: #673AB7', word);
        const pronunciation = await pronunciationService.getPronunciation(word.toLowerCase(), 'english', accentType);
        if (!pronunciation) {
            console.warn('%c[English Processing] 未找到单词发音:', 'color: #673AB7', word);
        }
        const wordSpan = createWordSpan(word, pronunciation);
        container.appendChild(wordSpan);
        container.appendChild(document.createTextNode(' '));
    }

    element.replaceWith(container);
    console.debug('%c[English Processing] 英语文本处理完成', 'color: #673AB7');
}

// 处理日语文本
async function processJapaneseText(element, text, settings) {
    console.debug('%c[Japanese Processing] 处理日语文本:', 'color: #E91E63', text);
    const container = document.createElement('span');
    container.className = 'pronunciation-container pronunciation-processed';

    const pronunciation = await pronunciationService.getPronunciation(
        text, 
        'japanese', 
        'standard'
    );
    if (!pronunciation) {
        console.warn('%c[Japanese Processing] 未找到日语发音', 'color: #E91E63');
    }
    const wordSpan = createWordSpan(text, pronunciation);
    container.appendChild(wordSpan);

    element.replaceWith(container);
    console.debug('%c[Japanese Processing] 日语文本处理完成', 'color: #E91E63');
}

// 处理韩语文本
async function processKoreanText(element, text, settings) {
    console.debug('%c[Korean Processing] 处理韩语文本:', 'color: #795548', text);
    const container = document.createElement('span');
    container.className = 'pronunciation-container pronunciation-processed';

    const pronunciation = await pronunciationService.getPronunciation(
        text, 
        'korean', 
        'standard'
    );
    if (!pronunciation) {
        console.warn('%c[Korean Processing] 未找到韩语发音', 'color: #795548');
    }
    const wordSpan = createWordSpan(text, pronunciation);
    container.appendChild(wordSpan);

    element.replaceWith(container);
    console.debug('%c[Korean Processing] 韩语文本处理完成', 'color: #795548');
}

// 创建带发音提示的单词span元素
function createWordSpan(word, pronunciation) {
    console.debug('%c[DOM] 创建单词span:', 'color: #607D8B', word, pronunciation);
    const span = document.createElement('span');
    span.className = 'word-container';
    
    // 创建发音提示元素
    if (pronunciation) {
        const tooltip = document.createElement('span');
        tooltip.className = 'pronunciation-tooltip';
        
        // 如果启用了音标上色且是英语发音
        if (globalSettings.accent?.english?.enablePhoneticColor && 
            /^[A-Za-z\u0250-\u02AF\u02B0-\u02FF]+$/.test(pronunciation)) {
            
            // 将发音拆分为单个音标
            const phonemes = pronunciation.match(/[A-Za-z\u0250-\u02AF\u02B0-\u02FF]+/g) || [];
            
            phonemes.forEach(phoneme => {
                const phoneticSpan = document.createElement('span');
                phoneticSpan.textContent = phoneme;
                
                // 根据音标类型设置颜色
                if (vowel[phoneme]) {
                    phoneticSpan.style.color = vowel[phoneme].color;
                } else if (constant[phoneme]) {
                    phoneticSpan.style.color = constant[phoneme].color;
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
    
    // 创建文本元素
    const textSpan = document.createElement('span');
    textSpan.className = 'word-text';
    textSpan.textContent = word;
    span.appendChild(textSpan);

    return span;
}

// 处理选中文本
async function handleSelectedText(event) {
    console.warn('%c[Selection] 处理选中文本', 'color: #009688');
    if (!globalSettings.selection.enabled) {
        console.warn('%c[Selection] 选择功能未启用', 'color: #009688');
        return;
    }
    
    const selection = window.getSelection();
    const selectedText = selection.toString().trim();
    
    if (!selectedText) {
        console.warn('%c[Selection] 未选中文本', 'color: #009688');
        return;
    }
    
    const range = selection.getRangeAt(0);
    
    // 检查是否选中了发音提示元素或word-text元素
    if (range.commonAncestorContainer.nodeType === 1) {
        const container = range.commonAncestorContainer;
        if (container.querySelector('.pronunciation-tooltip')) {
            console.warn('%c[Selection] 选中了发音提示元素，跳过', 'color: #009688');
            return;
        }
        if (container.querySelector('.word-text')) {
            console.warn('%c[Selection] 选中了word-text元素，跳过', 'color: #009688');
            return;
        }
        if (container.classList.contains('word-text')) {
            console.warn('%c[Selection] 选中了word-text元素，跳过', 'color: #009688');
            return;
        }
    }
    
    const language = detectLanguage(selectedText);
    console.debug('%c[Selection] 选中文本语言:', 'color: #009688', language);

    // 如果是英文文本，先尝试扩展单词范围
    if (language === 'english') {
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
    
    // 创建一个包装容器来保存原始内容和样式
    const wrapper = document.createElement('span');
    wrapper.className = 'selected-text-wrapper';
    
    // 将选中内容移动到wrapper中，保持原始元素
    const fragment = range.extractContents();
    wrapper.appendChild(fragment);
    
    // 将wrapper插入到原位置
    range.insertNode(wrapper);
    
    // 处理发音，但保持原有结构
    processText(wrapper, globalSettings);
    
    // 清除选择
    selection.removeAllRanges();
    console.debug('%c[Selection] 选中文本处理完成', 'color: #009688');
}

// Alt键悬停处理函数
async function handleHover(event) {
   
    
    // if (!globalSettings.selection?.enabled) {
    //     console.warn('%c[Hover] 选择功能未启用', 'color: #3F51B5');
    //     return;
    // }

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
            
            const accentType = globalSettings.accent?.english?.uk ? 'uk' : 'us';
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

// 检查目标是否有效
function IsTargetValid(target){
    if (!target) {
        console.debug('%c[Validation] 目标为空', 'color: #3F51B5');
        return;
    }
    const tagName = target.tagName;
    const text = target.textContent.trim();

    if (!text) {
        console.debug('%c[Validation] 目标文本为空', 'color: #3F51B5');
        return;
    }
    if (['BODY', 'HTML'].includes(tagName)) {
        console.debug('%c[Validation] 目标为BODY或HTML', 'color: #3F51B5');
        return;
    }
    if (tagName === 'DIV' && text.trim().length > 1000) {
        console.debug('%c[Validation] 目标为DIV且文本长度大于1000', 'color: #3F51B5');
        return;
    }
    return true;
}



// 更新鼠标位置的事件监听器
document.addEventListener('mousemove', (event) => {
    mousePosition.x = event.clientX;
    mousePosition.y = event.clientY;
});

// 修改 keydown 事件处理程序
document.addEventListener('keydown', (event) => {
    console.debug('%c[Hover] Alt键按下事件:', 'color: #3F51B5', event.key);
    if (event.key === 'Alt') {
        // 使用保存的鼠标位置
        const target = document.elementFromPoint(mousePosition.x, mousePosition.y);
        if (!IsTargetValid(target)) {
            return;
        }
        handleHover({target});
    }
});

document.addEventListener('mouseup', handleSelectedText);

// 消息监听器，处理设置更新
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'addPronunciation') {
        console.debug('%c[Settings] 收到设置更新消息', 'color: #FF5722');
        globalSettings = request.settings;  // 更新全局设置
        // 查找所有文本节点
        const textNodes = document.evaluate(
            '//text()[not(ancestor::script) and not(ancestor::style)]',
            document,
            null,
            XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE,
            null
        );

        console.debug('%c[Settings] 找到文本节点:', 'color: #FF5722', textNodes.snapshotLength, '个');
        // 处理每个文本节点
        for (let i = 0; i < textNodes.snapshotLength; i++) {
            const node = textNodes.snapshotItem(i);
            if (node.parentElement) {
                processText(node.parentElement, request.settings);
            } else {
                console.warn('%c[Settings] 文本节点没有父元素:', 'color: #FF5722', node);
            }
        }
        console.debug('%c[Settings] 设置更新处理完成', 'color: #FF5722');
    }
});

// 添加样式
const style = document.createElement('style');
style.textContent = `
    .pronunciation-container {
        line-height: 2.4;
    }
    .word-container {
        display: inline-block;
        position: relative;
        text-align: center;
        margin: 0 2px;
    }
    .pronunciation-tooltip {
        position: absolute;
        background: transparent;
        color: #666;
        font-size: 0.8em;
        font-family: Arial, sans-serif;
        line-height: 1;
        top: -0.2em;
        left: 50%;
        transform: translateX(-50%);
        white-space: nowrap;
    }
    .word-text {
        display: inline-block;
    }
    .pronunciation-processed {
        background-color: rgba(255, 255, 255, 0.05);
    }
    .selected-text {
        background-color: rgba(255, 0, 0, 0.2);
    }
    .selected-text-wrapper {
    display: inline;
    background-color: rgba(255, 255, 255, 0.05);
}
    .pronunciation-tooltip span {
        display: inline-block;
        margin: 0 0.5px;
    }
`;
document.head.appendChild(style);