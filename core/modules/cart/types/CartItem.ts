import Product from '@vue-storefront/core/modules/catalog/types/Product'

import CartItemOption from './CartItemOption'
import CartItemTotals from './CartItemTotals'

export default interface CartItem extends Product {
  deduct_VAT: any,
  qty: number,
  procc_product_id: string,
  options: CartItemOption[],
  totals: CartItemTotals,
  server_item_id: number | string,
  server_cart_id: any,
  product_type?: string,
  item_id?: number | string,
  checksum?: string,
  quote_id?: string,
  store_brand: string
}
