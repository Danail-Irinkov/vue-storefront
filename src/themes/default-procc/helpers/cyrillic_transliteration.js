/**
 * Cyrillic<->Latin Transliteration helper
 */

const cyrillicPattern = /.*[\u0400-\u04FF].*/gi;

export default {
  /**
   * @return {string}
   */
  CyrToLat (text) {
    return transform(text, false)
  },
  /**
   * @return {string}
   */
  LatToCyr (text) {
    return transform(text, true)
  },
  isCyr (text) {
    return cyrillicPattern.test(text)
  },
  isLat (text) {
    return !cyrillicPattern.test(text)
  }
}

const _preset = 'uk'; // Original code had this _preset thing, but not planning to use it, I will tune the behaviour manually

const _firstLetterAssociations = {
  'а': 'a',
  'б': 'b',
  'в': 'v',
  '###в': 'w', /// '###' is special character to allow duplicate object keys, is removed at the end
  'ґ': 'g',
  'г': 'g',
  'д': 'd',
  'е': 'e',
  // "ё": "e",
  // "є": "ye",
  'ж': 'zh',
  'з': 'z',
  'и': 'i',
  // "і": "i",
  // "ї": "yi",
  'й': 'j',
  'к': 'k',
  'л': 'l',
  'м': 'm',
  'н': 'n',
  'о': 'o',
  'п': 'p',
  'р': 'r',
  'с': 's',
  'т': 't',
  'у': 'u',
  'ф': 'f',
  'х': 'h',
  'ц': 'c',
  'ч': 'ch',
  '###ч': '`',
  '######ч': '~',
  'ш': 'sh',
  '###ш': '[',
  '######ш': '{',
  'щ': 'sht',
  '###щ': ']',
  '######щ': '}',
  'ъ': 'y',
  // "ы": "i",
  'ь': '',
  // "э": "e",
  'ю': 'yu',
  '###ю': '\\',
  '######ю': '|',
  'я': 'ya',
  '###я': 'q'
};

if (_preset === 'uk') {
  Object.assign(_firstLetterAssociations, {
    // "г": "h",
    // "и": "y",
    // "й": "y",
    // 'х': 'kh',
    'ц': 'ts',
    'щ': 'shch'
    // "'": "",
    // "’": "",
    // "ʼ": "",
  });
}

const _associations = Object.assign({}, _firstLetterAssociations);

if (_preset === 'uk') {
  Object.assign(_associations, {
    // "є": "ie",
    // "ї": "i",
    // "й": "i",
    'ю': 'iu',
    'я': 'ia'
  });
}
const _firstLetterAssociationsInverted = {}
for (let key in _firstLetterAssociations) {
  _firstLetterAssociationsInverted[_firstLetterAssociations[key]] = key
}
const _associationsInverted = {}
for (let key in _associations) {
  _associationsInverted[_associations[key]] = key
}
function transform (input, inverted, spaceReplacement) {
  if (!input) {
    return '';
  }

  // We must normalize string for transform all unicode chars to uniform form
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/normalize
  const normalizedInput = input.normalize();

  let newStr = '';
  for (let i = 0; i < normalizedInput.length; i++) {
    const isUpperCaseOrLowercase = normalizedInput[i] === normalizedInput[i].toUpperCase();
    let strLowerCase = normalizedInput[i].toLowerCase();
    if (strLowerCase === ' ' && spaceReplacement) {
      newStr += spaceReplacement;
      continue;
    }
    let newLetter = _preset === 'uk' && strLowerCase === 'г' && i > 0 && normalizedInput[i - 1].toLowerCase() === 'з'
      ? 'gh'
      : inverted ? (i === 0 ? _firstLetterAssociationsInverted : _associationsInverted)[strLowerCase] : (i === 0 ? _firstLetterAssociations : _associations)[strLowerCase];
    if (typeof newLetter === 'undefined') {
      newStr += isUpperCaseOrLowercase ? strLowerCase.toUpperCase() : strLowerCase;
    } else {
      newStr += isUpperCaseOrLowercase ? newLetter.toUpperCase() : newLetter;
    }
  }
  return newStr.replace('###', '').replace('###', '');
}
