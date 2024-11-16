// 语言检测模式定义
const languagePatterns = {
    english: /^[a-zA-Z\s.,!?'"()-]+$/,  // 英语匹配模式
    mandarin: /[\u4e00-\u9fff]/,        // 中文匹配模式
    hangul: /[\uAC00-\uD7A3]/,          // 韩语匹配模式
    japanese: /[\u3040-\u30FF]/,         // 日语匹配模式
};

// 检测文本语言类型的函数
const detectLanguage = text => {
    for (const [lang, pattern] of Object.entries(languagePatterns)) {
        if (pattern.test(text)) return lang;
    }
    return 'unknown';
};

// 全局设置变量，用于存储用户偏好
let globalSettings = {
    selection: {
        enabled: true,           // 是否启用选择功能
        modifierKey: 'alt'       // 触发键(alt键)
    }
};

// 发音服务类，用于管理和获取各语言的发音数据
class PronunciationService {
    constructor() {
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
        try {
            // 分别加载各语言的发音数据文件
            this.pronunciationData.english.us = await this.fetchJson('data/en/us.json');
            this.pronunciationData.english.uk = await this.fetchJson('data/en/uk.json');
            this.pronunciationData.japanese.standard = await this.fetchJson('data/ja/pronunciations.json');
            this.pronunciationData.korean.standard = await this.fetchJson('data/ko/pronunciations.json');
        } catch (error) {
            console.error('加载发音数据出错:', error);
        }
    }

    // 从指定路径获取JSON数据
    async fetchJson(path) {
        const response = await fetch(chrome.runtime.getURL(path));
        return await response.json();
    }

    // 获取指定单词的发音
    getPronunciation(word, language, accentType) {
        try {
            const data = this.pronunciationData[language]?.[accentType];
            if (!data) {
                return null;
            }
            return data[word] || null;
        } catch (error) {
            console.error('获取发音数据出错:', error);
            return null;
        }
    }
}

// 创建发音服务的单例实例
const pronunciationService = new PronunciationService();
pronunciationService.loadPronunciationData();

// 处理文本的主函数
async function processText(element, settings) {
    // 检查元素是否已处理过
    if (element.classList.contains('pronunciation-processed')) {
        return;
    }

    const text = element.textContent.trim();
    if (!text) return;

    // 检测文本语言并验证是否启用该语言
    const language = detectLanguage(text);
    if (!language || !settings.enabledLanguages[language]) {
        return;
    }

    // 根据不同语言调用相应的处理函数
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
    }
}

// 处理英语文本
async function processEnglishText(element, text, settings) {
    const words = text.split(/\s+/);
    const container = document.createElement('span');
    container.className = 'pronunciation-container pronunciation-processed';

    // 确定使用的口音类型
    const accentType = settings.accent.english.uk ? 'uk' : 'us';

    // 处理每个单词
    for (const word of words) {
        const pronunciation = await pronunciationService.getPronunciation(word, 'english', accentType);
        const wordSpan = createWordSpan(word, pronunciation);
        container.appendChild(wordSpan);
        container.appendChild(document.createTextNode(' '));
    }

    element.replaceWith(container);
}

// 处理日语文本
async function processJapaneseText(element, text, settings) {
    const container = document.createElement('span');
    container.className = 'pronunciation-container pronunciation-processed';

    const pronunciation = await pronunciationService.getPronunciation(
        text, 
        'japanese', 
        'standard'
    );
    const wordSpan = createWordSpan(text, pronunciation);
    container.appendChild(wordSpan);

    element.replaceWith(container);
}

// 处理韩语文本
async function processKoreanText(element, text, settings) {
    const container = document.createElement('span');
    container.className = 'pronunciation-container pronunciation-processed';

    const pronunciation = await pronunciationService.getPronunciation(
        text, 
        'korean', 
        'standard'
    );
    const wordSpan = createWordSpan(text, pronunciation);
    container.appendChild(wordSpan);

    element.replaceWith(container);
}

// 创建带发音提示的单词span元素
function createWordSpan(word, pronunciation) {
    const span = document.createElement('span');
    span.className = 'word-container';
    span.textContent = word;

    if (pronunciation) {
        const tooltip = document.createElement('span');
        tooltip.className = 'pronunciation-tooltip';
        tooltip.textContent = pronunciation;
        span.appendChild(tooltip);
    }

    return span;
}

// Alt键悬停处理函数
async function handleAltHover(event) {
    // 检查功能是否启用且是否按下Alt键
    if (!globalSettings.selection?.enabled || !event.altKey) {
        return;
    }

    const target = event.target;

    // 处理已有发音提示的情况
    if (target.classList.contains('pronunciation-processed')) {
        const originalText = target.getAttribute('data-original-text');
        if (originalText) {
            const textNode = document.createTextNode(originalText);
            target.parentNode.replaceChild(textNode, target);
        }
        return;
    }

    const text = target.innerText.trim();
    if (!text) return;

    console.log(target,text);

    // 创建发音容器
    const container = document.createElement('span');
    container.className = 'pronunciation-container pronunciation-processed';
    container.setAttribute('data-original-text', text);

    // 将文本分割为字符数组
    const characters = Array.from(text);
    
    // 处理每个字符
    for (let i = 0; i < characters.length; i++) {
        const char = characters[i];
        
        // 跳过空白字符和标点符号
        if (/[\s\p{P}]/u.test(char)) {
            container.appendChild(document.createTextNode(char));
            continue;
        }

        // 检测字符语言
        const charLanguage = detectLanguage(char);
        if (!charLanguage || !globalSettings.enabledLanguages?.[charLanguage]) {
            container.appendChild(document.createTextNode(char));
            continue;
        }

        let pronunciation = '';
        
        // 根据语言获取发音
        if (charLanguage === 'english') {
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
}

// 添加鼠标悬停事件监听器
document.addEventListener('mouseover', (event) => {
    // 仅处理特定文本元素
    const validElements = ['P', 'DIV', 'SPAN'];
    if (validElements.includes(event.target.tagName) && 
        event.target.textContent && 
        event.target.textContent.trim().length > 0 &&
        event.target.textContent.trim().length < 200) { // 限制文本长度
        handleAltHover(event);
    }
});

// 消息监听器，处理设置更新
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'addPronunciation') {
        globalSettings = request.settings;  // 更新全局设置
        // 查找所有文本节点
        const textNodes = document.evaluate(
            '//text()[not(ancestor::script) and not(ancestor::style)]',
            document,
            null,
            XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE,
            null
        );

        // 处理每个文本节点
        for (let i = 0; i < textNodes.snapshotLength; i++) {
            const node = textNodes.snapshotItem(i);
            if (node.parentElement) {
                processText(node.parentElement, request.settings);
            }
        }
    }
});

// 添加样式
const style = document.createElement('style');
style.textContent = `
    .pronunciation-container {
        display: inline-block;
        line-height: 2.5;
        margin: 1em 0;
    }
    .word-container {
        display: inline-block;
        position: relative;
        text-align: center;
        margin: 0 2px;
    }
    .pronunciation-overlay {
        position: absolute;
        background: rgba(255, 255, 255, 0.95);
        color: #666;
        padding: 5px;
        border-radius: 4px;
        font-size: 0.9em;
        font-family: Arial, sans-serif;
        line-height: 1.4;
        margin-top: -1.8em;
        text-align: center;
        box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        z-index: 10000;
        pointer-events: none;
        word-wrap: break-word;
    }
    .pronunciation-processed {
        background-color: rgba(255, 255, 255, 0.05);
    }
    .selected-text {
        background-color: rgba(255, 255, 0, 0.2);
    }
`;
document.head.appendChild(style);