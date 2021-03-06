import { mapState, mapGetters } from 'vuex'
import RootState from '@vue-storefront/core/types/RootState'
import ProCcApi from 'src/themes/default-procc/helpers/procc_api.js'
import find from 'lodash-es/find'
import _ from 'lodash'
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
      ProCC_Countries: [], // Edited By Dan
      countries: [], // Edited By Dan
      shipping: {},
      shipToMyAddress: false,
      selectedShippingMethods: {},
      myAddressDetails: {
        firstname: '',
        lastname: '',
        country: '',
        region: '',
        city: '',
        street: ['', ''],
        apartmentNumber: '',
        streetAddress: '',
        postcode: '',
        telephone: '',
        street_id: '',
        site_id: '',
        ISO_code: ''
      },
      cities: [],
      streets: [],
      no_cities_available: false,
      no_streets_available: false,
      addressSaved: false,
      city_loading: false,
      street_loading: false,
      streets_filtered_options: [],
      cities_filtered_options: [],
      selected_street_id: '',
      get_cities_request_working: false
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
    disable_apartment_no () {
      return !(this.shipping && this.shipping.city && this.shipping.streetAddress)
    },
    disable_all_fields () { return !(this.shipping && this.shipping.street_id && this.shipping.ISO_code && this.shipping.site_id) },
    disable_street_fields () { return !(this.shipping && this.shipping.ISO_code && (this.shipping.site_id || this.no_cities_available)) },
    disable_city_fields () { return !(this.shipping && this.shipping.ISO_code) },
    paymentMethod () {
      return this.$store.getters['checkout/getPaymentMethods']
    }
  },
  watch: {
    isActive: {
      handler (val) {
        if (val && this.shipping.ISO_code) { this.getCitiesList(this.shipping.ISO_code) }
        if (val && this.shipping.site_id) { this.getStreetList(this.shipping.site_id, '') }
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
    },
    shipping: {
      handler: function (newValue) {
        // Autofill Post Code
        let post_code
        for (let city of this.cities) {
          if (city.site_id === newValue.site_id) {
            post_code = city.post_code
          }
        }
        if (post_code && !this.shipping.zipCode) this.shipping.zipCode = post_code
      },
      deep: true
    }
  },
  created () {
    this.countries = [...Countries]
  },
  async mounted () {
    await this.getShippingCountryList()
    this.checkDefaultShippingAddress()
    this.checkSelectedShippingMethod()
    this.$nextTick(() => {
      this.selectCountry()
    })
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
      // console.log('saveShippingMethod this.selectedShippingMethods', this.selectedShippingMethods)

      this.$bus.$emit('checkout-after-shippingMethodChanged', { selectedShippingMethods: this.selectedShippingMethods, brand_id_changed: brand_id })
      this.checkSelectedShippingMethod()
    },
    onAfterShippingSet (receivedData) {
      this.shipping = receivedData
      this.isFilled = true
    },
    onAfterPersonalDetails (receivedData) {
      console.log('onAfterPersonalDetails receivedData', receivedData)
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
      console.log('hasShippingDetails this.currentUser', this.currentUser)
      if (this.currentUser && this.currentUser.addresses && this.currentUser.addresses.length > 0) {
        let addresses = this.currentUser.addresses.filter((adr) => adr.address_type === 'shipping')
        console.log('hasShippingDetails addresses', addresses)
        this.myAddressDetails = addresses[addresses.length - 1]
        return true
      }
      return false
    },
    useMyAddress () {
      console.log('useMyAddress Started this.myAddressDetails', this.myAddressDetails)
      console.log('useMyAddress Started this.shipping', this.shipping)
      if (this.shipToMyAddress) {
        this.shipping = {
          firstName: this.myAddressDetails.first_name,
          lastName: this.myAddressDetails.last_name,
          country: this.myAddressDetails.country,
          state: this.myAddressDetails.state ? this.myAddressDetails.state : this.myAddressDetails.region ? this.myAddressDetails.region : '', // this is not need for now by shabbir
          city: this.myAddressDetails.city,
          streetAddress: this.myAddressDetails.streetName,
          apartmentNumber: this.myAddressDetails.streetNumber,
          zipCode: this.myAddressDetails.postalCode,
          phoneNumber: this.myAddressDetails.phone,
          ISO_code: this.myAddressDetails.ISO_code ? this.myAddressDetails.ISO_code : '',
          country_id: this.myAddressDetails.country_id ? this.myAddressDetails.country_id : '',
          site_id: this.myAddressDetails.site_id ? this.myAddressDetails.site_id : '',
          street_id: this.myAddressDetails.street_id ? this.myAddressDetails.street_id : '',
          street_type: this.myAddressDetails.street_type ? this.myAddressDetails.street_type : '',
          city_type: this.myAddressDetails.city_type ? this.myAddressDetails.city_type : '',
          shippingMethod: this.checkoutShippingDetails.shippingMethod,
          shippingCarrier: this.checkoutShippingDetails.shippingCarrier
        }
        console.log('useMyAddress Started this.shipping2', this.shipping)
      } else {
        this.shipping = this.checkoutShippingDetails
      }
      // this.changeCountry() // DIsabled By Dan To avoid unneccesary calls
    },
    getShippingMethod () {
      // console.log('this.shipping.shippingMethod', this.shipping.shippingMethod)
      // console.log('this.shippingMethods.length', this.shippingMethods.length)
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
      if (this.shipping.country) return this.shipping.country
      for (let i = 0; i < this.countries.length; i++) {
        if (this.countries[i].ISO_code === this.shipping.ISO_code) {
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
    },
    //  procc country, city and street
    selectCountry () {
      console.log('selectCountry Started!! selectCountry')
      this.$nextTick(() => {
        this.$v.shipping.ISO_code.$touch()
        if (this.shipping.ISO_code) {
          let country = find(this.ProCC_Countries, { 'ISO_code': this.shipping.ISO_code })
          console.log('selectCountry Started!! this.shipping.ISO_code', this.shipping.ISO_code)
          console.log('selectCountry Started!! this.ProCC_Countries', this.ProCC_Countries.length)
          console.log('selectCountry Started!! country', country)
          this.no_cities_available = !country || !country.cities_available
          this.no_streets_available = !country || !country.streets_available
          this.shipping.country = country ? country.name : '';
          this.shipping.country_id = country ? country._id : '';
          this.cities = []
          this.streets = []
          // this.shipping.site_id = ''
          // this.shipping.state = ''
          // this.shipping.city = ''
          // this.shipping.street_id = ''
          // this.shipping.streetAddress = ''
          // this.shipping.zipCode = ''
          this.getCitiesList(this.shipping.ISO_code)
          this.$bus.$emit('checkout-before-shippingMethods', this.shipping.country)
          this.$nextTick(async () => {
            console.log('this.no_cities_available', this.no_cities_available)
            await this.sleep(500)
            if (this.no_cities_available && document.getElementById('cityInput')) {
              document.getElementById('cityInput').focus();
            } else if (document.getElementById('cityInput2')) {
              document.getElementById('cityInput2').focus();
            }
            // this.$forceUpdate()
          })
        }
      })
    },
    addToCities (cities) {
      console.log('addToCities cities', cities)
      for (let city in cities) {
        // if(this.cities.findIndex())
      }
      this.cities = _.unionBy(this.cities, cities, 'site_id')
      console.log('addToCities this.cities', this.cities)
    },
    addToStreets (streets) {
      console.log('addToStreets streets', streets)
      this.streets = _.unionBy(this.streets, streets, 'street_id')
      // console.log('addToCities this.cities', this.cities)
    },
    selectCity () {
      this.$nextTick(() => {
        this.$v.shipping.city.$touch();
        if (!this.no_cities_available && this.shipping.site_id) {
          let selected_city = find(this.cityOptions, { 'site_id': this.shipping.site_id })
          console.log('selectCity this.shipping.site_id ', this.shipping.site_id)
          console.log('selectCity selected_city', selected_city)
          if (selected_city) {
            if (selected_city.post_code) {
              this.shipping.zipCode = selected_city.post_code
              // this.shipping.postalCode = selected_city.post_code // NOT USED?
            }
            if (selected_city.region) {
              this.shipping.state = selected_city.region
            }
            if (selected_city.city_name) {
              this.shipping.city = selected_city.city_name
            }
            if (selected_city.city_type) {
              this.shipping.city_type = selected_city.city_type
            }
          }

          this.streets = []
          this.shipping.street_id = ''
          this.shipping.streetAddress = ''
          this.getStreetList(this.shipping.site_id, '')
          this.focusStreetInput()
        } else { // if manual input of city
          this.shipping.city = this.shipping.site_id

          // Focus Postal Code
          let postal_input = this.$refs.postal_code
          if (!this.shipping.zipCode && postal_input) { postal_input.setFocus('zip-code'); }
        }
      })
    },
    async focusStreetInput () {
      await this.sleep(500)
      let input1 = this.$refs.street_name
      console.log('focusStreetInput1', input1)
      if (input1) {
        input1.setFocus('street-address')
      } else {
        let input2 = this.$refs.street_name2
        console.log('focusStreetInput2', input2)
        input2.setFocus()
      }
    },
    async focusStreetNumberInput () {
      await this.sleep(500)
      let inputS1 = this.$refs.apartment_number
      console.log('focusStreetNumberInput', inputS1)
      if (inputS1) {
        inputS1.setFocus('apartment-number')
      }
    },
    selectStreet () {
      console.log('selectStreet START ')
      this.$nextTick(() => {
        console.log('selectStreet START 22', !this.no_streets_available)
        console.log('selectStreet START 23', this.shipping.street_id)
        this.$v.shipping.streetAddress.$touch();
        if (!this.no_streets_available && this.shipping.street_id) {
          let street = find(this.streets, { 'street_id': this.shipping.street_id })
          console.log('selectStreet street ', street)
          console.log('selectStreet this.shipping.street_id', this.shipping.street_id)
          // this.selected_street_id = ''
          if (street && street.label) {
            this.shipping.streetAddress = street.label
          } else if (street && street.streetName) {
            this.shipping.streetAddress = street.streetName
          } else if (street && street.street_name) {
            this.shipping.streetAddress = street.street_name
          } else {
            this.shipping.streetAddress = this.shipping.street_id
          }
          this.no_streets_available = !this.no_streets_available
          this.shipping.street_type = street.street_type
          this.no_streets_available = !this.no_streets_available
        } else { // if manual input of street
          this.shipping.street_id = this.shipping.streetAddress
        }
        if (this.shipping.streetAddress && this.shipping.streetAddress.length > 2 && this.shipping.streetAddress.length < 35) {
          this.focusStreetNumberInput()
        }
      })
    },
    getCitiesList (country_id, query = null) {
      if (query)query = query.toUpperCase()
      // if (this.get_cities_request_working) {
      //   return false;
      // }
      this.city_loading = true;
      this.get_cities_request_working = true
      console.log('GETTING CITIES', country_id)
      return this.ProCcApi.getCitiesList(country_id, query)
        .then((result) => {
          this.cities = result.data.cities;
          console.log('GETTING CITIES DATA: ', this.cities)
          this.city_loading = false;
          this.get_cities_request_working = false
        })
    },
    getStreetList (site_id, query) {
      this.street_loading = true
      return this.ProCcApi.getStreetList(site_id, query)
        .then((result) => {
          if (result.data.no_streets_available) { this.no_streets_available = true }
          if (result.data.streets && result.data.streets.length > 0) {
            this.streets = result.data.streets
            this.street_loading = false
            this.no_streets_available = false
          } else if (result.data.no_streets_available) {
            this.streets = [{street_id: 0, streetName: this.shipping.streetAddress, street_type: ''}]
            this.shipping.street_id = 0
          }
          if (this.selected_street_id) {
            this.$nextTick(() => {
              this.shipping.street_id = this.selected_street_id
            });
          }
        })
    }

  }
}
