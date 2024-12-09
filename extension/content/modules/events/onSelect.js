// 处理选中的文本
async function handleSelectedText(event) {
    console.warn('%c[Selection] 处理选中文本', 'color: #009688');
    if (!globalSettings.selection.enabled) {
        console.warn('%c[Selection] 选择功能未启用', 'color: #009688');
        return;
    }    
    const selection = window.getSelection();
    
    // 未选中文本
    if (!selection.toString().trim()) {
        console.warn('%c[Selection] 未选中文本', 'color: #009688');
        return;
    }

    // 获取选中文本范围
    const range = selection.getRangeAt(0);
    const container = range.commonAncestorContainer;
    const selectedText = selection.toString().trim();
    const language = detectLanguage(selectedText);
    console.debug('%c[Selection] 选中文本语言:', 'color: #009688', language);

    // 如果是英文文本，扩展选择范围
    if (language === 'english') {
        await expandEnglishSelection(range, selectedText);
    }

    // 打印更新后range的文本
    console.debug('%c[Selection] 更新后的选中文本:', 'color: #009688', range.toString());

    
    // // 获取所有可翻译的节点
    // for (const node of Array.from(container.childNodes)) {
    //     if (!IsTranslateTargetValid(node)) {
    //         continue;
    //     }

    //     // 创建一个包装容器来保存原始内容和样式
    //     const wrapper = document.createElement('span');
    //     wrapper.className = 'selected-text-wrapper';
        
    //     // 将选中内容移动到wrapper中，保持原始元素
    //     const fragment = range.extractContents();
    //     wrapper.appendChild(fragment);
        
    //     // 将wrapper插入到原位置
    //     range.insertNode(wrapper);
        
    //     // 处理发音，保持原有结构
    //     await processText(wrapper, language);
    //     debugger

    //     // 将处理后的内容替换回原节点的innerHTML
    //     node.innerHTML = wrapper
    // }

    // // 清除选择
    // // selection.removeAllRanges();
    // console.debug('%c[Selection] 选中文本处理完成', 'color: #009688');
}

