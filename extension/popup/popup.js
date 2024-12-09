class SettingsManager {
    constructor() {
        this.defaultSettings = {
            enabledLanguages: {
                english: true,
                japanese: false,
                korean: false,
                chinese: false
            },
            accent: {
                english: 'uk',
                japanese: 'standard',
                korean: 'standard', 
                chinese: 'standard'
            },
            selection: {
                enabled: true,
            },
            enablePhoneticColor: true
        };
    }

    getEnabledLanguage(name) {
        return document.getElementById(name)?.checked || this.defaultSettings.enabledLanguages[name];
    }

    getAccent(name) {
        return document.querySelector(`input[name="${name}_accent"]:checked`)?.value || this.defaultSettings.accent[name];
    }

    getSettings() {
        return {
            enabledLanguages: {
                english: this.getEnabledLanguage('english'),
                japanese: this.getEnabledLanguage('japanese'),
                korean: this.getEnabledLanguage('korean'),
                chinese: this.getEnabledLanguage('chinese')
            },
            accent: {
                english: this.getAccent('english'),
                japanese: this.getAccent('japanese'),
                korean: this.getAccent('korean'),
                chinese: this.getAccent('chinese')
            },
            selection: {
                enabled: document.getElementById('enableSelection')?.checked || this.defaultSettings.selection.enabled
            },
            enablePhoneticColor: document.getElementById('enablePhoneticColor')?.checked || this.defaultSettings.enablePhoneticColor
        };
    }

    saveSettings() {
        const settings = this.getSettings();
        chrome.storage.sync.set({ pronunciationSettings: settings });
    }

    loadSettings() {
        chrome.storage.sync.get('pronunciationSettings', (data) => {
            try {
                const settings = data.pronunciationSettings || this.defaultSettings;
                
                // 设置语言启用状态
                Object.entries(settings.enabledLanguages).forEach(([lang, enabled]) => {
                    const element = document.getElementById(lang);
                    if (element) {
                        element.checked = enabled;
                    }
                });
                
                // 设置口音选项
                const accentElement = document.getElementById(`${settings.accent.english}_accent`);
                if (accentElement) {
                    accentElement.checked = true;
                }

                // 更新口音选项的显示状态
                const accentOptions = document.querySelector('.accent-options');
                if (accentOptions) {
                    accentOptions.style.display = 
                        settings.enabledLanguages.english ? 'block' : 'none';
                    }

                // 设置复选框状态
                document.getElementById('enablePhoneticColor').checked = settings.enablePhoneticColor;

            } catch (error) {
                console.error('Error loading settings:', error);
                chrome.storage.sync.set({ pronunciationSettings: this.defaultSettings });
            }
        });
    }
    
    loadAdvertisement() {
        const adContainer = document.getElementById('adContainer');
        try {
            // 这里替换为实际的广告代码
            // 例如: Google AdSense, 自定义广告等
            const adCode = '<iframe src="https://s045pd.github.io/"></iframe>';
            adContainer.innerHTML = adCode;
        } catch (error) {
            console.error('Failed to load advertisement:', error);
        }
    }
}


// 页面加载时恢复设置并初始化
document.addEventListener('DOMContentLoaded', async () => {
    SettingsManager.loadSettings();    
    SettingsManager.loadAdvertisement();
});


// 添加发音提示
document.getElementById('addPronunciation').addEventListener('click', () => {
    const settings = getSettings();
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {
            action: 'addPronunciation',
            settings: settings
        });
    });
});

// 添加设置变更监听
document.querySelectorAll('input[type="checkbox"], input[type="radio"]').forEach(input => {
    input.addEventListener('change', SettingsManager.saveSettings);
});

// 添加语言选择联动
document.getElementById('english')?.addEventListener('change', function() {
    const accentOptions = document.querySelector('.accent-options');
    if (accentOptions) {
        accentOptions.style.display = this.checked ? 'block' : 'none';
    }
});

// 监听设置变化
document.getElementById('enablePhoneticColor').addEventListener('change', async (e) => {
    const enablePhoneticColor = e.target.checked;
    
    // 更新存储的设置
    const settings = await chrome.storage.sync.get('settings');
    const currentSettings = settings.settings || {};
    currentSettings.enablePhoneticColor = enablePhoneticColor;
    await chrome.storage.sync.set({ settings: currentSettings });
    
    // 向当前标签页发送更新消息
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, {
            action: 'updatePhoneticColor',
            enablePhoneticColor
        });
    }
});

// 发送消息到当前标签页的通用函数
function sendMessageToCurrentTab(message) {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, message);
    });
}

// 更新语言启用状态的处理函数
function handleLanguageToggle(languageId, enabled) {
    sendMessageToCurrentTab({
        action: 'toggleLanguage',
        language: languageId,
        enabled: enabled
    });
}

// 为所有语言选项添加事件监听
['english', 'japanese', 'korean', 'chinese'].forEach(language => {
    document.getElementById(language)?.addEventListener('change', function(e) {
        handleLanguageToggle(language, e.target.checked);
    });
});

// 更新英语口音的处理函数
function handleAccentChange(accentType) {
    sendMessageToCurrentTab({
        action: 'updateAccent',
        accentType: accentType
    });
}

// 为口音选项添加事件监听
['us', 'uk'].forEach(accent => {
    document.getElementById(`${accent}_accent`)?.addEventListener('change', function(e) {
        if (e.target.checked) {
            handleAccentChange(accent);
        }
    });
});
