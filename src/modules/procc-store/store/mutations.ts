import { MutationTree } from 'vuex'
import StoreDataState from '../types/StoreDataState'

const mutations: MutationTree<StoreDataState> = {
  updateStoreBanners (state, data) {
    state.banners = data
  },
  SET_HEAD_IMAGE (state, headImage) {
    state.headImage = headImage
  },
  SET_CURRENT_STORE (state, data) {
    state.currentStore = data
  }
}

export default mutations
