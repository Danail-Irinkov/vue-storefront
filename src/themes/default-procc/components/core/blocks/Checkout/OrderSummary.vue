<template>
  <div v-if="cartItems && cartItems.length > 0" class="checkout pt10 serif cl-accent">
    <h3 class="order-sum pl20 pr20">
      Order Summary
    </h3>
    <div v-for="(segment, index) in totals" :key="index" class="row pl20 pr20 py5" v-if="segment.code !== 'grand_total' && segment.code !== 'shipping'">
      <div class="col-xs cl-accent">
        {{ segment.title }}
      </div>
      <div v-if="segment.value != null" class="col-xs align-right cl-accent h4">
        <spinner v-if="loadingSummary" />
        <span v-else>{{ segment.value | mangopay_price }}</span>
      </div>
    </div>

    <div v-for="(segment, index) in totals" :key="index" class="row pl20 pr20 py5" v-if="segment.code === 'shipping'">
      <div class="col-xs cl-accent">
        {{ segment.title }}
        <ul style="font-size: 14px" v-if="segment.extension_attributes && !loadingSummary" class="shipping-method-attributes">
          <li v-for="(data, key) in segment.extension_attributes" :key="key">
            {{ data.name }} ({{ data.cost | mangopay_price }})
          </li>
        </ul>
      </div>
      <div v-if="segment.value != null" class="col-xs align-right cl-accent h4">
        <spinner v-if="loadingSummary" />
        <span v-else>{{ segment.value | mangopay_price }}</span>
      </div>
    </div>

    <div class="row pl20 pr20 py5 h3" v-for="(segment, index) in totals" :key="index" v-if="segment.code === 'grand_total'">
      <div class="col-xs">
        <h3 class="order-sum">
          {{ segment.title }}
        </h3>
      </div>
      <div class="col-xs align-right">
        <h3 class="order-sum">
          <spinner v-if="loadingSummary" />
          <span v-else>{{ segment.value | mangopay_price }}</span>
        </h3>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import Spinner from 'theme/components/core/Spinner'
export default {
  data () {
    return {
      loadingSummary: false
    }
  },
  components: {
    Spinner
  },
  beforeMount () {
    this.$bus.$on('loading-order-summary', this.hideShowSpinner)
  },
  beforeDestroy () {
    this.$bus.$off('loading-order-summary')
  },
  computed: {
    ...mapGetters({
      totals: 'cart/getTotals',
      cartItems: 'cart/getCartItems'
    })
  },
  methods: {
    hideShowSpinner (isLoading) {
      this.loadingSummary = isLoading
      this.$forceUpdate()
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
</style>
<style>
  .checkout .spinner{
    padding: 0;
  }
  .shipping-method-attributes {padding-left: 25px;}
</style>
