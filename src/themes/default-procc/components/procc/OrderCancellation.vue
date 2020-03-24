<template>
  <modal :name="'modal-order-cancellation'" class="modal-order-cancellation" :width="640">
    <p slot="header" class="modal-header h4 serif weight-700 bg-cl-secondary m0">
      {{ $t('Order Cancellation') }}
    </p>
    <div slot="content">
      <textarea class="form-control" v-model="cancellation_message"
                :placeholder="$t('Order Cancellation Message')" rows="6"
      />
    </div>
    <div class="row between-xs middle-xs mt40 mb20">
      <div class="col-xs-12">
        <button-full @click.native="cancelOrder" :disabled="process_running">
          {{ $t('Order Cancel') }}
        </button-full>
      </div>
    </div>
  </modal>
</template>

<script>
import Modal from 'theme/components/core/Modal'
import ButtonFull from 'theme/components/theme/ButtonFull.vue'
import ProCcApi from 'src/themes/default-procc/helpers/procc_api.js'
export default {
  name: 'OrderCancellation',
  props: {
    orderId: {
      required: true,
      type: String
    }
  },
  data () {
    return {
      cancellation_message: '',
      process_running: false
    }
  },
  computed: {
  },
  mounted () {
    this.$nextTick(() => {
      this.$bus.$emit('modal-show', 'modal-order-cancellation')
    })
  },
  beforeDestroy () {
    this.$bus.$emit('modal-hide', 'modal-order-cancellation')
  },
  components: {
    Modal,
    ButtonFull
  },
  methods: {
    async cancelOrder () {
      this.process_running = true
      console.log('this.$store 11', this.$store.state.user.current._id)
      console.log('this.$store', this.$store.state.user.current.user_type.active_brand)
      ProCcApi().cancelOrder({order_id: this.orderId, cancellation_message: this.cancellation_message, status: 'customer_cancelled'}, this.$store.state.user.current._id, this.$store.state.user.current.user_type.active_brand)
        .then(async (response) => {
          this.process_running = false
          if (response.data.message_type ==='success') { this.$bus.$emit('modal-hide', 'modal-order-cancellation') }
          this.$store.dispatch('notification/spawnNotification', {
            type: response.data.message_type === 'success' ? 'success' : 'error',
            message: response.data.message,
            action1: { label: this.$t('OK') }
          })
          this.$store.dispatch('user/getOrdersHistory', { refresh: true, useCache: true })
        })
        .catch((error) => {
          this.process_running = false
          this.$store.dispatch('notification/spawnNotification', {
            type: 'error',
            message: error.message ? error.message : error,
            action1: { label: this.$t('OK') }
          })
        })
    }
  }
}
</script>

<style lang="scss" scoped>
  @import '~theme/css/variables/colors';
  @import '~theme/css/helpers/functions/color';
  $color-tertiary: color(tertiary);
  $color-white-smoke: color(white-smoke);

  .modal {
    font-size: 18px;
  }
  .cancel-order {
    text-align: center;
    margin-bottom: 30px;

    @media only screen and (min-width: 576px) {
      text-align: left;
      margin-bottom: 0;
    }
  }
</style>
<style lang="scss">
  .modal.modal-order-cancellation {
    header.modal-header {
      padding: 15px;
    }
    .modal-container {
      max-width: 90%;
      /*min-width: 812px;*/
      border-radius: 8px;
      overflow: hidden;
      textarea.form-control{
        width: 95%;
        background-color: #FFFFFF;
        border: 2px solid #909090;
        border-radius: 4px;
        color: #565656;
        padding: 8px 12px;
        -webkit-box-shadow: none;
        box-shadow: none;
      }
      @media (max-width: 991px) {
        min-width: 90%;
        width: auto !important;
        max-width: calc(100% - 30px);
        margin: 0 auto;
        height: auto;
        max-height: 90vh;
        overflow-y: auto;
        min-height: 1px;
      }
      .modal-content {
        padding-top: 23px;
        padding-bottom: 23px;
        @media (max-width: 991px) {
          padding: 10px;
        }
      }
      button {
        min-width: 1px;
        width: auto;
        line-height: normal;
        padding: 10px 20px;
        margin:  0 auto;
      }
    }
  }
</style>
