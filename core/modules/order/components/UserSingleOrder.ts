import { mapGetters } from 'vuex';
import sumBy from 'lodash-es/sumBy'
/**
 * Component responsible for displaying single user order. Requires User module.
 */
export const UserSingleOrder = {
  name: 'UserSingleOrder',
  computed: {
    ...mapGetters({
      ordersHistory: 'user/getOrdersHistory'
    }),
    order () {
      return this.ordersHistory.find(order =>
        // modify by shabbir for get order by id
        order._id.toString() === this.$route.params.orderId.toString()
      )
    },
    paymentMethod () {
      // modify by shabbir for get order payment
      return this.order && this.order.transaction
    },
    billingAddress () {
      // modify by shabbir for get order address
      return this.order && this.order.address
    },
    shippingAddress () {
      // modify by shabbir for get order address
      return this.order && this.order.address
    },
    singleOrderItems () {
      if (!this.order) return []
      return this.order.order_items
    },
    // created function by shabbir for get order summary
    orderSummary () {
      let subtotal = sumBy(this.order.order_items, (o) => { return o.price * o.qty })
      let shipping_amount = this.order.shipping_fee
      let tax = this.order.tax ? this.order.tax : 0
      let grand_total = subtotal + shipping_amount + tax
      return {subtotal, shipping_amount, tax, grand_total}
    }

  },
  methods: {
    async remakeOrder (products) {
      this.$bus.$emit('notification-progress-start', this.$t('Please wait ...'))
      const productsToAdd = []
      for (const item of products) {
        const product = await this.$store.dispatch('product/single', { options: { sku: item.sku }, setCurrentProduct: false, selectDefaultVariant: false })
        product.qty = item.qty_ordered
        productsToAdd.push(product)
      }
      await this.$store.dispatch('cart/addItems', { productsToAdd })
      this.$bus.$emit('notification-progress-stop', {})
      // Redirect to the cart straight away.
      this.$router.push(this.localizedRoute('/checkout'))
    },
    skipGrouped (items) {
      return items.filter((item) => {
        return !item.parent_item_id
      })
    }
  }
}
