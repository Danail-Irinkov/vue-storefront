<template>
  <div
    class="microcart cl-accent relative bg-cl-primary"
    data-testid="microcart"
  >
    <transition name="fade">
      <div v-if="isEditMode" class="overlay" @click="closeEditMode" />
    </transition>
    <div class="row bg-cl-primary px40 actions">
      <account-icon class="p15 icon hidden-xs pointer login-registration" :show-text="true" />
      <div class="col-xs end-xs">
        <button
          type="button"
          class="p0 brdr-none bg-cl-transparent close"
          @click="closeMicrocartExtend"
          data-testid="closeMicrocart"
        >
          <i class="material-icons py20 cl-accent">
            close
          </i>
        </button>
      </div>
    </div>
    <div class="row middle-xs bg-cl-primary top-sm px40 actions">
      <div class="col-xs-12 col-sm">
        <h2
          v-if="productsInCart.length"
          class="cl-accent mt0 editedByDanProCC mb35"
        >
          {{ $t('Shopping cart') }}
        </h2>
      </div>
      <div class="col-xs-12 col-sm mt35 mb35 mt0 end-sm clearcart-col">
        <clear-cart-button
          v-if="productsInCart.length"
          @click.native="clearCart"
          style="margin-right: 15px"
        />
        <clear-go-to-checkout-btn-pro-c-c
          v-if="productsInCart.length"
          :link="{ name: 'checkout' }"
          @click.native="closeMicrocartExtend"
          style="padding-left: 15px; border-left-width: 2px!important; border-left-color: #9a9a9a!important; border-left-style: outset!important;"
        />
      </div>
    </div>

    <h4 v-if="!productsInCart.length" class="cl-accent ml30">
      {{ $t('Your shopping cart is empty.') }}
    </h4>
    <div v-if="!productsInCart.length" class="ml30" @click="closeMicrocartExtend">
      {{ $t("Don't hesitate and") }}
      <router-link :to="localizedRoute('/')">
        {{ $t('browse our catalog') }}
      </router-link>
      {{ $t('to find something beautiful for You!') }}
    </div>
    <div v-for="brand in getBrandsDetails" :key="brand._id" v-if="productsInCart.length && productsInCartByBrandProCC(brand._id).length > 0">
      <order-items :brand="brand" :order-items="productsInCartByBrandProCC(brand._id)" :shipping-method="getSelectedShippingMethods[brand._id]" class-name="bg-cl-secondary mb20" :is-disabled-inputs="false" />
    </div>
    <!--<div v-if="productsInCart.length" class="summary px40 cl-accent serif">
      <h3 class="m0 pt40 mb30 weight-400 summary-heading">
        {{ $t('Shopping summary') }}
      </h3>
      <div v-for="(segment, index) in totals" :key="index" class="row py20" v-if="segment.code !== 'grand_total' && segment.code !== 'shipping' && segment.code !== 'tax' && 'Edited by Dan to avoid tax row, not configured'">
        <div class="col-xs">
          {{ segment.title }}
          <button v-if="appliedCoupon && segment.code === 'discount'" type="button" class="p0 brdr-none bg-cl-transparent close delete-button ml10" @click="clearCoupon">
            <i class="material-icons cl-accent">
              close
            </i>
          </button>
        </div>
        <div v-if="segment.value != null" class="col-xs align-right">
          {{ segment.value | price }}
        </div>
      </div>
      <div v-for="(segment, index) in totals" :key="index" class="row py20" v-if="segment.code == 'shipping'">
        <div class="col-xs">
          {{ segment.title }}
          <ul style="font-size: 14px" v-if="segment.value">
            <li v-for="data in segment.value" :key="data.id">
              {{ data.name }} ({{ data.cost | mangopay_price }})
            </li>
          </ul>
          <button v-if="appliedCoupon && segment.code === 'discount'" type="button" class="p0 brdr-none bg-cl-transparent close delete-button ml10" @click="clearCoupon">
            <i class="material-icons cl-accent">
              close
            </i>
          </button>
        </div>
        <div class="col-xs align-right">
          {{ segment.total || 0 | price }}
        </div>
      </div> -->
    <!--      <div class="row py20">-->
    <!--        <div v-if="OnlineOnly && !addCouponPressed" class="col-xs-12">-->
    <!--          <button-->
    <!--            class="p0 brdr-none serif fs-medium-small cl-accent bg-cl-transparent"-->
    <!--            type="button"-->
    <!--            @click="addDiscountCoupon"-->
    <!--          >-->
    <!--            {{ $t('Add a discount code') }}-->
    <!--          </button>-->
    <!--        </div>-->
    <!--        <div v-if="OnlineOnly && addCouponPressed" class="col-xs-12 pt30 coupon-wrapper">-->
    <!--          <div class="coupon-input">-->
    <!--            <label class="h6 cl-secondary">{{ $t('Discount code') }}</label>-->
    <!--            <base-input type="text" id="couponinput" :autofocus="true" v-model.trim="couponCode" @keyup.enter="setCoupon" />-->
    <!--          </div>-->
    <!--          <button-outline color="dark" :disabled="!couponCode" @click.native="setCoupon">-->
    <!--            {{ $t('Add discount code') }}-->
    <!--          </button-outline>-->
    <!--        </div>-->
    <!--      </div>-->

    <!--<div class="row pt30 pb20 weight-700 middle-xs" v-for="(segment, index) in totals" :key="index" v-if="segment.code === 'grand_total'">
        <div class="col-xs h4 total-price-label">
          {{ segment.title }}
        </div>
        <div class="col-xs align-right h2 total-price-value">
          {{ segment.value | price }}
        </div>
      </div>
    </div>-->
    <microcart-summary class="bg-cl-secondary mb20" v-if="productsInCart.length" />

    <div
      class="row py20 px40 middle-xs actions"
      v-if="productsInCart.length && !isCheckoutMode"
    >
      <div class="col-xs-12 col-sm-6 first-sm">
        <router-link :to="localizedRoute('/')" class="no-underline cl-secondary link">
          <span @click="closeMicrocartExtend">
            {{ $t('Return to shopping') }}
          </span>
        </router-link>
      </div>
      <div class="col-xs-12 first-xs col-sm-6 end-sm">
        <button-full
          :link="{ name: 'checkout' }"
          @click.native="closeMicrocartExtend"
        >
          {{ $t('Go to checkout') }}
        </button-full>
        <instant-checkout v-if="isInstantCheckoutRegistered" class="no-outline button-full block brdr-none w-100 px10 py20 bg-cl-mine-shaft :bg-cl-th-secondary ripple weight-400 h4 cl-white sans-serif fs-medium mt20" />
      </div>
    </div>
    <shipping-method v-if="loadShippingMethod" :store-brand-id="brandId" :is-active="true" />
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import i18n from '@vue-storefront/i18n'
import { isModuleRegistered } from '@vue-storefront/core/lib/modules'

import ShippingMethod from 'theme/components/procc/Checkout/ShippingMethod'
import VueOfflineMixin from 'vue-offline/mixin'
import onEscapePress from '@vue-storefront/core/mixins/onEscapePress'
import InstantCheckout from 'src/modules/instant-checkout/components/InstantCheckout.vue'
import { registerModule } from '@vue-storefront/core/lib/modules'
import { CartSummary } from '@vue-storefront/core/modules/checkout/components/CartSummary'

// import BaseInput from 'theme/components/core/blocks/Form/BaseInput'
import ClearCartButton from 'theme/components/core/blocks/Microcart/ClearCartButton'
import ClearGoToCheckoutBtnProCC from 'theme/components/core/blocks/Microcart/ClearGoToCheckoutBtnProCC' // Added by Dan
import Checkout from '@vue-storefront/core/pages/Checkout' // Added by Dan
import ButtonFull from 'theme/components/theme/ButtonFull'
// import ButtonOutline from 'theme/components/theme/ButtonOutline'
import AccountIcon from 'theme/components/core/blocks/Header/AccountIcon'
// import Product from 'theme/components/core/blocks/Microcart/Product'
import OrderItems from 'theme/components/core/blocks/Checkout/OrderItems'
import EditMode from './EditMode'
import MicrocartSummary from './MicrocartSummary'
import { InstantCheckoutModule } from 'src/modules/instant-checkout'
import Microcart from '@vue-storefront/core/compatibility/components/blocks/Microcart/Microcart'
export default {
  components: {
    // Product,
    ClearCartButton,
    ClearGoToCheckoutBtnProCC, // Added by Dan
    ButtonFull,
    // ButtonOutline,
    // BaseInput,
    AccountIcon,
    InstantCheckout,
    OrderItems,
    ShippingMethod, // Added by Dan
    MicrocartSummary
  },
  mixins: [
    VueOfflineMixin,
    EditMode,
    onEscapePress,
    CartSummary, // Added by Dan
    Checkout, // Added by Dan
    Microcart
  ],
  data () {
    return {
      addCouponPressed: false,
      couponCode: '',
      componentLoaded: false,
      // isInstantCheckoutRegistered: isModuleRegistered('InstantCheckoutModule')
      isInstantCheckoutRegistered: false // Disabled By Dan, because not tested
    }
  },
  props: {
    isCheckoutMode: {
      type: Boolean,
      required: false,
      default: () => false
    }
  },
  beforeCreate () {
    registerModule(InstantCheckoutModule)
  },
  mounted () {
    this.$nextTick(() => {
      this.componentLoaded = true
      this.$bus.$emit('scrollSidebarBottom') // Added by Dan
    })
  },
  computed: {
    ...mapGetters({
      productsInCart: 'cart/getCartItems',
      appliedCoupon: 'cart/getCoupon',
      totals: 'cart/getTotals',
      isOpen: 'cart/getIsMicroCartOpen',
      getBrandsDetails: 'checkout/getBrandsDetails',
      getSelectedShippingMethods: 'checkout/getSelectedShippingMethods'
    })
  },
  methods: {
    ...mapActions({
      applyCoupon: 'cart/applyCoupon'
    }),
    getBrandData (id) {
      if (this.getBrandsDetails) {
        return find(this.getBrandsDetails, (o) => {
          return o._id === id
        });
      } else {
        return {
          name: '',
          logo: {thumb: ''},
          customer_support_email: ''
        }
      }
    },
    addDiscountCoupon () {
      this.addCouponPressed = true
    },
    clearCoupon () {
      this.$store.dispatch('cart/removeCoupon')
      this.addCouponPressed = false
    },
    toggleMicrocart () {
      this.$store.dispatch('ui/toggleMicrocart')
    },
    async setCoupon () {
      const couponApplied = await this.applyCoupon(this.couponCode)
      this.addCouponPressed = false
      this.couponCode = ''
      if (!couponApplied) {
        this.$store.dispatch('notification/spawnNotification', {
          type: 'warning',
          message: i18n.t("You've entered an incorrect coupon code. Please try again."),
          action1: { label: i18n.t('OK') }
        })
      }
    },
    closeMicrocartExtend () {
      let close_micro_cart = this.toggleMicrocart // Added By Dan
      setTimeout(close_micro_cart, 83) // Added By Dan
      this.$store.commit('ui/setSidebar', false)
      this.addCouponPressed = false
    },
    onEscapePress () {
      this.toggleMicrocart()
    },
    clearCart () {
      this.$store.dispatch('notification/spawnNotification', {
        type: 'warning',
        message: i18n.t('Are you sure you would like to remove all the items from the shopping cart?'),
        action1: { label: i18n.t('Cancel'), action: 'close' },
        action2: { label: i18n.t('OK'),
          action: async () => {
            await this.$store.dispatch('cart/clear', { recreateAndSyncCart: false }) // just clear the items without sync
            await this.$store.dispatch('cart/sync', { forceClientState: true })
          }
        },
        hasNoTimeout: true
      })
    }
  }
}
</script>

<style lang="scss" scoped>
  @import "~theme/css/animations/transitions";

  .close {
    i {
      opacity: 0.6;
    }
    &:hover,
    &:focus {
      i {
        opacity: 1;
      }
    }
  }

  .mt0 {
    @media (max-width: 767px) {
      margin-top: 0;
    }
  }

  .clearcart {
    &-col {
      display: flex;
      align-self: center;
    }
  }

  .products {
    @media (max-width: 767px) {
      /*// Edited by Dan*/
      padding: 0px 15px;
    }
  }

  .actions {
    @media (max-width: 767px) {
      /*padding: 0 15px;*/ //Disabled By Dan
    }
    .link {
      @media (max-width: 767px) {
        display: flex;
        justify-content: center;
        padding: 20px 70px;
        &.checkout {
          margin-top: 55px;
          padding: 0;
        }
      }
    }
  }

  .summary {
    @media (max-width: 767px) {
      // Edited by dan
      /*padding:  0 15px;*/
      font-size: 18px;
    }
  }

  .summary-heading {
    @media (max-width: 767px) {
      font-size: 18px;
    }
  }

  .total-price-label {
    @media (max-width: 767px) {
      font-size: 18px;
    }
  }

  .total-price-value {
    @media (max-width: 767px) {
      font-size: 24px;
    }
  }

  .delete-button {
    vertical-align: middle;
  }

  .coupon-wrapper {
    display: flex;

    .button-outline {
      text-transform: inherit;
      width: 50%;
    }

    .coupon-input {
      margin-right: 20px;
      width: 100%;
    }
  }

  .overlay {
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    position: absolute;
    z-index: 0;
    height: 100%;
    background:rgba(0, 0, 0, 0.4);
  }

  .fade-enter-active, .fade-leave-active {
    transition: opacity .4s;
  }
  .fade-enter, .fade-leave-to {
    opacity: 0;
  }
</style>
<style lang="scss">

  .login-registration {
    button {
      display: flex;
      align-items: center;
      flex-flow: row-reverse;
      i.material-icons.block {
        margin-right: 5px;
      }
    }
  }
  .microcart .modal-shipping-method .modal-backdrop {    background-color: rgba(0, 0, 0, 0.4);}
  .microcart {
      .modal-container{
        header { color:#000;}
          .modal-content {
              .radioStyled {
                margin: 0 !important;
                float: right;
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
                  display: none;
                  opacity: 0;
                  cursor: pointer;
                  &:checked + span.checkmark:after{
                    content: '';
                    display: block;
                    height: 8px;
                    width: 8px;
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    background-color: #fff;
                  }
                  &:focus {
                    outline: none;
                  }
                }
                .checkmark {
                  height: 20px;
                  width: 20px;
                  right: 0;
                  position: absolute;
                  top: 0;
                  left: 0;
                  border-radius: 50%;
                  border: 1px solid #000;

                  &:after {
                    content: "";
                    position: absolute;
                    display: none;
                    top: 3px;
                    left: 3px;
                    width: 19px;
                    height: 19px;
                    border-radius: 50%;
                    background: #828282;
                  }
                }
              }
          }
      }
  }
  .microcart .modal-container .modal-content .radioStyled input:checked ~ .checkmark:after {display: block;}
  .microcart .modal-container .modal-content  .radioStyled input:checked + span.checkmark {    background: #000;}
</style>
