



<p align="center">
    <h1 align="center" >多语言发音助手(测试中)</h1>
    <p align="center"> 一个Chrome浏览器扩展程序，为多种语言提供发音指导，包括英语、中文、日语和韩语。</p>
        <p align="center">
          <a target="_blank" href="https://www.python.org/downloads/" title="Python version"><img src="https://img.shields.io/badge/python-%3E=_3.10-green.svg"></a>
          <a target="_blank" href="LICENSE" title="License: MIT"><img src="https://img.shields.io/badge/License-MIT-blue.svg"></a>
          <a target="_blank" href="https://chrome.google.com/webstore/detail/multilingual-pronunciation-assistant/your-extension-id" title="Chrome Extension"><img src="https://img.shields.io/badge/Chrome-Extension-orange.svg"></a>
</p>


> Our Goal：make you sound like a native, even further.



## 功能

### 多语言支持
  - 英语
    - 英式发音 🇬🇧
    - 美式发音 🇺🇸
  - ~~中文~~ 🇨🇳
  - ~~日语~~ 🇯🇵
  - ~~韩语~~ 🇰🇷


### 文本处理
  - 可处理整个页面或选中文本
  - Alt+鼠标悬停整段展示发音
  - 读音标记（音长、是否重读）


## 安装方法

> 暂未发布到Chrome商店，请手动安装

1. 克隆此仓库或下载ZIP文件
2. 打开Chrome浏览器，访问 `chrome://extensions/`
3. 在右上角启用"开发者模式"
4. 点击"加载已解压的扩展程序"并选择扩展程序目录

## 使用方法

1. 点击Chrome工具栏中的扩展程序图标
2. 选择要启用的语言
3. 点击"添加发音提示"处理当前页面
4. 或者选择任意文本查看其发音

## 项目结构
.github/ # GitHub Actions配置
├── workflows/ # 工作流配置
├── scripts/ # 自动脚本目录
extension/ # 扩展程序主目录
├── content/ # 内容脚本
├── data/ # 处理后的发音数据
├── icons/ # 扩展图标
├── manifest.json # 扩展配置文件
└── popup/ # 弹出窗口相关文件
raw/ # 原始数据目录
├── interim/ # 中间处理数据
├── processed/ # 最终处理数据
└── raw/ # 原始语料数据
scripts/ # 工具脚本
├── gather/ # 数据收集脚本
├── generate_icons.js # 图标生成脚本
└── updater.py # 更新脚本
tests/ # 测试目录
├── extension/ # 扩展测试
└── scripts/ # 脚本测试



### 数据来源

#### 英语发音数据
- 来源：[莱比锡语料库集合](https://wortschatz.uni-leipzig.de/en/download/English)
- 数据集：英语新闻语料库（2012）
- 格式：带IPA转写的词频列表
- 处理：使用gather.ipynb清理和标准化

#### 中文数据
- 拼音数据来自CC-CEDICT
- 包含声调标记和简繁体字映射

#### 日语数据
- 假名读音基于官方常用汉字表
- 罗马字转换遵循修改版平文式

#### 韩语数据
- 谚文发音规则来自韩国国立国语院
- 罗马化遵循韩语罗马字新转写法



### TODO

- 提交issues自动词库填充
- 语言补充
- 功能优化
- 发布到Chrome商店

