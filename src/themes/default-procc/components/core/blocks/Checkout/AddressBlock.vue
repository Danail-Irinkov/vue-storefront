<!--Created component for display address block by shabbir-->
<template>
  <div :class="className">
    <p>
      {{ address.first_name }} {{ address.last_name }}
    </p>
    <p v-if="address.streetNumber || address.streetName">
      {{ address.streetNumber }} - {{ address.streetName }},
    </p>
    <p v-if="address.city || address.postalCode">
      {{ address.city }} {{ address.postalCode }},
    </p>
    <p>
      <span v-if="address.country"> {{ address.country }}</span>
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
      type: Object,
      required: true,
      default: {}
    },
    className: {
      type: String,
      default: ''
    }
  }
}
</script>

<style scoped>

</style>
