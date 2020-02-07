<template>
  <div class="mb35">
    <!-- My shipping details header -->
    <div class="row mb15">
      <div class="col-xs-12 col-sm-6" :class="{ 'cl-accent' : !isEdited }">
        <h3 class="m0 mb5">
          {{ $t('My shipping details') }}
        </h3>
      </div>
      <div class="col-xs-12 col-sm-6">
        <div class="lh30 flex end-md" v-if="!isEdited">
          <a href="#" class="cl-tertiary flex" @click.prevent="edit">
            <span class="pr5">
              {{ $t('Edit your shipping details') }}
            </span>
            <i class="material-icons cl-tertiary">edit</i>
          </a>
        </div>
      </div>
    </div>

    <!-- My shipping details body (edit mode) -->
    <div class="row" v-if="isEdited">
      <template>
        <base-input
          class="col-xs-12 col-sm-6 mb10"
          type="text"
          name="first-name"
          autocomplete="given-name"
          :placeholder="`${$t('First name')} *`"
          v-model.trim="shippingDetails.first_name"
          @input="$v.shippingDetails.first_name.$touch()"
          :validations="[
            {
              condition: !$v.shippingDetails.first_name.required && $v.shippingDetails.first_name.$error,
              text: $t('Field is required')
            },
            {
              condition: !$v.shippingDetails.first_name.minLength,
              text: $t('Name must have at least 2 letters.')
            }
          ]"
        />

        <base-input
          class="col-xs-12 col-sm-6 mb10"
          type="text"
          name="last-name"
          autocomplete="family-name"
          :placeholder="`${$t('Last name')} *`"
          v-model.trim="shippingDetails.last_name"
          @input="$v.shippingDetails.last_name.$touch()"
          :validations="[{
            condition: !$v.shippingDetails.last_name.required && $v.shippingDetails.last_name.$error,
            text: $t('Field is required')
          }]"
        />

        <base-checkbox
          v-if="hasBillingAddress()"
          class="col-xs-12 mb10"
          id="addCompanyFilled"
          v-model="useCompanyAddress"
        >
          {{ $t("Use my company's address details") }}
        </base-checkbox>

        <base-input
          class="col-xs-12 col-sm-6 mb10"
          type="text"
          name="street-address"
          autocomplete="address-line1"
          :placeholder="`${$t('Street name')} *`"
          v-model.trim="shippingDetails.streetName"
          @input="$v.shippingDetails.streetName.$touch()"
          :validations="[{
            condition: !$v.shippingDetails.streetName.required && $v.shippingDetails.streetName.$error,
            text: $t('Field is required')
          }]"
        />

        <base-input
          class="col-xs-12 col-sm-6 mb10"
          type="text"
          name="apartment-number"
          autocomplete="address-line2"
          :placeholder="`${$t('House/Apartment number')} *`"
          v-model.trim="shippingDetails.streetNumber"
          @input="$v.shippingDetails.streetNumber.$touch()"
          :validations="[{
            condition: !$v.shippingDetails.streetNumber.required && $v.shippingDetails.streetNumber.$error,
            text: $t('Field is required')
          }]"
        />

        <base-input
          class="col-xs-12 col-sm-6 mb10"
          type="text"
          name="city"
          autocomplete="address-level2"
          :placeholder="`${$t('City')} *`"
          v-model.trim="shippingDetails.city"
          @input="$v.shippingDetails.city.$touch()"
          :validations="[
            {
              condition: !$v.shippingDetails.city.required && $v.shippingDetails.city.$error,
              text: $t('Field is required')
            },
            {
              condition: $v.shippingDetails.city.$error && $v.shippingDetails.city.required,
              text: $t('Please provide valid city name')
            }
          ]"
        />

        <base-input
          class="col-xs-12 col-sm-6 mb10"
          type="text"
          name="state"
          autocomplete="address-level1"
          :placeholder="$t('State / Province')"
          v-model.trim="shippingDetails.region"
        />

        <base-input
          class="col-xs-12 col-sm-6 mb10"
          type="text"
          name="zip-code"
          autocomplete="postal-code"
          :placeholder="`${$t('Zip-code')} *`"
          v-model.trim="shippingDetails.postalCode"
          @input="$v.shippingDetails.postalCode.$touch()"
          :validations="[
            {
              condition: !$v.shippingDetails.postalCode.required && $v.shippingDetails.postalCode.$error,
              text: $t('Field is required')
            },
            {
              condition: !$v.shippingDetails.postalCode.minLength,
              text: $t('Zip-code must have at least 3 letters.')
            }
          ]"
        />

        <base-select
          class="col-xs-12 col-sm-6 mb10"
          name="countries"
          :options="countryOptions"
          :selected="shippingDetails.country"
          :placeholder="$t('Country *')"
          :validations="[
            {
              condition: $v.shippingDetails.country.$error && !$v.shippingDetails.country.required,
              text: $t('Field is required')
            }
          ]"
          v-model="shippingDetails.country"
          autocomplete="country-name"
          @blur="$v.shippingDetails.country.$touch()"
          @change="$v.shippingDetails.country.$touch()"
        />

        <base-input
          class="col-xs-12 col-sm-6 mb10"
          type="text"
          name="phone-number"
          autocomplete="tel"
          :placeholder="$t('Phone Number')"
          v-model.trim="shippingDetails.phone"
        />

        <div class="hidden-xs col-sm-6 mb25" />

        <div class="col-xs-12 col-sm-6">
          <button-full
            @click.native="updateDetails"
            :disabled="$v.$invalid"
          >
            {{ $t('Update my shipping details') }}
          </button-full>
        </div>
        <div class="col-xs-12 col-sm-6 flex middle-xs py10">
          <a href="#" @click="exitSection" class="h4 cl-accent">
            {{ $t('Cancel') }}
          </a>
        </div>
      </template>
    </div>

    <!-- My shipping details summary -->
    <div class="row fs16 mb35" v-else>
      <div class="col-xs-12 h4">
        <p>
          {{ shippingDetails.first_name }} {{ shippingDetails.last_name }}
        </p>
        <base-checkbox
          v-if="useCompanyAddress"
          class="col-xs-12 mb25"
          id="useCompanyAddressFilled"
          v-model="useCompanyAddress"
          disabled
        >
          {{ $t("Use my company's address details") }}
        </base-checkbox>
        <p class="mb25">
          {{ shippingDetails.company }}
        </p>
        <p class="mb25">
          {{ shippingDetails.streetName }}
          <span v-if="shippingDetails.streetNumber"> {{ shippingDetails.streetNumber }}</span>
        </p>
        <p class="mb25">
          {{ shippingDetails.city }} {{ shippingDetails.postalCode }}
        </p>
        <p class="mb25">
          <span v-if="shippingDetails.region">{{ shippingDetails.region }}, </span>
          {{ shippingDetails.country }}
        </p>
        <div class="mb25">
          {{ shippingDetails.phone }}
          <tooltip v-if="shippingDetails.phone">
            {{ $t('Phone number may be needed by carrier') }}
          </tooltip>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { required, minLength } from 'vuelidate/lib/validators'
import MyShippingDetails from '@vue-storefront/core/compatibility/components/blocks/MyAccount/MyShippingDetails'
import { unicodeAlpha, unicodeAlphaNum } from '@vue-storefront/core/helpers/validators'

import ButtonFull from 'theme/components/theme/ButtonFull'
import Tooltip from 'theme/components/core/Tooltip'
import BaseCheckbox from 'theme/components/core/blocks/Form/BaseCheckbox'
import BaseInput from 'theme/components/core/blocks/Form/BaseInput'
import BaseSelect from 'theme/components/core/blocks/Form/BaseSelect'

export default {
  components: {
    ButtonFull,
    Tooltip,
    BaseCheckbox,
    BaseInput,
    BaseSelect
  },
  mixins: [MyShippingDetails],
  computed: {
    countryOptions () {
      return this.countries.map((item) => {
        return {
          value: item.name,
          label: item.name
        }
      })
    }
  },
  validations: {
    shippingDetails: {
      first_name: {
        required,
        minLength: minLength(2),
        unicodeAlpha
      },
      last_name: {
        required
      },
      country: {
        required
      },
      streetName: {
        required,
        unicodeAlphaNum
      },
      streetNumber: {
        required,
        unicodeAlphaNum
      },
      postalCode: {
        required,
        minLength: minLength(3)
      },
      city: {
        required,
        unicodeAlpha
      }
    }
  }
}
</script>
