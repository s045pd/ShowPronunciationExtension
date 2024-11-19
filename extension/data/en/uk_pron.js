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



const dataMap = {
    vowel,
    constant,
}

export { dataMap };