<template>
  <div class="w-100" style="padding: 10px 20px 10px 20px; margin-bottom: 10px">
    <!--    // Edited by Dan 02-01-2020-->
    <div class="brdr-cl-primary py5 px20"
         style="">
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
        <div class="store-contact text shipping-method" v-if="getSelectedShippingMethods[brand_id]">
          {{ getSelectedShippingMethods[brand_id].name }} | {{ getSelectedShippingMethods[brand_id].cost | price }}
          <button class="btn normal-icon-btn" @click="showShippingModel(brand_id)">
            <svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="shipping-fast" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512" class="mr-2 svg-inline--fa fa-shipping-fast fa-w-20"><path fill="currentColor" d="M624 352h-16V243.9c0-12.7-5.1-24.9-14.1-33.9L494 110.1c-9-9-21.2-14.1-33.9-14.1H416V48c0-26.5-21.5-48-48-48H112C85.5 0 64 21.5 64 48v48H8c-4.4 0-8 3.6-8 8v16c0 4.4 3.6 8 8 8h272c4.4 0 8 3.6 8 8v16c0 4.4-3.6 8-8 8H40c-4.4 0-8 3.6-8 8v16c0 4.4 3.6 8 8 8h208c4.4 0 8 3.6 8 8v16c0 4.4-3.6 8-8 8H8c-4.4 0-8 3.6-8 8v16c0 4.4 3.6 8 8 8h208c4.4 0 8 3.6 8 8v16c0 4.4-3.6 8-8 8H64v128c0 53 43 96 96 96s96-43 96-96h128c0 53 43 96 96 96s96-43 96-96h48c8.8 0 16-7.2 16-16v-32c0-8.8-7.2-16-16-16zM160 464c-26.5 0-48-21.5-48-48s21.5-48 48-48 48 21.5 48 48-21.5 48-48 48zm320 0c-26.5 0-48-21.5-48-48s21.5-48 48-48 48 21.5 48 48-21.5 48-48 48zm80-208H416V144h44.1l99.9 99.9V256z" class=""></path></svg>
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
import ShippingMethod from './ShippingMethod'

export default {
  components: {
    Product,
    ShippingMethod
  },
  props: {
    brand_id: {
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
