<template>
  <div>
    <a href="#" class="store-locale" @click.prevent="showLanguagesModal">
      <!--      {{ country }} / {{ lang }} / {{ currency }}-->
      <!--      // Edited by Dan-->
      {{ lang }} / {{ currency }}
    </a>
    <modal-switcher v-if="loadLanguagesModal" />
  </div>
</template>

<script>
import { currentStoreView } from '@vue-storefront/core/lib/multistore'
const ModalSwitcher = () => import(/* webpackChunkName: "vsf-languages-modal" */ 'theme/components/core/blocks/Switcher/Language.vue')
import i18n from '@vue-storefront/i18n'

export default {
  components: {
    ModalSwitcher
  },
  data () {
    const storeView = currentStoreView()
    return {
      country: storeView.i18n.defaultCountry,
      // lang: storeView.i18n.defaultLanguage,
      currency: storeView.i18n.currencyCode,
      loadLanguagesModal: false
    }
  },
  computed: {
    lang () { // added by Dan
      return i18n.locale.slice(0,2).toUpperCase()
    }
  },
  methods: {
    showLanguagesModal () {
      this.loadLanguagesModal = true
      this.$bus.$emit('modal-show', 'modal-switcher')
    }
  }
}
</script>

<style lang="scss" scoped>

</style>
