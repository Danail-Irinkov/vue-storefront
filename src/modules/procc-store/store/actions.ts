import { ActionTree } from 'vuex'
import RootState from '@vue-storefront/core/types/RootState'
import StoreDataState from '../types/StoreDataState'
import { Logger } from '@vue-storefront/core/lib/logger'
import procc_api from '@vue-storefront/theme-default-procc/helpers/procc_api'

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
    procc_api().getStoreDataForVSF(rootState.storeView.storeCode)
      .then((result) => {
        if (result.data && result.data.storefront)
          commit('SET_CURRENT_STORE', result.data.storefront)
      })
      .catch((error) => {
        console.log(error)
      })
  }
}

export default actions
