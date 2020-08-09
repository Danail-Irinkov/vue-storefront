import * as types from '@vue-storefront/core/modules/cart/store/mutation-types'
import { Logger } from '@vue-storefront/core/lib/logger'
import { CartService } from '@vue-storefront/core/data-resolver'
import isEmpty from 'lodash/isEmpty'
import {
  prepareShippingInfoForUpdateTotals,
  createOrderData,
  createShippingInfoData
} from '@vue-storefront/core/modules/cart/helpers'

const totalsActions = {
  async getTotals (context, { addressInformation, hasShippingInformation }) {
    if (hasShippingInformation) {
      let new_shipping = await CartService.setShippingInfo(addressInformation)
      // console.log('getTotals new_shipping', new_shipping.result.totals)
      return new_shipping
    }

    return CartService.getTotals()
  },
  async overrideServerTotals ({ commit, getters, dispatch }, { forceServerSync, addressInformation, hasShippingInformation }) {
    const { resultCode, result } = await dispatch('getTotals', { addressInformation, hasShippingInformation })

    if (resultCode === 200) {
      const totals = result.totals || result
      // Logger.info('Overriding server totals. ', 'cart', totals)()
      const itemsAfterTotal = prepareShippingInfoForUpdateTotals(totals.items)

      for (let key of Object.keys(itemsAfterTotal)) {
        const item = itemsAfterTotal[key]
        const product = { server_item_id: item.item_id, totals: item, qty: item.qty }
        await dispatch('updateItem', { product })
      }

      // UPDATING THE SELECTED SHIPPING METHODS PRICES AFTER RECALCULATION -> Added By Dan
      console.log('overrideServerTotals START Loop')
      let selectedShippingMethods = getters.getSelectedShippingMethods

      for (let seg of totals.total_segments) {
        if (seg.code === 'shipping' && seg.extension_attributes && seg.extension_attributes.length > 0) {
          for (let ship_method of seg.extension_attributes) {
            if (ship_method.brandId && ship_method.name === 'Rapido') {
              // Update currently selected Shipping method
              let rapido_cost = ship_method.cost
              let brand_id = ship_method.brandId

              for (let key in selectedShippingMethods) {
                if (!selectedShippingMethods.hasOwnProperty(key)) continue

                if ((!selectedShippingMethods[key].cost || forceServerSync) &&
                    String(key) === String(brand_id) &&
                    selectedShippingMethods[key].isRapido) {
                  selectedShippingMethods[key].cost = rapido_cost
                  await dispatch('updateSelectedShippingMethods', {selectedShippingMethods})
                  break
                }
              }
            }
          }
        }
      }
      // UPDATING THE SELECTED SHIPPING METHODS PRICES AFTER RECALCULATION -> Added By Dan - END

      commit(types.CART_UPD_TOTALS, { itemsAfterTotal, totals, platformTotalSegments: totals.total_segments })
      commit(types.CART_SET_TOTALS_SYNC)

      // we received payment methods as a result of this call, updating state
      if (result.payment_methods && getters.canUpdateMethods) {
        const backendPaymentMethods = result.payment_methods.map(method => ({ ...method, is_server_method: true }))
        dispatch('checkout/replacePaymentMethods', backendPaymentMethods, { root: true })
      }

      return
    } else {
      Logger.warn('The "cart/totalsActions" action is deprecated and will not be shipping price', 'cart')()
    }

    Logger.error(result, 'cart')()
  },
  async syncTotals ({ dispatch, getters, rootGetters }, payload: { forceServerSync: boolean, methodsData?: any } = { forceServerSync: false, methodsData: null }) {
    const methodsData = payload ? payload.methodsData : null
    // console.log('pullMethods payload.forceServerSync', payload.forceServerSync)

    await dispatch('pullMethods', { forceServerSync: payload.forceServerSync })

    if (getters.canSyncTotals && (getters.isTotalsSyncRequired || payload.forceServerSync)) {
      const shippingMethodsData = methodsData || createOrderData({
        shippingDetails: rootGetters['checkout/getShippingDetails'],
        shippingMethods: rootGetters['checkout/getShippingMethods'],
        paymentMethods: rootGetters['checkout/getPaymentMethods'],
        paymentDetails: rootGetters['checkout/getPaymentDetails'],
        selectedShippingMethods: rootGetters['checkout/getSelectedShippingMethods']
      })

      // console.log('syncTotals shippingMethodsData' , shippingMethodsData)
      // if (shippingMethodsData.country) {
      return dispatch('overrideServerTotals', {
        forceServerSync: payload.forceServerSync,
        hasShippingInformation: shippingMethodsData.selectedShippingMethods && !isEmpty(shippingMethodsData.selectedShippingMethods),
        addressInformation: createShippingInfoData(shippingMethodsData)
      })
      // }

      // Logger.error('Please do set the tax.defaultCountry in order to calculate totals', 'cart')()
    }
  },
  async refreshTotals ({ dispatch }, payload) {
    Logger.warn('The "cart/refreshTotals" action is deprecated and will not be supported with the Vue Storefront 1.11', 'cart')()
    return dispatch('syncTotals', payload)
  }
}

export default totalsActions
