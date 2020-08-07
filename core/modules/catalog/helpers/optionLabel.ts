/**
 * Helper method for getting attribute name - TODO: to be moved to external/shared helper
 *
 * @param {String} attributeCode
 * @param {String} optionId - value to get label for
 */
import toString from 'lodash-es/toString'

export function optionLabel (state, { attributeKey, searchBy = 'code', optionId }) {
  let attrCache = state.labels[attributeKey];
  console.log('optionLabel state', state)
  console.log('optionLabel attributeKey', attributeKey)
  console.log('optionLabel searchBy', searchBy)
  console.log('optionLabel optionId', optionId)
  console.log('optionLabel attrCache', attrCache)
  if (attrCache) {
    let label = attrCache[optionId];

    if (label) {
      return label
    }
  }
  let attr = state['list_by_' + searchBy][attributeKey];
  console.log('optionLabel attr', attr)
  if (attr) {
    let opt = attr.options.find((op) => { // TODO: cache it in memory
      if (toString(op.value) === toString(optionId)) {
        return op
      }
    }); // TODO: i18n support with  multi-website attribute names

    console.log('optionLabel opt', opt)
    if (opt) {
      if (!state.labels[attributeKey]) {
        state.labels[attributeKey] = {}
      }
      console.log('optionLabel state.labels[attributeKey]', state.labels[attributeKey])
      state.labels[attributeKey][optionId] = opt.label;
      return opt ? opt.label : optionId
    } else {
      return optionId
    }
  } else {
    return optionId
  }
}
