<template>
  <div>
<!--    <h2>-->
<!--      About us-->
<!--    </h2>-->
    <p>
      {{ $t(storeAboutText) }}
    </p>
  </div>
</template>

<script>
  import {currentStoreView} from "@vue-storefront/core/lib/multistore";
  import {mapGetters} from "vuex";

  export default {
    name: 'StoreAboutUs',
    props: {
    },
    data () {
      return {
      }
    },
    mounted () {
      console.log('StoreAboutUs MOUNTED!')
    },
    methods: {
    },
    computed: {
      ...mapGetters({
        currentStore: 'procc/getCurrentStore'
      }),
      storeAboutText () {
        let text = ''
        if (this.isDefaultStore){
          text = 'ProCC is a marketplace of content creators\' Favourite Product picks from different brands, ' +
            'but the Vendors process the shipping and customer support. Browse your favourite influencer\'s stores, ' +
            'support your favourite Content Creators by purchasing their favourite clothes, apparel, cosmetics and more'
        } else {
          text = this.currentStore && this.currentStore.storefront_setting && this.currentStore.storefront_setting.about_text ? this.currentStore.storefront_setting.about_text : this.currentStoreView.about_text ? this.currentStoreView.about_text : ''
        }
        return text
      },
      currentStoreView () {
        return currentStoreView()
      },
      isDefaultStore () {
        const storeView = currentStoreView();
        return storeView.storeCode === ''
      }
    }
  }
</script>

<style lang="scss" scoped>
</style>
