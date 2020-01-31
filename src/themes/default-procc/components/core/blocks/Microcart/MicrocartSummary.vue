<!--created component for order summary in micro cart and order confirm page -->
<template>
  <div v-if="productsInCart.length || orderSummary.length" class="summary p10 cl-accent serif" :class="className">
    <h3 class="m0 p10 mb10 weight-400 summary-heading">
      {{ $t('Shopping summary') }}
    </h3>
    <div v-for="(segment, index) in summaryData" :key="index" class="row p10" v-if="segment.code !== 'grand_total' && segment.code !== 'shipping' && segment.code !== 'tax' && 'Edited by Dan to avoid tax row, not configured'">
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
    <div v-for="(segment, index) in summaryData" :key="index" class="row p10" v-if="segment.code == 'shipping'">
      <div class="col-xs">
        {{ segment.title }}
        <ul style="font-size: 14px" v-if="segment.value">
          <li v-for="data in segment.value" :key="data.id">
            {{ data.name }} ({{ data.cost | price }})
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
    </div>
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

    <div class="row p10 weight-700 middle-xs" v-for="(segment, index) in summaryData" :key="index" v-if="segment.code === 'grand_total'">
      <div class="col-xs h4 total-price-label">
        {{ segment.title }}
      </div>
      <div class="col-xs align-right h2 total-price-value">
        {{ segment.value | price }}
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import i18n from '@vue-storefront/i18n'
import isEmpty from 'lodash-es/isEmpty'
export default {
  components: {},
  mixins: [],
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
    className: {
      type: String,
      default: ''
    },
    orderSummary: {
      type: Array,
      default: ()=>[]
    }
  },
  computed: {
    ...mapGetters({
      productsInCart: 'cart/getCartItems',
      appliedCoupon: 'cart/getCoupon',
      totals: 'cart/getTotals'
    }),
    // created function for get summary data, if orderSummary passed then take form orderSummary else get from getTotal
    summaryData () {
      return this.orderSummary && !isEmpty(this.orderSummary) ? this.orderSummary : this.totals
    }
  },
  methods: {
    ...mapActions({
      applyCoupon: 'cart/applyCoupon'
    }),
    addDiscountCoupon () {
      this.addCouponPressed = true
    },
    clearCoupon () {
      this.$store.dispatch('cart/removeCoupon')
      this.addCouponPressed = false
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
    }
  }
}
</script>

<style lang="scss" scoped>
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
</style>
