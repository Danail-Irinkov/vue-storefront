<template>
  <div class="container pt5 pb30">
    <div class="row">
      <div class="col-12">
        <label for="search" class="visually-hidden">
          {{ $t('Search') }}
        </label>
        <div class="search-input-group" style="border-bottom: 0">
          <i class="material-icons search-icon">search</i>
          <input
            ref="search"
            id="search"
            v-model="search"
            class="search-panel-input"
            :placeholder="$t('What are you looking for?')"
            type="search"
            :autofocus="true"
          >
        </div>
      </div>
    </div>
    <div class="row">
      <a class="col-xl-6 no-underline"
         v-if="storeView && storeView.storeCode"
         v-for="(storeView, storeKey) in storeViews" :key="storeKey">
          <store-card :store-code="storeView.storeCode" :store-name="storeView.name.replace(' Store', '')" :storeUrl="storeView.url"/>
      </a>
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
    isStoreFiltered (storeView) {
      let bool = true
      let search = this.search.toLowerCase()
      if (search && storeView
        && !(storeView.storeCode.toLowerCase().indexOf(search) !== -1
          || (storeView.name && storeView.name.toLowerCase().indexOf(search) !== -1)
          || (storeView.storeName && storeView.storeName.toLowerCase().indexOf(search) !== -1)
          || (storeView.store_brand_name && storeView.store_brand_name.toLowerCase().indexOf(search) !== -1)
          || (storeView.store_brand_tags && storeView.store_brand_tags.indexOf(search) !== -1)
        )){
        bool = false
      }
      return bool
    },
  },
  mounted () {
    this.defaultStoreViews = store.state.config.storeViews
  },
  data () {
    return {
      search: '',
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
          const storeView = store.state.config.storeViews[key]
          if (storeView && storeView.storeCode && !storeView.is_test && !storeView.disabled && this.isStoreFiltered(storeView)) {
            store_views[key] = storeView
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
<style lang="scss" scoped>
  @import "~theme/css/animations/transitions";
  @import "~theme/css/variables/grid";
  @import "~theme/css/variables/typography";

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
  .search-input-group {
    display: flex;
    border-bottom: 1px solid #bdbdbd;
  }

  .search-icon {
    width: 60px;
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .search-panel-input {
    width: 100%;
    height: 60px;
    padding-bottom: 0;
    padding-top: 0;
    border: none;
    outline: 0;
    font-size: 18px;
    font-family: map-get($font-families, secondary);

    @media #{$media-xs} {
      font-size: 16px;
    }
  }
</style>
