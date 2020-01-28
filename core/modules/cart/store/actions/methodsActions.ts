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
import map from 'lodash-es/map'
import find from 'lodash-es/find';

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
  async updateCartSelectedShippingMethods ({ commit }, updateData) {
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
    if (selectedShippingMethods && !isEmpty(selectedShippingMethods)) {
      await dispatch('checkout/updateSelectedShippingMethods', selectedShippingMethods, { root: true })
    }
  },
  async syncShippingMethods ({ getters, rootGetters, dispatch }, { forceServerSync = false }) {
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
        await ProCcApi().getShippingMethodByBrand(brand_ids)
          .then((result) => {
            let default_shipping_methods = {}
            let shipping_methods = {}
            for (let brand_id in result.data.shipping_methods) {
              let store_data = result.data.shipping_methods[brand_id]
              shipping_methods[brand_id] = result.data.shipping_methods[brand_id]['shipping_methods']
              let shipping_method_data = find(result.data.shipping_methods[brand_id]['shipping_methods'], (m) => { return m._id === store_data['default_shipping_method'] })
              default_shipping_methods[brand_id] = shipping_method_data
            }
            dispatch('updateShippingMethods', {shippingMethods: shipping_methods})
            dispatch('updateSelectedShippingMethods', {selectedShippingMethods: default_shipping_methods})
            dispatch('updateBrandsDetails', {brandsDetails: map(result.data.shipping_methods, (o) => { return o.brand; })})
            dispatch('setCheckoutShippingMethods')
          })
      }
    } else {
      Logger.debug('Shipping methods does not need to be updated', 'cart')()
    }
  }
}

export default methodsActions
