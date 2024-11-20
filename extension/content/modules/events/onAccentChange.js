// 处理语言切换
function handleLanguageToggle(request) {
    console.debug('%c[Settings] 切换语言可见性:', 'color: #FF5722', request.language, request.enabled);
    
    // 更新全局设置
    globalSettings.enabledLanguages[request.language] = request.enabled;
    
    // 查找所有相应语言的容器
    const containers = document.querySelectorAll(`.pronunciation-container[data-language="${request.language}"]`);
    console.debug('%c[Settings] 找到容器数量:', 'color: #FF5722', containers.length);
    
    containers.forEach(container => {
        if (request.enabled) {
            container.classList.remove('pronunciation-hidden');
            console.debug('%c[Settings] 显示容器:', 'color: #FF5722', container);
        } else {
            container.classList.add('pronunciation-hidden');
            console.debug('%c[Settings] 隐藏容器:', 'color: #FF5722', container);
        }
    });
}
