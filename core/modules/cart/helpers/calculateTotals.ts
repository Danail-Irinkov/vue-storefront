import i18n from '@vue-storefront/i18n'
import sumBy from 'lodash-es/sumBy'
import filter from 'lodash-es/filter'
import ShippingMethod from '@vue-storefront/core/modules/cart/types/ShippingMethod'
import PaymentMethod from '@vue-storefront/core/modules/cart/types/PaymentMethod'
import CartItem from '@vue-storefront/core/modules/cart/types/CartItem'

const calculateTotals = (shippingMethod: ShippingMethod, paymentMethod: PaymentMethod, cartItems: CartItem[]) => {
  let totalByShippingMethod = shippingMethod ? getShippingCost(shippingMethod, cartItems) : []
  const shippingTax = shippingMethod ? sumBy(totalByShippingMethod, (s) => { return s.cost }) : 0
  const totalsArray = [
    {
      code: 'subtotal_incl_tax',
      title: i18n.t('Subtotal incl. tax'),
      value: sumBy(cartItems, (p) => p.qty * p.price_incl_tax),
      extension_attributes: null
    },
    {
      code: 'grand_total',
      title: i18n.t('Grand total'),
      value: sumBy(cartItems, (p) => p.qty * p.price_incl_tax) + shippingTax,
      extension_attributes: null
    }
  ]

  if (paymentMethod) {
    totalsArray.push({
      code: 'payment',
      title: i18n.t(paymentMethod.title),
      value: paymentMethod.cost_incl_tax,
      extension_attributes: null
    })
  }
  if (shippingMethod) {
    totalsArray.push({
      code: 'shipping',
      title: i18n.t('Shipping Total Cost'),
      value: shippingTax,
      extension_attributes: totalByShippingMethod

    })
  }
  return totalsArray
}
function getShippingCost (shippingMethods, cartItems) {
  let total_shipping = []
  let method = null
  let cartItemByBrand = null
  for (let brand_id in shippingMethods) {
    method = shippingMethods[brand_id]
    if (method) {
      cartItemByBrand = filter(cartItems, (product) => { return product.procc_brand_id === brand_id })
      total_shipping.push({name: method.name, cost: cartItemByBrand.length * method.cost})
    }
  }
  return total_shipping
}

export default calculateTotals
