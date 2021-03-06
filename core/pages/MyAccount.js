import i18n from '@vue-storefront/i18n'
import Composite from '@vue-storefront/core/mixins/composite'
import { Logger } from '@vue-storefront/core/lib/logger'
import { currentStoreView, localizedRoute } from '@vue-storefront/core/lib/multistore'
import {htmlDecode} from '../filters';

export default {
  name: 'MyAccount',
  mixins: [Composite],
  props: {
    activeBlock: {
      type: String,
      default: 'MyProfile'
    }
  },
  data () {
    return {
      navigation: [],
      returnEditMode: false
    }
  },
  beforeMount () {
    this.$bus.$on('myAccount-before-updateUser', this.onBeforeUpdateUser)
    this.$bus.$on('myAccount-before-changePassword', this.onBeforeChangePassword)
  },
  async mounted () {
    await this.$store.dispatch('user/startSession')
    if (!this.$store.getters['user/isLoggedIn']) {
      localStorage.setItem('redirect', this.$route.path)
      this.$router.push(localizedRoute('/', currentStoreView().storeCode))
    }
  },
  destroyed () {
    this.$bus.$off('myAccount-before-updateUser', this.onBeforeUpdateUser)
    this.$bus.$off('myAccount-before-changePassword', this.onBeforeChangePassword)
  },
  methods: {
    onBeforeChangePassword (passwordData) {
      this.$store.dispatch('user/changePassword', passwordData)
    },
    onBeforeUpdateUser (updatedData) {
      if (updatedData) {
        try {
          // changed update to updateCustomerProfile method in vuex for update customer data by shabbir
          this.$store.dispatch('user/updateCustomerProfile', { customer: updatedData })
        } catch (err) {
          this.$bus.$emit('myAccount-before-remainInEditMode', this.$props.activeBlock)
          Logger.error(err)()
        }
      }
    }
  },
  metaInfo () {
    const currentStoreBrand = this.$store.getters['procc/getCurrentStoreBrand']
    let currentBrandName = currentStoreBrand.name

    return {
      title: htmlDecode((currentBrandName ? currentBrandName + ' - ' : '') + i18n.t('My Account')), // Added by Dan
      // title: this.$route.meta.title || i18n.t('My Account'),
      meta: this.$route.meta.description ? [{ vmid: 'description', name: 'description', content: this.$route.meta.description }] : []
    }
  },
  asyncData ({ store, route, context }) { // this is for SSR purposes to prefetch data
    return new Promise((resolve, reject) => {
      if (context) context.output.cacheTags.add(`my-account`)
      resolve()
    })
  }
}
