import { UserOrders } from '@vue-storefront/core/modules/order/components/UserOrders'
import {UserOrderPayment} from '@vue-storefront/core/modules/order/components/UserOrderPayment';

// component fully deprecated. Use user/components/Orders instead
export default {
  name: 'MyOrders',
  mixins: [UserOrders, UserOrderPayment]
}
