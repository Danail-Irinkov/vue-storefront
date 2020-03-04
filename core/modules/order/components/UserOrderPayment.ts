import { mapGetters } from 'vuex';
import { Logger } from '@vue-storefront/core/lib/logger';
import ProCcApi from '@vue-storefront/theme-default-procc/helpers/procc_api';
import i18n from '@vue-storefront/i18n';

/**
 * Component responsible for displaying user orders. Requires User module.
 */
export const UserOrderPayment = {
  data () {
    return {
      selected_order: ''
    }
  },
  computed: {
    ...mapGetters('user', ['getOrdersHistory'])
  },
  methods: {
    paymentRetry (order) {
      this.$bus.$emit('notification-progress-start', i18n.t('Processing Transaction...'))
      console.log('this.getTotals: ', order)
      let data = {order_ids: [order._id]}
      this.selected_order = order
      this.ProCcAPI.VSFOrderPayment(data, order.customer_brand._id).then(async (response) => {
        if (response.data.payIn_result && response.data.payIn_result.RedirectURL) {
          let newWin = window.open(response.data.payIn_result.RedirectURL, 'popUpWindow', 'height=700,width=800,left=0,top=0,resizable=yes,scrollbars=yes,toolbar=yes,menubar=no,location=no,directories=no, status=yes')
          if (!newWin || newWin.closed || typeof newWin.closed === 'undefined') {
            this.$store.dispatch('notification/spawnNotification', {
              type: 'error',
              message: this.$t('Please allow to open popup window'),
              action1: { label: this.$t('OK') }
            })
          }
        } else {
          this.$bus.$emit('notification-progress-stop');
          this.$store.dispatch('notification/spawnNotification', {
            type: 'error',
            message: this.$t('Something goes Wrong :(  Server could not respond'),
            action1: { label: this.$t('OK') }
          })
        }
      }).catch(err => {
        Logger.error(err, 'Transaction was not Done!!')
        this.$bus.$emit('notification-progress-stop');
        this.$store.dispatch('notification/spawnNotification', {
          type: 'error',
          message: this.$t('Something goes Wrong :(  payment fail, please retry'),
          action1: { label: this.$t('OK') }
        })
      })
    },
    async updateTransactionStatus (mp_transaction_id) {
      let BrandId = this.$store.state.user.current.user_type ? this.$store.state.user.current.user_type.active_brand : this.currentImage.brand
      this.ProCcAPI.updateTransactionStatus({mangopay_transaction_id: mp_transaction_id}, BrandId).then((result) => {
        this.transactionId = result.data.transaction._id
        if (result.data.message_type === 'success') {
          // emit event for place order in megento by shabbir
          this.saveTransactionInOrder(mp_transaction_id)
        } else {
          this.$bus.$emit('notification-progress-stop');
          this.$store.dispatch('notification/spawnNotification', {
            type: 'error',
            message: this.$t('Transaction was not done!!!!'),
            action1: { label: this.$t('OK') }
          })
        }
      }).catch(err => {
        Logger.error(err, 'Transaction was not Done!!')()
        this.$bus.$emit('notification-progress-stop');
        this.$store.dispatch('notification/spawnNotification', {
          type: 'error',
          message: this.$t('Transaction was not done!!!!'),
          action1: { label: this.$t('OK') }
        })
      })
    },
    async saveTransactionInOrder (mp_transaction_id) {
      console.log('preparedOrder2Last323', mp_transaction_id)
      let update_data = {
        mp_transaction: mp_transaction_id,
        order_ids: [this.selected_order._id]
      }
      console.log('preparedOrder!!update_data', update_data)
      // call API for update order status after payment successfully done
      return ProCcApi().saveTransactionInOrder(update_data, this.selected_order.customer_brand._id)
        .then((task) => {
          console.log('preparedOrder!!task.data', task.data)
          this.$store.dispatch('user/getOrdersHistory', { refresh: true, useCache: true })
          this.$bus.$emit('notification-progress-stop');
          this.$forceUpdate()
          this.selected_order = ''
        }).catch((error) => {
          Logger.error('Internal validation error; Order entity is not compliant with the schema: ' + JSON.stringify(error), 'orders')()
          this.$bus.$emit('notification-progress-stop');
        })
    }
  }
}
