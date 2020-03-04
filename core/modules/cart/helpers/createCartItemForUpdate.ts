import config from 'config'
import CartItem from '@vue-storefront/core/modules/cart/types/CartItem';

const createCartItemForUpdate = (clientItem: CartItem, serverItem: any, updateIds: boolean = false): CartItem => {
  // const sku = clientItem.parentSku && config.cart.setConfigurableProductOptions ? clientItem.parentSku : clientItem.sku
  const sku = clientItem.sku ? clientItem.sku : clientItem.parentSku // Edited by dan to fix create order issue when product variants are not synced 30-12-2019
  console.log('createCartItemForUpdate', clientItem)
  const cartItem = {
    sku,
    qty: clientItem.qty,
    product_option: clientItem.product_option,
    procc_product_id: clientItem.procc_product_id, // Edited by shabbir for save product id in cart session
    item_id: clientItem.id,
    product_type: clientItem.type_id,
    name: clientItem.name,
    price: clientItem.price,
    store_brand: clientItem.store_brand // Edited by shabbir for save product id in cart session
  } as any as CartItem

  if (updateIds && serverItem.quote_id && serverItem.item_id) {
    return {
      ...cartItem,
      quote_id: serverItem.quote_id,
      item_id: serverItem.item_id
    }
  }

  return cartItem
}

export default createCartItemForUpdate
