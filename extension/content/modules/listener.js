
// 初始化事件监听器
function initializeEventListeners() {

    // 监听鼠标位置，用于辅助ALT
    document.addEventListener('mousemove', (event) => {
        mousePosition.x = event.clientX;
        mousePosition.y = event.clientY;
    });

    // 监听ALT按下事件，执行音标翻译
    document.addEventListener('keydown', (event) => {
        console.debug('%c[Hover] Alt键按下事件:', 'color: #3F51B5', event.key);
        if (event.key === 'Alt') {
            const target = document.elementFromPoint(mousePosition.x, mousePosition.y);
            if (!IsHoverTargetValid(target)){
                return
            };
            handleHover({target});
        }
    });

    // 监听鼠标松开事件，执行选中文本翻译
    document.addEventListener('mouseup', handleSelectedText);
}



// 添加消息监听器
function initializeMessageListener() {
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        const actionHandlers = {
            addPronunciation: handleAddPronunciation,
            updatePhoneticColor: handleUpdatePhoneticColor,
            toggleLanguage: handleToggleLanguage,
            updateAccent: handleUpdateAccent
        };

        const handler = actionHandlers[request.action];
        if (handler) {
            handler(request);
        }
    });
}
