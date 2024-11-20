

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

    if (target.querySelector('.pronunciation-tooltip')) {
        console.warn('%c[Selection] 选中了发音提示元素，跳过', 'color: #009688');
        return;
    }
    if (target.querySelector('.word-text')) {
        console.warn('%c[Selection] 选中了word-text元素，跳过', 'color: #009688');
        return;
    }

    if (target.querySelector('.pronunciation-hidden')) {
        console.warn('%c[Selection] 选中了pronunciation-hidden元素，跳过', 'color: #009688');
        return;
    }

    if (target.querySelector('.pronunciation-processed')) {
        console.warn('%c[Selection] 选中了pronunciation-processed元素，跳过', 'color: #009688');
        return;
    }

    if (target.querySelector('.pronunciation-container')) {
        console.warn('%c[Selection] 选中了pronunciation-container元素，跳过', 'color: #009688');
        return;
    }

    return true;
}