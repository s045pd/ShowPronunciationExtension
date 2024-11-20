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
            english: {
                us: document.getElementById('us_accent')?.checked || true,
                uk: document.getElementById('uk_accent')?.checked || false,
                enablePhoneticColor: document.getElementById('enablePhoneticColor')?.checked || true
            },
            japanese: {
                standard: true
            },
            korean: {
                standard: true
            }
        },
        selection: {
            enabled: document.getElementById('enableSelection')?.checked || false,
            modifierKey: document.querySelector('input[name="modifier_key"]:checked')?.value || 'ctrl'
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
            english: {
                us: true,
                uk: false
            },
            japanese: {
                standard: true
            },
            korean: {
                standard: true
            }
        },
        selection: {
            enabled: true,
            modifierKey: 'ctrl'
        }
    };

    chrome.storage.sync.get('pronunciationSettings', (data) => {
        try {
            const settings = data.pronunciationSettings || defaultSettings;
            
            // 设置语言启用状态
            const languageElements = {
                english: document.getElementById('english'),
                japanese: document.getElementById('japanese'),
                korean: document.getElementById('korean')
            };

            // 安全地设置复选框状态
            Object.entries(languageElements).forEach(([lang, element]) => {
                if (element && settings.enabledLanguages?.[lang] !== undefined) {
                    element.checked = settings.enabledLanguages[lang];
                }
            });
            
            // 设置口音选项
            const accentElements = {
                us: document.getElementById('us_accent'),
                uk: document.getElementById('uk_accent')
            };

            // 安全地设置单选按钮状态
            if (settings.accent?.english) {
                Object.entries(accentElements).forEach(([accent, element]) => {
                    if (element && settings.accent.english[accent] !== undefined) {
                        element.checked = settings.accent.english[accent];
                    }
                });
            }

            // 更新口音选项的显示状态
            const accentOptions = document.querySelector('.accent-options');
            if (accentOptions) {
                accentOptions.style.display = 
                    settings.enabledLanguages?.english ? 'block' : 'none';
            }

        } catch (error) {
            console.error('Error loading settings:', error);
            // 如果出错，使用默认设置
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