<template>
  <router-link :to="localizedRoute('/')" :title="$t('Home Page')" class="no-underline inline-flex">
    <!--        // Changes Dan-->
    <img
      v-if="logo_loaded > 0"
      :width="width"
      :height="height"
      :src="storeLogo"
      :alt="$t(defaultTitle)"
      :key="logo_loaded"
    >
  </router-link>
</template>

<script>
import config from 'config'
import { currentStoreView } from '@vue-storefront/core/lib/multistore'
import { mapGetters } from 'vuex'

export default {
  computed: {
    ...mapGetters({
      storeLogo: 'procc/getStoreLogo'
    })
  },
  watch: {
    storeLogo: { // This was done by Vinod -> not sure why
      handler: function (newValue, oldValue) {
        console.log('storeLogo newValue', newValue)
        if (newValue !== '') {
          this.logo_loaded = 0
          setTimeout(() => this.logo_loaded++, 50)
        }
      },
      deep: true,
      immediate: true
    }
  },
  data () {
    const storeView = currentStoreView()
    return {
      defaultTitle: storeView.seo.defaultTitle ? storeView.seo.defaultTitle : config.seo.defaultTitle,
      logo_loaded: 0
    }
  },
  props: {
    width: {
      type: [String, Number],
      required: true
    },
    height: {
      type: [String, Number],
      required: true
    }
  }
}
</script>
