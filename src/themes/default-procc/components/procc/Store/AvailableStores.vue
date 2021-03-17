<template>
  <div class="container pt30 pb30">
    <div class="row">
<!--      <div class="col-md-3 start-xs category-filters">-->
<!--        <div class="sidebar">-->
<!--          <h4 class="sidebar__header">-->
<!--            <span> {{ $t('Filter') }} </span>-->
<!--            <button-->
<!--              class="no-outline brdr-none py15 px40 bg-cl-mine-shaft :bg-cl-th-secondary ripple h5 cl-white sans-serif" @click="clearFilter()" v-if="isActive != false"-->
<!--            >-->
<!--              {{ $t('Clear') }}-->
<!--            </button>-->
<!--          </h4>-->
<!--          <div>-->
<!--            <h5>Store Name</h5>-->
<!--            <div class="button-div">-->
<!--              <button-->
<!--                class="bg-cl-primary brdr-1 brdr-cl-primary brdr-square h5 cl-tertiary name-selector" :class="{'active': isActive == 'asc'}" @click="sortStore('asc')"-->
<!--              >-->
<!--                Ascending-->
<!--              </button>-->
<!--              <button-->
<!--                class="pt2 bg-cl-primary brdr-1 brdr-cl-primary brdr-square h5 cl-tertiary name-selector" :class="{'active': isActive == 'desc'}" @click="sortStore('desc')"-->
<!--              >-->
<!--                Descending-->
<!--              </button>-->
<!--            </div>-->
<!--          </div>-->
<!--        </div>-->
<!--      </div>-->
<!--      <div class="col-12 justify-content-center">-->
<!--        <div class="row">-->
          <a class="col-xl-6 no-underline"
             v-if="!storeView.disabled && typeof storeView === 'object' && storeView.i18n"
             v-for="(storeView, storeCode) in storeViews" :key="storeCode">
              <store-card :store-code="storeView.storeCode" :store-name="storeView.name.replace(' Store', '')" :storeUrl="storeView.url"/>
          </a>
<!--        </div>-->
<!--      </div>-->
    </div>
  </div>
</template>
<script>
import StoreCard from 'theme/components/procc/Store/StoreCard'
import store from '@vue-storefront/core/store'
import _ from 'lodash'

export default {
  components: {
    StoreCard
  },
  methods: {
    sortStore (sort) {
      this.isActive = sort
      this.stores = _.orderBy(this.storeViews, ['storeCode'], sort.toString())
      store.state.config.storeViews = this.stores
    },
    clearFilter () {
      this.isActive = false
      store.state.config.storeViews = this.defaultStoreViews
      this.stores = this.defaultStoreViews
    }
  },
  mounted () {
    this.defaultStoreViews = store.state.config.storeViews
  },
  data () {
    return {
      defaultStoreViews: '',
      isActive: false,
      stores: store.state.config.storeViews
    }
  },
  computed: {
    storeViews () { // Added by Dan to remove Dev stores
      let store_views = {};
      for (let key in store.state.config.storeViews) {
        if (store.state.config.storeViews.hasOwnProperty(key)) {
          if (store.state.config.storeViews[key] && store.state.config.storeViews[key].is_test) {
            // continue
          } else {
            store_views[key] = store.state.config.storeViews[key]
          }
        }
      }
      // TODO: transport the brand rating value to store objects so we can sort more elaborately :)
      store_views = _.orderBy(store_views, ['storeId'], 'desc')
      return store_views
    }
  }
}
</script>
<style lang="scss">
  .justify-content-center {
    justify-content: center;
  }
  .sidebar__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    min-height: 47px;
  }
  .name-selector {
    padding: 5px
  }
  .name-selector.active {
    border-color: #828282;
    border-width: 2px;
    color: #828282;
  }
  .button-div{
    flex-direction: column;
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    height: 65px;
  }
  .button-div button {
    width: 90px
  }
</style>
