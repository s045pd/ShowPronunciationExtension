// 初始化
async function initialize() {
    try {
        // 加载发音数据
        await pronunciationService.loadPronunciationData();
        
        // 注入样式
        injectStyles();
        
        // 初始化事件监听
        if (typeof initializeEventListeners === 'function') {
            initializeEventListeners();
        } else {
            console.error('initializeEventListeners is not defined');
        }
        
        // 初始化消息监听
        if (typeof initializeMessageListener === 'function') {
            initializeMessageListener();
        } else {
            console.error('initializeMessageListener is not defined');
        }
    } catch (error) {
        console.error('Initialization error:', error);
    }
}

// 等待 DOM 加载完成后初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
} else {
    initialize();
}