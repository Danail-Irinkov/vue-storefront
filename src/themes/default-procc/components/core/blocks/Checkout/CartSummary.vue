<template>
  <div class="w-100" style="padding: 10px 20px 10px 20px; margin-bottom: 10px">
    <!--    // Edited by Dan 02-01-2020-->
    <div class="brdr-cl-primary py5 px20"
         style=""
    >
      <!--      // DISABLED BY DAN -> Not Needed as it is obvious-->
      <!--      <h3 class="order-sum cl-accent summary-title">-->
      <!--        {{ $t('Cart Items') }}-->
      <!--      </h3>-->
      <div class="store-info" v-if="brand_id">
        <img :src="getBrandData(brand_id).logo.thumb" alt="" class="brand-img">
        <p>{{ getBrandData(brand_id).name }}</p>
        <div class="store-contact text brand-contact">
          <a class="btn normal-icon-btn" :href="'mailto:'+getBrandData(brand_id).customer_support_email">
            <i class="material-icons" data-v-0ac1abd3="">mail_outline</i>
          </a>
        </div>
        <div class="store-contact text shipping-method pointer" v-if="getSelectedShippingMethods[brand_id]" @click="showShippingModel(brand_id)">
          {{ getSelectedShippingMethods[brand_id].name }} | {{ getSelectedShippingMethods[brand_id].cost | price }}
          <button class="btn normal-icon-btn">
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 -5 73 70" fill="none" stroke="#202020" stroke-miterlimit="10" stroke-width="2" stroke-linejoin="round" data-darkreader-inline-fill="" data-darkreader-inline-stroke="" style="--darkreader-inline-fill:none; --darkreader-inline-stroke:#d4d1cc;"><g stroke-linecap="round"><path d="M17 15h26c2.3 0 2.1 1.6 1.7 3.1S41 33 41 33h10.1l4-2 3.9 2v8c0 1.3-.5 2-2 2h-8M9 43h6.6m9.4 0h14.6" /><path d="M43.6 23H49l6.1 8M31 23H9m18 8H5" /></g><path d="M24.8 44a6.9 6.9 0 0 1-6.2 5c-2.7 0-4.2-2.2-3.4-5a6.9 6.9 0 0 1 6.2-5c2.6 0 4.2 2.2 3.4 5zm24 0a6.9 6.9 0 0 1-6.2 5c-2.7 0-4.2-2.2-3.4-5a6.9 6.9 0 0 1 6.2-5c2.6 0 4.2 2.2 3.4 5z" /></svg>
          </button>
        </div>
      </div>
      <!--      <product v-for="product in productsInCart" :key="product.sku" :product="product" />-->
      <product v-for="product in productsInCartByBrandProCC(brand_id)" :key="product.sku" :product="product" />
    </div>
    <div class="py50 px25" v-show="false && 'TODO: need to edit the texts'">
      <h4 class="h3 m0">
        {{ $t('Safety') }}
      </h4>
      <p class="cl-tertiary lh20">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit.
        Nullam sed tempor lorem. Vivamus volutpat eros id est semper accumsan.
      </p>
      <h4 class="h3 mb0" v-if="!isVirtualCart">
        {{ $t('Shipping') }}
      </h4>
      <p class="cl-tertiary lh20" v-if="!isVirtualCart">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit.
        Nullam sed tempor lorem. Vivamus volutpat eros id est semper accumsan.
      </p>
      <h4 class="h3 mb0">
        {{ $t('Returns') }}
      </h4>
      <p class="cl-tertiary lh20">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit.
        Nullam sed tempor lorem. Vivamus volutpat eros id est semper accumsan.
      </p>
    </div>
  </div>
</template>

<script>
import { CartSummary } from '@vue-storefront/core/modules/checkout/components/CartSummary'
import Product from './Product'
// import ShippingMethod from './ShippingMethod'

export default {
  components: {
    Product
    // ShippingMethod
  },
  props: {
    brandId: {
      type: String,
      default: ''
    }
  },
  mixins: [CartSummary]
}
</script>

<style lang="scss" scoped>
  .summary-title {
    @media (max-width: 767px) {
      margin-left: 0;
    }
  }
  .store-info .brand-img {
    max-width: 30px;
    float: left;
    margin-right: 10px;
  }
  .store-info {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    flex-wrap: wrap;
  }
  .store-contact.text.shipping-method {
    margin-left: auto;
    display: flex;
    align-items: center;
    max-width: 80%;
    line-height: normal;
  }
  .store-contact.text.shipping-method i {
    margin-left: 10px;
    cursor: pointer;
  }
  .shipping-method .normal-icon-btn svg.fa-shipping-fast{
    width: 25px;
    margin-left: 5px;
    }
  @media (max-width: 767px) {
    .store-info p {
      min-width: calc(100% - 79px);
    }
  }
</style>
