// 语言检测模式定义
const languagePatterns = {
    english: /[a-zA-Z]+/,
    chinese: /[\u4e00-\u9fff]/,
    hangul: /[\uAC00-\uD7A3]/,
    japanese: /[\u3040-\u30FF]/,
};

// 检测文本语言类型的函数
const detectLanguage = text => {
    console.debug('%c[Language Detection] 检测文本语言:', 'color: #2196F3', text);
    for (const [lang, pattern] of Object.entries(languagePatterns)) {
        if (pattern.test(text)) {
            console.debug('%c[Language Detection] 检测到语言:', 'color: #2196F3', lang);
            return lang;
        }
    }
    console.warn('%c[Language Detection] 未检测到支持的语言', 'color: #2196F3');
    return 'unknown';
}; 