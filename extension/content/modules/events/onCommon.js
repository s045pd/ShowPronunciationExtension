async function handleAddPronunciation(request) {
    console.debug('%c[Settings] 收到设置更新消息', 'color: #FF5722');
    Object.assign(globalSettings, request.settings);
    
    const textNodes = document.evaluate(
        '//text()[not(ancestor::script) and not(ancestor::style)]',
        document,
        null,
        XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE,
        null
    );

    console.debug('%c[Settings] 找到文本节点:', 'color: #FF5722', textNodes.snapshotLength, '个');
    
    for (let i = 0; i < textNodes.snapshotLength; i++) {
        const node = textNodes.snapshotItem(i);
        if (node.parentElement) {
            await processText(node.parentElement, request.settings);
        }
    }
}
