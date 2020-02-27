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
        {{ segment.value | price }}
      </div>
    </div>

    <div v-for="(segment, index) in totals" :key="index" class="row pl20 pr20 py5" v-if="segment.code === 'shipping'">
      <div class="col-xs cl-accent">
        {{ segment.title }}
        <ul style="font-size: 14px" v-if="segment.extension_attributes">
          <li v-for="(data) in segment.extension_attributes" :key="data.name">
            {{ data.name }} ({{ data.cost | price }})
          </li>
        </ul>
      </div>
      <div v-if="segment.value != null" class="col-xs align-right cl-accent h4">
        {{ segment.value | price }}
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
          {{ segment.value | price }}
        </h3>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
export default {
  computed: {
    ...mapGetters({
      totals: 'cart/getTotals',
      cartItems: 'cart/getCartItems'
    })
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
