// 元音基础颜色 - 使用不同颜色区分类型
const vowelColor = "#FFA07A";  // 基础色调（不使用）

// 辅音基础颜色 - 使用蓝色系
const consonantColor = "#4A90E2";  // 深蓝色基调

// 元音类型定义
const long_vowel = {
    "type": "long_vowel", 
    "color": "#800080",  // 紫色
    "description": "long vowel"
}

const short_vowel = {
    "type": "short_vowel",
    "color": "#FFA500",  // 橙色
    "description": "short vowel"
}

const neutral_vowel = {
    "type": "neutral_vowel",
    "color": "#FF0000",  // 红色
    "description": "neutral vowel"
}

// 辅音类型定义
const voiced_constant = {
    "type": "voiced_constant",
    "color": "#FFFFFF",  // 白色字体
    "backgroundColor": "#4169E1",  // 皇家蓝背景
    "description": "voiced consonant"
}

const unvoiced_constant = {
    "type": "unvoiced_constant", 
    "color": "#4169E1",  // 皇家蓝
    "description": "unvoiced consonant"
}

const diphthong = {
    "type": "diphthong",
    "color": "#222222",  // 雅黑色
    "description": "diphthong"
}

const vowel = {
    "ɪ": short_vowel,
    "iː": long_vowel,
    "ʊ": short_vowel,
    "uː": long_vowel,
    "e": short_vowel,
    "ə": neutral_vowel,
    "ɜː": long_vowel,
    "ɔː": long_vowel,
    "æ": short_vowel,
    "ʌ": short_vowel,
    "ɑː": long_vowel,
    "eɪ": diphthong,
    "aɪ": diphthong,
    "ɔɪ": diphthong,
    "əʊ": diphthong,
    "aʊ": diphthong,
    "ɪə": diphthong,
    "eə": diphthong,
    "ʊə": diphthong
}

const constant = {
    "p": unvoiced_constant,
    "b": voiced_constant,
    "t": unvoiced_constant,
    "d": voiced_constant,
    "k": unvoiced_constant,
    "g": voiced_constant,
    "f": unvoiced_constant,
    "v": voiced_constant,
    "θ": unvoiced_constant,
    "ð": voiced_constant,
    "s": unvoiced_constant,
    "z": voiced_constant,
    "ʃ": unvoiced_constant,
    "ʒ": voiced_constant,
    "h": unvoiced_constant,
    "m": voiced_constant,
    "n": voiced_constant,
    "ŋ": voiced_constant,
    "l": voiced_constant,
    "r": voiced_constant,
    "j": voiced_constant,
    "w": voiced_constant,
    "ʧ": unvoiced_constant,
    "ʤ": voiced_constant
}