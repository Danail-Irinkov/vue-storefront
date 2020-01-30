<template>
<div>
  <p>
    {{ shipping.firstName }} {{ shipping.lastName }}
  </p>
  <p>
    {{ shipping.streetAddress }} {{ shipping.apartmentNumber }}
  </p>
  <p>
    {{ shipping.city }} {{ shipping.zipCode }}
  </p>
  <p>
    <span v-if="shipping.state">{{ shipping.state }}, </span>
    <span>{{ getCountryName() }}</span>
  </p>
  <div v-if="shipping.phoneNumber">
    <span class="pr15">{{ shipping.phoneNumber }}</span>
    <tooltip>{{ $t('Phone number may be needed by carrier') }}</tooltip>
  </div>
</div>
</template>

<script>
const Countries = require('@vue-storefront/i18n/resource/countries.json')
export default {
  name: 'Address',
  data () {
    return {
      countries: Countries
    }
  },
  props: {
    shipping: null
  },
  methods: {
    getCountryName () {
      for (let i = 0; i < this.countries.length; i++) {
        if (this.countries[i].code === this.shipping.country) {
          return this.countries[i].name
        }
      }
      return ''
    }
  }
}
</script>

<style scoped>

</style>
