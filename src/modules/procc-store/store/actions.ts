import { ActionTree } from 'vuex'
import RootState from '@vue-storefront/core/types/RootState'
import StoreDataState from '../types/StoreDataState'
import { Logger } from '@vue-storefront/core/lib/logger'
import ProCcApi from 'src/themes/default-procc/helpers/procc_api.js'
import EventBus from '@vue-storefront/core/compatibility/plugins/event-bus'

const actions: ActionTree<StoreDataState, RootState> = {
  async updateStoreBanners ({commit, rootState, dispatch}, data) {
    dispatch('updateCurrentStore')
    let storeCategoriesBannersResource = rootState.storeView && rootState.storeView.storeCode ? `banners/${rootState.storeView.storeCode}_store_banners` : `store_banners`
    try {
      const storeCategoriesModule = await import(/* webpackChunkName: "vsf-promoted-offers-[request]" */ `theme/resource/${storeCategoriesBannersResource}.json`)
      commit('updateStoreBanners', storeCategoriesModule)
    } catch (err) {
      Logger.debug('Unable to load Store Category On Home' + err)()
    }
  },
  async updateHeadImage ({commit, rootState}, data) {
    let mainImageResource = rootState.storeView && rootState.storeView.storeCode ? `banners/${rootState.storeView.storeCode}_main-image` : `main-image`
    try {
      const imageModule = await import(/* webpackChunkName: "vsf-head-img-[request]" */ `theme/resource/${mainImageResource}.json`)
      commit('SET_HEAD_IMAGE', imageModule.image)
    } catch (err) {
      Logger.debug('Unable to load headImage' + err)()
    }
  },
  async updateCurrentStore ({commit, rootState}) {
    console.log('updateCurrentStore START')
    if (rootState.storeView && rootState.storeView.storeCode) {
      return ProCcApi().getStoreDataVSF(rootState.storeView.storeCode, rootState.storeView.procc_brand_id)
        .then((result) => {
          // console.log('updateCurrentStore RESULT', result.data.message_type)
          if (result.data && result.data.storeData) {
            commit('SET_CURRENT_STORE', result.data.storeData)
            if (result.data.storeData.storefront_setting && result.data.storeData.storefront_setting.template) {
              EventBus.$emit('update-theme', result.data.storeData.storefront_setting.template)
            }
          }
          return result.data.storeData
        })
        .catch((error) => {
          console.log('Error in updateCurrentStore', error)
        })
    } else { return null }
  }
}

export default actions
