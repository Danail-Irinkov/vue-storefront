import { GetterTree } from 'vuex'
import RootState from '@vue-storefront/core/types/RootState'
import StoreDataState from '../types/StoreDataState'
import _ from 'lodash'
import {currentStoreView} from '../../../../core/lib/multistore';
import actions from './actions'

const getters: GetterTree<StoreDataState, RootState> = {
  getStoreBanners: state => {
    return state.banners
  },
  getStorePolicies: state => {
    let policies = []
    if (state.currentStore.policies) {
      policies.push('asdads')
    }
    return policies
  },
  getHeadImage: state => state.headImage,
  getStoreLogo: state => {
    return state.headImage && state.headImage.logo ? _.get(state.headImage, 'logo') : '/assets/logo.svg'
  },
  getCurrentStore: state => state.currentStore,
  getCurrentStoreBrand: state => state.currentStore && state.currentStore.brand && state.currentStore.brand._id ? state.currentStore.brand : {}
}

export default getters
