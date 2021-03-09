// Need this kebabcase, because lodash.kebabCase is doing it in a different way (numbers == words)
module.exports.kebabForLink = function (string) {
  string = string.replace(/&/g, 'And')
  let split_pattern = /[A-ZА-Я]*[a-zа-я0-9:;)?!'".]*/g;

  function split (text) {
    let words = text.match(split_pattern) || [];

    if (words.length === 1 && words[0].length === text.length) {
      if (/[a-z]/.test(text)) {
        words = splitCamelCase(text);
      }
    }

    return words;
  }

  function splitCamelCase (text) {
    let foundFirstUpperCase = /[A-Z]*/.exec(text);
    if (!foundFirstUpperCase) {
      return [text];
    }

    // PascalCase
    if (foundFirstUpperCase.index === 0) {
      return text.match(split_pattern);
    }

    // camelCase
    let words = text.slice(foundFirstUpperCase.index).match(split_pattern);
    words.unshift(text.slice(0, foundFirstUpperCase.index));
    return words;
  }

  function kebabCase (text) {
    return join(split(text));
  }

  function join (words) {
    // console.log('join words 3', words)
    if (!words.length) {
      return '-';
    }

    // let ret = String(words[0]).toLowerCase();
    let ret = '';

    for (let i = 0, n = words.length; i < n; i++) {
      if (words[i]) {
        words[i] = words[i].replace(':', '').replace('?', '').replace('!', '').replace(')', '')
          .replace('(', '').replace('.', '').replace('"', '').replace("'", '')
        // .replace(/[А-Я]*[а-я]*/g, '') // CYRILIC WORKAROUND!!!!!
        ret += (i > 0 ? '-' : '') + String(words[i]).toLowerCase();
      }
    }
    if (!ret) {
      return '-';
    }
    return ret;
  }

  Object.defineProperties(kebabCase, {
    split: {
      enumerable: true,
      value: split
    },
    join: {
      enumerable: true,
      value: join
    }
  });
  return kebabCase(string)
}
