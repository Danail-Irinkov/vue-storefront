<template>
  <!-- modify by shabbir for display order data from procc-->
  <div class="mb35">
    <!-- My orders header -->
    <div class="row mb15">
      <div class="col-xs-12 col-sm-6">
        <h3 class="m0 mb5">
          {{ $t('My orders') }}
        </h3>
      </div>
    </div>
    <!-- My orders body -->
    <div class="row">
      <div class="col-xs-12" v-show="!isHistoryEmpty">
        <table class="brdr-1 brdr-cl-bg-secondary">
          <thead>
            <tr>
              <th class="p20 serif lh20">
                {{ $t('Order ID') }}
              </th>
              <th class="p20 serif lh20 hide-on-xs">
                {{ $t('Date and time') }}
              </th>
              <th class="p20 serif lh20 hide-on-xs">
                {{ $t('Author') }}
              </th>
              <th class="p20 serif lh20 hide-on-xs">
                {{ $t('Value') }}
              </th>
              <th class="p20 serif lh20 hide-on-xs">
                {{ $t('Type') }}
              </th>
              <th class="p20 serif lh20 hide-on-xs">
                {{ $t('Status') }}
              </th>
              <th class="p20 serif lh20">
&nbsp;
              </th>
            </tr>
          </thead>
          <tbody>
            <tr class="brdr-top-1 brdr-cl-bg-secondary" v-for="order in ordersHistory" :key="order.entity_id">
              <td class="fs-medium lh25">
                #{{ order.order_no }}
              </td>
              <td class="fs-medium lh25 hide-on-xs">
                {{ order.createdAt | date }}
              </td>
              <td class="fs-medium lh25 hide-on-xs">
                {{ order.customer_user.first_name }} {{ order.customer_user.last_name }}
              </td>
              <td class="fs-medium lh25 hide-on-xs">
                {{ (order.total/100).toFixed(2) | price }}
              </td>
              <td class="fs-medium lh25 hide-on-xs">
                {{ $t('Purchase') }}
              </td>
              <td class="fs-medium lh25 hide-on-xs">
                {{ order.status | camelCase }}
              </td>
              <td class="fs-medium lh25">
                <span class="relative dropdown">
                  <i class="material-icons cl-secondary pointer">more_horiz</i>
                  <div class="dropdown-content bg-cl-primary align-left sans-serif lh20 weight-400 fs-medium-small py5">
                    <router-link class="no-underline block py10 px15" :to="localizedRoute(`/my-account/orders/${order._id}`)">
                      {{ $t('View order') }}
                    </router-link>
                    <a :href="`${config.PROCC.FRONT_URL}/orderReview/${order.customer_feedback_hash}`" class="no-underline block py10 px15" target="_blank">
                      {{ $t('Order Feedback') }}
                    </a>
                    <a href="#" class="no-underline block py10 px15" @click.prevent="toggleCancellationOrder(order._id)" v-if="order.status =='awaiting_pickup' || order.status =='awaiting_shipment'">{{ $t('Order Cancellation') }}</a>
                    <a class="no-underline block py10 px15" @click.prevent="getOrderInvoicePDF(order._id)" v-if="order.status != 'awaiting_payment' && order.status != 'brand_cancelled' && order.status != 'customer_cancelled'">{{ $t('Download Invoice') }}</a>
                    <a href="#" class="no-underline block py10 px15" @click.prevent="paymentRetry(order)" v-if="order.status =='awaiting_payment'">{{ $t('Retry Payment') }}</a>
                    <!--                    <a href="#" class="no-underline block py10 px15" @click.prevent="remakeOrder(skipGrouped(order.items))">{{ $t('Remake order') }}</a>-->
                  </div>
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="col-xs-12 h4" v-show="isHistoryEmpty">
        <p>{{ $t('No orders yet') }}</p>
      </div>
    </div>
    <order-cancellation :order-id="selectedOrderId" v-if="loadOrderCancellationModal" />
  </div>
</template>

<script>
import UserOrder from '@vue-storefront/core/modules/order/components/UserOrdersHistory'
import config from 'config';
import OrderCancellation from 'theme/components/procc/OrderCancellation.vue'
export default {
  mixins: [UserOrder],
  components: {
    OrderCancellation
  },
  mounted () {
    window.callPlaceOrder = (transactionId) => { // ProCC MangoPay Handler
      console.log('window.callPlaceOrder MyOrders')
      this.updateTransactionStatus(transactionId)
    }
  }
}
</script>

<style lang="scss" scoped>
@import '~theme/css/base/global_vars';
@import '~theme/css/variables/colors';
@import '~theme/css/helpers/functions/color';
$color-icon-hover: color(secondary, $colors-background);

table {
  border-collapse: collapse;
  width: 100%;

  th, td {
    text-align: left;
    padding: 20px;

    @media (max-width: 1199px) {
      padding: 10px;
    }

    @media (max-width: 767px) {
      text-align: center;
    }

    &.hide-on-xs {

      @media (max-width: 767px) {
        display: none;
      }

    }

  }

  i {
    vertical-align: middle;
  }

}

.dropdown {
  display: block;
  margin: -20px;
  padding: 20px;

  @media (max-width: 1199px) {
    margin: -10px;
    padding: 10px;
  }

  .dropdown-content {
    display: none;
    position: absolute;
    right: 0;
    top: 100%;
    width: 160px;
    z-index: 1;
    box-shadow: 0 0 10px rgba(0,0,0,0.1);
  }

  a {
    opacity: .6;

    &:hover,
    &:focus {
      background-color: $color-icon-hover;
      opacity: 1;
    }

  }

  &:hover .dropdown-content {
    display: block;
  }

}

</style>
