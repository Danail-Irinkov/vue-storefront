<template>
  <div class="payment pt10">
    <div class="row pl20 pr20">
      <div class="col-xs-12">
        <div
          class="number-circle lh35 cl-white brdr-circle align-center weight-700"
          :class="{ 'bg-cl-th-accent' : isActive || isFilled, 'bg-cl-tertiary' : !isFilled && !isActive }"
        >
          {{ (isVirtualCart ? 2 : 3) }}
        </div>
        <div class="mb15">
          <div :class="{ 'cl-bg-tertiary' : !isFilled && !isActive }">
            <h4 class="m0">
              {{ $t('Payment') }} ({{ $t('Billing Address') }})
            </h4>
          </div>
          <div class="pr30">
            <div class="lh30 flex end-lg" v-if="isFilled && !isActive">
              <a href="#" class="cl-tertiary flex" @click.prevent="edit">
                <span class="pr5">
                  {{ $t('Edit payment') }}
                </span>
                <i class="material-icons cl-tertiary">edit</i>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="row pl20" v-if="isActive">
      <div class="hidden-xs col-sm-2 col-md-1" />
      <div class="col-xs-11 col-sm-9 col-md-10">
        <div class="row" v-if="isActive">
          <base-checkbox
            class="col-xs-12 mb15"
            id="sendToShippingAddressCheckbox"
            v-model="sendToShippingAddress"
            v-if="!isVirtualCart"
          >
            {{ $t('My billing address is the same') }}
          </base-checkbox>
        </div>
        <!--modify condition for show address at copy shipping address unchecked by shabbir -->
        <div class="row" v-if="!sendToShippingAddress">
          <base-checkbox
            v-if="hasBillingData()"
            class="col-xs-12 mb15"
            id="sendToBillingAddressCheckbox"
            v-model="sendToBillingAddress"
          >
            {{ $t('Use my billing data') }}
          </base-checkbox>

          <base-input
            class="col-xs-12 col-sm-6 mb10"
            type="text"
            name="first-name"
            :placeholder="$t('First name *')"
            v-model.trim="payment.firstName"
            @blur="$v.payment.firstName.$touch()"
            autocomplete="given-name"
            :validations="[
              {
                condition: $v.payment.firstName.$error && !$v.payment.firstName.required,
                text: $t('Field is required')
              },
              {
                condition: !$v.payment.firstName.minLength,
                text: $t('Name must have at least 2 letters.')
              }
            ]"
          />

          <base-input
            class="col-xs-12 col-sm-6 mb10"
            type="text"
            name="last-name"
            :placeholder="$t('Last name *')"
            v-model.trim="payment.lastName"
            @blur="$v.payment.lastName.$touch()"
            autocomplete="family-name"
            :validations="[{
              condition: $v.payment.lastName.$error && !$v.payment.lastName.required,
              text: $t('Field is required')
            }]"
          />

          <base-input
            class="col-xs-12 mb10"
            type="text"
            name="phone-number"
            :placeholder="$t('Phone Number')"
            v-model.trim="payment.phoneNumber"
            autocomplete="tel"
          />
          <base-select
            class="col-xs-12 col-sm-6 mb10"
            name="countries"
            :select-options="countryOptions"
            :selected="payment.ISO_code"
            :placeholder="$t('Country *')"
            :validations="[
              {
                condition: $v.payment.ISO_code.$error && !$v.payment.ISO_code.required,
                text: $t('Field is required')
              }
            ]"
            v-model="payment.ISO_code"
            autocomplete="country-name"
            @blur="$v.payment.ISO_code.$touch()"
            @change="changeCountry"
          />
          <base-input
            class="col-xs-12 col-sm-6 mb10"
            type="text"
            name="state"
            :placeholder="$t('State / Province')"
            v-model.trim="payment.state"
            autocomplete="address-level1"
          />
          <base-input
            class="col-xs-12 col-sm-6 mb10"
            type="text"
            name="city"
            :placeholder="$t('City *')"
            v-model.trim="payment.city"
            @blur="$v.payment.city.$touch()"
            autocomplete="address-level2"
            :validations="[
              {
                condition: $v.payment.city.$error && !$v.payment.city.required,
                text: $t('Field is required')
              },
              {
                condition: $v.payment.city.$error && $v.payment.city.required,
                text: $t('Please provide a valid city name')
              }
            ]"
          />
          <base-input
            class="col-xs-12 col-sm-6 mb10"
            type="text"
            name="zip-code"
            :placeholder="$t('Zip-code *')"
            v-model.trim="payment.zipCode"
            @blur="$v.payment.zipCode.$touch()"
            autocomplete="postal-code"
            :validations="[
              {
                condition: $v.payment.zipCode.$error && !$v.payment.zipCode.required,
                text: $t('Field is required')
              },
              {
                condition: !$v.payment.zipCode.minLength,
                text: $t('Zip-code must have at least 3 letters.')
              }
            ]"
          />

          <base-input
            class="col-xs-12 col-sm-9 mb10"
            type="text"
            name="street-address"
            :placeholder="$t('Street name *')"
            v-model.trim="payment.streetAddress"
            @blur="$v.payment.streetAddress.$touch()"
            autocomplete="address-line1"
            :validations="[{
              condition: $v.payment.streetAddress.$error && !$v.payment.streetAddress.required,
              text: $t('Field is required')
            }]"
          />

          <base-input
            class="col-xs-12 col-sm-3 mb10"
            type="text"
            name="apartment-number"
            :placeholder="$t('House/Apartment')"
            v-model.trim="payment.apartmentNumber"
            @blur="$v.payment.apartmentNumber.$touch()"
            autocomplete="address-line2"
            :validations="[{
              condition: $v.payment.apartmentNumber.$error && !$v.payment.apartmentNumber.required,
              text: $t('Field is required')
            }]"
          />
          <div class="col-xs-12">
            <h4>
              {{ $t('Payment method') }}
            </h4>
          </div>
          <div v-for="(method, index) in paymentMethods" :key="index" class="col-md-6">
            <label class="radioStyled"> {{ method.title ? $t(method.title) : $t(method.name) }}
              <input
                type="radio"
                :value="method.code"
                name="payment-method"
                v-model="payment.paymentMethod"
                @change="changePaymentMethod"
              >
              <span class="checkmark" />
            </label>
          </div>
          <span class="validation-error" v-if="!$v.payment.paymentMethod.required">{{ $t('Field is required') }}</span>
        </div>

        <!--modify condition for show address at copy shipping address checked  by shabbir -->
        <div class="row pl20" v-if="sendToShippingAddress">
          <div class="hidden-xs col-sm-2 col-md-1" />
          <div class="col-xs-12 col-sm-9 col-md-11">
            <div class="row fs16 mb35">
              <div class="col-xs-12 h4">
                <p>
                  {{ payment.firstName }} {{ payment.lastName }}
                </p>
                <p>
                  {{ payment.streetAddress }} {{ payment.apartmentNumber }}
                </p>
                <p>
                  {{ payment.city }} {{ payment.zipCode }}
                </p>
                <p>
                  <span v-if="payment.state">{{ payment.state }}, </span>
                  <span>{{ getCountryName() }}</span>
                </p>
                <div v-if="payment.phoneNumber">
                  <span class="pr15">{{ payment.phoneNumber }}</span>
                  <tooltip>{{ $t('Phone number may be needed by carrier') }}</tooltip>
                </div>
                <p v-if="generateInvoice">
                  <strong>{{ $t('Invoice to') }}:</strong>
                  <span style="padding-left: 5px">{{ payment.company }}  -  {{ payment.taxId }}</span>
                </p>
              </div>
            </div>
          </div>
        </div>
        <div class="row" key="invoice-input">
          <base-checkbox
            class="col-xs-12 mb15"
            key="invoice-input-checkbox"
            id="generateInvoiceCheckbox"
            v-model="generateInvoice"
          >
            {{ $t('I want an invoice for my company') }}
            {{ VATEnabledStores.length === 0 ? '(' + $t('VAT free') + ')' : '' }}
          </base-checkbox>

          <template>
            <div key="taxid-input-wrapper" v-if="generateInvoice">
              <base-input
                class="col-xs-12 mb10"
                type="text"
                key="taxid-input"
                name="tax-id"
                :placeholder="$t('Tax identification number *')"
                v-model.trim="payment.taxId"
                @blur="verifyVATNumber"
                autocomplete="tax-id"
                :validations="[
                  {
                    condition: $v.payment.taxId.$error && !$v.payment.taxId.required,
                    text: $t('Field is required')
                  },
                  {
                    condition: !$v.payment.taxId.minLength,
                    text: $t('The tax identification number must have at least 3 letters.')
                  }
                ]"
              />

              <base-input
                class="col-xs-12 mb10"
                type="text"
                key="company-name-input"
                name="company-name"
                :placeholder="$t('Company name *')"
                v-model.trim="payment.company"
                @input="$v.payment.company.$touch()"
                autocomplete="organization"
                :validations="[{
                  condition: $v.payment.company.$error && !$v.payment.company.required,
                  text: $t('Field is required')
                }]"
              />

              <div class="col-xs-12 mb25">
                <label class="fs16">
                  {{ $t('We will send you the invoice to ') }} {{ $store.state.checkout.personalDetails.emailAddress }} {{ $t('as soon as you receive the products and submit a review') }} :)
                </label>
              </div>
            </div>
          </template>
        </div>
        <div class="row">
          <div class="col-xs-12">
            <h4>{{ $t('Payment method') }}</h4>
          </div>
          <div class="col-md-6 mb15">
            <label class="radioStyled"> {{ getPaymentMethod().title }}
              <input type="radio" value="" checked disabled name="chosen-payment-method">
              <span class="checkmark" />
            </label>
          </div>
        </div>
      </div>
    </div>
    <!--modify code for show place order button after click-->
    <div class="row" v-if="isActive || isFilled">
      <div class="hidden-xs col-sm-2 col-md-1" />
      <div class="col-xs-12 col-sm-9 col-md-11">
        <div class="row">
          <div class="col-xs-12 col-md-8 px20 my30">
            <button-full
              @click.native="sendDataToCheckout"
              data-testid="paymentSubmit"
              :disabled="$v.payment.$invalid"
            >
              {{ $t('Place Order') }}
            </button-full>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { required, minLength } from 'vuelidate/lib/validators'
import { unicodeAlpha, unicodeAlphaNum } from '@vue-storefront/core/helpers/validators'
import { Payment } from '@vue-storefront/core/modules/checkout/components/Payment'

import BaseCheckbox from 'theme/components/core/blocks/Form/BaseCheckbox'
import BaseInput from 'theme/components/core/blocks/Form/BaseInput'
import BaseSelect from 'theme/components/core/blocks/Form/BaseSelect'
import ButtonFull from 'theme/components/theme/ButtonFull'
import Tooltip from 'theme/components/core/Tooltip'
import { Logger } from '@vue-storefront/core/lib/logger'
import { OrderModule } from '@vue-storefront/core/modules/order'
import { registerModule } from '@vue-storefront/core/lib/modules'
import { mapGetters } from 'vuex'

export default {
  components: {
    BaseCheckbox,
    BaseInput,
    BaseSelect,
    ButtonFull,
    Tooltip
  },
  mixins: [Payment],
  computed: {
    ...mapGetters({
      getTotals: 'cart/getTotals',
      currentImage: 'procc/getHeadImage',
      getCartItems: 'cart/getCartItems',
      getCartItemsByBrand: 'cart/getCartItemsByBrand',
      currentCart: 'carts/getCartToken'
    }),
    countryOptions () {
      let cntrys = []
      for (let cntry of this.ProCC_Countries) {
        cntrys.push({
          ...cntry,
          value: cntry.ISO_code,
          label: cntry.name
        })
      }
      return cntrys
    }
  },
  validations () {
    if (!this.generateInvoice) {
      return {
        payment: {
          firstName: {
            required,
            minLength: minLength(2),
            unicodeAlpha
          },
          lastName: {
            required,
            unicodeAlpha
          },
          country: {
            required
          },
          ISO_code: {
            required
          },
          streetAddress: {
            required,
            unicodeAlphaNum
          },
          apartmentNumber: {
            required,
            unicodeAlphaNum
          },
          zipCode: {
            required,
            minLength: minLength(3),
            unicodeAlphaNum
          },
          city: {
            required,
            unicodeAlpha
          },
          paymentMethod: {
            required
          }
        }
      }
    } else {
      return {
        payment: {
          firstName: {
            required,
            minLength: minLength(2),
            unicodeAlpha
          },
          lastName: {
            required,
            unicodeAlpha
          },
          company: {
            // unicodeAlphaNum, // DIsabled by dan due to cyrilic names
            required
          },
          taxId: {
            required,
            minLength: minLength(6)
          },
          country: {
            required
          },
          ISO_code: {
            required
          },
          streetAddress: {
            required,
            unicodeAlphaNum
          },
          apartmentNumber: {
            required,
            unicodeAlphaNum
          },
          zipCode: {
            required,
            minLength: minLength(3),
            unicodeAlphaNum
          },
          city: {
            required,
            unicodeAlpha
          },
          paymentMethod: {
            required
          }
        }
      }
    }
  },
  beforeCreate () {
    registerModule(OrderModule)
  },
  mounted () {
    window.callPlaceOrder = (transactionId) => { // ProCC MangoPay Handler
      console.log('window.callPlaceOrder Payment')
      let BrandId = this.currentImage.brand
      this.transactionId = transactionId
      this.ProCcAPI.updateTransactionStatus({mangopay_transaction_id: transactionId}, BrandId).then((result) => {
        // console.log('Payment callPlaceOrder', result.data)
        this.transactionId = result.data.transaction._id
        if (result.data.message_type === 'success') {
          // emit event for place order in megento by shabbir
          this.$bus.$emit('place-magento-order', {transactionId: this.transactionId})
        } else {
          this.$bus.$emit('notification-progress-stop');
          this.$store.dispatch('notification/spawnNotification', {
            type: 'error',
            message: this.$t('Transaction failed'),
            action1: { label: this.$t('OK') }
          })
        }
      }).catch(err => {
        Logger.error(err, 'Transaction was not Done!!')()
        this.$bus.$emit('notification-progress-stop');
        this.$store.dispatch('notification/spawnNotification', {
          type: 'error',
          message: this.$t('Transaction failed'),
          action1: { label: this.$t('OK') }
        })
      })
    }
  },
  methods: {
    onFailure (result) {
      this.$store.dispatch('notification/spawnNotification', {
        type: 'error',
        message: this.$t(result.result),
        action1: {label: this.$t('OK')}
      })
    }
  }
}
</script>
