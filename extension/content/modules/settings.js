// 全局设置变量，用于存储用户偏好
const globalSettings = {
    enablePhoneticColor: false,
    selection: {
        enabled: true,           
        modifierKey: 'alt'       
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

// 鼠标位置跟踪
const mousePosition = {
    x: 0,
    y: 0
}; 