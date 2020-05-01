import { mapState, mapGetters } from 'vuex'
import RootState from '@vue-storefront/core/types/RootState'
import toString from 'lodash-es/toString'
import i18n from '@vue-storefront/i18n'
import { Logger } from '@vue-storefront/core/lib/logger'
import ProCcApi from 'src/themes/default-procc/helpers/procc_api.js'
import find from 'lodash-es/find';
const Countries = require('@vue-storefront/i18n/resource/countries.json')

export const Payment = {
  name: 'Payment',
  props: {
    isActive: {
      type: Boolean,
      required: true
    }
  },
  data () {
    return {
      isFilled: false,
      ProCcApi: ProCcApi(),
      countries: Countries,
      ProCC_Countries: [], // Edited By Dan
      VATEnabledStores: [], // Edited By Dan
      payment: this.$store.getters['checkout/getPaymentDetails'],
      generateInvoice: false,
      sendToShippingAddress: false,
      sendToBillingAddress: false
    }
  },
  computed: {
    ...mapState({
      currentUser: (state: RootState) => state.user.current,
      shippingDetails: (state: RootState) => state.checkout.shippingDetails
    }),
    ...mapGetters({
      paymentMethods: 'checkout/getPaymentMethods',
      paymentDetails: 'checkout/getPaymentDetails',
      isVirtualCart: 'cart/isVirtualCart',
      currentImage: 'procc/getHeadImage', // by ProCC
      getShippingDetails: 'checkout/getShippingDetails',
      getPersonalDetails: 'checkout/getPersonalDetails'
    }),
    customerIsInEU(){
      let customer_country = 'BG'
      let EU_countries = ['BG']
      return EU_countries.indexOf(customer_country) !== -1
    }
  },
  created () {
    if (!this.payment.paymentMethod || this.notInMethods(this.payment.paymentMethod)) {
      this.payment.paymentMethod = this.paymentMethods.length > 0 ? this.paymentMethods[0].code : 'cashondelivery'
    }
  },
  mounted () {
    this.verifyStoreVATStatus()
    this.getShippingCountryList()
    if (this.payment.firstName) {
      this.initializeBillingAddress()
    }

    if (this.payment.company && this.payment.taxId) {
      this.generateInvoice = true
    }
    this.changePaymentMethod()
  },
  watch: {
    shippingDetails: {
      handler () {
        if (this.sendToShippingAddress) {
          this.copyShippingToBillingAddress()
        }
      },
      deep: true
    },
    sendToShippingAddress: {
      handler () {
        this.useShippingAddress()
      }
    },
    // created watch function for copy address from shipping address  by shabbir
    isActive: {
      handler (value) {
        if (value) { this.sendToShippingAddress = true }
      }
    },
    sendToBillingAddress: {
      handler () {
        this.useBillingAddress()
      }
    },
    generateInvoice: {
      handler () {
        this.useGenerateInvoice()
      }
    }
  },
  methods: {
    async getShippingCountryList () {
      try {
        // console.log('C Countries1:', this.countries )
        if (this.ProCC_Countries.length === 0) {
          // let ProCC_Countries = await this.ProCcApi.getShippingCountriesList() // Added by Dan to load countries from ProCC shipping list
          let ProCC_Countries = await this.ProCcApi.getCountriesList() // Added by Dan to load countries from ProCC shipping list
          ProCC_Countries = ProCC_Countries.data.countries
          this.ProCC_Countries = [...ProCC_Countries]
          console.log('C Countries3:', this.ProCC_Countries)
        }

        // FORCING ALL COUNTRIES TO BE LOADED FROM HERE DUE TO MISSING SITE_ID
        this.countries = [...this.ProCC_Countries]
      } catch (e) {
        console.log('getShippingCountryList Err: ', e)
      }
    },
    sendDataToCheckout () {
      this.$bus.$emit('checkout-after-paymentDetails', this.payment, this.$v)
      this.placeOrderAtPayment() // modify function for call place order function by shabbir
    },
    edit () {
      if (this.isFilled) {
        this.$bus.$emit('checkout-before-edit', 'payment')
      }
    },
    hasBillingData () {
      if (this.currentUser) {
        if (this.currentUser.hasOwnProperty('default_billing')) {
          return true
        }
      }
      return false
    },
    initializeBillingAddress () {
      let initialized = false
      if (this.currentUser) {
        if (this.currentUser.hasOwnProperty('default_billing')) {
          let id = this.currentUser.default_billing
          let addresses = this.currentUser.addresses
          for (let i = 0; i < addresses.length; i++) {
            if (toString(addresses[i].id) === toString(id)) {
              this.payment = {
                ...addresses[i],
                firstName: addresses[i].firstname,
                lastName: addresses[i].lastname,
                company: addresses[i].company,
                country: addresses[i].country,
                state: addresses[i].region.region ? addresses[i].region.region : '',
                city: addresses[i].city,
                streetAddress: addresses[i].street[0],
                apartmentNumber: addresses[i].street[1],
                zipCode: addresses[i].postcode,
                taxId: addresses[i].vat_id,
                phoneNumber: addresses[i].telephone,
                ISO_code: addresses[i].ISO_code ? addresses[i].ISO_code : '',
                country_id: addresses[i].country_id ? addresses[i].country_id : '',
                site_id: addresses[i].site_id ? addresses[i].site_id : '',
                street_id: addresses[i].street_id ? addresses[i].street_id : '',
                street_type: addresses[i].street_type ? addresses[i].street_type : '',
                city_type: addresses[i].city_type ? addresses[i].city_type : '',
                paymentMethod: this.paymentMethods[0].code
              }
              // this.generateInvoice = true
              this.sendToBillingAddress = true
              initialized = true
            }
          }
        }
      }
      if (!initialized) {
        this.payment = this.paymentDetails || {
          firstName: '',
          lastName: '',
          company: '',
          country: '',
          state: '',
          city: '',
          streetAddress: '',
          apartmentNumber: '',
          postcode: '',
          zipCode: '',
          phoneNumber: '',
          taxId: '',
          ISO_code: '',
          country_id: '',
          site_id: '',
          street_id: '',
          street_type: '',
          city_type: '',
          paymentMethod: this.paymentMethods.length > 0 ? this.paymentMethods[0].code : ''
        }
      }
    },
    useShippingAddress () {
      if (this.sendToShippingAddress) {
        this.copyShippingToBillingAddress()
        this.sendToBillingAddress = false
      }

      if (!this.sendToBillingAddress && !this.sendToShippingAddress) {
        this.payment = this.paymentDetails
      }
    },
    copyShippingToBillingAddress () {
      this.payment = {
        ...this.payment,
        firstName: this.shippingDetails.firstName,
        lastName: this.shippingDetails.lastName,
        country: this.shippingDetails.country,
        state: this.shippingDetails.state,
        city: this.shippingDetails.city,
        streetAddress: this.shippingDetails.streetAddress,
        apartmentNumber: this.shippingDetails.apartmentNumber,
        zipCode: this.shippingDetails.zipCode,
        phoneNumber: this.shippingDetails.phoneNumber,
        ISO_code: this.shippingDetails.ISO_code ? this.shippingDetails.ISO_code : '',
        country_id: this.shippingDetails.country_id ? this.shippingDetails.country_id : '',
        site_id: this.shippingDetails.site_id ? this.shippingDetails.site_id : '',
        street_id: this.shippingDetails.street_id ? this.shippingDetails.street_id : '',
        street_type: this.shippingDetails.street_type ? this.shippingDetails.street_type : '',
        city_type: this.shippingDetails.city_type ? this.shippingDetails.city_type : '',
        paymentMethod: this.paymentMethods.length > 0 ? this.paymentMethods[0].code : ''
      }
    },
    useBillingAddress () {
      if (this.sendToBillingAddress) {
        let id = this.currentUser.default_billing
        let addresses = this.currentUser.addresses
        for (let i = 0; i < addresses.length; i++) {
          if (toString(addresses[i].id) === toString(id)) {
            this.payment = {
              firstName: addresses[i].firstname,
              lastName: addresses[i].lastname,
              company: addresses[i].company,
              country: addresses[i].country_id,
              state: addresses[i].region.region ? addresses[i].region.region : '',
              city: addresses[i].city,
              streetAddress: addresses[i].street[0],
              apartmentNumber: addresses[i].street[1],
              zipCode: addresses[i].postcode,
              taxId: addresses[i].vat_id,
              phoneNumber: addresses[i].telephone,
              ISO_code: addresses[i].ISO_code ? addresses[i].ISO_code : '',
              country_id: addresses[i].country_id ? addresses[i].country_id : '',
              site_id: addresses[i].site_id ? addresses[i].site_id : '',
              street_id: addresses[i].street_id ? addresses[i].street_id : '',
              street_type: addresses[i].street_type ? addresses[i].street_type : '',
              city_type: addresses[i].city_type ? addresses[i].city_type : '',
              paymentMethod: this.paymentMethods.length > 0 ? this.paymentMethods[0].code : ''
            }

            if (this.payment.company && this.payment.taxId) {
              this.generateInvoice = true
            }
          }
        }
        this.sendToShippingAddress = false
      }

      if (!this.sendToBillingAddress && !this.sendToShippingAddress) {
        this.payment = this.paymentDetails
        this.generateInvoice = false
      }
    },
    async verifyStoreVATStatus () { // Added By Dan
      try {
        for (let store_brand_id in this.getCartItemsByBrand) {
          let verification = { valid: false }
          if (this.VATEnabledStores.indexOf(store_brand_id) === -1) {
            verification = (await this.ProCcApi.validateVATNumber({brand_id: store_brand_id}, this.currentImage.brand)).data.validation
          }

            console.log('verifyStoreVATStatus', verification)
          // if (verification.valid) { // DISABLED FOR TESTING!!!
            this.VATEnabledStores.push(store_brand_id)
          // }
        }
      } catch (e) {
        console.log('verifyStoreVATStatus error', e)
      }
    },
    async verifyVATNumber () { // Added By Dan
      try {
        this.$v.payment.taxId.$touch()
        console.log('verifyVATNumber Start')

        if (this.VATEnabledStores.length > 0){
          let verification = { valid: false, company_name: null }
          if (this.customerIsInEU){
            let VAT_number = this.payment.taxId
            verification = (await this.ProCcApi.validateVATNumber({VAT_number}, this.currentImage.brand)).data.validation
            console.log('verifyVATNumber', verification)
          }
          if ((verification && verification.valid) || !this.customerIsInEU){
            // Show Company VAT enabled -> for name and address under the input
            if (verification.company_name) {
            // if company name is different than provided, replace it with the received one
              this.payment.company = verification.company_name
              // TODO: maybe also do similar for address if provided in the validation
            }

            // reduce the VAT amount from the total
            for (let item of this.getCartItems) {
              console.log('verifyVATNumber cart Item', item)
              let product = {
                ...item
              }
              if (this.VATEnabledStores.indexOf(item.procc_brand_id) !== -1) {
                // deduct VAT from order_item
                product.deduct_VAT = true
              } else {
                product.deduct_VAT = false
              }
              console.log('verifyVATNumber updateItem VAT: ', product)
              await this.$store.dispatch('cart/updateItem', { product })
            }
            this.$store.dispatch('cart/sync', { forceClientState: true })

            await this.$store.dispatch('notification/spawnNotification', {
              type: 'success',
              message: this.$t('VAT deducted, please account for VAT according to your local law'),
              action1: { label: i18n.t('OK') }
            })
          } else {
            // if not valid -> show warning that Company Id is not VAT enabled
            await this.$store.dispatch('notification/spawnNotification', {
              type: 'warning',
              message: this.$t('This is not a valid EU VAT Number'),
              action1: { label: i18n.t('OK') }
            })
          }
        }
      } catch (e) {
        // Show failed to verify VAT Number
        console.log('verifyVATNumber ERR: ', e)
        return this.$store.dispatch('notification/spawnNotification', {
          type: 'warning',
          message: this.$t('Server failed to verify EU VAT Number'),
          action1: { label: i18n.t('OK') }
        })
      }
    },
    useGenerateInvoice () {
      if (!this.generateInvoice) {
        this.payment.company = ''
        this.payment.taxId = ''
      }
    },
    getCountryName () {
      if (this.payment.country) return this.payment.country
      for (let i = 0; i < this.countries.length; i++) {
        if (this.countries[i].ISO_code === this.payment.ISO_code) {
          return this.countries[i].name
        }
      }
      return ''
    },
    getPaymentMethod () {
      for (let i = 0; i < this.paymentMethods.length; i++) {
        if (this.paymentMethods[i].code === this.payment.paymentMethod) {
          return {
            title: this.paymentMethods[i].title ? this.paymentMethods[i].title : this.paymentMethods[i].name
          }
        }
      }
      return {
        name: ''
      }
    },
    notInMethods (method) {
      let availableMethods = this.paymentMethods
      if (availableMethods.find(item => item.code === method)) {
        return false
      }
      return true
    },
    changePaymentMethod () {
      this.$v.payment.paymentMethod.$touch()
      // reset the additional payment method component container if exists.
      if (document.getElementById('checkout-order-review-additional-container')) {
        document.getElementById('checkout-order-review-additional-container').innerHTML = '<div id="checkout-order-review-additional">&nbsp;</div>' // reset
      }

      // Let anyone listening know that we've changed payment method, usually a payment extension.
      this.$bus.$emit('checkout-payment-method-changed', this.payment.paymentMethod)
    },
    changeCountry () {
      this.$v.payment.country.$touch()

      let country = find(this.ProCC_Countries, { 'name': this.payment.country })
      console.log('changeCountry COUNTRY: ', country)
      // this.payment.country = country.name;
      this.payment.ISO_code = country.ISO_code;
      this.payment.country_id = country._id;

      this.$store.dispatch('checkout/updatePaymentDetails', { country: this.payment.country })
      this.$store.dispatch('cart/syncPaymentMethods', { forceServerSync: true })
    },
    // added function for place order by shabbir
    placeOrderAtPayment () { // Edited by Dan to verify transaction has passed
      if (this.getPersonalDetails.createAccount) {
        this.register()
      } else {
        // change code for place order by shabbir
        this.$bus.$emit('checkout-do-placeOrder')
      }
    },
    // added function for register customer by shabbir
    async register () {
      this.$bus.$emit('notification-progress-start', i18n.t('Registering the account ...'));

      try {
        const result = await this.$store.dispatch('user/register', {
          email: this.getPersonalDetails.emailAddress,
          password: this.getPersonalDetails.password,
          first_name: this.getPersonalDetails.firstName,
          last_name: this.getPersonalDetails.lastName,
          addresses: [{
            first_name: this.getShippingDetails.first_name,
            last_name: this.getShippingDetails.last_name,
            streetName: this.getShippingDetails.streetAddress,
            streetNumber: this.getShippingDetails.apartmentNumber,
            city: this.getShippingDetails.city,
            ...(this.getShippingDetails.state ? { region: { region: this.getShippingDetails.state } } : {}),
            country: this.getShippingDetails.country,
            postCode: this.getShippingDetails.zipCode,
            ISO_code: this.getShippingDetails.ISO_code ? this.getShippingDetails.ISO_code : '',
            country_id: this.getShippingDetails.country_id ? this.getShippingDetails.country_id : '',
            site_id: this.getShippingDetails.site_id ? this.getShippingDetails.site_id : '',
            street_id: this.getShippingDetails.street_id ? this.getShippingDetails.street_id : '',
            street_type: this.getShippingDetails.street_type ? this.getShippingDetails.street_type : '',
            city_type: this.getShippingDetails.city_type ? this.getShippingDetails.city_type : '',
            ...(this.getShippingDetails.phoneNumber ? { phone: this.getShippingDetails.phoneNumber } : {})
          }]
        });

        this.$bus.$emit('notification-progress-stop');
        if (result.code !== 200) {
          this.onFailure(result);
          // If error includes a word 'password', emit event that eventually focuses on a corresponding field
          if (result.result.includes(i18n.t('password'))) {
            this.$bus.$emit('checkout-after-validationError', 'password')
          }
          // If error includes a word 'mail', emit event that eventually focuses on a corresponding field
          if (result.result.includes(i18n.t('email'))) {
            this.$bus.$emit('checkout-after-validationError', 'email-address')
          }
        } else {
          this.$bus.$emit('modal-hide', 'modal-signup');
          await this.$store.dispatch('user/login', {
            username: this.getPersonalDetails.emailAddress,
            password: this.getPersonalDetails.password
          });
          this.$bus.$emit('checkout-do-placeOrder', result.result.id);
          this.onSuccess()
        }
      } catch (err) {
        this.$bus.$emit('notification-progress-stop');
        Logger.error(err, 'checkout')()
      }
    }
  }
}
