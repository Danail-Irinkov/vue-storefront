import * as types from './mutation-types'
import { quickSearchByQuery } from '@vue-storefront/core/lib/search'
import { StorageManager } from '@vue-storefront/core/lib/storage-manager'
import AttributeState from '../../types/AttributeState'
import RootState from '@vue-storefront/core/types/RootState'
import { ActionTree } from 'vuex'
import config from 'config'
import { Logger } from '@vue-storefront/core/lib/logger'
import { entityKeyName } from '@vue-storefront/core/lib/store/entities'
import { prefetchCachedAttributes } from '../../helpers/prefetchCachedAttributes'
import areAttributesAlreadyLoaded from './../../helpers/areAttributesAlreadyLoaded'
import createAttributesListQuery from './../../helpers/createAttributesListQuery'
import reduceAttributesLists from './../../helpers/reduceAttributesLists'

const actions: ActionTree<AttributeState, RootState> = {
  async updateAttributes ({ commit, getters }, { attributes }) {
    console.log('updateAttributes Start 1 labels', getters.attributeListByCode)
    console.log('updateAttributes Start 1 attributes', attributes)
    console.log('updateAttributes Start 1 StorageManager.attributes', StorageManager.get('attributes'))
    const idsList = getters.getAttributeListById
    const codesList = getters.getAttributeListByCode

    console.log('updateAttributes Start 2 idsList', idsList)
    console.log('updateAttributes Start 2 codesList', codesList)
    for (let attr of attributes) {
      if (attr && !config.attributes.disablePersistentAttributesCache) {
        const attrCollection = StorageManager.get('attributes')

        try {
          console.log('updateAttributes Start 3 setItem attr', attr.attribute_code)
          await attrCollection.setItem(entityKeyName('attribute_code', attr.attribute_code.toLowerCase()), attr)
          await attrCollection.setItem(entityKeyName('attribute_id', attr.attribute_id.toString()), attr)
        } catch (e) {
          Logger.error(e, 'mutations')()
        }
      }
    }

    console.log('updateAttributes Start 4 idsList', reduceAttributesLists({ codesList, idsList, attributes }))
    commit(types.ATTRIBUTE_UPD_ATTRIBUTES, reduceAttributesLists({ codesList, idsList, attributes }))
  },
  async loadCachedAttributes ({ dispatch }, { filterField, filterValues }) {
    if (!filterValues) {
      return
    }

    const attributes = await prefetchCachedAttributes(filterField, filterValues)
    console.log('loadCachedAttributes prefetchCachedAttributes', attributes)
    if (attributes) {
      await dispatch('updateAttributes', { attributes })
    }
  },
  updateBlacklist ({ commit, getters }, { filterValues, filterField, attributes }) {
    if (attributes && filterValues.length > 0) {
      const foundValues = attributes.map(attr => attr[filterField])
      const toBlackList = filterValues.filter(ofv => !foundValues.includes(ofv) && !getters.getBlacklist.includes(ofv))
      commit(types.ATTRIBUTE_UPD_BLACKLIST, toBlackList)
    }
  },
  /**
   * Load attributes with specific codes
   * @param {Object} context
   * @param {Array} attrCodes attribute codes to load
   */
  async list ({ getters, dispatch }, { filterValues = null, filterField = 'attribute_code', only_user_defined = false, only_visible = false, size = 150, start = 0, includeFields = config.entities.optimize ? config.entities.attribute.includeFields : null }) {
    console.log('ATTRIBUTES LIST 1')
    const blacklist = getters.getBlacklist
    const idsList = getters.getAttributeListById
    const codesList = getters.getAttributeListByCode
    const orgFilterValues = filterValues || []
    console.log('ATTRIBUTES LIST 2')
    await dispatch('loadCachedAttributes', { filterField, filterValues })
    console.log('ATTRIBUTES LIST 3')

    if (areAttributesAlreadyLoaded({ filterValues, filterField, blacklist, idsList, codesList })) {
      Logger.info('Skipping attribute load - attributes already loaded', 'attr', { orgFilterValues, filterField })()
      return { items: Object.values(codesList) }
    }

    console.log('ATTRIBUTES LIST 4')
    const query = createAttributesListQuery({
      filterValues,
      filterField,
      onlyDefinedByUser: only_user_defined,
      onlyVisible: only_visible
    })
    console.log('createAttributesListQuery query', query)
    const resp = await quickSearchByQuery({ entityType: 'attribute', query, includeFields, start, size })
    const attributes = resp && orgFilterValues.length > 0 ? resp.items : null
    // console.log('createAttributesListQuery resp', resp)
    // console.log('createAttributesListQuery attributes', attributes)
    console.log('ATTRIBUTES LIST 5 DISPATCHING')
    dispatch('updateBlacklist', { filterValues, filterField, attributes })
    await dispatch('updateAttributes', { attributes })

    return resp
  }
}

export default actions
