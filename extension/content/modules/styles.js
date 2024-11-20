const styles = `
    .pronunciation-container {
        line-height: 2.4;
    }
    .word-container {
        display: inline-block;
        position: relative;
        text-align: center;
        margin: 0 2px;
    }
    .pronunciation-tooltip {
        position: absolute;
        background: transparent;
        color: #666;
        font-size: 0.7em;
        font-family: Arial, sans-serif;
        line-height: 1;
        top: -0.3em;
        left: 50%;
        transform: translateX(-50%);
        white-space: nowrap;
        letter-spacing: -0.2px;
    }
    .word-text {
        display: inline-block;
    }
    .pronunciation-processed {
        background-color: rgba(255, 255, 255, 0.05);
    }
    .selected-text {
        background-color: rgba(255, 0, 0, 0.2);
    }
    .selected-text-wrapper {
        display: inline;
        background-color: rgba(255, 255, 255, 0.05);
    }
    .pronunciation-tooltip span {
        display: inline-block;
        margin: 0 0.2px;
        line-height: 1.1;
    }
`;

function injectStyles() {
    const style = document.createElement('style');
    style.textContent = styles;
    document.head.appendChild(style);
} 