<template>
  <div>
    <p>
      {{ $t(storeWorkingHours) }}
    </p>
    <p>
      {{ $t(storeContactInfo) }}
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
      storeWorkingHours () {
        let text = ''
        if (this.isDefaultStore){
          text = ''
        } else {
          text = this.currentStore && this.currentStore.storefront_setting && this.currentStore.storefront_setting.working_hours ? this.currentStore.storefront_setting.working_hours : this.currentStoreView.working_hours ? this.currentStoreView.working_hours : ''
        }
        return text
      },
      storeContactInfo () {
        let text = ''
        if (this.isDefaultStore){
          text = ''
        } else {
          text = this.currentStore && this.currentStore.storefront_setting && this.currentStore.storefront_setting.contact_information ? this.currentStore.storefront_setting.contact_information : this.currentStoreView.contact_information ? this.currentStoreView.contact_information : ''
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
