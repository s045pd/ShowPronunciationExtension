// 全局设置变量，用于存储用户偏好
const Language = Object.freeze({
    english: 'english',
    japanese: 'japanese', 
    korean: 'korean',
    chinese: 'chinese'
});


const Accent = Object.freeze({
    english: {
        us: 'us',
        uk: 'uk'
    },
    chinese: {
        standard: 'standard'
    }
});



const defaultSettings = {
    enabledLanguages: {
        english: true,
        japanese: true,
        korean: true,
        chinese: true
    },
    accent: {
        english: 'uk',
        japanese: 'standard',
        korean: 'standard',
        chinese: 'standard'
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