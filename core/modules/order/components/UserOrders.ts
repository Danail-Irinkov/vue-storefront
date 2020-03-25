import { mapGetters } from 'vuex';
import ProCcApi from 'src/themes/default-procc/helpers/procc_api.js'
/**
 * Component responsible for displaying user orders. Requires User module.
 */
export const UserOrders = {
  name: 'UserOrders',
  computed: {
    ...mapGetters('user', ['getOrdersHistory']),
    ordersHistory () {
      return this.getOrdersHistory
    },
    isHistoryEmpty () {
      return this.getOrdersHistory.length < 1
    }
  },
  methods: {
    getOrderInvoicePDF (orderId) {
      ProCcApi().getOrderInvoicePDF(orderId)
        .then((response) => {
          const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }))
          let file_name = orderId + '.pdf'
          const link = document.createElement('a')
          link.href = url;
          // get file name from response
          const contentDisposition = response.headers['content-disposition']
          if (contentDisposition) {
            const fileNameMatch = contentDisposition.match(/filename="(.+)"/)
            if (fileNameMatch.length === 2) { file_name = fileNameMatch[1]; }
          }
          link.setAttribute('download', file_name);
          document.body.appendChild(link);
          link.click();
        })
    },

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
