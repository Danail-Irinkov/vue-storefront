import * as types from '@vue-storefront/core/modules/cart/store/mutation-types'
import { Logger } from '@vue-storefront/core/lib/logger'
import config from 'config'
import EventBus from '@vue-storefront/core/compatibility/plugins/event-bus'
import { CartService } from '@vue-storefront/core/data-resolver'
import {
  productsEquals,
  createDiffLog,
  notifications,
  createCartItemForUpdate
} from '@vue-storefront/core/modules/cart/helpers'
import CartItem from '@vue-storefront/core/modules/cart/types/CartItem';
import { cartHooksExecutors } from './../../hooks'

const mergeActions = {
  async updateClientItem ({ dispatch }, { clientItem, serverItem }) {
    const cartItem = clientItem === null ? await dispatch('getItem', serverItem) : clientItem

    if (!cartItem || typeof serverItem.item_id === 'undefined') return
    const product = {
      server_item_id: serverItem.item_id,
      procc_product_id: serverItem.procc_product_id,
      sku: cartItem.sku,
      server_cart_id: serverItem.quote_id,
      prev_qty: cartItem.qty,
      product_option: serverItem.product_option,
      type_id: serverItem.product_type
    }

    await dispatch('updateItem', { product })
    EventBus.$emit('cart-after-itemchanged', { item: cartItem })
  },
  async updateServerItem ({ getters, rootGetters, commit, dispatch }, { clientItem, serverItem, updateIds }) {
    const diffLog = createDiffLog()
    let cartItem = createCartItemForUpdate(clientItem, serverItem, updateIds)
    const event = await CartService.updateItem(getters.getCartToken, cartItem)
    // console.timeEnd('updateServerItem0')
    const wasUpdatedSuccessfully = event.resultCode === 200
    Logger.debug('Cart item server sync' + event, 'cart')()
    diffLog.pushServerResponse({ status: event.resultCode, sku: clientItem.sku, result: event })

    if (!wasUpdatedSuccessfully && !serverItem) {
      commit(types.CART_DEL_ITEM, { product: clientItem, removeByParentSku: false })
      diffLog.pushNotification(notifications.outOfStock())
      return diffLog
    }

    if (!wasUpdatedSuccessfully && clientItem.item_id) {
      await dispatch('restoreQuantity', { cartItem, clientItem })
      return diffLog
    }

    if (!wasUpdatedSuccessfully) {
      commit(types.CART_DEL_NON_CONFIRMED_ITEM, { product: clientItem })
      return diffLog
    }

    if (!rootGetters['checkout/isUserInCheckout']) {
      const isThisNewItemAddedToTheCart = (!clientItem || !clientItem.server_item_id)
      diffLog.pushNotification(
        isThisNewItemAddedToTheCart ? notifications.productAddedToCart() : notifications.productQuantityUpdated()
      )
    }
    await dispatch('updateClientItem', { clientItem, serverItem: event.result })
    return diffLog
  },
  async synchronizeServerItem ({ dispatch }, { serverItem, clientItem, forceClientState, dryRun }) {
    // console.log('synchronizeServerItem Start')
    // console.time('synchronizeServerItem1')
    // console.time('synchronizeServerItem2')
    // console.time('synchronizeServerItem3')
    const diffLog = createDiffLog()

    if (!serverItem) {
      Logger.warn('No server item with sku ' + clientItem.sku + ' on stock.', 'cart')()
      diffLog.pushServerParty({ sku: clientItem.sku, status: 'no-item' })

      if (dryRun) return diffLog
      // console.log("forceClientState", forceClientState)
      if (forceClientState || !config.cart.serverSyncCanRemoveLocalItems) {
        console.log('updateServerItem Start sync')
        const updateServerItemDiffLog = await dispatch('updateServerItem', { clientItem, serverItem, updateIds: false })

        // console.timeEnd('synchronizeServerItem1')
        return diffLog.merge(updateServerItemDiffLog)
      }

      await dispatch('removeItem', { product: clientItem })
      return diffLog
    }

    if (serverItem.qty !== clientItem.qty || serverItem.deduct_VAT !== clientItem.deduct_VAT) { // edited by Dan to addd VAT check
      Logger.log('Wrong qty for ' + clientItem.sku, clientItem.qty, serverItem.qty)()
      diffLog.pushServerParty({ sku: clientItem.sku, status: 'wrong-qty', 'client-qty': clientItem.qty, 'server-qty': serverItem.qty })
      if (dryRun) return diffLog
      if (forceClientState || !config.cart.serverSyncCanModifyLocalItems) {
        const updateServerItemDiffLog = await dispatch('updateServerItem', { clientItem, serverItem, updateIds: true })

        // console.timeEnd('synchronizeServerItem2')
        return diffLog.merge(updateServerItemDiffLog)
      }

      await dispatch('updateItem', { product: serverItem })
    }

    // console.timeEnd('synchronizeServerItem3')
    return diffLog
  },
  async mergeClientItem ({ dispatch }, { clientItem, serverItems, forceClientState, dryRun }) {
    // console.log('mergeActions.ts mergeClientItem clientItem', clientItem)
    // console.log('mergeActions.ts mergeClientItem serverItem', serverItems)
    const serverItem = serverItems.find(itm => productsEquals(itm, clientItem))
    const diffLog = await dispatch('synchronizeServerItem', { serverItem, clientItem, forceClientState, dryRun })

    if (!diffLog.isEmpty()) return diffLog

    Logger.info('Server and client item with SKU ' + clientItem.sku + ' synced. Updating cart.', 'cart', 'cart')()
    if (!dryRun) {
      const product = {
        sku: clientItem.sku,
        server_cart_id: serverItem.quote_id,
        server_item_id: serverItem.item_id,
        product_option: serverItem.product_option,
        type_id: serverItem.product_type
      }

      await dispatch('updateItem', { product })
    }

    return diffLog
  },
  async mergeClientItems ({ dispatch }, { clientItems, serverItems, forceClientState, dryRun }) {
    const diffLog = createDiffLog()

    // Added by Dan to merge the quantities of same SKU items added separately
    let cl_items_sofar = {}
    for (let clientItem of clientItems) {
      if (cl_items_sofar[clientItem.procc_product_id] &&
        cl_items_sofar[clientItem.procc_product_id].procc_product_id === clientItem.procc_product_id &&
        cl_items_sofar[clientItem.procc_product_id].sku === clientItem.sku &&
        cl_items_sofar[clientItem.procc_product_id].price === clientItem.price &&
        cl_items_sofar[clientItem.procc_product_id].size === clientItem.size
      ) {
        console.log('Merging clientItem1', cl_items_sofar[clientItem.procc_product_id])
        console.log('Merging clientItem2', clientItem)
        // Update 1st CartItem's quantity + product2.qty
        cl_items_sofar[clientItem.procc_product_id].qty += clientItem.qty
        forceClientState = true
        // Remove 2nd from cart
        dispatch('cart/removeItem', { product: clientItem })

        // Merge change to clientItem1
        clientItem = cl_items_sofar[clientItem.procc_product_id]
      } else {
        cl_items_sofar[clientItem.procc_product_id] = clientItem
      }
      // Added by Dan to merge the quantities of same SKU items added separately - END

      try {
        const mergeClientItemDiffLog = await dispatch('mergeClientItem', { clientItem, serverItems, forceClientState, dryRun })
        diffLog.merge(mergeClientItemDiffLog)
      } catch (e) {
        Logger.debug('Problem syncing clientItem', 'cart', clientItem)()
      }
    }

    return diffLog
  },
  async mergeServerItem ({ dispatch, getters }, { clientItems, serverItem, forceClientState, dryRun }) {
    // console.log('mergeActions.ts mergeServerItem clientItems', clientItems)
    // console.log('mergeActions.ts mergeServerItem serverItem', serverItem)
    const diffLog = createDiffLog()
    const clientItem = clientItems.find(itm => productsEquals(itm, serverItem))
    console.log('mergeServerItem clientItem', clientItem)
    if (clientItem) return diffLog
    Logger.info('No client item for' + serverItem.sku, 'cart')()
    diffLog.pushClientParty({ sku: serverItem.sku, status: 'no-item' })
    if (dryRun) return diffLog

    if (forceClientState) {
      Logger.info('Removing product from cart', 'cart', serverItem)()
      Logger.log('Removing item' + serverItem.sku + serverItem.item_id, 'cart')()
      const cartItem = {
        sku: serverItem.sku,
        item_id: serverItem.item_id,
        quote_id: serverItem.quote_id
      } as any as CartItem
      console.log('mergeServerItem cartItem', cartItem)
      const resp = await CartService.deleteItem(getters.getCartToken, cartItem)
      console.log('mergeServerItem resp', resp)
      return diffLog.pushServerResponse({ status: resp.resultCode, sku: serverItem.sku, result: resp })
    }

    const productToAdd = await dispatch('getProductVariant', { serverItem })
    // console.log("productToAdd",productToAdd)
    if (productToAdd) {
      dispatch('addItem', { productToAdd, forceServerSilence: true })
      Logger.debug('Product variant for given serverItem has not found', 'cart', serverItem)()
    }

    console.log('mergeServerItem diffLog', diffLog)
    return diffLog
  },
  async mergeServerItems ({ dispatch }, { serverItems, clientItems, forceClientState, dryRun }) {
    const diffLog = createDiffLog()
    const definedServerItems = serverItems.filter(serverItem => serverItem)

    for (const serverItem of definedServerItems) {
      try {
        const mergeServerItemDiffLog = await dispatch('mergeServerItem', { clientItems, serverItem, forceClientState, dryRun })
        diffLog.merge(mergeServerItemDiffLog)
      } catch (e) {
        Logger.debug('Problem syncing serverItem', 'cart', serverItem)()
      }
    }

    return diffLog
  },
  async updateTotalsAfterMerge ({ dispatch, getters, commit }, { clientItems, dryRun }) {
    if (dryRun) return

    if (getters.isTotalsSyncRequired && clientItems.length > 0) {
      // await dispatch('syncShippingMethods', { forceServerSync: false }) // Added By Dan to Sync shipping methods upon cart modifications
      await dispatch('syncTotals')
    }

    commit(types.CART_SET_ITEMS_HASH, getters.getCurrentCartHash)
  },
  async merge ({ getters, dispatch }, { serverItems, clientItems, dryRun = false, forceClientState = false }) {
    const hookResult = cartHooksExecutors.beforeSync({ clientItems, serverItems })

    const diffLog = createDiffLog()
    const mergeParameters = {
      clientItems: hookResult.clientItems,
      serverItems: hookResult.serverItems,
      forceClientState,
      dryRun
    }
    // console.time('mergeClientItems')
    const mergeClientItemsDiffLog = await dispatch('mergeClientItems', mergeParameters)
    // console.timeEnd('mergeClientItems')
    console.log('mergeServerItems', serverItems)
    console.log('mergeServer mergeParameters', mergeParameters)
    // console.time('mergeServerItems')
    const mergeServerItemsDiffLog = await dispatch('mergeServerItems', mergeParameters)
    // console.timeEnd('mergeServerItems')
    dispatch('updateTotalsAfterMerge', { clientItems, dryRun })

    diffLog
      .merge(mergeClientItemsDiffLog)
      .merge(mergeServerItemsDiffLog)
      .pushClientParty({ status: getters.isCartHashChanged ? 'update-required' : 'no-changes' })
      .pushServerParty({ status: getters.isTotalsSyncRequired ? 'update-required' : 'no-changes' })

    EventBus.$emit('servercart-after-diff', { diffLog: diffLog, serverItems: hookResult.serverItem, clientItems: hookResult.clientItems, dryRun: dryRun })
    Logger.info('Client/Server cart synchronised ', 'cart', diffLog)()

    return diffLog
  }
}

export default mergeActions
