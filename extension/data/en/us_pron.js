const long_vowel = {
    "type": "long_vowel",
    "color": "#FF6B6B",
    "description": "long ee as in 'fleece'"
}

const short_vowel = {
    "type": "short_vowel", 
    "color": "#FF6B6B",
    "description": "short i as in 'kit'"
}

const neutral_vowel = {
    "type": "neutral_vowel",
    "color": "#D4D4D4", 
    "description": "schwa as in 'comma'"
}

const voiced_constant = {
    "type": "voiced_constant",
    "color": "#FF9F9F",
    "description": "v as in 'vase'"
}

const unvoiced_constant = {
    "type": "unvoiced_constant",
    "color": "#FF9F9F", 
    "description": "f as in 'fan'"
}

const diphthong = {
    "type": "diphthong",
    "color": "#FFB6C1",
    "description": "two vowel sounds combined"
}

const vowel = {
    "ɪ": short_vowel,
    "i": long_vowel,     // 美式通常使用 i 而不是 iː
    "ʊ": short_vowel,
    "u": long_vowel,     // 美式通常使用 u 而不是 uː
    "ɛ": short_vowel,    // 美式使用 ɛ 而不是 e
    "ə": neutral_vowel,
    "ɝ": long_vowel,     // 美式重读的 r 化元音
    "ɚ": neutral_vowel,  // 美式轻读的 r 化元音
    "ɔ": long_vowel,     // 美式通常使用 ɔ 而不是 ɔː
    "æ": short_vowel,
    "ʌ": short_vowel,
    "ɑ": long_vowel,     // 美式通常使用 ɑ 而不是 ɑː
    "e": diphthong,
    "aɪ": diphthong,
    "ɔɪ": diphthong,
    "oʊ": diphthong,     // 美式使用 oʊ 而不是 əʊ
    "aʊ": diphthong,
    "ɪr": diphthong,     // 美式使用 ɪr 而不是 ɪə
    "ɛr": diphthong,     // 美式使用 ɛr 而不是 eə
    "ʊr": diphthong      // 美式使用 ʊr 而不是 ʊə
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
    "tʃ": unvoiced_constant,  // 美式通常使用 tʃ 而不是 ʧ
    "dʒ": voiced_constant     // 美式通常使用 dʒ 而不是 ʤ
}



const dataMap = {
    vowel,
    constant
}

export { dataMap };
