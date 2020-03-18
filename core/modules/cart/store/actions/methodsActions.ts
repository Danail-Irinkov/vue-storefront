import * as types from '@vue-storefront/core/modules/cart/store/mutation-types'
import { currentStoreView } from '@vue-storefront/core/lib/multistore'
import { Logger } from '@vue-storefront/core/lib/logger'
import EventBus from '@vue-storefront/core/compatibility/plugins/event-bus'
import { CartService } from '@vue-storefront/core/data-resolver'
import { preparePaymentMethodsToSync, createOrderData, createShippingInfoData } from '@vue-storefront/core/modules/cart/helpers'
import PaymentMethod from '../../types/PaymentMethod'
import ProCcApi from 'src/themes/default-procc/helpers/procc_api.js'
import keys from 'lodash-es/keys'
import isEmpty from 'lodash-es/isEmpty'
import size from 'lodash-es/size'

const methodsActions = {
  async pullMethods ({ getters, dispatch }, { forceServerSync }) {
    if (getters.isTotalsSyncRequired || forceServerSync) {
      await dispatch('syncShippingMethods', { forceServerSync })
      await dispatch('syncPaymentMethods', { forceServerSync })
    } else {
      Logger.debug('Skipping payment & shipping methods update as cart has not been changed', 'cart')()
    }
  },
  async setDefaultCheckoutMethods ({ getters, rootGetters, commit }) {
    if (!getters.getPaymentMethodCode) {
      commit(types.CART_UPD_PAYMENT, rootGetters['checkout/getDefaultPaymentMethod'])
    }
  },
  // created method for update cart selected shipping methods
  async updateCartSelectedShippingMethods ({ commit, getters, rootGetters }, updateData) {
    commit(types.CART_UPD_SELECTED_SHIPPING_METHODS, updateData)
  },
  // created method for set shipping method and selected shipping methods in checkout
  async setCheckoutShippingMethods ({ getters, rootGetters, commit }) {
    if ((!getters.getShippingMethods || isEmpty(getters.getShippingMethods))) {
      commit(types.CART_UPD_SHIPPING_METHODS, rootGetters['checkout/getShippingMethods'])
    }
    if ((!getters.getSelectedShippingMethods || isEmpty(getters.getSelectedShippingMethods))) {
      commit(types.CART_UPD_SELECTED_SHIPPING_METHODS, rootGetters['checkout/getSelectedShippingMethods'])
    }
  },
  async syncPaymentMethods ({ getters, rootGetters, dispatch }, { forceServerSync = false }) {
    if (getters.canUpdateMethods && (getters.isTotalsSyncRequired || forceServerSync)) {
      Logger.debug('Refreshing payment methods', 'cart')()
      let backendPaymentMethods: PaymentMethod[]

      const paymentDetails = rootGetters['checkout/getPaymentDetails']
      if (paymentDetails.country) {
        // use shipping info endpoint to get payment methods using billing address
        const shippingMethodsData = createOrderData({
          shippingDetails: rootGetters['checkout/getShippingDetails'],
          shippingMethods: rootGetters['checkout/getShippingMethods'],
          paymentMethods: rootGetters['checkout/getPaymentMethods'],
          paymentDetails: paymentDetails,
          selectedShippingMethods: rootGetters['checkout/getSelectedShippingMethods']
        })

        if (shippingMethodsData.country) {
          const { result } = await CartService.setShippingInfo(createShippingInfoData(shippingMethodsData))
          backendPaymentMethods = result.payment_methods || []
        }
      }
      if (!backendPaymentMethods || backendPaymentMethods.length === 0) {
        const { result } = await CartService.getPaymentMethods()
        backendPaymentMethods = result
      }

      const { uniqueBackendMethods, paymentMethods } = preparePaymentMethodsToSync(
        backendPaymentMethods,
        rootGetters['checkout/getNotServerPaymentMethods']
      )
      await dispatch('checkout/replacePaymentMethods', paymentMethods, { root: true })
      EventBus.$emit('set-unique-payment-methods', uniqueBackendMethods)
    } else {
      Logger.debug('Payment methods does not need to be updated', 'cart')()
    }
  },
  async updateShippingMethods ({ dispatch }, { shippingMethods, commit }) {
    if (shippingMethods && !isEmpty(shippingMethods)) {
      await dispatch('checkout/replaceShippingMethods', shippingMethods, { root: true })
    }
  },
  async updateBrandsDetails ({ dispatch }, { brandsDetails }) {
    if (brandsDetails && !isEmpty(brandsDetails)) {
      await dispatch('checkout/updateBrandsDetails', brandsDetails, { root: true })
    }
  },
  // created method for emit updateSelectedShippingMethods in checkout for update selected shipping methods
  async updateSelectedShippingMethods ({ dispatch }, { selectedShippingMethods, commit }) {
    console.log('selectedShippingMethods: ', selectedShippingMethods)
    console.log('size(selectedShippingMethods): ', size(selectedShippingMethods))
    if (selectedShippingMethods && size(selectedShippingMethods) > 0) {
      // for (let key in selectedShippingMethods){
      //   let shipping_method = selectedShippingMethods[key]
      //   if (shipping_method && shipping_method.isRapido){
      //     console.log('IS RAPIDO SHIPPING METHOD: ', shipping_method)
      //     shipping_method.cost = await dispatch('calculateRapidoShippingFee', { brandId: shipping_method.brand })
      //     console.log('shipping_method.cost', shipping_method.cost)
      //   }
      // }
      await dispatch('checkout/updateSelectedShippingMethods', selectedShippingMethods, { root: true })
    }
  },
  async calculateRapidoShippingFee ({ rootGetters }, {brandId}) {
    const cartId = rootGetters['cart/getCartToken']
    console.log('calculateShipmentCost shipping cartId ', cartId)
    console.log('calculateShipmentCost shipping brandId ', brandId)
    return ProCcApi().calculateShipmentCost({cartId, brandId}).then(async (result) => {
      console.log('calculateShipmentCost', result.data)
      let cost = parseFloat(result.data.shipping_cost).toFixed(2);
      console.log('calculateShipmentCost shipping cost ', cost)
      return cost
    }).catch((error) => {
      console.error('error', error)
      return Promise.reject(error)
    })
  },
  syncShippingMethods: async function ({getters, rootGetters, dispatch}, {forceServerSync = false}) {
    if (getters.canUpdateMethods && (getters.isTotalsSyncRequired || forceServerSync)) {
      const storeView = currentStoreView()
      Logger.debug('Refreshing shipping methods', 'cart')()
      const shippingDetails = rootGetters['checkout/getShippingDetails']

      // build address data with what we have
      const address = (shippingDetails) ? {
        region: shippingDetails.state,
        region_id: shippingDetails.region_id ? shippingDetails.region_id : 0,
        country_id: shippingDetails.country,
        street: [shippingDetails.streetAddress1, shippingDetails.streetAddress2],
        postcode: shippingDetails.zipCode,
        city: shippingDetails.city,
        region_code: shippingDetails.region_code ? shippingDetails.region_code : ''
      } : {country_id: storeView.tax.defaultCountry}

      if (getters.getCartItemsByBrand && !isEmpty(getters.getCartItemsByBrand)) {
        const brand_ids = keys(getters.getCartItemsByBrand);
        const cartId = rootGetters['cart/getCartToken']
        // added code for get shipping methods and set shipping methods and selected shipping method in vuex by shabbir
        await ProCcApi().updateShippingMethodsFromProCC({brand_ids, cartId})
      }
    } else {
      Logger.debug('Shipping methods does not need to be updated', 'cart')()
    }
  }
}

export default methodsActions
