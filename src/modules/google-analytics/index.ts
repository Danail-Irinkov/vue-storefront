import VueAnalytics from 'vue-analytics'
import { Logger } from '@vue-storefront/core/lib/logger'
import { once, isServer } from '@vue-storefront/core/helpers'
import { StorefrontModule } from '@vue-storefront/core/lib/modules';
import Vue from 'vue';

const googleAnalyticsStore = {
  namespaced: true,
  state: {
    key: null
  }
}

export const GoogleAnalyticsModule: StorefrontModule = function ({store, router, appConfig}) {
  // console.log('GoogleAnalyticsModule appConfig', appConfig)
  // console.log('Google Analytics Starting up with id1: ', appConfig.analytics.id)
  if (appConfig.analytics.id && !isServer && process.env.NODE_ENV === 'production') {
    once('__VUE_EXTEND_ANALYTICS__', () => {
      // console.log('Google Analytics Starting up with id2: ', appConfig.analytics.id)
      Vue.use(VueAnalytics, {
        id: appConfig.analytics.id,
        router,
        ecommerce: {
          enabled: true
        }
      })
    })
  } else {
    Logger.warn(
      'Google Analytics extension is not working. Ensure Google Analytics account ID is defined in config',
      'GA'
    )()
  }

  store.registerModule('google-analytics', googleAnalyticsStore)

  if (appConfig.analytics.id && !isServer) {
    Vue.prototype.$bus.$on('order-after-placed', event => {
      const order = event.order
      const ecommerce = (Vue as any).$ga.ecommerce

      order.products.forEach(product => {
        ecommerce.addItem({
          id: product.id.toString(),
          name: product.name,
          sku: product.sku,
          category: product.category ? product.category[0].name : '',
          price: product.price.toString(),
          quantity: product.qty.toString()
        })
      })
      ecommerce.send()
    })
  }
}
