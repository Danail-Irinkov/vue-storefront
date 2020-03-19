<!-- Created component for display order items group by brand in order confirm and micro cart page -->
<template>
  <div class="w-100" :class="className">
    <div class="py5 px20">
      <div class="store-info" v-if="brand">
        <img :src="brand.logo.thumb" alt="" class="brand-img">
        <p>{{ brand.name }}</p>
        <div class="store-contact text brand-contact">
          <a class="btn normal-icon-btn no-underline" :href="'mailto:'+brand.customer_support_email">
            <i class="material-icons" data-v-0ac1abd3="">mail_outline</i>
          </a>
        </div>
        <div class="store-contact text shipping-method" :class="{pointer: !isDisabledInputs}" v-if="shippingMethod" @click="showShippingModel(brand._id, isDisabledInputs)">
          <strong v-if="orderId" class="mr10">Order Id #{{ orderId }}</strong>
          {{ shippingMethod.name }} |&nbsp;
          <span v-if="shippingMethod.cost && shippingMethod.cost > 0">{{ shippingMethod.cost | price }}</span>
          <span class="smaller-spinner" v-else><spinner /></span> &nbsp;
          <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 -5 73 70" fill="none" stroke="#202020" stroke-miterlimit="10" stroke-width="2" stroke-linejoin="round" data-darkreader-inline-fill="" data-darkreader-inline-stroke="" style="--darkreader-inline-fill:none; --darkreader-inline-stroke:#d4d1cc;"><g stroke-linecap="round"><path d="M17 15h26c2.3 0 2.1 1.6 1.7 3.1S41 33 41 33h10.1l4-2 3.9 2v8c0 1.3-.5 2-2 2h-8M9 43h6.6m9.4 0h14.6" /><path d="M43.6 23H49l6.1 8M31 23H9m18 8H5" /></g><path d="M24.8 44a6.9 6.9 0 0 1-6.2 5c-2.7 0-4.2-2.2-3.4-5a6.9 6.9 0 0 1 6.2-5c2.6 0 4.2 2.2 3.4 5zm24 0a6.9 6.9 0 0 1-6.2 5c-2.7 0-4.2-2.2-3.4-5a6.9 6.9 0 0 1 6.2-5c2.6 0 4.2 2.2 3.4 5z" /></svg>
        </div>
      </div>
      <!--<div class="row p10 between-xs order-item" v-for="product in productsInCartByBrandProCC(brand_id)" :key="product.sku">
        <div class="blend col-md-2">
          <product-image :image="getProductImage(product)"/>
        </div>
        <div class="col-md-6">
          <div class="h4 weight-400 cl-accent serif">
            {{ product.name | htmlDecode }}
          </div>
          <div class="h6 cl-tertiary pt5">
            {{ product.sku }}
          </div>
        </div>
        <div class="col-md-1">
          <div v-for="opt in product.options" :key="opt.label">
            <span class="opn">{{ opt.label }}: </span>
            <span class="opv" v-html="opt.value" />
          </div>
        </div>
        <div class="col-md-1">
          <div v-if="isOnline && product.totals">
            <span class="h4 cl-error" v-if="product.totals.discount_amount">{{ product.totals.row_total - product.totals.discount_amount + product.totals.tax_amount | price }} </span>
            <span class="price-original h5" v-if="product.totals.discount_amount">{{ product.totals.row_total_incl_tax | price }}</span>
            <span v-if="!product.totals.discount_amount" class="h4">{{ product.totals.row_total_incl_tax | price }}</span>
          </div>
          <div v-else>
            <span class="h4 cl-error" v-if="product.special_price">{{ product.price_incl_tax * product.qty | price }} </span>
            <span class="price-original h5" v-if="product.special_price">{{ product.original_price_incl_tax * product.qty | price }}</span>
            <span v-if="!product.special_price" class="h4">{{ product.price_incl_tax * product.qty | price }}</span>
          </div>
        </div>
      </div>-->
      <ul class="thank-you-order-items">
        <microcart-product v-for="product in orderItems" :key="product.checksum || product.sku" :product="getProductData(product)" :is-disabled-inputs="isDisabledInputs" />
      </ul>
    </div>
  </div>
</template>

<script>
import MicrocartProduct from 'theme/components/core/blocks/Microcart/Product'
import { onlineHelper } from '@vue-storefront/core/helpers'
import { CartSummary } from '@vue-storefront/core/modules/checkout/components/CartSummary';
import Spinner from 'theme/components/core/Spinner' //Added By Dan

export default {
  components: {
    MicrocartProduct,
    Spinner
  },
  props: {
    brand: {
      type: Object,
      required: true,
      default: ''
    },
    orderId: {
      type: Number,
      default: 0
    },
    orderItems: {
      type: Array,
      required: true,
      default: []
    },
    shippingMethod: {
      type: Object,
      default: () => {}
    },
    isDisabledInputs: {
      type: Boolean,
      required: false
    },
    className: {
      type: String,
      default: ''
    }
  },
  computed: {
    isOnline () {
      return onlineHelper.isOnline
    },
    favoriteIcon () {
      return this.isOnWishlist ? 'favorite' : 'favorite_border'
    }
  },
  mixins: [CartSummary],
  methods: {
    getProductData (product) {
      let product_data = product
      if (!product_data.price_incl_tax) { product_data.price_incl_tax = product.price }
      return product_data
    }
  }
}
</script>

<style lang="scss" scoped>
  .summary-title {
    @media (max-width: 767px) {
      margin-left: 0;
    }
  }
  .store-info {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    flex-wrap: wrap;
    .brand-img {
      max-width: 30px;
      float: left;
      margin-right: 10px;
    }
    .store-contact {
      float: left;
      margin-left: 15px;
      position: relative;
      line-height: 0;
    }
    .shipping-method {
      margin-left: auto;
      display: flex;
      align-items: center;
      max-width: 80%;
      line-height: normal;
      i {
        margin-left: 10px;
      }
      .normal-icon-btn svg.fa-shipping-fast{
        width: 25px;
        margin-left: 5px;
      }
    }
  }
</style>
<style lang="scss">
  .smaller-spinner {
    & > div.spinner {
      padding: 0px 8px!important;
    }
  }
  @media (max-width: 991px) {
    .store-info p {
      max-width: 60%;
    }
    .store-contact.text.brand-contact {
      margin-left: 10px;
    }
  }
  ul.thank-you-order-items {
    padding: 0;
    margin: 0;
    li.row {
      padding: 10px;
      .blend {
        flex: none;
        & > div {
          margin: 0;
          background: #fff;
          img {
            max-width: 100%;
            position: relative;
            transform: none;
            top: 0;
            left: 0;
          }
          .product-image.product-image--width {
            padding: 0 !important;
            height: auto;
            width: 150px;
          }
        }
      }
    }
    .prices {
      margin-left: auto;
      @media (max-width: 767px) {
        margin-left: 0;
        text-align: left;
      }
    }
    .product-name-and-qty {
      @media (max-width: 767px) {
        flex-direction: column;
      }
    }
    .details {
      .product-name-and-qty {
        max-width: 80%;
      }
    }
  }
</style>
