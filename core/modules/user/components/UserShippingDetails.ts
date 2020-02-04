import toString from 'lodash-es/toString'
const Countries = require('@vue-storefront/i18n/resource/countries.json')

export const UserShippingDetails = {
  name: 'MyShippingDetails',
  data () {
    return {
      shippingDetails: {
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
    updateDetails () {
      let updatedShippingDetails
      if (!this.objectsEqual(this.shippingDetails, this.getShippingDetails())) {
        updatedShippingDetails = JSON.parse(JSON.stringify(this.$store.state.user.current))
        let updatedShippingDetailsAddress = {
          first_name: this.shippingDetails.first_name,
          last_name: this.shippingDetails.last_name,
          streetName: [this.shippingDetails.streetName, this.shippingDetails.streetNumber],
          city: this.shippingDetails.city,
          ...(this.shippingDetails.region ? { region: { region: this.shippingDetails.region } } : {}),
          country_id: this.shippingDetails.country,
          postalCode: this.shippingDetails.postalCode,
          ...(this.shippingDetails.phone ? { telephone: this.shippingDetails.phone } : {})
        }
        if (this.currentUser.hasOwnProperty('default_shipping')) {
          if (this.currentUser.addresses.length === 0) {
            updatedShippingDetails = null
          } else {
            updatedShippingDetails.addresses = updatedShippingDetails.addresses.map((address) =>
              toString(address.id) === toString(this.currentUser.default_shipping)
                ? {...address, ...updatedShippingDetailsAddress} // update default address if already exist
                : address
            )
          }
        } else {
          // create default address
          updatedShippingDetails.addresses.push({
            ...updatedShippingDetailsAddress,
            default_shipping: true
          })
        }
      }
      this.exitSection(null, updatedShippingDetails)
    },
    exitSection (event, updatedShippingDetails) {
      this.$bus.$emit('myAccount-before-updateUser', updatedShippingDetails)
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
        const companyAddress = this.currentUser.addresses.find((address) => (!address._id.set_as_default))
        if (companyAddress) {
          this.shippingDetails.first_name = companyAddress.first_name
          this.shippingDetails.last_name = companyAddress.last_name
          this.shippingDetails.streetName = companyAddress.streetName
          this.shippingDetails.streetNumber = companyAddress.streetNumber
          this.shippingDetails.city = companyAddress.city
          this.shippingDetails.postalCode = companyAddress.postalCode
          this.shippingDetails.region = companyAddress.region.region ? companyAddress.region.region : ''
          this.shippingDetails.country = companyAddress.country_id
        }
      } else {
        this.shippingDetails = this.getShippingDetails()
      }
    },
    readShippingDetailsFromCurrentUser (shippingDetails) {
      for (let address of this.currentUser.addresses) {
        if (!address._id.set_as_default) {
          return {
            first_name: address.first_name,
            last_name: address.last_name,
            streetName: address.streetName,
            streetNumber: address.streetNumber,
            city: address.city,
            postalCode: address.postalCode,
            region: address.region && address.region.region ? address.region.region : '',
            country: address.country_id,
            phone: address.hasOwnProperty('telephone') ? address.telephone : ''
          }
        }
      }
      return shippingDetails
    },
    getShippingDetails () {
      this.currentUser = Object.assign({}, this.$store.state.user.current)
      let shippingDetails = {
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
        if (this.currentUser && this.currentUser.addresses) {
          shippingDetails = this.readShippingDetailsFromCurrentUser(shippingDetails);
        } else {
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
