class PronunciationService {
    constructor() {
        console.log('%c[Service] 初始化发音服务', 'color: #4CAF50');
        this.pronunciationData = {
            english: {
                us: null,
                uk: null
            },
            japanese: {
                standard: null
            },
            korean: {
                standard: null
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
            this.pronunciationData.japanese.standard = await this.fetchJson('data/ja/ipa.json');
            this.pronunciationData.korean.standard = await this.fetchJson('data/ko/ipa.json');
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
                return {};  // 返回空对象而不是 null
            }
            return await response.json();
        } catch (error) {
            console.error('%c[Service Error] 获取JSON出错:', 'color: #f44336', error);
            return {};  // 返回空对象而不是 null
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

const pronunciationService = new PronunciationService(); 