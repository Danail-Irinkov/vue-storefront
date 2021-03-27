<template>
  <transition-group name="fade-in-down">
    <div class="free-shipment-banner bg-cl-primary" key="fsb" v-if="showFreeShipmentBanner">
      <p class="align-center" style="margin: 0;padding: 10px;font-size: 14px">
          {{$t('freeShippingBannerText', {brand_name: shipmentBannerData.brand_name}) }} {{shipmentBannerData.free_shipping_amount | price}}
      </p>
      <div class="w-100" style="height: 0!important;">
        <button style="position: relative;top: -31px;width: 98%;"
                type="button"
                :aria-label="$t('Close')"
                class="w-100 inline-flex end-xs bg-cl-transparent brdr-none p0 close-btn"
                @click="toggleFreeShippingBanner">
          <i class="material-icons">close</i>
        </button>
      </div>
    </div>
  </transition-group>
</template>
<script>
    export default {
      name: 'free-shipping-banner',
      data() {
          return {
            showFreeShipmentBanner: true,
            shipmentBannerData: {
              brand_name: '',
              free_shipping_amount: 50,
            },
          }
      },
      created(){
        this.$bus.$on('toggleFreeShippingBanner', this.toggleFreeShippingBanner)
      },
      beforeDestroy() {
        this.$bus.$off('toggleFreeShippingBanner')
      },
      methods: {
        toggleFreeShippingBanner(data = {}) {
          console.log('toggleFreeShippingBanner Start', data)
          if (data && data.brand_name) {
            this.shipmentBannerData = {...data}
            this.showFreeShipmentBanner = true
          } else {
            this.showFreeShipmentBanner = !this.showFreeShipmentBanner
          }
        }
      }
    }
</script>
<style lang="scss" scoped>
    @import '~theme/css/variables/colors';
    @import '~theme/css/helpers/functions/color';

    $color-icon-hover: color(secondary, $colors-background);

    header {
        height: 54px;
        top: -55px;
        z-index: 3;
        transition: top 0.2s ease-in-out;
    }

    @media (max-width: 767px) {
        a,
        span {
            font-size: 12px;
        }
    }
</style>
