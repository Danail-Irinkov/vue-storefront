import { mapState, mapGetters } from 'vuex'
import RootState from '@vue-storefront/core/types/RootState'
import ProCcApi from 'src/themes/default-procc/helpers/procc_api.js'
const Countries = require('@vue-storefront/i18n/resource/countries.json')

export const Shipping = {
  name: 'Shipping',
  props: {
    isActive: {
      type: Boolean,
      required: true
    }
  },
  beforeDestroy () {
    this.$bus.$off('checkout-after-personalDetails', this.onAfterPersonalDetails)
    this.$bus.$off('checkout-after-shippingset', this.onAfterShippingSet)
  },
  beforeMount () {
    this.$bus.$on('checkout-after-personalDetails', this.onAfterPersonalDetails)
    this.$bus.$on('checkout-after-shippingset', this.onAfterShippingSet)
  },
  data () {
    return {
      isFilled: false,
      ProCcApi: ProCcApi(),
      countries: [], //Edited By Dan
      shipping: this.$store.state.checkout.shippingDetails,
      shipToMyAddress: false,
      selectedShippingMethods: {},
      myAddressDetails: {
        firstname: '',
        lastname: '',
        country: '',
        region: '',
        city: '',
        street: ['', ''],
        postcode: '',
        telephone: ''
      }
    }
  },
  computed: {
    ...mapState({
      currentUser: (state: RootState) => state.user.current
    }),
    ...mapGetters({
      shippingMethods: 'checkout/getShippingMethods',
      getSelectedShippingMethods: 'checkout/getSelectedShippingMethods'
    }),
    checkoutShippingDetails () {
      return this.$store.state.checkout.shippingDetails
    },
    paymentMethod () {
      return this.$store.getters['checkout/getPaymentMethods']
    }
  },
  watch: {
    isActive: {
      handler (val) {
        if(val)
          this.changeCountry()
      }
    },
    shippingMethods: {
      handler () {
        this.checkSelectedShippingMethod()
      }
    },
    shipToMyAddress: {
      handler () {
        this.useMyAddress()
      },
      immediate: true
    }
  },
  created () {
    this.countries = [...Countries]
  },
  mounted () {
    this.getShippingCountryList()
    this.checkDefaultShippingAddress()
    this.checkSelectedShippingMethod()
  },
  methods: {
    async getShippingCountryList () {
      try {
        // console.log('C Countries1:', this.countries )
        if (!this.ProCC_Countries) {
          let ProCC_Countries = await this.ProCcApi.getShippingCountriesList() // Added by Dan to load countries from ProCC shipping list
          this.ProCC_Countries = [...ProCC_Countries]
          console.log('C Countries3:', this.ProCC_Countries )
        }

        this.countries = [...this.ProCC_Countries]
      }catch (e) {
        console.log('getShippingCountryList Err: ', e)
      }
    },
    checkDefaultShippingAddress () {
      this.shipToMyAddress = this.hasShippingDetails()
    },
    checkSelectedShippingMethod () {
      // console.log('this.getSelectedShippingMethods1', this.getSelectedShippingMethods)
      for (let brand_id in this.getSelectedShippingMethods) {
        if (this.getSelectedShippingMethods[brand_id] && this.getSelectedShippingMethods[brand_id]._id) {
          this.selectedShippingMethods[brand_id] = this.getSelectedShippingMethods[brand_id]._id
        }
      }
      this.$forceUpdate()
      // console.log('this.getSelectedShippingMethods2', this.getSelectedShippingMethods)
    },
    saveShippingMethod (brand_id) {
      this.$bus.$emit('modal-hide', 'modal-shipping-method')
      console.log('saveShippingMethod this.selectedShippingMethods', this.selectedShippingMethods)

      this.$bus.$emit('checkout-after-shippingMethodChanged', { selectedShippingMethods: this.selectedShippingMethods, brand_id_changed: brand_id })
      this.checkSelectedShippingMethod()
    },
    onAfterShippingSet (receivedData) {
      this.shipping = receivedData
      this.isFilled = true
    },
    onAfterPersonalDetails (receivedData) {
      if (!this.isFilled) {
        this.$store.dispatch('checkout/updatePropValue', ['firstName', receivedData.firstName])
        this.$store.dispatch('checkout/updatePropValue', ['lastName', receivedData.lastName])
      }
    },
    sendDataToCheckout () {
      this.$bus.$emit('checkout-after-shippingDetails', this.shipping, this.$v)
      this.isFilled = true
    },
    edit () {
      if (this.isFilled) {
        this.$bus.$emit('checkout-before-edit', 'shipping')
      }
    },
    hasShippingDetails () {
      if (this.currentUser) {
        if (this.currentUser.addresses && this.currentUser.addresses.length > 0) {
          let addresses = this.currentUser.addresses
          for (let i = 0; i < addresses.length; i++) {
            if (addresses[i].set_as_default) {
              this.myAddressDetails = addresses[i]
              return true
            }
          }
        }
      }
      return false
    },
    useMyAddress () {
      if (this.shipToMyAddress) {
        this.shipping = {
          firstName: this.myAddressDetails.first_name,
          lastName: this.myAddressDetails.last_name,
          country: this.myAddressDetails.country,
          // state: this.myAddressDetails.region.region ? this.myAddressDetails.region.region : '', // this is not need for now by shabbir
          city: this.myAddressDetails.city,
          streetAddress: this.myAddressDetails.streetName,
          apartmentNumber: this.myAddressDetails.streetNumber,
          zipCode: this.myAddressDetails.postalCode,
          phoneNumber: this.myAddressDetails.phone,
          shippingMethod: this.checkoutShippingDetails.shippingMethod,
          shippingCarrier: this.checkoutShippingDetails.shippingCarrier
        }
      } else {
        this.shipping = this.checkoutShippingDetails
      }
      // this.changeCountry() // DIsabled By Dan To avoid unneccesary calls
    },
    getShippingMethod () {
      console.log('this.shipping.shippingMethod', this.shipping.shippingMethod)
      console.log('this.shippingMethods.length', this.shippingMethods.length)
      for (let i = 0; i < this.shippingMethods.length; i++) {
        console.log('this.shippingMethods[i]._id', this.shippingMethods[i]._id)
        if (this.shippingMethods[i]._id === this.shipping.shippingMethod) {
          return {
            name: this.shippingMethods[i].name,
            cost: this.shippingMethods[i].cost
          }
        }
      }
      return {
        name: '',
        cost: ''
      }
    },
    getCountryName () {
      for (let i = 0; i < this.countries.length; i++) {
        if (this.countries[i].code === this.shipping.country) {
          return this.countries[i].name
        }
      }
      return ''
    },
    changeCountry () {
      this.$bus.$emit('checkout-before-shippingMethods', this.shipping.country)
    },
    getCurrentShippingMethod (brand_id) {
      let shippingCode = this.shipping.shippingMethod[brand_id]
      let currentMethod = this.shippingMethods && this.shippingMethods[brand_id] ? this.shippingMethods[brand_id].find(item => item.method_code === shippingCode) : {}
      return currentMethod
    },
    changeShippingMethod (brand_id) {
      let currentShippingMethod = this.getCurrentShippingMethod(brand_id)
      if (currentShippingMethod) {
        this.shipping = Object.assign(this.shipping, {shippingCarrier: currentShippingMethod.carrier_code})
        this.$bus.$emit('checkout-after-shippingMethodChanged', {
          country: this.shipping.country,
          method_code: currentShippingMethod._id,
          carrier_code: currentShippingMethod._id,
          payment_method: this.paymentMethod[0].code
        })
      }
    },
    notInMethods (method) {
      let availableMethods = this.shippingMethods
      if (availableMethods.find(item => item.method_code === method)) {
        return false
      }
      return true
    }
  }
}
