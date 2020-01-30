<template>
  <div>
    <header class="thank-you-title py35 pl20">
      <div class="container">
        <breadcrumbs
          :with-homepage="true"
          :routes="[]"
          :active-route="this.$t('Order confirmation')"
        />
        <img src="https://procc.co/static/img/check-mark-circle.png" class="order-confirm-header">
        <h4 class="category-title">{{ $t('Thank you for your purchase') }}</h4>
      </div>
    </header>
    <!-- modify for display order details-->
    <div class="container">
      <div class="row mb20" v-if="lastOrderConfirmation.orders">
        <div class="col-sm-6 address">
          <div class="bg-cl-secondary p10">
            <h4 class="m0">{{$t("Shipping Address")}}</h4>
            <address :shipping="lastOrderConfirmation.orders.address" v-if="lastOrderConfirmation.orders.address"></address>
          </div>
        </div>
        <div class="col-sm-6 address">
          <div class="bg-cl-secondary p10">
            <h4 class="m0">{{$t("Billing Address")}}</h4>
            <address :shipping="lastOrderConfirmation.orders.address" v-if="lastOrderConfirmation.orders.address"></address>
          </div>
        </div>
      </div>
      <div class="mb20 bg-cl-secondary thank-you-improvment">
        <h4>
          {{ $t('What we can improve?') }}
        </h4>
        <p class="mb25">
          {{ $t('Your feedback is important for us. Let us know what we could improve.') }}
        </p>
          <form @submit.prevent="sendFeedback">
            <div class="row align-items-end feedback-row">
          <div class="col-md-8 col-lg-9">
            <base-textarea
              class="m0 h-100"
              type="text"
              name="body"
              v-model="feedback"
              :placeholder="$t('Type your opinion')"
              :autofocus="true"
            />
          </div>
            <div class="col-md-4 col-lg-3">
              <button-outline color="dark">
                {{ $t('Give a feedback') }}
              </button-outline>
            </div>
            </div>
          </form>
      </div>
      <div v-for="order in lastOrderConfirmation.orders" :key="order._id">
        <order-items :brand="order.brand" :order-items="order.order_items" :shipping-method="order.shipping_method" className="bg-cl-secondary mb20" order-id="order.order_no" :is-disabled-inputs="true"/>
      </div>
      <div class="row">
        <div class="col-md-6"></div>
        <div class="col-md-6">
          <microcart-summary class="bg-cl-secondary mb20"></microcart-summary>
        </div>
      </div>
      <div class="mb20 bg-cl-secondary thank-you-improvment">
        <h4> {{$t('What are the next steps?')}}</h4>
        <ol>
          <li v-if="lastOrderConfirmation.orders.customer.email">{{$t('You will receive an email at')}} {{lastOrderConfirmation.orders.customer.email}} {{$t('confirming your order.')}}</li>
          <li>{{$t('You will receive another confirmation email at shipping. If you have any questions, see our')}} <a href="https://procc.co/faq" target="_blank">{{$t("FAQ")}}</a> </li>
        </ol>
        <p>{{$t("Remember You can check the status of the order using the order tracking option")}}</p>
      </div>
      <div class="mb20 bg-cl-secondary thank-you-improvment">
        <h3 class="center title"> {{$t("Suggested Products")}}</h3>
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
              {{ $t('What we can improve?') }}
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
                {{ $t('Give a feedback') }}
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
import Address from './Address'
import ProCCTileLinks from 'theme/components/procc/TileLinks/ProCCTileLinks'
import MicrocartSummary from 'theme/components/core/blocks/Microcart/MicrocartSummary'
import { EmailForm } from '@vue-storefront/core/modules/mailer/components/EmailForm'
import { isServer } from '@vue-storefront/core/helpers'
import config from 'config'
import { registerModule } from '@vue-storefront/core/lib/modules'
import { MailerModule } from '@vue-storefront/core/modules/mailer'

export default {
  name: 'ThankYouPage',
  mixins: [Composite, VueOfflineMixin, EmailForm],
  beforeCreate () {
    registerModule(MailerModule)
  },
  data () {
    return {
      feedback: ''
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
    mailerElements () {
      return config.mailer.contactAddress
    }
  },
  methods: {
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
          subject: this.$t('What we can improve?'),
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
  components: {
    Address,
    BaseTextarea,
    Breadcrumbs,
    ButtonOutline,
    OrderItems,
    ProCCTileLinks,
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
</style>
