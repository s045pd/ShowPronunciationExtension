document.getElementById('addPronunciation').addEventListener('click', () => {
    const settings = getSettings();
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {
            action: 'addPronunciation',
            settings: settings
        });
    });
});

// 获取当前设置
function getSettings() {
    return {
        enabledLanguages: {
            english: document.getElementById('english')?.checked || false,
            japanese: document.getElementById('japanese')?.checked || false,
            korean: document.getElementById('korean')?.checked || false
        },
        accent: {
            english: document.querySelector('input[name="english_accent"]:checked')?.value || 'us',
            japanese: 'standard',
            korean: 'standard'
        },
        selection: {
            enabled: document.getElementById('enableSelection')?.checked || false,
        }
    };
}

// 保存用户设置
function saveSettings() {
    const settings = getSettings();
    chrome.storage.sync.set({ pronunciationSettings: settings });
}

// 加载用户设置
function loadSettings() {
    const defaultSettings = {
        enabledLanguages: {
            english: true,
            japanese: true,
            korean: true
        },
        accent: {
            english: 'us',
            japanese: 'standard',
            korean: 'standard'
        },
        selection: {
            enabled: true,
        }
    };

    chrome.storage.sync.get('pronunciationSettings', (data) => {
        try {
            const settings = data.pronunciationSettings || defaultSettings;
            
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

        } catch (error) {
            console.error('Error loading settings:', error);
            chrome.storage.sync.set({ pronunciationSettings: defaultSettings });
        }
    });
}

// 添加设置变更监听
document.querySelectorAll('input[type="checkbox"], input[type="radio"]').forEach(input => {
    input.addEventListener('change', saveSettings);
});

// 添加语言选择联动
document.getElementById('english')?.addEventListener('change', function() {
    const accentOptions = document.querySelector('.accent-options');
    if (accentOptions) {
        accentOptions.style.display = this.checked ? 'block' : 'none';
    }
});

// 页面加载时恢复设置
document.addEventListener('DOMContentLoaded', loadSettings);

// 初始化设置
document.addEventListener('DOMContentLoaded', async () => {
    // 从 storage 获取当前设置
    const settings = await chrome.storage.sync.get('settings');
    const currentSettings = settings.settings || { enablePhoneticColor: true };
    
    // 设置复选框状态
    document.getElementById('enablePhoneticColor').checked = currentSettings.enablePhoneticColor;
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

// 更新语言启用状态的处理函数
function handleLanguageToggle(languageId, enabled) {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {
            action: 'toggleLanguage',
            language: languageId,
            enabled: enabled
        });
    });
}

// 更新英语口音的处理函数
function handleAccentChange(accentType) {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {
            action: 'updateAccent',
            accentType: accentType
        });
    });
}

// 添加语言切换事件监听
document.getElementById('english').addEventListener('change', function(e) {
    handleLanguageToggle('english', e.target.checked);
});

document.getElementById('japanese').addEventListener('change', function(e) {
    handleLanguageToggle('japanese', e.target.checked);
});

document.getElementById('korean').addEventListener('change', function(e) {
    handleLanguageToggle('korean', e.target.checked);
});

// 添加口音切换事件监听
document.getElementById('us_accent').addEventListener('change', function(e) {
    if (e.target.checked) {
        handleAccentChange('us');
    }
});

document.getElementById('uk_accent').addEventListener('change', function(e) {
    if (e.target.checked) {
        handleAccentChange('uk');
    }
}); 