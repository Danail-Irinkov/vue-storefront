<template>
  <div>
    <header class="thank-you-title py35 pl20">
      <div class="container">
        <!--        <breadcrumbs-->
        <!--          :with-homepage="true"-->
        <!--          :routes="[]"-->
        <!--          :active-route="this.$t('Order confirmation')"-->
        <!--        />-->
        <img src="https://procc.co/static/img/check-mark-circle.png" class="order-confirm-header" style="opacity: 0.6;">
        <h4 class="category-title">
          {{ $t('Thank you for your purchase') }}
        </h4>
      </div>
    </header>
    <!-- modify for display order details-->
    <div class="container" v-if="lastOrderConfirmation.orders && lastOrderConfirmation.orders[0]">
      <div class="row mb20" v-if="userInfoIsNotStored">
        <h4 class="bg-cl-secondary" style="width: 100%; text-align: center; margin: 0 8px 1rem 18px!important;padding: 20px 0 20px 0">
          {{ $t("Store your order's details in your ProCC Account") }}
        </h4>
        <div class="col-md-6">
          <base-checkbox
            class="col-sm-12 bg-cl-secondary p15 ml10"
            id="storePersonalInfo"
            v-model="storePersonalInfo"
          >
            {{ $t("Save my Personal Information in accordance with ProCC's Privacy Policy") }}
          </base-checkbox>
        </div>
        <div class="col-md-6">
          <base-checkbox
            class="col-sm-12 bg-cl-secondary p15 ml10"
            id="storePaymentInfo"
            v-model="storePaymentInfo"
          >
            {{ $t("Save my Payment Information in accordance with ProCC's Privacy Policy") }}
          </base-checkbox>
        </div>
        <div class="col-md-8 animated fadeInDown bg-cl-secondary"
             v-if="storePersonalInfo || storePaymentInfo"
             style="padding-left: 15px;margin: 1rem -28px 0 18px;"
        >
          <base-input
            class=""
            style="width: calc(100% - 28px); padding-top: 22px"
            type="password"
            name="password"
            v-model="password"
            @blur="$v.password.$touch()"
            :placeholder="$t('Password *')"
            :validations="[{
              condition: !$v.password.required && $v.password.$error,
              text: $t('Field is required')
            }]"
          />
        </div>
        <div class="col-md-4 animated fadeInDown bg-cl-secondary"
             v-if="storePersonalInfo || storePaymentInfo"
             style="padding-left: 15px; margin-top: 1rem"
        >
          <button-full
            @click.native="saveUserAccount"
            data-testid="orderReviewSubmit"
            class="place-order-btn"
            style="margin-top: 10px;"
            :disabled="$v.password.$invalid"
          >
            {{ $t('Save to Account') }}
          </button-full>
        </div>
      </div>
      <div v-for="order in lastOrderConfirmation.orders" :key="order._id">
        <order-items :brand="order.brand" :order-items="order.order_items" :shipping-method="order.shipping_method" class-name="bg-cl-secondary mb20" :order-id="order.order_no" :is-disabled-inputs="true" />
      </div>
      <div class="row">
        <div class="col-md-6 address">
          <div class="bg-cl-secondary p10" style="min-height: 212px">
            <h4 class="m0">
              {{ $t("Shipping Address") }}
            </h4>
            <address-block class-name="px10" :address="lastOrderConfirmation.orders[0].address" v-if="lastOrderConfirmation.orders[0] && lastOrderConfirmation.orders[0].address" />
          </div>
        </div>
        <div class="col-md-6">
          <microcart-summary class="bg-cl-secondary mb20" :order-summary="orderSummary" />
        </div>
      </div>
      <div class="mb20 bg-cl-secondary thank-you-improvment">
        <h4> {{ $t('What are the next steps?') }}</h4>
        <ol>
          <li v-if="lastOrderConfirmation.orders[0].customer_user">
            {{ $t('You will receive an email at') }} <strong>{{ lastOrderConfirmation.orders[0].customer_user.email }}</strong> {{ $t('confirming your order.') }}
          </li>
          <li>{{ $t('You will receive another confirmation email at shipping. If you have any questions, see our') }} <a href="https://procc.co/faq" target="_blank">{{ $t("FAQ") }}</a> </li>
        </ol>
        <p>{{ $t("You can check the status of the order using your account's Order History") }}</p>
      </div>
      <div class="mb20 bg-cl-secondary thank-you-improvment">
        <h4>
          {{ $t('What can we improve?') }}
        </h4>
        <p class="mb25">
          {{ $t('Your feedback is important for us. Let us know what we could improve.') }}
        </p>
        <form @submit.prevent="sendFeedback">
          <div class="row align-items-end feedback-row">
            <div class="col-md-8 col-lg-9">
              <base-textarea
                class="m0 h-100 textarea-height-procc"
                style=""
                type="text"
                name="body"
                v-model="feedback"
                :placeholder="$t('Type your opinion')"
                :autofocus="true"
              />
            </div>
            <div class="col-md-4 col-lg-3">
              <button-outline color="dark">
                {{ $t('Send feedback') }}
              </button-outline>
            </div>
          </div>
        </form>
      </div>
      <div class="mb20 bg-cl-secondary thank-you-improvment">
        <h3 class="center title">
          {{ $t("Suggested Products") }}
        </h3>
        <ProCCTileLinks />
      </div>
    </div>
    <!--<div class="thank-you-content align-justify py40 pl20">
      <div class="container">
        <div class="row">
          <div class="col-md-6 pl20 pr20">
            <h3 v-if="OnlineOnly">
              {{ $t('Your purchase') }}
            </h3>
            <p v-if="OnlineOnly" v-html="this.$t('You have successfuly placed the order. You can check status of your order by using our <b>delivery status</b> feature. You will receive an order confirmation e-mail with details of your order and a link to track its progress.')" />
            <div v-if="OnlineOnly && lastOrderConfirmation.orders">
              <p v-for="order in lastOrderConfirmation.orders" :key="order._id">
                <strong>{{ order.brand.name }}</strong> brand's order number is {{ order.order_no }}.
              </p>
            </div>
            <h4 v-if="OfflineOnly">
              {{ $t('You are offline') }}
            </h4>
            <p v-if="OfflineOnly && !isNotificationSupported">
              {{ $t('To finish the order just come back to our store while online. Your order will be sent to the server as soon as you come back here while online and then confirmed regarding the stock quantities of selected items') }}
            </p>
            <p v-if="OfflineOnly && isNotificationSupported && !isPermissionGranted">
              {{ $t("You can allow us to remind you about the order via push notification after coming back online. You'll only need to click on it to confirm.") }}
            </p>
            <p v-if="OfflineOnly && isNotificationSupported && !isPermissionGranted">
              {{ $t(`Or if you will stay on "Order confirmation" page, the order will be placed automatically without confirmation, once the internet connection will be back.`) }}
            </p>
            <p v-if="OfflineOnly && isNotificationSupported && isPermissionGranted">
              <strong>{{ $t('You will receive Push notification after coming back online. You can confirm the order by clicking on it') }}</strong>
            </p>
            <p v-if="!isPermissionGranted && isNotificationSupported">
              <button-outline color="dark" @click.native="requestNotificationPermission()">
                {{ $t('Allow notification about the order') }}
              </button-outline>
            </p>
            <p>
              <button-outline
                color="dark"
                @click.native="$router.push('/')"
              >
                {{ $t('Return to shopping') }}
              </button-outline>
            </p>
            <div id="thank-you-extensions" />
          </div>
          <div class="col-md-6 bg-cl-secondary thank-you-improvment">
            <h3>
              {{ $t('What can we improve?') }}
            </h3>
            <p class="mb25">
              {{ $t('Your feedback is important for us. Let us know what we could improve.') }}
            </p>
            <form @submit.prevent="sendFeedback">
              <base-textarea
                class="mb25"
                type="text"
                name="body"
                v-model="feedback"
                :placeholder="$t('Type your opinion')"
                :autofocus="true"
              />
              <button-outline color="dark">
                {{ $t('Send feedback') }}
              </button-outline>
            </form>
          </div>
        </div>
      </div>
    </div>-->
  </div>
</template>

<script>
import Composite from '@vue-storefront/core/mixins/composite'
import Breadcrumbs from 'theme/components/core/Breadcrumbs'
import BaseTextarea from 'theme/components/core/blocks/Form/BaseTextarea'
import ButtonOutline from 'theme/components/theme/ButtonOutline'
import VueOfflineMixin from 'vue-offline/mixin'
import OrderItems from './OrderItems'
import ProCCTileLinks from 'theme/components/procc/TileLinks/ProCCTileLinks'
import MicrocartSummary from 'theme/components/core/blocks/Microcart/MicrocartSummary'
import AddressBlock from 'theme/components/core/blocks/Checkout/AddressBlock'
import { EmailForm } from '@vue-storefront/core/modules/mailer/components/EmailForm'
import { isServer } from '@vue-storefront/core/helpers'
import config from 'config'
import { registerModule } from '@vue-storefront/core/lib/modules'
import { MailerModule } from '@vue-storefront/core/modules/mailer'
import _ from 'lodash'
import BaseCheckbox from 'theme/components/core/blocks/Form/BaseCheckbox'
import BaseInput from 'theme/components/core/blocks/Form/BaseInput'
import ButtonFull from 'theme/components/theme/ButtonFull'
import { required, minLength } from 'vuelidate/lib/validators'

export default {
  name: 'ThankYouPage',
  mixins: [Composite, VueOfflineMixin, EmailForm],
  beforeCreate () {
    registerModule(MailerModule)
  },
  data () {
    return {
      feedback: '',
      password: '', // Added by Dan
      storePersonalInfo: false, // Added by Dan
      storePaymentInfo: false // Added by Dan
    }
  },
  computed: {
    lastOrderConfirmation () {
      return this.$store.state.order.last_order_confirmation ? this.$store.state.order.last_order_confirmation.confirmation : {}
    },
    isNotificationSupported () {
      if (isServer || !('Notification' in window)) return false
      return 'Notification' in window
    },
    isPermissionGranted () {
      if (isServer || !('Notification' in window)) return false
      return Notification.permission === 'granted'
    },
    checkoutPersonalEmailAddress () {
      return this.$store.state.checkout.personalDetails.emailAddress
    },
    // created function for get order summary from order
    orderSummary () {
      let summary_data = []
      let total = _.sumBy(this.lastOrderConfirmation.orders, (o) => { return o.total; });
      let shipping_fee = _.sumBy(this.lastOrderConfirmation.orders, (o) => { return o.shipping_fee; });
      summary_data.push({code: 'subtotal', title: 'Subtotal', value: (total - shipping_fee)})
      summary_data.push({code: 'shipping_fee', title: 'Shipping Fee', value: shipping_fee})
      summary_data.push({code: 'grand_total', title: 'Grand Total', value: total})
      return summary_data
    },
    mailerElements () {
      return config.mailer.contactAddress
    },
    userInfoIsNotStored () { // Added By Dan
      // TODO: Need to populate these boolenans according to real situation
      // TODO: if the email the user wrote is already in used in an account -> add the data to that account, BUT dont allow the user to access the stored address an payment methods, unless they login and input password
      const isUserAddressStored = false
      const isUserPaymentStored = false
      return !isUserAddressStored || !isUserPaymentStored
    }
  },
  methods: {
    saveUserAccount () { // Added by Dan
      // TODO: Create an user account, OR save the selected address and/or payment data to the current user's account
      console.log('saveUserAccount Mock Started')
    },
    requestNotificationPermission () {
      if (isServer) return false
      if ('Notification' in window && Notification.permission !== 'granted') {
        Notification.requestPermission()
      }
    },
    sendFeedback () {
      console.log('this.checkoutPersonalEmailAddress', this.checkoutPersonalEmailAddress)
      console.log('this.mailerElements', this.mailerElements)
      this.sendEmail(
        {
          sourceAddress: this.checkoutPersonalEmailAddress,
          targetAddress: this.mailerElements,
          subject: this.$t('What can we improve?'),
          emailText: this.feedback
        },
        this.onSuccess,
        this.onFailure
      )
    },
    onSuccess (message) {
      this.$store.dispatch('notification/spawnNotification', {
        type: 'success',
        message,
        action1: { label: this.$t('OK') }
      })
      if (this.mailerElements.sendConfirmation) {
        this.sendEmail(
          {
            sourceAddress: this.mailerElements,
            targetAddress: this.checkoutPersonalEmailAddress,
            subject: this.$t('Confirmation of receival'),
            emailText: this.$t(`Dear customer,\n\nWe have received your letter.\nThank you for your feedback!`),
            confirmation: true
          }
        )
      }
    },
    onFailure (message) {
      this.$store.dispatch('notification/spawnNotification', {
        type: 'error',
        message,
        action1: { label: this.$t('OK') }
      })
    }
  },
  destroyed () {
    this.$store.dispatch('checkout/setThankYouPage', false)
  },
  validations: { // Added by Dan
    password: { // Added by Dan
      minLength: minLength(8),
      required
    }
  },
  components: {
    AddressBlock,
    BaseTextarea,
    Breadcrumbs,
    ButtonOutline,
    OrderItems,
    ProCCTileLinks,
    BaseCheckbox,
    BaseInput,
    ButtonFull,
    MicrocartSummary
  }
}
</script>

<style lang="scss">
  .thank-you-content {
    padding-left: 0;

    p {
      line-height: 25px
    }
    @media (min-width: 64em) {
      h4 {
        font-size: 24px;
      }
    }
  }
  .thank-you-title {
    .order-confirm-header {
      width: 96px;
      height: auto !important;
      display: block;
      text-align: center;
      margin: auto;
    }
    .category-title{
      text-align: center;
      margin: auto;
    }
  }
  .thank-you-improvment {
    padding: 20px;
    h4 {
      margin-top: 0;
    }

    textarea {
      min-height: 100px;
      margin: 0;padding: 0;
    }
    h3.center.title {
      margin-bottom: 15px;
      text-align: center;
      margin-top: 0;
    }
    .feedback-row {
      align-items: flex-end;
      button {
        margin-bottom: 4px;
        @media (max-width: 767px) {
          margin-top: 15px;
        }
      }
    }
  }
  @media (max-width: 575px) {
    .address:not(:last-child) {
      margin-bottom: 15px;
    }
    .details {
      &.flex-nowrap {
        flex-wrap: wrap;
        flex-flow: column;
      }
    }
  }
  .textarea-height-procc { // Added By Dan
    & > div > textarea {
      padding-top: 10px;
      min-height: 50px!important
    }
  }
</style>
