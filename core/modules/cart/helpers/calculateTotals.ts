import i18n from '@vue-storefront/i18n'
import sumBy from 'lodash-es/sumBy'
import filter from 'lodash-es/filter'
import ShippingMethod from '@vue-storefront/core/modules/cart/types/ShippingMethod'
import PaymentMethod from '@vue-storefront/core/modules/cart/types/PaymentMethod'
import CartItem from '@vue-storefront/core/modules/cart/types/CartItem'

const calculateTotals = (shippingMethod: ShippingMethod, paymentMethod: PaymentMethod, cartItems: CartItem[]) => {
  console.log('calculateTotals STARTED')
  const totalByShippingMethod = shippingMethod ? getShippingCostByBrand(shippingMethod, cartItems) : []
  const shippingTax = shippingMethod ? sumBy(totalByShippingMethod, (s) => { return s.cost }) : 0
  const subTotal = sumBy(cartItems, (p) => {
    if (p.deduct_VAT) { // VAT adjustment VAT calculation
      return p.qty * p.price_incl_tax * 0.82 // TODO NEED TO ACTUALLY CALCULATE THE ACTUAL COST
    } else {
      return p.qty * p.price_incl_tax
    }
  })

  const totalsArray = [
    {
      code: 'subtotal_incl_tax',
      title: i18n.t('Subtotal incl. tax'),
      value: subTotal,
      extension_attributes: null
    },
    {
      code: 'grand_total',
      title: i18n.t('Grand total'),
      value: subTotal + shippingTax,
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
function getShippingCostByBrand (shippingMethods, cartItems) {
  console.log('getShippingCostByBrand STARTED')
  let total_shipping = []
  let method = null
  let cartItemByBrand = null
  for (let brand_id in shippingMethods) {
    method = shippingMethods[brand_id]
    let is_VAT_deducted = false
    if (method) {
      cartItemByBrand = filter(cartItems, (product) => { return product.procc_brand_id === brand_id })
      if (cartItemByBrand[0].deduct_VAT) {
        is_VAT_deducted = true
      }
      let shipping_method_cost = is_VAT_deducted ? method.cost * 0.82 : method.cost // TODO: actually calculate the minus VFAT price according to Country VAT rate
      total_shipping.push({
        name: method.name,
        cost: method.isPerProduct ? cartItemByBrand.length * shipping_method_cost : shipping_method_cost}) // modified by Dan
    }
  }
  return total_shipping
}

export default calculateTotals
