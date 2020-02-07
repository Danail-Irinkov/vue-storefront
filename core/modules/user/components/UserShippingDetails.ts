import toString from 'lodash-es/toString'
import { Logger } from '@vue-storefront/core/lib/logger'
const Countries = require('@vue-storefront/i18n/resource/countries.json')

export const UserShippingDetails = {
  name: 'MyShippingDetails',
  data () {
    return {
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
        phone: ''
      },
      countries: Countries,
      useCompanyAddress: false,
      currentUser: Object.assign({}, this.$store.state.user.current),
      isEdited: false,
      remainInEditMode: false
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
    this.shippingDetails = this.getShippingDetails()
  },
  watch: {
    useCompanyAddress: {
      handler () {
        this.fillCompanyAddress()
      }
    }
  },
  methods: {
    onLoggedIn () {
      this.currentUser = Object.assign({}, this.$store.state.user.current)
      this.shippingDetails = this.getShippingDetails()
    },
    edit () {
      this.isEdited = true
    },
    objectsEqual (a, b) {
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
    async updateDetails () {
      let updatedShippingDetails
      if (!this.objectsEqual(this.shippingDetails, this.getShippingDetails())) {
        updatedShippingDetails = JSON.parse(JSON.stringify(this.$store.state.user.current))
        let updatedShippingDetailsAddress = {
          first_name: this.shippingDetails.first_name,
          last_name: this.shippingDetails.last_name,
          streetName: this.shippingDetails.streetName,
          streetNumber: this.shippingDetails.streetNumber,
          city: this.shippingDetails.city,
          ...(this.shippingDetails.region ? { region: { region: this.shippingDetails.region } } : {}),
          country: this.shippingDetails.country,
          postalCode: this.shippingDetails.postalCode,
          ...(this.shippingDetails.phone ? { phone: this.shippingDetails.phone } : {})
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
          } else { this.onFailure(result) }
        } catch (err) {
          Logger.error(err)()
          this.onFailure(err)
        }
      }
    },
    onFailure (result) {
      this.$store.dispatch('notification/spawnNotification', {
        type: 'error',
        message: this.$t(result.message ? result.message : result),
        action1: { label: this.$t('OK') }
      })
    },
    exitSection (event, updatedShippingDetails) {
      if (!updatedShippingDetails) {
        this.shippingDetails = this.getShippingDetails()
        this.useCompanyAddress = false
        this.remainInEditMode = false
      }
      if (!this.remainInEditMode) {
        this.isEdited = false
      }
    },
    fillCompanyAddress () {
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
    readShippingDetailsFromCurrentUser (shippingDetails) {
      for (let address of this.currentUser.addresses) {
        if (address.set_as_default) {
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
            phone: address.hasOwnProperty('phone') ? address.phone : ''
          }
        }
      }
      return shippingDetails
    },
    getShippingDetails () {
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
        phone: ''
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
    getCountryName () {
      for (let i = 0; i < this.countries.length; i++) {
        if (this.countries[i].code === this.shippingDetails.country) {
          return this.countries[i].name
        }
      }
      return ''
    },
    hasBillingAddress () {
      if (this.currentUser) {
        if (this.currentUser.hasOwnProperty('default_billing')) {
          return true
        }
      }
      return false
    }
  }
}
