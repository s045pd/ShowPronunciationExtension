
async function handleSelectedText(event) {
    console.warn('%c[Selection] 处理选中文本', 'color: #009688');
    if (!globalSettings.selection.enabled) {
        console.warn('%c[Selection] 选择功能未启用', 'color: #009688');
        return;
    }
    
    const selection = window.getSelection();
    const selectedText = selection.toString().trim();
    
    if (!selectedText) {
        console.warn('%c[Selection] 未选中文本', 'color: #009688');
        return;
    }
    
    const range = selection.getRangeAt(0);
    
    // ���查是否选中了发音提示元素或word-text元素
    if (range.commonAncestorContainer.nodeType === 1) {
        const container = range.commonAncestorContainer;
        if (container.querySelector('.pronunciation-tooltip')) {
            console.warn('%c[Selection] 选中了发音提示元素，跳过', 'color: #009688');
            return;
        }
        if (container.querySelector('.word-text')) {
            console.warn('%c[Selection] 选中了word-text元素，跳过', 'color: #009688');
            return;
        }
        if (container.classList.contains('word-text')) {
            console.warn('%c[Selection] 选中了word-text元素，跳过', 'color: #009688');
            return;
        }
    }
    
    const language = detectLanguage(selectedText);
    console.debug('%c[Selection] 选中文本语言:', 'color: #009688', language);

    // 如果是英文文本，先尝试扩展单词范围
    if (language === 'english') {
        console.debug('%c[Selection] 处理英文选中文本', 'color: #009688');
        const words = selectedText.split(/[\s\p{P}]+/u).filter(word => word.length > 0);
        if (words.length > 0) {
            const firstWord = words[0];
            const lastWord = words[words.length - 1];
            
            // 扩展首尾单词
            const expandedFirstWord = await tryExpandWord(firstWord, range.startContainer, true);
            const expandedLastWord = await tryExpandWord(lastWord, range.endContainer, false);
            
            // 更新range的起始和结束位置
            if (expandedFirstWord !== firstWord) {
                console.debug('%c[Selection] 更新首单词:', 'color: #009688', expandedFirstWord);
                const startOffset = range.startContainer.textContent.indexOf(expandedFirstWord);
                range.setStart(range.startContainer, startOffset);
            }
            
            if (expandedLastWord !== lastWord) {
                console.debug('%c[Selection] 更新尾单词:', 'color: #009688', expandedLastWord);
                const endOffset = range.endContainer.textContent.indexOf(expandedLastWord) + expandedLastWord.length;
                range.setEnd(range.endContainer, endOffset);
            }
        }
    }
    
    // 创建一个包装容器来保存原始内容和样式
    const wrapper = document.createElement('span');
    wrapper.className = 'selected-text-wrapper';
    
    // 将选中内容移动到wrapper中，保持原始元素
    const fragment = range.extractContents();
    wrapper.appendChild(fragment);
    
    // 将wrapper插入到原位置
    range.insertNode(wrapper);
    
    // 处理发音，但保持原有结构
    processText(wrapper, globalSettings);
    
    // 清除选择
    selection.removeAllRanges();
    console.debug('%c[Selection] 选中文本处理完成', 'color: #009688');
}