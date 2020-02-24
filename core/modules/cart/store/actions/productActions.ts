import SearchQuery from '@vue-storefront/core/lib/search/searchQuery'

const productActions = {
  async findProductOption ({ dispatch }, { serverItem }) {
    if (serverItem.product_type === 'configurable') {
      let query = new SearchQuery()
      query = query.applyFilter({key: 'configurable_children.sku', value: {'eq': serverItem.sku}})

      const { items } = await dispatch('product/list', { query, start: 0, size: 1, updateState: false }, { root: true })
      return items.length >= 1 ? { sku: items[0].parentSku, childSku: serverItem.sku } : null
    }

    return { sku: serverItem.sku }
  },
  async getProductVariant ({ dispatch }, { serverItem }) {
    try {
      const options = await dispatch('findProductOption', { serverItem })
      console.log('getProductVariant options', options)
      const singleProduct = await dispatch('product/single', { options, assignDefaultVariant: true, setCurrentProduct: false, selectDefaultVariant: false }, { root: true })
      console.log('getProductVariant singleProduct', singleProduct)
      return {
        ...singleProduct,
        server_item_id: serverItem.item_id,
        qty: serverItem.qty,
        server_cart_id: serverItem.quote_id,
        product_option: serverItem.product_option || singleProduct.product_option
      }
    } catch (e) {
      console.log('getProductVariant e', e)
      return null
    }
  }
}

export default productActions
