<template>
  <div id="checkout" ref="checkout">
    <div class="container">
      <div class="row" v-show="!isThankYouPage">
        <!--        // Edited By Dan-->
        <div class="col-lg-8 col-md-12 col-sm-12 col-xs-12 mt20" style="">
          <div class="box-left"
               v-for="(brand_id, index) in getArrayBrandsOfCartProductsProCC()"
               :key="index"
          >
            <cart-summary :brand-id="brand_id" />
          </div>
          <div class="box-left mt20">
            <!--    // Edited by Dan 02-01-2020-->
            <div class="checkout-title py5 px20">
              <h3>
                {{ $t('Checkout') }}
              </h3>
            </div>
            <personal-details
              class="line relative"
              :is-active="activeSection.personalDetails"
              :focused-field="focusedField"
            />
            <shipping class="line relative"
                      data-scroll id="#shipping"
                      :is-active="activeSection.shipping" v-if="!isVirtualCart"
            />
            <payment class="line relative"
                     data-scroll id="#payment"
                     :is-active="activeSection.payment"
            />

            <div id="custom-steps" />
          </div>
        </div>
        <!--        <div class="hidden-xs col-sm-5 bg-cl-secondary">-->
        <!--        // TODO: Need to make sure the cart summary shows in mobile version -> 'xs'-->
        <div class="col-lg-4 col-md-12 col-sm-12 mt20" style="z-index: 2">
          <div class="box-right">
            <order-summary />
          </div>
        </div>
      </div>
    </div>
    <order-finalized-thank-you v-show="isThankYouPage" />
    <shipping-method v-if="loadShippingMethod" :store-brand-id="brandId" :is-active="true" />
  </div>
</template>

<script>
import Checkout from '@vue-storefront/core/pages/Checkout'

import PersonalDetails from 'theme/components/core/blocks/Checkout/PersonalDetails'
import Shipping from 'theme/components/core/blocks/Checkout/Shipping'
import Payment from 'theme/components/core/blocks/Checkout/Payment'
// import OrderReview from 'theme/components/core/blocks/Checkout/OrderReview'
import CartSummary from 'theme/components/core/blocks/Checkout/CartSummary'
import OrderSummary from 'theme/components/core/blocks/Checkout/OrderSummary'
import OrderFinalizedThankYou from 'theme/components/procc/Checkout/OrderFinalizedThankYou'
import ShippingMethod from 'theme/components/procc/Checkout/ShippingMethod'
import { registerModule } from '@vue-storefront/core/lib/modules'
import { OrderModule } from '@vue-storefront/core/modules/order'

export default {
  components: {
    PersonalDetails,
    Shipping,
    Payment,
    OrderSummary,
    // OrderReview,
    CartSummary,
    OrderFinalizedThankYou, // Added by ProCC
    ShippingMethod // Added by ProCC
  },
  mixins: [Checkout],
  beforeCreate () {
    registerModule(OrderModule)
  },
  methods: {
    getArrayBrandsOfCartProductsProCC () { // Added by Dan to split items by Brand
      // console.log('his.$store.state.cart.cartItems', this.$store.state.cart.cartItems)
      let brands = []
      for (let product of this.$store.state.cart.cartItems) {
        if (brands.indexOf(product.procc_brand_id) === -1) {
          brands.push(product.procc_brand_id)
        }
      }
      // console.log('getArrayBrandsOfCartProductsProCC.brands', brands)

      return brands
    },
    notifyEmptyCart () {
      this.$bus.$emit('notification-progress-stop'); // Added by Dan
      this.$store.dispatch('notification/spawnNotification', {
        type: 'warning',
        message: this.$t('Shopping cart is empty. Please add some products before entering Checkout'),
        action1: { label: this.$t('OK') }
      })
    },
    notifyOutStock (chp) {
      this.$bus.$emit('notification-progress-stop'); // Added by Dan
      this.$store.dispatch('notification/spawnNotification', {
        type: 'error',
        message: chp.name + this.$t(' is out of stock!'),
        action1: { label: this.$t('OK') }
      })
    },
    notifyNotAvailable () {
      this.$bus.$emit('notification-progress-stop'); // Added by Dan
      this.$store.dispatch('notification/spawnNotification', {
        type: 'error',
        message: this.$t('Some of the ordered products are not available!'),
        action1: { label: this.$t('OK') }
      })
    },
    notifyStockCheck () {
      this.$bus.$emit('notification-progress-stop'); // Added by Dan
      this.$store.dispatch('notification/spawnNotification', {
        type: 'warning',
        message: this.$t('Please wait while we check for available stock quantities'),
        action1: { label: this.$t('OK') }
      })
    },
    notifyNoConnection () {
      this.$bus.$emit('notification-progress-stop'); // Added by Dan
      this.$store.dispatch('notification/spawnNotification', {
        type: 'warning',
        message: this.$t('We are sorry, there is no Internet connection. You can still place your order. We will notify you when we are back online if any of your ordered products are out of stock.'),
        action1: { label: this.$t('OK') }
      })
    }
  }
}
</script>
<style lang="scss">
  @import '~theme/css/base/text';
  @import '~theme/css/variables/colors';
  @import '~theme/css/helpers/functions/color';
  $bg-secondary: color(secondary, $colors-background);
  $color-tertiary: color(tertiary);
  $color-secondary: color(secondary);
  $color-error: color(error);
  $color-white: color(white);
  $color-black: color(black);

  #checkout {
    .number-circle {
      margin-top: 6px; // Added By Dan
      width: 35px;
      height: 35px;

      @media (max-width: 768px) {
        width: 25px;
        height: 25px;
        line-height: 25px;
      }
    }
    .radioStyled {
      display: block;
      position: relative;
      padding-left: 35px;
      margin-bottom: 12px;
      cursor: pointer;
      font-size: 16px;
      line-height: 30px;
      -webkit-user-select: none;
      -moz-user-select: none;
      -ms-user-select: none;
      user-select: none;

      input {
        position: absolute;
        opacity: 0;
        cursor: pointer;
      }

      .checkmark {
        position: absolute;
        top: 0;
        left: 0;
        height: 26px;
        width: 26px;
        border-radius: 50%;
        border: 1px solid $color-black;

        &:after {
          content: "";
          position: absolute;
          display: none;
          top: 4px;
          left: 4px;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: $color-secondary;
        }
      }

      input:checked ~ .checkmark:after {
        display: block;
      }
    }
  }

  .line {
    &:after {
      content: '';
      display: block;
      position: absolute;
      top: 0;
      left: 37px;
      z-index: -1;
      width: 1px;
      height: 100%;
      background-color: $bg-secondary;

      @media (max-width: 768px) {
        display: none;
      }
    }
  }

  .checkout-title {
    @media (max-width: 767px) {
      background-color: $bg-secondary;
      margin-bottom: 25px;

      h1 {
        font-size: 36px;
      }
    }
  }
  @media screen and (min-width:1200px){
  #checkout .container {max-width: 1200px;margin:0 auto;}
  }
  #app {background: #fafafa;}
  .box-left, .box-right {background: #fff;    border-radius: 8px;}
  .checkout-title h3, h3.order-sum{font-size: 24px;
    color: #000;
    font-weight: 700;
    margin-bottom: 24px;
    margin-top: 8px;
    line-height: 1.1;}
  #checkout .number-circle {    float: left;    margin-top: 0px;margin-right: 12px;width: 26px;
    height: 26px;
    line-height: 27px;}
  .store-info p {
    font-size: 16px;
    font-weight: 500;
    float: left;
    margin: 0;
    max-width: calc(100% - 79px);
  }
  .store-info .store-contact {
    float: left;
    margin-left: 15px;
    position: relative;
    line-height: 0;
  }
  .store-info .store-contact i {
    cursor: pointer;
  }
  #checkout .row {clear: left;}
  button.normal-icon-btn {    background: none;
    border: none;}
  button.normal-icon-btn:focus {
    outline: 0;
  }
  .qty-add-dlt button{background: #f2f2f2;
    border: none;
    width: 28px;
    height: 28px;}
  .qty-add-dlt button i {    font-size: 18px;
    line-height: 28px;}
  .qty-add-dlt span{line-height: 28px;
    padding: 0 10px;
    display: inline-block;
    vertical-align: top;}
  .static-available {font-size: 14px;color: #da7b05;}
  .text-c-dt {text-align: center;}
  .dt-float-l {float: left;}
  .dt-float-r {float: right;}
  .flex.qty-fav-delete {
    flex-flow: row;
    flex-wrap: wrap;
    justify-content: center;
  }

  .flex.qty-fav-delete button.btn.normal-icon-btn {flex: none;}

  .flex.qty-fav-delete .qty-add-dlt {
    flex: 100%;
    margin: 10px 0 0;
  }
  @media screen and (min-width:576px) and (max-width: 767px){
    .flex.qty-fav-delete {display: block;}
    .flex.qty-fav-delete .qty-add-dlt {
      display: block;
      float: none;
      width: 100%;
      margin: 10px 0 !important;
    }
  }
  @media screen and (max-width: 767px){
    .qty-add-dlt {float: left;}
    .flex.qty-fav-delete .qty-add-dlt {
      flex: 1;
      margin: 0;
    }
    .flex.qty-fav-delete {
      flex-flow: row-reverse;
    }
    .static-available {
      margin-top: 3px;
    }
  }
  @media screen and (max-width: 575px){
    .text-c-dt {text-align: left;}
    .shipping-text{text-align: left !important;}
  }

  @media (max-width: 363px) {
    .material-icons {
      font-size: 18px;
    }

    .qty-add-dlt button {
      width: 20px;
      height: 20px;
      padding: 0;
    }

    .qty-add-dlt span {
      line-height: 20px;
    }

    .qty-add-dlt button i {
      font-size: 100%;
      line-height: 20px;
    }
    .order-item {
      padding-left: 0;
      padding-right: 0;
    }
    .static-available {
      font-size: 11px;
    }
  }

</style>
