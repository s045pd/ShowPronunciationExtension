

// 判断alt悬浮目标是否合法
function IsHoverTargetValid(target) {

    if (!target) {
        console.debug('%c[Validation] 目标为空', 'color: #3F51B5');
        return false;
    }
    const tagName = target.tagName;
    const text = target.textContent.trim();

    if (!text) {
        console.debug('%c[Validation] 目标文本为空', 'color: #3F51B5');
        return false;
    }
    if (['BODY', 'HTML'].includes(tagName)) {
        console.debug('%c[Validation] 目标为BODY或HTML', 'color: #3F51B5');
        return false;
    }
    if (tagName === 'DIV' && text.trim().length > 1000) {
        console.debug('%c[Validation] 目标为DIV且文本长度大于1000', 'color: #3F51B5');
        return false;
    }

    return true;
} 



// 判断目标是否可以进行翻译，一般为单个元素
function IsTranslateTargetValid(target) {

    if (!target) {
        console.debug('%c[Validation] 目标为空', 'color: #3F51B5');
        return false;
    }

    // 元素，检查是否可以进行翻译
    if (target.nodeType === 1) {
        const className = target.className;
        const targetClassNames = ['pronunciation-tooltip', 'word-text', 'pronunciation-container','pronunciation-hidden','word-container'];     

        if (targetClassNames.includes(className)) {
            console.debug('%c[Validation] 目标元素包含发音提示元素', 'color: #3F51B5');
            return false;
        }
        else if (Array.from(target.querySelectorAll('*')).some(child => child.className && targetClassNames.includes(child.className))) {
            console.debug('%c[Validation] 目标子集元素包含发音提示元素', 'color: #3F51B5');
            return false;
        }
    }

    if (target.nodeType === 3) {
       if (target.data.trim().length === 0) {
        console.debug('%c[Validation] 目标文本为空', 'color: #3F51B5');
        return false;
       }
    }

    console.debug('%c[Validation] 目标合法', 'color: #3F51B5', target);

    return true;
}