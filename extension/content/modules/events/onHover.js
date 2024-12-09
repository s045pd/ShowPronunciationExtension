class TextProcessor {
    constructor() {
        this.cursor = '';
        this.container = null;
        this.characters = [];
        this.currentIndex = 0;
    }

    async processText(text) {
        this.container = document.createElement('span');
        this.container.className = 'pronunciation-container';

        // 先按空白字符分割文本
        const segments = text.split(/(\s+)/);
        console.debug('%c[Hover] 文本分段:', 'color: #3F51B5', segments);

        for (const segment of segments) {
            // 如果是空白字符，直接添加
            if (/^\s+$/.test(segment)) {
                this.container.appendChild(document.createTextNode(segment));
                continue;
            }

            // 处理非空白段落
            this.characters = Array.from(segment);
            this.currentIndex = 0;

            while (this.currentIndex < this.characters.length) {
                const char = this.characters[this.currentIndex];

                // 跳过标点符号
                if (/[\p{P}]/u.test(char)) {
                    console.debug('%c[Hover] 跳过标点:', 'color: #3F51B5', char);
                    this.container.appendChild(document.createTextNode(char));
                    this.currentIndex++;
                    continue;
                }

                // 检测字符语言
                const charLanguage = detectLanguage(char);
                if (!charLanguage) {
                    console.warn('%c[Hover] 未检测到字符语言:', 'color: #3F51B5', char);
                    this.container.appendChild(document.createTextNode(char));
                    this.currentIndex++;
                    continue;
                }
                if (!globalSettings.enabledLanguages?.[charLanguage]) {
                    console.warn('%c[Hover] 字符语言未启用:', 'color: #3F51B5', charLanguage);
                    this.container.appendChild(document.createTextNode(char));
                    this.currentIndex++;
                    continue;
                }

                // 根据语言处理文本
                switch (charLanguage) {
                    case 'english':
                        await this.processEnglishWord();
                        break;
                    case 'chinese':
                        await this.processChineseWord();
                        break;
                    case 'korean':
                    case 'japanese':
                        await this.processSingleCharacter(charLanguage);
                        break;
                    default:
                        this.container.appendChild(document.createTextNode(char));
                        this.currentIndex++;
                }
            }
        }

        return this.container;
    }

    async processEnglishWord() {
        console.debug('%c[Hover] 处理英语字符', 'color: #3F51B5');
        this.cursor = '';
        
        // 收集完整的英文单词
        while (this.currentIndex < this.characters.length && 
               /[a-zA-Z]/.test(this.characters[this.currentIndex])) {
            this.cursor += this.characters[this.currentIndex];
            this.currentIndex++;
        }

        if (this.cursor) {
            const accentType = globalSettings.accent.english;
            const pronunciation = await pronunciationService.getPronunciation(
                this.cursor.toLowerCase(),
                'english',
                accentType
            );
            
            const wordSpan = createWordSpan(this.cursor, 'english', accentType, pronunciation);
            this.container.appendChild(wordSpan);
        }
    }

    async processChineseWord() {
        console.debug('%c[Hover] 处理中文字符', 'color: #3F51B5');
        this.cursor = '';
        let maxMatch = '';
        let tempIndex = this.currentIndex;
        let currentNode = null;

        // 尝试最大匹配
        while (tempIndex < this.characters.length) {
            const char = this.characters[tempIndex];
            if (!/[\u4e00-\u9fff]/.test(char)) break;
            
            // 如果是第一个字符，获取以它为key的节点
            if (tempIndex === this.currentIndex) {
                currentNode = await pronunciationService.getPronunciation(
                    char,
                    'chinese',
                    'standard'
                );
                if (!currentNode) break;
            } else {
                // 继续遍历树结构
                if (!currentNode[char]) break;
                currentNode = currentNode[char];
            }

            this.cursor += char;
            
            // 检查是否有拼音数据
            if (currentNode['_']) {
                maxMatch = this.cursor;
            }
            tempIndex++;
        }

        // 如果找到匹配，使用最长匹配
        if (maxMatch) {
            const pronunciation = await pronunciationService.getPronunciation(
                maxMatch,
                'chinese',
                'standard'
            );
            const wordSpan = createWordSpan(maxMatch, 'chinese', 'standard', pronunciation['_']);
            this.container.appendChild(wordSpan);
            this.currentIndex += maxMatch.length;
        } else {
            // 如果没有匹配，处理单个字符
            const char = this.characters[this.currentIndex];
            const pronunciation = await pronunciationService.getPronunciation(
                char,
                'chinese',
                'standard'
            );
            const charSpan = createWordSpan(char, 'chinese', 'standard', pronunciation ? pronunciation['_'] : null);
            this.container.appendChild(charSpan);
            this.currentIndex++;
        }
    }

    async processSingleCharacter(language) {
        console.debug('%c[Hover] 处理单字符:', 'color: #3F51B5', language);
        const char = this.characters[this.currentIndex];
        const pronunciation = await pronunciationService.getPronunciation(
            char,
            language,
            'standard'
        );
        
        const charSpan = createWordSpan(char, language, 'standard', pronunciation);
        this.container.appendChild(charSpan);
        this.currentIndex++;
    }
}

const handleHover = async (event) => {
    const target = event.target;
    console.debug('%c[Hover] 处悬停', 'color: #3F51B5');
    console.debug('%c[Hover] 鼠标移动事件:', 'color: #3F51B5');
    console.debug('%c[Hover] 目标文本长度:', 'color: #3F51B5', target.textContent.length);
    console.debug('%c[Hover] 目标元素最近文本:', 'color: #3F51B5', target.closest('p, span, article, section'));

    // 如果已经处理过，则移除处理
    if (!IsTranslateTargetValid(target)) {
        console.debug('%c[Hover] 目标已处理过，移除处理', 'color: #3F51B5');
        return;
    }

    const text = target.innerText.trim();
    if (!text) {
        console.debug('%c[Hover] 目标文本为空，跳过', 'color: #3F51B5');
        return;
    }

    const textProcessor = new TextProcessor();

    for (const node of Array.from(target.childNodes)) {
        if (!IsTranslateTargetValid(node)) {
            continue;
        }

        if (node.nodeType === 3) { // Text node
            const processedContainer = await textProcessor.processText(node.textContent);
            node.parentNode.replaceChild(processedContainer, node);
        }
        else if (node.nodeType === 1) { // Element node
            const processedContainer = await textProcessor.processText(node.innerText);
            node.innerHTML = '';
            node.appendChild(processedContainer);
        }
    }
};