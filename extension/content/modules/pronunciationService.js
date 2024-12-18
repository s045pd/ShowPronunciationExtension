class PronunciationService {
    constructor() {
        console.log('%c[Service] 初始化发音服务', 'color: #4CAF50');
        this.pronunciationData = {
            english: null,
            japanese: null,
            korean: null,
            chinese: null
        };
    }

    // 加载所有语言的发音数据
    async loadPronunciationData() {
        console.log('%c[Service] 开始加载发音数据', 'color: #4CAF50');
        try {
            // 使用循环加载所有语言数据
            const languagePaths = {
                english: 'data/en/data.json',
                japanese: 'data/ja/data.json', 
                korean: 'data/ko/data.json',
                chinese: 'data/cn/data.json'
            };

            for (const [language, path] of Object.entries(languagePaths)) {
                this.pronunciationData[language] = await this.fetchJson(path);
            }
            
            console.log('%c[Service] 发音数据加载完成', 'color: #4CAF50');
        } catch (error) {
            console.error('%c[Service Error] 加载发音数据出错:', 'color: #f44336', error);
        }
    }

    // 从指定路径获取JSON数据
    async fetchJson(path) {
        console.debug('%c[Service] 获取JSON数据:', 'color: #4CAF50', path);
        try {
            const url = chrome.runtime.getURL(path);
            console.debug('%c[Service] 完整URL:', 'color: #4CAF50', url);
            const response = await fetch(url);
            if (!response.ok) {
                console.error('%c[Service Error] 获取JSON失败:', 'color: #f44336', response.status, response.statusText);
                return {};
            }
            return await response.json();
        } catch (error) {
            console.error('%c[Service Error] 获取JSON出错:', 'color: #f44336', error);
            return {};
        }
    }

    // 获取指定单词的发音
    getPronunciation(word, language, accentType) {
        console.debug('%c[Service] 获取发音:', 'color: #4CAF50',`${word} -> ${language.toUpperCase()}[${accentType}]`);
        try {
            if (language !== 'chinese') {
                // 处理英语发音（新格式）
                const wordData = this.pronunciationData.english?.[word];
                if (!wordData) {
                    console.warn('%c[Service] 未找到单词数据:', 'color: #4CAF50', word);
                    return null;
                }
                
                const accentData = wordData.accent?.[accentType];
                if (!accentData) {
                    console.warn('%c[Service] 未找到口音数据:', 'color: #4CAF50', accentType);
                    return null;
                }
                
                console.debug('%c[Service] 获取到发音:', 'color: #4CAF50', accentData.alpha);
                return accentData.alpha;  // 返回音标
            } else {
                // 其他语言保持原有处理方式
                const data = this.pronunciationData[language];
                if (!data) {
                    console.warn('%c[Service] 未找到对应语言的发音数据', 'color: #4CAF50');
                    return null;
                }
                const pronunciation = data[word];
                if (!pronunciation) {
                    console.warn('%c[Service] 未找到单词的发音数据', 'color: #4CAF50');
                    return null;
                }
                console.debug('%c[Service] 获取到发音:', 'color: #4CAF50', pronunciation);
                return pronunciation;
            }
        } catch (error) {
            console.error('%c[Service Error] 获取发音数据出错:', 'color: #f44336', error);
            return null;
        }
    }
}

const pronunciationService = new PronunciationService(); 