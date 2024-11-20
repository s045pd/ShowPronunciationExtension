// 全局设置变量，用于存储用户偏好
const Language = Object.freeze({
    english: 'english',
    japanese: 'japanese', 
    korean: 'korean'
});


const Accent = Object.freeze({
    english: {
        us: 'us',
        uk: 'uk'
    }
});



const defaultSettings = {
    enabledLanguages: {
        english: true,
        japanese: true,
        korean: true
    },
    accent: {
        english: 'us',
        japanese: 'standard',
        korean: 'standard'
    },
    selection: {
        enabled: true,
    },
    accentSource: {
        'C_UK': 'https://media.english-chinese-simplified.com/uk_pron',
        'C_US': 'https://media.english-chinese-simplified.com/us_pron'
    }
};



let globalSettings = { ...defaultSettings };

// 鼠标位置跟踪
const mousePosition = {
    x: 0,
    y: 0
}; 