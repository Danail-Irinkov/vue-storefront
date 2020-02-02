import { ActionTree } from 'vuex'
import * as stockMutationTypes from '@vue-storefront/core/modules/catalog/store/stock/mutation-types'
import RootState from '@vue-storefront/core/types/RootState'
import StockState from '../../types/StockState'
import config from 'config'
import { StockService } from '@vue-storefront/core/data-resolver'
import { getStatus, getProductInfos } from '@vue-storefront/core/modules/catalog/helpers/stock'
import { Logger } from '@vue-storefront/core/lib/logger'
import ProCcApi from 'src/themes/default-procc/helpers/procc_api.js'

const actions: ActionTree<StockState, RootState> = {
  async queueCheck ({ dispatch }, { product }) {
    const checkStatus = {
      qty: product.stock ? product.stock.qty : 0,
      status: getStatus(product, 'ok')
    }
    if (config.stock.synchronize) {
      // call procc api for get quantity by shabbir
      ProCcApi().checkProductQty({product_id: product.procc_product_id, sku: product.sku, size: product.size}, product.procc_brand_id).then((result) => {
        dispatch('cart/stockSync', result.data.product, { root: true })
        // Edited for set product available qty. in vuex by shabbir
        console.log('queueCheck result.data.product', result.data.product)
        console.log('queueCheck product.procc_product_id', product.procc_product_id)

        let product_data = result.data.product
        let quantities = product_data.available_qty
        quantities.product_id = product.procc_product_id
        dispatch('product/setProductAvailableQuantity', quantities, { root: true })
        Logger.debug(`Stock quantity checked for ${result.data.product.product_sku}, response time: ${result.data.product.transmited_at - result.data.product.created_at} ms`, 'stock')()
      }).catch((error) => {
        console.error('error check qty', error)
      })
      // @ts-ignore

      return {
        ...checkStatus,
        onlineCheckTaskId: ''
      }
    }
    return {
      ...checkStatus,
      status: getStatus(product, 'volatile')
    }
  },
  async check (context, { product }) {
    if (config.stock.synchronize) {
      // call procc api for get quantity by shabbir
      return ProCcApi().checkProductQty({product_id: product.procc_product_id, sku: product.sku, size: product.size}, product.procc_brand_id)
        .then((result) => {
        // Edited for set product available qty. in vuex by shabbir
          console.log('check result.data.product', result.data.product)
          console.log('queueCheck product.procc_product_id', product.procc_product_id)
          let product_data = result.data.product
          let quantities = product_data.available_qty
          quantities.product_id = product.procc_product_id
          context.dispatch('product/setProductAvailableQuantity', quantities, { root: true })
          return {
            qty: result.data.product ? parseInt(result.data.product.qty) : 0,
            status: getStatus(result.data.product, 'ok'),
            onlineCheckTaskId: ''
          }
        }).catch((error) => {
          console.error('error check qty', error)
          return {
            qty: 0,
            status: getStatus({}, 'ok'),
            onlineCheckTaskId: ''
          }
        })
    }

    return {
      qty: product.stock ? product.stock.qty : 0,
      status: getStatus(product, 'volatile')
    }
  },
  async list ({ commit }, { skus }) {
    if (!config.stock.synchronize) return

    const task = await StockService.list(skus)

    if (task.resultCode === 200) {
      const productInfos = getProductInfos(task.result)

      for (const productInfo of productInfos) {
        commit(stockMutationTypes.SET_STOCK_CACHE_PRODUCT, {
          productId: productInfo.product_id,
          productInfo
        })
      }
    }

    return task
  },
  clearCache ({ commit }) {
    commit(stockMutationTypes.SET_STOCK_CACHE, {})
  }
}

export default actions
