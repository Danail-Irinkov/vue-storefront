/**
 * camel case of provided text created by shabbir
 * @param {String} text
 */
export function camelCase (text) {
  if (!text) return ''
  text = text.toString()
  return text.split('_')
    .map((item) => {
      return item.charAt(0).toUpperCase() + item.substring(1);
    })
    .join(' ');
}
