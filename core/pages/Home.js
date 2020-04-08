import { mapGetters } from 'vuex'

import EventBus from '@vue-storefront/core/compatibility/plugins/event-bus'
import i18n from '@vue-storefront/i18n'

import Composite from '@vue-storefront/core/mixins/composite'
import { Logger } from '@vue-storefront/core/lib/logger'
import {currentStoreView} from '../lib/multistore';
import isObject from 'lodash-es/isObject'

export default {
  name: 'Home',
  mixins: [Composite],
  methods: {
    stringifyTags (tags_obj) {
      if (!isObject(tags_obj)) return tags_obj;

      console.log('stringifyTags tags_obj', tags_obj)
      let tags_string = ''
      for (let key in tags_obj) {
        const tcat = tags_obj[key]
        for (let tag of tcat) {
          if (tags_string) tags_string += ' '
          tags_string += tag
        }
      }
      return tags_string
    }
  },
  computed: {
    ...mapGetters('category', ['getCategories']),
    currentStoreSettings () {
      return this.$store.getters['procc/getCurrentStore']
      // return {
      //   contact_information: 'contact_information',
      //   about_text: 'about_text',
      //   working_hours: 'working_hours'
      // }
    },
    rootCategories () {
      return this.getCategories
    }
  },
  async asyncData ({ store, route, context }) { // this is for SSR purposes to prefetch data
    if (context) context.output.cacheTags.add(`home`)
    Logger.info('Calling asyncData in Home Page (core)')()
    try {
      await EventBus.$emitFilter('home-after-load', { store: store, route: route })
    } catch (e) {
      Logger.error(e)()
      throw e
    }
  },
  beforeMount () {
    this.$store.dispatch('category/reset')
  },
  metaInfo () {
    const storeView = currentStoreView()
    const currentStore = this.$store.getters['procc/getCurrentStore']
    console.log('Home currentStore', currentStore)
    const about_text = currentStore && currentStore.storefront_setting && currentStore.storefront_setting.about_text ? currentStore.storefront_setting.about_text : storeView.about_text ? storeView.about_text : ''
    const tags = currentStore && currentStore.brand && currentStore.brand.tags ? this.stringifyTags(currentStore.brand.tags) : storeView.store_brand_tags ? storeView.store_brand_tags : ''

    console.log('Home about_text', about_text)
    console.log('Home tags', tags)

    let isMainProCCStore = storeView.storeCode === ''
    let currentBrandName = currentStore && currentStore.brand && currentStore.brand.name ? currentStore.brand.name : storeView.store_brand_name

    let title = isMainProCCStore ? i18n.t('All Stores') : currentBrandName + ' - ' + i18n.t('Home')
    let description = isMainProCCStore ? i18n.t('List of the available ProCC Store Brands') : about_text + ' - ' + tags
    return {
      title: this.$route.meta.title || title,
      // meta: this.$route.meta.description ? [{ vmid: 'description', name: 'description', content: this.$route.meta.description }] : []
      meta: [{ vmid: 'description', name: 'description', content: description }]
    }
  }
}
