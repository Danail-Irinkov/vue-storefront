import Product from '@vue-storefront/core/modules/catalog/types/Product'
import { ProductConfiguration } from '@vue-storefront/core/modules/catalog/types/ProductConfiguration'

const getAvailableFiltersByProduct = (product: Product) => {
  let filtersMap = {}
  if (product && product.configurable_options) {
    product.configurable_options.forEach(configurableOption => {
      const type = configurableOption.attribute_code
      let filterVariants
      if (configurableOption.values) {
        filterVariants = configurableOption.values.map(({value_index, label}) => {
          return {id: value_index, label, type}
        })
      } else {
        console.log('Error getAvailableFiltersByProduct missing onfigurableOption.values')
        filterVariants = []
      }
      filtersMap[type] = filterVariants
    })
  }

  // Added by Dan to correct the sizes order after Update
  if (filtersMap['size'] && filtersMap['size'][0] && filtersMap['size'][0].id) {
    filtersMap['size'] = filtersMap['size'].sort((a, b) => { return (a.id > b.id) ? 1 : -1 });
  }

  return filtersMap
}

const getSelectedFiltersByProduct = (product: Product, configuration: ProductConfiguration) => {
  // console.log('GSFP product', product)
  if (!configuration) {
    return null
  }

  let selectedFilters = {}
  if (configuration && product) {
    Object.keys(configuration).map(filterType => {
      const filter = configuration[filterType]
      selectedFilters[filterType] = {
        id: filter.id,
        label: filter.label,
        type: filterType
      }
    })
  }
  return selectedFilters
}

export { getAvailableFiltersByProduct, getSelectedFiltersByProduct }
