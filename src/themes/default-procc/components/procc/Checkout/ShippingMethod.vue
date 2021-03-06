<template>
  <modal :name="'modal-shipping-method'" class="modal-shipping-method" :width="640">
    <p slot="header" class="p15 modal-header h4 serif weight-700 bg-cl-secondary m0">
      {{ $t('Shipping Methods') }}
    </p>
    <div slot="content">
      <table class="brdr-1 brdr-cl-bg-secondary text-align-center-all">
        <thead>
          <tr>
            <th />
            <th>
              {{ $t('Carrier') }}
            </th>
            <th>
              {{ $t('Estimated Delivery Time') }}
            </th>
            <th>
              {{ $t('Cost') }}
            </th>
            <th>
              {{ $t('Tracking') }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr class="brdr-top-1 brdr-cl-bg-secondary" v-for="method in shippingMethods[storeBrandId]" :key="method._id">
            <td class="fs-medium lh25">
              <div style="width: 100%; text-align: center">
                <label class="radioStyled">
                  <input
                    type="radio"
                    :value="method._id"
                    name="shipping-method"
                    v-model="selectedShippingMethods[storeBrandId]"
                  >
                  <span class="checkmark" />
                </label>
              </div>
            </td>
            <td class="fs-medium lh25" :data-th="$t('Carrier')">
              {{ method.name }}
            </td>
            <td class="fs-medium lh25" :data-th="$t('Estimated Delivery')" style="min-width: 180px;">
              {{ method.estimated_delivery_period }} {{ $t('Days') }}
            </td>
            <td class="fs-medium lh25 align-right" :data-th="$t('Cost')">
              <span v-if="method.cost > 0">{{ method.cost | mangopay_price }}</span>
              <span v-else-if="getSelectedShippingMethods[storeBrandId].name === method.name && getSelectedShippingMethods[storeBrandId].cost > 0">{{ getSelectedShippingMethods[storeBrandId].cost | mangopay_price }}</span>
              <span v-else>{{ $t('Calculated') }}</span>
            </td>
            <td class="fs-medium lh25" :data-th="$t('Tracking')">
              <!--     // TODO: add a proper boolean to show if there is tracking for thew shipping method-->
              <i class="material-icons">
                check
              </i>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="row between-xs middle-xs mt40">
      <div class="col-xs-12">
        <button-full @click.native="saveShippingMethod(storeBrandId)"
                     :disabled="shippingMethods.length <= 0"
        >
          {{ $t('Apply') }}
        </button-full>
      </div>
    </div>
  </modal>
</template>

<script>
import Modal from 'theme/components/core/Modal'
import ButtonFull from 'theme/components/theme/ButtonFull.vue'
import { required, minLength } from 'vuelidate/lib/validators'
import { Shipping } from '@vue-storefront/core/modules/checkout/components/Shipping'

export default {
  props: {
    storeBrandId: {
      required: true,
      type: String,
      default: () => []
    }
  },
  mounted () {
    // const shippingDetails = this.$store.get['checkout/getShippingDetails']
    // console.log('modal  ShippingMethod shippingDetails', shippingDetails)
    // if(shippingDetails.country){ // if customer has set the Country for shipping
    // this.$store.dispatch('syncShippingMethods', { forceServerSync: false })
    // }
    this.$nextTick(() => {
      this.$bus.$emit('modal-show', 'modal-shipping-method')
    })
  },
  beforeDestroy () {
    this.$bus.$emit('modal-hide', 'modal-shipping-method')
  },
  components: {
    Modal,
    ButtonFull
  },
  mixins: [ Shipping ],
  validations: {
    selectedShippingMethods: {
      required
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

  table {
    border-collapse: collapse;
    width: 100%;
    border: 0;

    @media (max-width: 767px) {
      border-top: none;
    }

    th, td {
      text-align: left;
      padding: 20px;

      &.align-right {
        text-align: right;

        @media (max-width: 767px) {
          text-align: left;
        }

      }

      @media (max-width: 1199px) {
        padding: 10px;
      }

    }

    thead {
      @media (max-width: 767px) {
        display: none;
      }
    }

    tbody {

      tr {
        @media (max-width: 767px) {
          display: block
        }

        &:nth-child(even) {
          td {
            background-color: $color-white-smoke;
          }
        }

      }

      td {
        vertical-align: top;

        @media (max-width: 767px) {
          display: block;
          text-align: left;
          padding: 10px 20px;
          &:before {
            content: attr(data-th) ': ';
            font-weight: 700;
          }
          &:first-child:before {
            content: unset;
          }
        }

        &:first-child {
          @media (max-width: 767px) {
            padding: 20px 20px 10px 20px;
          }
        }

        &:last-child {
          @media (max-width: 767px) {
            padding: 10px 20px 20px 20px;
          }
        }
      }

    }

    tfoot {

      tr {
        @media (max-width: 767px) {
          display: block
        }

        &:last-child {
          td:last-child {
            padding-bottom: 20px
          }
        }

      }

      td {
        @media (max-width: 767px) {
          display: block
        }

        &:first-child {
          @media (max-width: 767px) {
            font-weight: 700;
            padding: 20px 20px 5px 20px;
          }
        }

        &:last-child {
          @media (max-width: 767px) {
            padding: 5px 20px 0 20px;
          }
        }

      }

    }

    i {
      vertical-align: middle;
    }

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
<style scoped lang="scss">
  .modal.modal-shipping-method {
    header.modal-header {
      padding: 0 10px;
    }
    .modal-container {
      max-width: 90%;
      /*min-width: 812px;*/
      border-radius: 8px;
      overflow: hidden;
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
      .row {
        margin: 0;
        padding: 10px 5px;
      }
      .modal-content {
        padding: 16px 30px 26px;
        line-height: 21px;
        @media (max-width: 991px) {
          padding: 10px;
        }
        table {
          tr {
            width: 100%;
            @media (max-width: 767px) {
              position: relative;
              display: table;
              &:first-child {
                border: 0
              }
            }
          }
          th {
            font-weight: normal;
            text-align: left;
            height: 100%;
            border-bottom: 1px solid #f2f2f2;
            vertical-align: middle;
            font-size: 14px;
            color: #999;
            padding: 14px 5px 16px;
          }
          td {
            font-size: 14px;
            font-weight: 600;
            color: #000;
            text-align: left;
            padding: 8px 8px 8px 0;
            line-height: 21px;
            &:first-child {
              padding-left: 0;
              padding-right: 0;
            }
            /*@media (max-width: 767px) {*/
            /*@media (max-width: 450px) {*/
            /*  &:before {*/
            /*    display: none;*/
            /*  }*/
            /*  width: calc(100% - 50px);*/
            /*  float: none;*/
            /*  padding-left:50px;*/
            /*  &:first-child {*/
            /*    width: 30px;*/
            /*    !*float:left;*!*/
            /*    padding:0;*/
            /*    position: absolute;*/
            /*    top: 7px;*/
            /*    left: 0*/
            /*  }*/
            /*}*/
          }
        }
        span.validation-error {
          font-size: 14px;
          color: red;
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
  .text-align-center-all th {
    text-align: center !important;
  }
  .text-align-center-all td {
    text-align: center !important;
  }
  .text-align-center-all tr {
    text-align: center !important;
    vertical-align: middle !important;
    max-height: 30px !important;
  }
  .modal-shipping-method {
    & .radioStyled {
      margin: 0 !important;
      @media (max-width: 767px) {
        top: 15px!important;
        right: 23px!important;
      }
      @media (max-width: 991px) {
        padding: 10px !important;
        float: left;
      }
      input {
        display: none;
        &:checked + span.checkmark:after {
          content: '';
          display: block;
          height: 8px;
          width: 8px;
          position: absolute;
          top: 50% !important;
          left: 50% !important;
          transform: translate(-50%, -50%);
          background-color: #fff;
        }
        &:checked + span.checkmark {
          background: #000;
        }
      }
      span.checkmark{
        left: 16px;
        right: 0;
      }
      &:after {
        top: 13px;
        left: 13px;
      }
    }
  }

</style>
