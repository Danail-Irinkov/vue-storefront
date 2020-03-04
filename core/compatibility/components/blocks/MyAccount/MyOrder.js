import { UserSingleOrder } from '@vue-storefront/core/modules/order/components/UserSingleOrder'
import { UserOrderPayment } from '@vue-storefront/core/modules/order/components/UserOrderPayment'

// Component deprecated, now in Order module
export default {
  name: 'MyOrder',
  mixins: [UserSingleOrder, UserOrderPayment]
}
