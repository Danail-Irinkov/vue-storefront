import { GetterTree } from 'vuex'
import sumBy from 'lodash-es/sumBy'
import CartState from '../types/CartState'
import RootState from '@vue-storefront/core/types/RootState'
import AppliedCoupon from '../types/AppliedCoupon'
import { onlineHelper, isServer, calcItemsHmac } from '@vue-storefront/core/helpers'
import { calculateTotals, getProductByBrand } from '@vue-storefront/core/modules/cart/helpers'
import config from 'config'

const getters: GetterTree<CartState, RootState> = {
  getCartToken: state => state.cartServerToken,
  getLastSyncDate: state => state.cartServerLastSyncDate,
  getLastTotalsSyncDate: state => state.cartServerLastTotalsSyncDate,
  getShippingMethod: state => state.shipping,
  getPaymentMethod: state => state.payment,
  getLastCartHash: state => state.cartItemsHash,
  getCurrentCartHash: state => calcItemsHmac(state.cartItems, state.cartServerToken),
  isCartHashChanged: (state, getters) => getters.getCurrentCartHash !== state.cartItemsHash,
  isSyncRequired: (state, getters) => getters.isCartHashEmptyOrChanged || !state.cartServerLastSyncDate,
  isTotalsSyncRequired: (state, getters) => getters.isCartHashEmptyOrChanged || !state.cartServerLastTotalsSyncDate,
  isCartHashEmptyOrChanged: (state, getters) => !state.cartItemsHash || getters.isCartHashChanged,
  getCartItems: state => state.cartItems,
  getCartItemsByBrand: state => getProductByBrand(state.cartItems),
  isTotalsSyncEnabled: () => config.cart.synchronize_totals && onlineHelper.isOnline && !isServer,
  isCartConnected: state => !!state.cartServerToken,
  isCartSyncEnabled: () => config.cart.synchronize && onlineHelper.isOnline && !isServer,
  getFirstShippingMethod: state => state.shipping instanceof Array ? state.shipping : state.shipping,
  getFirstPaymentMethod: state => state.payment instanceof Array ? state.payment[0] : state.payment,
  getTotals: (state, getters) => (state.platformTotalSegments && onlineHelper.isOnline) ? state.platformTotalSegments : calculateTotals(getters.getSelectedShippingMethods, getters.getFirstPaymentMethod, state.cartItems),
  getItemsTotalQuantity: ({ cartItems }) => config.cart.minicartCountType === 'items' ? cartItems.length : sumBy(cartItems, p => p.qty),
  getCoupon: ({ platformTotals }): AppliedCoupon | false =>
    !(platformTotals && platformTotals.hasOwnProperty('coupon_code')) ? false : { code: platformTotals.coupon_code, discount: platformTotals.discount_amount },
  isVirtualCart: ({ cartItems }) => cartItems.every(itm => itm.type_id === 'downloadable' || itm.type_id === 'virtual'),
  canUpdateMethods: (state, getters) => {
    // console.log('getters.isCartSyncEnabled', getters.isCartSyncEnabled)
    // console.log('getters.isCartConnected', getters.isCartConnected)
    return getters.isCartSyncEnabled && getters.isCartConnected
  },
  canSyncTotals: (state, getters) => getters.isTotalsSyncEnabled && getters.isCartConnected,
  isCartEmpty: state => state.cartItems.length === 0,
  bypassCounter: state => state.connectBypassCount,
  getShippingMethodCode: state => state.shipping && state.shipping.method_code,
  getPaymentMethodCode: state => state.payment && state.payment.code,
  getShippingMethods: state => state.shippingMethods,
  getSelectedShippingMethods: state => state.selectedShippingMethods,
  getIsAdding: state => state.isAddingToCart,
  getIsMicroCartOpen: state => state.isMicrocartOpen

}

export default getters
