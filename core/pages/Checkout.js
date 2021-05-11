import i18n from '@vue-storefront/i18n';
import config from 'config';
import VueOfflineMixin from 'vue-offline/mixin';
import { mapGetters } from 'vuex';
import { StorageManager } from '@vue-storefront/core/lib/storage-manager';
import Composite from '@vue-storefront/core/mixins/composite';
import { currentStoreView } from '@vue-storefront/core/lib/multistore';
import { isServer } from '@vue-storefront/core/helpers';
import { Logger } from '@vue-storefront/core/lib/logger';
import find from 'lodash-es/find';
import cloneDeep from 'lodash-es/cloneDeep';
import SmoothScroll from 'src/themes/default-procc/resource/smooth-scroll.polyfills.min.js'
import {htmlDecode} from '../filters';
import ProCcApi from 'src/themes/default-procc/helpers/procc_api.js'

export default {
  name: 'Checkout',
  mixins: [Composite, VueOfflineMixin],
  data () {
    return {
      transactionId: '', // by ProCC
      stockCheckCompleted: false,
      loadShippingMethod: false,
      brandId: null,
      stockCheckOK: false,
      confirmation: null, // order confirmation from server
      activeSection: {
        personalDetails: true,
        shipping: false,
        payment: false,
        orderReview: false
      },
      order: {},
      personalDetails: {},
      shipping: {},
      // shippingMethods: {}, // SLECTED?
      payment: {},
      orderReview: {},
      cartSummary: {},
      validationResults: {
        personalDetails: { $invalid: true },
        shipping: { $invalid: true },
        payment: { $invalid: true }
      },
      shippingAmount: null, // by ProCC
      userId: null, // by ProCC
      focusedField: null,
      procc_order_ids: null, // by shabbir for ProCC
      mangopay_transaction_id: null
    }
  },
  computed: {
    ...mapGetters({
      getTotals: 'cart/getTotals',
      isVirtualCart: 'cart/isVirtualCart',
      getCartItemsByBrand: 'cart/getCartItemsByBrand',
      currentImage: 'procc/getHeadImage', // by ProCC
      isThankYouPage: 'checkout/isThankYouPage'
    })
  },
  beforeMount () {
    this.$store.dispatch('checkout/load')
    this.$store.dispatch('checkout/setModifiedAt', Date.now())
    // TODO: Use one event with name as apram
    this.$bus.$on('cart-after-update', this.onCartAfterUpdate)
    this.$bus.$on('cart-after-delete', this.onCartAfterUpdate)
    this.$bus.$on('checkout-after-personalDetails', this.onAfterPersonalDetails)
    this.$bus.$on('checkout-after-shippingDetails', this.onAfterShippingDetails)
    this.$bus.$on('checkout-after-paymentDetails', this.onAfterPaymentDetails)
    this.$bus.$on('checkout-after-cartSummary', this.onAfterCartSummary)
    this.$bus.$on('checkout-before-placeOrder', this.onBeforePlaceOrder)
    this.$bus.$on('checkout-do-placeOrder', this.onDoPlaceOrder)
    this.$bus.$on('checkout-before-edit', this.onBeforeEdit)
    this.$bus.$on('order-after-placed', this.onAfterPlaceOrder)
    this.$bus.$on('show-shipping-method-modal', this.showShippingMethodModal)
    this.$bus.$on('place-magento-order', this.PlaceMagentoOrder)
    this.$bus.$on('checkout-before-shippingMethods', this.onBeforeShippingMethods)
    this.$bus.$on('checkout-after-shippingMethodChanged', this.onAfterShippingMethodChanged)
    this.$bus.$on('checkout-after-validationError', this.focusField)
    if (!this.isThankYouPage) {
      this.$store.dispatch('cart/load', { forceClientState: true }).then(() => {
        if (this.$store.state.cart.cartItems.length === 0) {
          this.notifyEmptyCart()
          this.$router.push(this.localizedRoute('/'))
        } else {
          this.stockCheckCompleted = false
          const checkPromises = []
          for (let product of this.$store.state.cart.cartItems) { // check the results of online stock check
            if (product.onlineStockCheckid) {
              checkPromises.push(new Promise((resolve, reject) => {
                StorageManager.get('syncTasks').getItem(product.onlineStockCheckid, (err, item) => {
                  if (err || !item) {
                    if (err) Logger.error(err)()
                    resolve(null)
                  } else {
                    product.stock = item.result
                    resolve(product)
                  }
                })
              }))
            }
          }
          Promise.all(checkPromises).then((checkedProducts) => {
            this.stockCheckCompleted = true
            this.stockCheckOK = true
            for (let chp of checkedProducts) {
              if (chp && chp.stock) {
                if (!chp.stock.is_in_stock) {
                  // console.log('chp.stock.is_in_stock', chp.stock)
                  this.stockCheckOK = false
                  chp.errors.stock = i18n.t('Out of stock!')
                  this.notifyOutStock(chp)
                }
              }
            }
          })
        }
      })
    }
    // Disabled By Dan
    // const storeView = currentStoreView()
    // let country = this.$store.state.checkout.shippingDetails.country
    // if (!country) country = storeView.i18n.defaultCountry
    // this.$bus.$emit('checkout-before-shippingMethods', country)

    // Added by Shab - Not usre why needed
    // this.$store.dispatch('cart/syncPaymentMethods', { forceServerSync: true })
  },
  beforeDestroy () {
    this.$store.dispatch('checkout/setModifiedAt', 0) // exit checkout
    this.$bus.$off('cart-after-update', this.onCartAfterUpdate)
    this.$bus.$off('cart-after-delete', this.onCartAfterUpdate)
    this.$bus.$off('checkout-after-personalDetails', this.onAfterPersonalDetails)
    this.$bus.$off('checkout-after-shippingDetails', this.onAfterShippingDetails)
    this.$bus.$off('checkout-after-paymentDetails', this.onAfterPaymentDetails)
    this.$bus.$off('checkout-after-cartSummary', this.onAfterCartSummary)
    this.$bus.$off('checkout-before-placeOrder', this.onBeforePlaceOrder)
    this.$bus.$off('checkout-do-placeOrder', this.onDoPlaceOrder)
    this.$bus.$off('checkout-before-edit', this.onBeforeEdit)
    this.$bus.$off('order-after-placed', this.onAfterPlaceOrder)
    this.$bus.$off('place-magento-order', this.PlaceMagentoOrder)
    this.$bus.$off('checkout-before-shippingMethods', this.onBeforeShippingMethods)
    this.$bus.$off('checkout-after-shippingMethodChanged', this.onAfterShippingMethodChanged)
    this.$bus.$off('checkout-after-validationError', this.focusField)
  },
  watch: {
    '$route': 'activateHashSection',
    'OnlineOnly': 'onNetworkStatusCheck'
  },
  methods: {
    onCartAfterUpdate (payload) {
      if (this.$store.state.cart.cartItems.length === 0) {
        this.notifyEmptyCart()
        this.$router.push(this.localizedRoute('/'))
      }
    },
    async onAfterShippingMethodChanged ({selectedShippingMethods, brand_id_changed}) {
      let selectedShippingMethods2 = {}
      let selectedShippingMethods_current = this.$store.getters['checkout/getSelectedShippingMethods']

      for (let brand_id in selectedShippingMethods) {
        brand_id = String(brand_id)
        brand_id_changed = String(brand_id_changed)
        if (!selectedShippingMethods.hasOwnProperty(brand_id)) continue
        // console.log('onAfterShippingMethodChanged brand_id_changed', brand_id_changed)
        // console.log('onAfterShippingMethodChanged brand_id', brand_id)

        selectedShippingMethods2[brand_id] = {...find(this.$store.state.checkout.shippingMethods[brand_id], (s) => { return s._id === selectedShippingMethods[brand_id] })}

        if (brand_id === brand_id_changed && selectedShippingMethods2[brand_id].isRapido) {
          selectedShippingMethods2[brand_id].cost = null
        } else if (selectedShippingMethods_current[brand_id] && selectedShippingMethods_current[brand_id]._id === selectedShippingMethods[brand_id]) {
          selectedShippingMethods2[brand_id].cost = String(selectedShippingMethods_current[brand_id].cost)
        } else {
          selectedShippingMethods2[brand_id].cost = String(selectedShippingMethods2[brand_id].cost)
        }
      }
      // console.log('onAfterShippingMethodChanged shippingMethods', shippingMethods)
      // console.log('onAfterShippingMethodChanged selectedShippingMethods2', selectedShippingMethods2)
      this.$bus.$emit('loading-summary', true)
      this.$bus.$emit('loading-order-summary', true)

      // TODO: Can we remove one of these vuex calls Shab  ?
      await this.$store.dispatch('checkout/updateSelectedShippingMethods', selectedShippingMethods2)
      await this.$store.dispatch('cart/updateCartSelectedShippingMethods', selectedShippingMethods2)
      // this.shippingMethods = selectedshippingMethods
      await this.$store.dispatch('cart/syncTotals', { forceServerSync: true })

      this.$bus.$emit('loading-summary', false)
      this.$bus.$emit('loading-order-summary', false)

      this.$forceUpdate()
    },
    notifyEmptyCart () {
      this.$bus.$emit('notification-progress-stop'); // Added by Dan
      this.$store.dispatch('notification/spawnNotification', {
        type: 'warning',
        message: this.$t('Shopping cart is empty. Please add some products before entering Checkout'),
        action1: { label: this.$t('OK') }
      })
    },
    async onBeforeShippingMethods (country) {
      console.log('onBeforeShippingMethods START')
      this.$bus.$emit('loading-order-summary', true)

      // Added By Dan To trigger Rapido Cost Spinners
      let selectedShippingMethods_current = this.$store.getters['checkout/getSelectedShippingMethods']
      for (let brand_id in selectedShippingMethods_current) {
        let sm = selectedShippingMethods_current[brand_id]
        if (sm.isRapido) {
          selectedShippingMethods_current[brand_id].cost = null
        }
      }
      await this.$store.dispatch('checkout/updateSelectedShippingMethods', selectedShippingMethods_current)
      // Added By Dan To trigger Rapido Cost Spinners - END

      await this.$store.dispatch('checkout/updatePropValue', ['country', country])
      await this.$store.dispatch('cart/syncTotals', { forceServerSync: true }) // Disabled by Dan for too much requests
      this.$forceUpdate()
      this.$bus.$emit('loading-order-summary', false)
    },
    async onAfterPlaceOrder (payload) {
      this.confirmation = payload.confirmation
      // edited by shabbir for not need
      // if (this.$store.state.checkout.personalDetails.createAccount) {
      //   console.log('Dispatching LOGIN REQUEST AT onAfterPlaceOrder')
      //   await this.$store.dispatch('user/login', { username: this.$store.state.checkout.personalDetails.emailAddress, password: this.$store.state.checkout.personalDetails.password })
      // }

      // Scrolling to top HERE to prepare for the ProCC Thank you page
      window.scrollTo(0, 0); // Added By Dan

      this.$store.dispatch('checkout/setThankYouPage', true)
      this.$store.dispatch('user/getOrdersHistory', { refresh: true, useCache: true })
      Logger.debug(payload.order)()
    },
    onBeforeEdit (section) {
      this.activateSection(section)
    },
    onBeforePlaceOrder (payload) {
      // Weird code again with no explaination by Shab
      // Added by Dan 02-01-2020
      this.$bus.$emit('checkout-do-placeOrder', {})
    },
    onAfterCartSummary (receivedData) {
      this.cartSummary = receivedData
    },
    // created function for show shipping method modal by brand id
    showShippingMethodModal (brand_id) {
      this.brandId = brand_id
      this.loadShippingMethod = true
      this.$bus.$emit('modal-show', 'modal-shipping-method')
    },
    onDoPlaceOrder (additionalPayload) {
      // add by shabbir for show spinner
      this.$bus.$emit('notification-progress-start', i18n.t('Processing order...'))
      if (this.$store.state.cart.cartItems.length === 0) {
        this.notifyEmptyCart()
        this.$router.push(this.localizedRoute('/'))
      } else {
        this.payment.paymentMethodAdditional = additionalPayload;
        // Change by shabbir
        setTimeout(() => {
          this.placeOrder()
        }, 400)
      }
    },
    // Removed order review section active functionality by shabbir
    onAfterPaymentDetails (receivedData, validationResult) {
      this.payment = receivedData
      this.validationResults.payment = validationResult
      this.savePaymentDetails()
    },
    onAfterShippingDetails (receivedData, validationResult) {
      this.shipping = receivedData
      this.validationResults.shipping = validationResult
      this.activateSection('payment')
      this.saveShippingDetails()

      const storeView = currentStoreView()
      storeView.tax.defaultCountry = this.shipping.country
    },
    onAfterPersonalDetails (receivedData, validationResult) {
      this.personalDetails = receivedData
      this.validationResults.personalDetails = validationResult

      if (this.isVirtualCart === true) {
        this.activateSection('payment')
      } else {
        this.activateSection('shipping')
      }
      this.savePersonalDetails()
      this.focusedField = null
    },
    onNetworkStatusCheck (isOnline) {
      this.checkConnection(isOnline)
    },
    async checkStocksProCC () { // Added By Dan
      // TODO: Copy the needed verifications here from 'checkStocks()' + Check Stock with ProCC + Show which Product is out of stock
      return true
    },
    checkStocks () {
      let isValid = true
      for (let child of this.$children) {
        if (child.hasOwnProperty('$v')) {
          if (child.$v.$invalid) {
            // Check if child component is Personal Details.
            // If so, then ignore validation of account creation fields.
            if (child.$v.hasOwnProperty('personalDetails')) {
              if (child.$v.personalDetails.$invalid) {
                isValid = false
                break
              }
            } else {
              isValid = false
              break
            }
          }
        }
      }

      if (typeof navigator !== 'undefined' && navigator.onLine) {
        if (this.stockCheckCompleted) {
          if (!this.stockCheckOK) {
            isValid = false
            console.log('notifyNotAvailable checkStocks')
            this.notifyNotAvailable()
          }
        } else {
          this.notifyStockCheck()
          isValid = false
        }
      }
      return isValid
    },
    activateHashSection () {
      if (!isServer) {
        let urlStep = window.location.hash.replace('#', '')
        if (this.activeSection.hasOwnProperty(urlStep) && this.activeSection[urlStep] === false) {
          this.activateSection(urlStep)
        } else if (urlStep === '') {
          this.activateSection('personalDetails')
        }
      }
    },
    checkConnection (isOnline) {
      if (!isOnline) {
        this.notifyNoConnection()
      }
    },
    activateSection (sectionToActivate) {
      for (let section in this.activeSection) {
        this.activeSection[section] = false
      }
      this.activeSection[sectionToActivate] = true

      // TODO: Scroll the page based on the #anchors -> '#' + sectionToActivate
      // console.log('activateSection scroll', sectionToActivate)
      // let anchor = document.querySelector('#' + sectionToActivate); // NOT GETTING THE ELEMENT WITH THIS QUERY? CAN YOU FIX?
      // console.log('activateSection anchor: ', anchor)
      let scroll = new SmoothScroll() // Added By Dan
      // Workaround for not being able to select the exact elements
      // TODO: GET ACCURATE PIXEL LOCATIONS FOR THE SCROLLS -> NOW FAILS WITH MANY PRODUCTS
      let scroll_offset = sectionToActivate === 'shipping' ? 833 : sectionToActivate === 'payment' ? 1183 : 0
      scroll.animateScroll(scroll_offset, null, { // Added By Dan
        durationMin: 1183,
        speed: 1200,
        // offset: 300,
        // clip: true,
        // speedAsDuration: true,
        easing: 'easeOutQuint'
      }); // Added By Dan
      // console.log('activateSection scroll: ', scroll)
      if (!isServer) window.location.href = window.location.origin + window.location.pathname + '#' + sectionToActivate
    },
    // This method checks if there exists a mapping of chosen payment method to one of Magento's payment methods.
    getPaymentMethod () {
      let paymentMethod = this.payment.paymentMethod
      if (config.orders.payment_methods_mapping.hasOwnProperty(paymentMethod)) {
        paymentMethod = config.orders.payment_methods_mapping[paymentMethod]
      }
      return paymentMethod
    },
    async prepareProCCOrder () {
      // console.log('this.$store.state.cart.selectedShippingMethods', this.$store.state.cart.selectedShippingMethods)

      const storeView = currentStoreView()
      const storeCode = storeView.storeCode ? storeView.storeCode : 'failed to find store url'

      this.order = {
        customer_user: this.$store.state.user.current ? this.$store.state.user.current._id : '', // edited by shabbir for get customer id
        customer_brand: this.$store.state.user.current && this.$store.state.user.current.user_type && this.$store.state.user.current.user_type.active_brand ? this.$store.state.user.current.user_type.active_brand : '', // edited by shabbir for get customer brand
        cartId: this.$store.state.cart.cartServerToken ? this.$store.state.cart.cartServerToken.toString() : '',
        products: this.$store.state.cart.cartItems,
        order_ids: this.procc_order_ids ? this.procc_order_ids : null, // Added by shabbir ProCC
        mp_transaction: this.mangopay_transaction_id ? this.mangopay_transaction_id : null, // Added by shabbir ProCC
        store_brand: this.currentImage.brand,
        store_code: storeCode,
        generateInvoice: !!this.payment.taxId,
        // Added by Dan ProCC -> TODO: need to charge 1 shipping fee per brand ordered from and store separate shipping methods for each brand
        shipping_amount: this.$store.state.cart.platformTotalSegments[1].value,
        // Added by Dan ProCC
        addressInformation: {
          billingAddress: {
            region: this.payment.state,
            region_id: this.payment.region_id ? this.payment.region_id : 0,
            country: this.payment.country,
            streetName: this.payment.streetAddress,
            streetNumber: this.payment.apartmentNumber,
            telephone: this.payment.phoneNumber,
            postcode: this.payment.zipCode,
            city: this.payment.city,
            state: this.payment.state,
            firstname: this.payment.firstName,
            lastname: this.payment.lastName,
            email: this.personalDetails.emailAddress,
            region_code: this.payment.region_code ? this.payment.region_code : '',
            company: this.payment.company,
            vat_id: this.payment.taxId,
            vat_id_is_validated: this.payment.vat_id_is_validated,
            ISO_code: this.payment.ISO_code ? this.payment.ISO_code : '',
            country_id: this.payment.country_id ? this.payment.country_id : '',
            site_id: this.payment.site_id ? this.payment.site_id : '',
            street_id: this.payment.street_id ? this.payment.street_id : '',
            street_type: this.payment.street_type ? this.payment.street_type : '',
            city_type: this.payment.city_type ? this.payment.city_type : '',
            generateInvoice: !!this.payment.taxId
          },
          selected_shipping_methods: this.$store.state.cart.selectedShippingMethods ? {...this.$store.state.cart.selectedShippingMethods} : {},
          payment_method_code: this.getPaymentMethod(),
          payment_method_additional: this.payment.paymentMethodAdditional,
          shippingExtraFields: this.shipping.extraFields
        }
      }

      // Workaround for missing shipping methods -> cant find where the method disappears but it happens when a product from a second brand is added to the cart and Default shipping method is choosen, and not changed by the user
      try {
        for (let key in this.order.products) {
          let product = this.order.products[key]
          // console.log('prepareProCCOrder product', product)
          // console.log('prepareProCCOrder this.order.products', this.order.products)
          // console.log('prepareProCCOrder this.$store.state.cart', this.$store.state.cart.cartItems[0])
          if (!this.order.selected_shipping_methods || !this.order.selected_shipping_methods[product.brand_id]) {
            // Update Shipping methods from ProCC
            // let brand_ids = []
            // for (let key2 in this.order.products) {
            //   brand_ids.push(this.order.products[key2].brand_id)
            // }
            // console.log('prepareProCCOrder brand_ids', brand_ids)
            // console.log('prepareProCCOrder this.order.cartId', this.order.cartId)
            // await ProCcApi().updateShippingMethodsFromProCC({brand_ids, cartId: this.order.cartId})
            // await this.sleep(500)
            console.log('prepareProCCOrder Updated Shipping Methods', this.$store.state.cart.selectedShippingMethods)

            this.order.selected_shipping_methods = this.$store.state.cart.selectedShippingMethods ? {...this.$store.state.cart.selectedShippingMethods} : {}
            console.log('prepareProCCOrder SHIPPING METHODS UPDATED', this.order.selected_shipping_methods)
            break
          }
        }
      } catch (e) {
        console.log('Workaround for missing shipping methods Error: ', e)
      }
      // Workaround - END

      if (!this.isVirtualCart) {
        this.order.addressInformation.shippingAddress = {
          region: this.shipping.state,
          region_id: this.shipping.region_id ? this.shipping.region_id : 0,
          country: this.shipping.country,
          streetName: this.shipping.streetAddress,
          streetNumber: this.shipping.apartmentNumber,
          company: 'NA', // TODO: Fix me! https://github.com/DivanteLtd/vue-storefront/issues/224
          telephone: this.shipping.phoneNumber,
          postcode: this.shipping.zipCode,
          city: this.shipping.city,
          state: this.shipping.state,
          firstname: this.shipping.firstName,
          lastname: this.shipping.lastName,
          email: this.personalDetails.emailAddress,
          ISO_code: this.shipping.ISO_code ? this.shipping.ISO_code : '',
          country_id: this.shipping.country_id ? this.shipping.country_id : '',
          site_id: this.shipping.site_id ? this.shipping.site_id : '',
          street_id: this.shipping.street_id ? this.shipping.street_id : '',
          street_type: this.shipping.street_type ? this.shipping.street_type : '',
          city_type: this.shipping.city_type ? this.shipping.city_type : ''
        }
      }
      return this.order
    },
    async placeOrder () {
      try {
        this.checkConnection({ online: typeof navigator !== 'undefined' ? navigator.onLine : true })
        // if (this.checkStocks()) {
        if (await this.checkStocksProCC()) { // Added By Dan
          await this.placeProCCOrder()
        } else {
          console.log('notifyNotAvailable placeOrder')
          this.notifyNotAvailable()
        }
      } catch (e) {
        console.log('placeOrder Err', e)
      }
    },
    // Created function by Shabbir for place order in ProCC
    async placeProCCOrder () {
      try {
        let order_data = await this.prepareProCCOrder()
        console.log('order_data------------ placeProCCOrder', order_data)
        let result = await this.ProCcAPI.addNewOrder(order_data, order_data.store_brand)
        if (result.data.message_type === 'success') {
          this.procc_order_ids = result.data.order_ids
          await this.ProCCOrderPayment(result.data.order_ids)
        } else {
          throw new Error(result.data.message)
        }
      } catch (e) {
        console.log('placeProCCOrder Err', e)
        this.$bus.$emit('notification-progress-stop');
        this.$store.dispatch('notification/spawnNotification', {
          type: 'error',
          message: this.$t('Placing the order failed, please contact support!'),
          action1: { label: this.$t('OK') }
        })
      }
    },
    getBrowserInfo (){
      return {
        JavaEnabled: navigator.javaEnabled(),
        Language: navigator.language || navigator.userLanguage,
        ColorDepth: screen.colorDepth,
        ScreenHeight: screen.height,
        ScreenWidth: screen.width,
        TimeZoneOffset: new Date().getTimezoneOffset().toString(),
        UserAgent: navigator.userAgent,
        JavascriptEnabled: true
      }
    },
    // Created function by shabbir for make payment
    async ProCCOrderPayment (order_ids) {
      // console.log('this.getTotals: ', this.getTotals)
      let amount
      for (let segment of this.getTotals) {
        if (segment.code === 'grand_total') {
          amount = segment.value
        }
      }
      let data = {
        total_amount: amount,
        order_ids,
        BrowserInfo: this.getBrowserInfo()
      }
      this.ProCcAPI.VSFOrderPayment(data, this.currentImage.brand).then(async (response) => {
        if (response.data.payIn_result && response.data.payIn_result.RedirectURL) {
          let newWin = window.open(response.data.payIn_result.RedirectURL, 'popUpWindow', 'height=700,width=800,left=0,top=0,resizable=yes,scrollbars=yes,toolbar=yes,menubar=no,location=no,directories=no, status=yes')
          if (!newWin || newWin.closed || typeof newWin.closed === 'undefined') {
            this.$bus.$emit('notification-progress-stop');
            this.$store.dispatch('notification/spawnNotification', {
              type: 'error',
              message: this.$t('Please allow to open popup window'),
              action1: { label: this.$t('OK') }
            })
          } else {
            console.log('newWin.onClose Set for payment popUp')
            let eventBusEmit = (event) => this.$bus.$emit(event)
            let timer = setInterval(() => {
              if (newWin.closed) {
                clearInterval(timer)
                eventBusEmit('notification-progress-stop')
              }
            }, 500)
          }
        } else {
          this.$bus.$emit('notification-progress-stop');
          this.$store.dispatch('notification/spawnNotification', {
            type: 'error',
            message: this.$t('Something goes Wrong :(  Server could not respond'),
            action1: { label: this.$t('OK') }
          })
        }
      }).catch(err => {
        Logger.error(err, 'Transaction was not Done!!')
        this.$bus.$emit('notification-progress-stop');
        this.$store.dispatch('notification/spawnNotification', {
          type: 'error',
          message: this.$t('Something went wrong :( the payment failed, please retry'),
          action1: { label: this.$t('OK') }
        })
      })
    },
    // Created function by Shabbir for place order in magento
    async PlaceMagentoOrder (payment_data) {
      try {
        if (payment_data && payment_data.transactionId) {
          this.mangopay_transaction_id = payment_data.transactionId
        }
        await this.$store.dispatch('checkout/placeOrder', {order: await this.prepareProCCOrder()})
      } catch (e) {
        console.log('PlaceMagentoOrder Error', e)
      }
    },
    savePersonalDetails () {
      this.$store.dispatch('checkout/savePersonalDetails', this.personalDetails)
    },
    saveShippingDetails () {
      this.$store.dispatch('checkout/saveShippingDetails', this.shipping)
    },
    savePaymentDetails () {
      this.$store.dispatch('checkout/savePaymentDetails', this.payment)
    },
    focusField (fieldName) {
      if (fieldName === 'password') {
        window.scrollTo(0, 0)
        this.activateSection('personalDetails')
        this.focusedField = fieldName
      }
      if (fieldName === 'email-address') {
        window.scrollTo(0, 0)
        this.activateSection('personalDetails')
        this.focusedField = fieldName
      }
    }
  },
  metaInfo () {
    const currentStoreBrand = this.$store.getters['procc/getCurrentStoreBrand']
    let currentBrandName = currentStoreBrand.name

    return {
      title: htmlDecode((currentBrandName ? currentBrandName + ' - ' : '') + i18n.t('Checkout')), // Added by Dan
      // title: this.$route.meta.title || i18n.t('Checkout'),
      meta: this.$route.meta.description ? [{ vmid: 'description', name: 'description', content: this.$route.meta.description }] : []
    }
  },
  asyncData ({ store, route, context }) { // this is for SSR purposes to prefetch data
    return new Promise((resolve, reject) => {
      if (context) context.output.cacheTags.add(`checkout`)
      if (context) context.server.response.redirect('/')
      resolve()
    })
  }
}
