const us_vowelColor = "#FFA07A";  // 基础色调（不使用）

const us_consonantColor = "#4A90E2";  // 深蓝色基调

const us_long_vowel = {
    "type": "long_vowel",
    "color": "#800080",  // 紫色
    "description": "long vowel"
}

const us_short_vowel = {
    "type": "short_vowel", 
    "color": "#FFA500",  // 橙色
    "description": "short vowel"
}

const us_neutral_vowel = {
    "type": "neutral_vowel",
    "color": "#FF0000",  // 红色
    "description": "neutral vowel"
}

const us_voiced_constant = {
    "type": "voiced_constant",
    "color": "#FFFFFF",  // 白色字体
    "backgroundColor": "#4169E1",  // 皇家蓝背景
    "description": "voiced consonant"
}

const us_unvoiced_constant = {
    "type": "unvoiced_constant",
    "color": "#4169E1",  // 皇家蓝
    "description": "unvoiced consonant"
}

const us_diphthong = {
    "type": "diphthong",
    "color": "#222222",  // 雅黑色
    "description": "diphthong"
}

const us_vowel = {
    "ɪ": us_short_vowel,
    "i": us_long_vowel,     // 美式通常使用 i 而不是 iː
    "ʊ": us_short_vowel,
    "u": us_long_vowel,     // 美式通常使用 u 而不是 uː
    "ɛ": us_short_vowel,    // 美式使用 ɛ 而不是 e
    "ə": us_neutral_vowel,
    "ɝ": us_long_vowel,     // 美式重读的 r 化元音
    "ɚ": us_neutral_vowel,  // 美式轻读的 r 化元音
    "ɔ": us_long_vowel,     // 美式通常使用 ɔ 而不是 ɔː
    "æ": us_short_vowel,
    "ʌ": us_short_vowel,
    "ɑ": us_long_vowel,     // 美式通常使用 ɑ 而不是 ɑː
    "e": us_diphthong,
    "aɪ": us_diphthong,
    "ɔɪ": us_diphthong,
    "oʊ": us_diphthong,     // 美式使用 oʊ 而不是 əʊ
    "aʊ": us_diphthong,
    "ɪr": us_diphthong,     // 美式使用 ɪr 而不是 ɪə
    "ɛr": us_diphthong,     // 美式使用 ɛr 而不是 eə
    "ʊr": us_diphthong      // 美式使用 ʊr 而不是 ʊə
}

const us_constant = {
    "p": us_unvoiced_constant,
    "b": us_voiced_constant,
    "t": us_unvoiced_constant,
    "d": us_voiced_constant,
    "k": us_unvoiced_constant,
    "g": us_voiced_constant,
    "f": us_unvoiced_constant,
    "v": us_voiced_constant,
    "θ": us_unvoiced_constant,
    "ð": us_voiced_constant,
    "s": us_unvoiced_constant,
    "z": us_voiced_constant,
    "ʃ": us_unvoiced_constant,
    "ʒ": us_voiced_constant,
    "h": us_unvoiced_constant,
    "m": us_voiced_constant,
    "n": us_voiced_constant,
    "ŋ": us_voiced_constant,
    "l": us_voiced_constant,
    "r": us_voiced_constant,
    "j": us_voiced_constant,
    "w": us_voiced_constant,
    "tʃ": us_unvoiced_constant,  // 美式通常使用 tʃ 而不是 ʧ
    "dʒ": us_voiced_constant     // 美式通常使用 dʒ 而不是 ʤ
}

const us_dataMap = {
    us_vowel,
    us_constant
}
