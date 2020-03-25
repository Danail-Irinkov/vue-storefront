import toString from 'lodash-es/toString'
import { Logger } from '@vue-storefront/core/lib/logger'
import find from "lodash-es/find";
import ProCcApi from 'src/themes/default-procc/helpers/procc_api.js'
const Countries = require('@vue-storefront/i18n/resource/countries.json')

export const UserShippingDetails = {
  name: 'MyShippingDetails',
  data () {
    return {
      ProCcApi: ProCcApi(),
      shippingDetails: {
        _id: '',
        first_name: '',
        last_name: '',
        streetName: '',
        streetNumber: '',
        city: '',
        postalCode: '',
        region: '',
        country: '',
        phone: '',
        street_id:'',
        site_id:'',
        ISO_code:''
      },
      countries: Countries,
      useCompanyAddress: false,
      currentUser: Object.assign({}, this.$store.state.user.current),
      isEdited: false,
      remainInEditMode: false,
      cities: [],
      streets: [],
      no_cities_available: false,
      no_streets_available: false,
      addressSaved: false,
      city_loading: false,
      street_loading: false,
      disable_all_fields:true,
      disable_street_fields:true,
      disable_city_fields:true,
      streets_filtered_options: [],
      cities_filtered_options: [],
      selected_street_id:'',
      get_cities_request_working: false,
    }
  },
  beforeMount () {
    this.$bus.$on('user-after-loggedin', this.onLoggedIn)
    this.$bus.$on('myAccount-before-remainInEditMode', block => {
      if (block === 'MyShippingDetails') {
        this.remainInEditMode = true
      }
    })
  },
  beforeDestroy () {
    this.$bus.$off('user-after-loggedin', this.onLoggedIn)
    this.$bus.$off('myAccount-before-remainInEditMode')
  },
  mounted () {
    this.getShippingCountryList()
    this.shippingDetails = this.getShippingDetails()
  },
  watch: {
    useCompanyAddress: {
      handler () {
        this.fillCompanyAddress()
      }
    },
    shippingDetails: {
      handler: function(newValue) {
        if(newValue.street_id && newValue.ISO_code && newValue.site_id)
          this.disable_all_fields=false
        if(newValue.ISO_code && newValue.ISO_code != 100)
          this.disable_all_fields=false
        if(newValue.ISO_code && newValue.site_id)
          this.disable_street_fields=false
        if(newValue.ISO_code)
          this.disable_city_fields=false
        if(newValue)
          this.disable_city_fields=false
      },
      deep: true
    }
  },
  methods: {
    onLoggedIn() {
      this.currentUser = Object.assign({}, this.$store.state.user.current)
      this.shippingDetails = this.getShippingDetails()
    },
    edit() {
      this.isEdited = true
    },
    objectsEqual(a, b) {
      const aProps = Object.keys(a)
      const bProps = Object.keys(b)

      if (aProps.length !== bProps.length) {
        return false
      }

      for (let i = 0; i < aProps.length; i++) {
        let propName = aProps[i]
        if (!b.hasOwnProperty(propName)) {
          return false
        } else {
          if (a[propName] !== null && b[propName] !== null && a[propName] === 'object' && b[propName] === 'object') {
            if (!this.objectsEqual(a[propName], b[propName])) {
              return false
            }
          } else if (a[propName] !== b[propName]) {
            return false
          }
        }
      }
      return true
    },
    async updateDetails() {
      let updatedShippingDetails
      if (!this.objectsEqual(this.shippingDetails, this.getShippingDetails())) {
        updatedShippingDetails = JSON.parse(JSON.stringify(this.$store.state.user.current))
        let updatedShippingDetailsAddress = {
          first_name: this.shippingDetails.first_name,
          last_name: this.shippingDetails.last_name,
          streetName: this.shippingDetails.streetName,
          streetNumber: this.shippingDetails.streetNumber,
          city: this.shippingDetails.city,
          ...(this.shippingDetails.region ? {region: {region: this.shippingDetails.region}} : {}),
          country: this.shippingDetails.country,
          postalCode: this.shippingDetails.postalCode,
          ...(this.shippingDetails.phone ? {phone: this.shippingDetails.phone} : {})
        }
        if (this.currentUser.addresses.length === 0) {
          updatedShippingDetails.addresses = [updatedShippingDetailsAddress]
        } else {
          updatedShippingDetails.addresses = updatedShippingDetails.addresses.map((address) =>
            address.set_as_default
              ? {...address, ...updatedShippingDetailsAddress} // update default address if already exist
              : address
          )
        }
      }
      if (this.shippingDetails) {
        try {
          // call method for update customer address data by shabbir
          this.shippingDetails.user = this.currentUser._id
          this.shippingDetails.set_as_default = true
          let result = await this.$store.dispatch('user/updateCustomerAddress', {address: this.shippingDetails})
          if (result.message_type === 'success') {
            this.exitSection(null, updatedShippingDetails)
          } else {
            this.onFailure(result)
          }
        } catch (err) {
          Logger.error(err)()
          this.onFailure(err)
        }
      }
    },
    onFailure(result) {
      this.$store.dispatch('notification/spawnNotification', {
        type: 'error',
        message: this.$t(result.message ? result.message : result),
        action1: {label: this.$t('OK')}
      })
    },
    exitSection(event, updatedShippingDetails) {
      if (!updatedShippingDetails) {
        this.shippingDetails = this.getShippingDetails()
        this.useCompanyAddress = false
        this.remainInEditMode = false
      }
      if (!this.remainInEditMode) {
        this.isEdited = false
      }
    },
    fillCompanyAddress() {
      if (this.useCompanyAddress) {
        const companyAddress = this.currentUser.addresses.find((address) => (address.set_as_default))
        if (companyAddress) {
          this.shippingDetails.first_name = companyAddress.first_name
          this.shippingDetails.last_name = companyAddress.last_name
          this.shippingDetails.streetName = companyAddress.streetName
          this.shippingDetails.streetNumber = companyAddress.streetNumber
          this.shippingDetails.city = companyAddress.city
          this.shippingDetails.postalCode = companyAddress.postalCode
          this.shippingDetails.region = companyAddress.region.region ? companyAddress.region.region : ''
          this.shippingDetails.country = companyAddress.country
        }
      } else {
        this.shippingDetails = this.getShippingDetails()
      }
    },
    readShippingDetailsFromCurrentUser(shippingDetails) {
      for (let address of this.currentUser.addresses) {
        if (address.set_as_default) {
          if(address.hasOwnProperty('ISO_code') )
            this.getCitiesList(address.ISO_code)
          if(address.hasOwnProperty('site_id') )
            this.getStreetList(address.site_id)
          return {
            _id: address._id,
            first_name: address.first_name,
            last_name: address.last_name,
            streetName: address.streetName,
            streetNumber: address.streetNumber,
            city: address.city,
            postalCode: address.postalCode,
            region: address.region && address.region.region ? address.region.region : '',
            country: address.country,
            phone: address.hasOwnProperty('phone') ? address.phone : '',
            ISO_code:address.ISO_code,
            site_id:address.hasOwnProperty('site_id') ? address.site_id : '',
            street_id:address.hasOwnProperty('street_id') ? address.street_id : '',
          }
        }
      }
      return shippingDetails
    },
    getShippingDetails() {
      this.currentUser = Object.assign({}, this.$store.state.user.current)
      let shippingDetails = {
        _id: '',
        first_name: '',
        last_name: '',
        streetName: '',
        streetNumber: '',
        city: '',
        postalCode: '',
        region: '',
        country: '',
        phone: '',
        street_id:'',
        site_id:'',
        ISO_code:''
      }
      if (this.currentUser) {
        if (this.currentUser && this.currentUser.addresses && this.currentUser.addresses.length > 0) {
          shippingDetails = this.readShippingDetailsFromCurrentUser(shippingDetails);
        } else {
          this.isEdited = true
          shippingDetails.first_name = this.currentUser.first_name
          shippingDetails.last_name = this.currentUser.last_name
        }
      }
      return shippingDetails;
    },
    getCountryName() {
      if (this.shippingDetails.country) return this.shippingDetails.country
      for (let i = 0; i < this.countries.length; i++) {
        if (this.countries[i].ISO_code === this.shippingDetails.ISO_code) {
          return this.countries[i].name
        }
      }
      return ''
    },
    hasBillingAddress() {
      if (this.currentUser) {
        if (this.currentUser.hasOwnProperty('default_billing')) {
          return true
        }
      }
      return false
    },
    //  get procc country, city and street
    async getShippingCountryList() {
      try {
        // console.log('C Countries1:', this.countries )
        if (!this.ProCC_Countries) {
          // let ProCC_Countries = await this.ProCcApi.getShippingCountriesList() // Added by Dan to load countries from ProCC shipping list
          let ProCC_Countries = await this.ProCcApi.getCountriesList() // Added by Dan to load countries from ProCC shipping list
          ProCC_Countries = ProCC_Countries.data.countries
          this.ProCC_Countries = [...ProCC_Countries]
          console.log('C Countries3:', this.ProCC_Countries)
        }

        this.countries = [...this.ProCC_Countries]
      } catch (e) {
        console.log('getShippingCountryList Err: ', e)
      }
    },
    selectCountry() {
      if (this.shippingDetails.ISO_code) {
        let country = find(this.countries, {'ISO_code': this.shippingDetails.ISO_code})
        this.no_cities_available = !country.cities_available
        this.no_streets_available = !country.streets_available
        this.shippingDetails.country = country.name;
        this.shippingDetails.country_id = country._id;
        this.cities = []
        this.streets = []
        this.shippingDetails.site_id = ''
        this.shippingDetails.city = ''
        this.shippingDetails.street_id = ''
        this.shippingDetails.streetName = ''
        this.shippingDetails.postalCode = ''
        this.getCitiesList(this.shippingDetails.ISO_code)
        this.$bus.$emit('checkout-before-shippingMethods', this.shippingDetails.country)
      }
    },
    selectCity() {
      if (!this.no_streets_available && this.shippingDetails.site_id) {
        let selected_city = find(this.cities, {'site_id': this.shippingDetails.site_id});
        if (selected_city) {
          if (selected_city.post_code) this.shippingDetails.postalCode = selected_city.post_code
          if (selected_city.city_name) {
            this.shippingDetails.city = selected_city.city_name
          }
          if (selected_city.city_type) this.shippingDetails.city_type = selected_city.city_type
        } else {
          // this.$refs.postalCode.focus()
          document.getElementById("postalCode").focus();
        }
        this.streets = []
        this.shippingDetails.street_id = ''
        this.shippingDetails.streetName = ''
        this.getStreetList(this.shippingDetails.site_id, '')
      } else { // if manual input of city
        this.shippingDetails.city = this.shippingDetails.site_id
      }
    },
    selectStreet() {
      if (!this.no_streets_available && this.shippingDetails.street_id) {
        let street = find(this.streets, {'street_id': this.shippingDetails.street_id})
        this.selected_street_id = ''
        if (street.streetName) {
          this.shippingDetails.streetName = street.streetName;
        } else if (street.street_name) {
          this.shippingDetails.streetName = street.street_name;
        } else {
          this.shippingDetails.streetName = this.shippingDetails.street_id;
        }
        this.shippingDetails.street_type = street.street_type;
      } else { // if manual input of street
        this.shippingDetails.street_id = this.shippingDetails.streetName;
      }
      if (this.shippingDetails.streetName && this.shippingDetails.streetName.length > 2 && this.shippingDetails.streetName.length < 35) this.disable_all_fields = false
    },
    getCitiesList(country_id, query = null) {
      if (query) query = query.toUpperCase()
      // if (this.get_cities_request_working) {
      //   return false;
      // }
      this.city_loading = true;
      this.get_cities_request_working = true
      console.log('GETTING CITIES', country_id)
      return this.ProCcApi.getCitiesList(country_id, query)
        .then((result) => {
          this.cities = result.data.cities;
          this.city_loading = false;
          this.get_cities_request_working = false
        })
    },
    getStreetList(site_id, query) {
      this.street_loading = true
      return this.ProCcApi.getStreetList(site_id, query)
        .then((result) => {
          if (result.data.no_streets_available)
            this.no_streets_available = true
          if (result.data.streets && result.data.streets.length > 0) {
            this.streets = result.data.streets
            this.street_loading = false
            this.no_streets_available = false
          } else if (result.data.no_streets_available) {
            this.streets = [{street_id: 0, streetName: this.address.city, street_type: '...'}]
            this.shippingDetails.street_id = 0
          }
          if (this.selected_street_id)
            this.$nextTick(() => {
              this.shippingDetails.street_id = this.selected_street_id
            });
        })
    },
  }
}
