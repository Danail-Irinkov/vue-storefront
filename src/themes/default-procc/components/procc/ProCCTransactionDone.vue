<template>
  <div style="padding: 3rem;text-align: center; font-family: Helvetica;font-size: larger;opacity: 0.7;color: rgba(0,0,0,0.68);">
    <p>{{ $t('Transaction is being processed') }}</p>
    <p>{{ $t('Please Wait...') }}</p>
  </div>
</template>
<script>
// TODO: i18n the strings
// import CheckOut from '../../pages/Checkout.vue'
export default {
  name: 'TransactionDone',
  components: {
    // CheckOut
  },
  data () {
    return {
      payment: this.$store.state.checkout.paymentDetails,
      mangopay_transaction_id: ''
    }
  },
  mounted () {
    if (this.$route.query.transactionId) {
      console.log('before window.opener.callPlaceOrder')
      window.opener.callPlaceOrder(this.$route.query.transactionId)

      setTimeout(() => { window.close() }, 3000)
    }
  }
}
</script>
