import find from 'lodash-es/find'

const getDefaultShippingMethods = (shippingMethods: any[]) => {
  let default_shipping_methods = []

  //TODO: Get Customer Expected Country and apply shipping method appropriately
  for (let brand_id in shippingMethods) {
    let default_shipping_method = find(shippingMethods[brand_id], (m) => { return !!m.set_as_default })
    if (!default_shipping_method) default_shipping_method = shippingMethods[brand_id][0]
    default_shipping_methods.push({brand_id, default_shipping_method })
  }
  return default_shipping_methods
}

export default getDefaultShippingMethods
