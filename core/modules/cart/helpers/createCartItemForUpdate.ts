import config from 'config'
import CartItem from '@vue-storefront/core/modules/cart/types/CartItem';

const createCartItemForUpdate = (clientItem: CartItem, serverItem: any, updateIds: boolean = false): CartItem => {
  // const sku = clientItem.parentSku && config.cart.setConfigurableProductOptions ? clientItem.parentSku : clientItem.sku
  const sku = clientItem.sku ? clientItem.sku : clientItem.parentSku // Edited by dan to fix create order issue when product variants are not synced 30-12-2019
  const cartItem = {
    sku,
    qty: clientItem.qty,
    product_option: clientItem.product_option
  } as any as CartItem

  if (updateIds && serverItem.quote_id && serverItem.item_id) {
    return {
      ...cartItem,
      quoteId: serverItem.quote_id,
      item_id: serverItem.item_id
    }
  }

  return cartItem
}

export default createCartItemForUpdate
