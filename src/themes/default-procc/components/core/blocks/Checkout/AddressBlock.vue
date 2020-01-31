<!--Created component for display address block by shabbir-->
<template>
<div :class="className">
  <p>
    {{ address.first_name }} {{ address.last_name }}
  </p>
  <p>
    {{ address.streetNumber }} - {{ address.streetName }}
  </p>
  <p>
    {{ address.city }} {{ address.postalCode }}
  </p>
  <p>
    <span v-if="address.country"> {{ getCountryName() }}</span>
  </p>
  <div v-if="address.phoneNumber">
    <span class="pr15">{{ address.phoneNumber }}</span>
    <tooltip>{{ $t('Phone number may be needed by carrier') }}</tooltip>
  </div>
</div>
</template>

<script>
const Countries = require('@vue-storefront/i18n/resource/countries.json')
export default {
  name: 'AddressBlock',
  data () {
    return {
      countries: Countries
    }
  },
  props: {
    address: {
      default: {}
    },
    className: {
      default: ''
    }
  },
  methods: {
    getCountryName () {
      for (let i = 0; i < this.countries.length; i++) {
        if (this.countries[i].code === this.address.country) {
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
