<template>
  <div class="pt10">
    <div class="row pl20 pr20">
      <div class="col-xs-12">
        <div
          class="number-circle lh35 cl-white brdr-circle align-center weight-700"
          :class="{ 'bg-cl-th-accent' : isActive || isFilled, 'bg-cl-tertiary' : !isFilled && !isActive }"
        >
          2
        </div>
        <div class="mb15">
          <div class="dt-float-l" :class="{ 'cl-bg-tertiary' : !isFilled && !isActive }">
            <h4 class="m0">
              {{ $t('Shipping') }} {{ $t('Address') }}
            </h4>
          </div>
          <div class=" dt-float-r pl20">
            <div class="lh30 flex end-lg" v-if="isFilled && !isActive">
              <a href="#" class="cl-tertiary flex" @click.prevent="edit">
                <span class="pr5">
                  {{ $t('Edit shipping') }}
                </span>
                <i class="material-icons cl-tertiary">edit</i>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="row pl20 pr20 mt15" v-if="isActive">
      <div class="hidden-xs col-sm-2 col-md-1" />
      <div class="col-xs-11 col-sm-9 col-md-10">
        <div class="row">
          <base-checkbox
            v-if="currentUser && hasShippingDetails()"
            class="col-xs-12 mb10"
            id="shipToMyAddressCheckbox"
            v-model="shipToMyAddress"
          >
            {{ $t('Ship to my default address') }}
          </base-checkbox>

          <base-input
            class="col-xs-12 col-sm-6 mb10"
            type="text"
            name="first-name"
            :placeholder="$t('First name *')"
            v-model.trim="shipping.firstName"
            @blur="$v.shipping.firstName.$touch()"
            autocomplete="given-name"
            :validations="[
              {
                condition: $v.shipping.firstName.$error && !$v.shipping.firstName.required,
                text: $t('Field is required')
              },
              {
                condition: !$v.shipping.firstName.minLength,
                text: $t('Name must have at least 2 letters.')
              }
            ]"
          />

          <base-input
            class="col-xs-12 col-sm-6 mb10"
            type="text"
            name="last-name"
            :placeholder="$t('Last name *')"
            v-model.trim="shipping.lastName"
            @blur="$v.shipping.lastName.$touch()"
            autocomplete="family-name"
            :validations="[{
              condition: $v.shipping.lastName.$error && !$v.shipping.lastName.required,
              text: $t('Field is required')
            }]"
          />
          <base-input
            class="col-xs-12 mb10"
            type="text"
            name="phone-number"
            :placeholder="$t('Phone Number')"
            v-model.trim="shipping.phoneNumber"
            autocomplete="tel"
            :validations="[
              {
                condition: !$v.shipping.phoneNumber.required,
                text: $t('Field is required')
              }
            ]"
          />
          <base-select
            class="col-xs-12 col-sm-6 mb10"
            name="countries"
            :selectOptions="countryOptions"
            :selected="shipping.ISO_code"
            :placeholder="$t('Country *')"
            :validations="[
              {
                condition: $v.shipping.ISO_code.$error && !$v.shipping.ISO_code.required,
                text: $t('Field is required')
              }
            ]"
            v-model="shipping.ISO_code"
            autocomplete="country-name"
            @blur="$v.shipping.ISO_code.$touch()"
            @change="selectCountry"
          />
<!--          <base-input-->
<!--            class="col-xs-12 col-sm-6 mb10"-->
<!--            type="text"-->
<!--            name="state"-->
<!--            :placeholder="$t('State / Province')"-->
<!--            v-model.trim="shipping.state"-->
<!--            autocomplete="address-level1"-->
<!--            :validations="[-->
<!--              {-->
<!--                condition: $v.shipping.state.$error && !$v.shipping.state.required,-->
<!--                text: $t('Field is required')-->
<!--              },-->
<!--              {-->
<!--                condition: !$v.shipping.state.minLength,-->
<!--                text: $t('Name must have at least 3 letters.')-->
<!--              }-->
<!--            ]"-->
<!--          />-->
          <base-input
            class="col-xs-12 col-sm-6 mb10"
            type="text"
            name="state"
            :placeholder="$t('State / Province')"
            v-model.trim="shipping.state"
            autocomplete="address-level1"
          />
           <base-input v-if="no_cities_available"
            class="col-xs-12 col-sm-6 mb10"
            type="text"
            name="city"
            id="cityInput"
            :disabled="disable_city_fields"
            :placeholder="$t('City *')"
            v-model.trim="shipping.city"
            @blur="$v.shipping.city.$touch()"
            @change="$v.shipping.city.$touch()"
            autocomplete="address-level2"
            :validations="[
              {
                condition: $v.shipping.city.$error && !$v.shipping.city.required,
                text: $t('Field is required')
              },
              {
                condition: $v.shipping.city.$error && $v.shipping.city.required,
                text: $t('Please provide valid city name')
              }
            ]"
          />
          <base-select v-else
            class="col-xs-12 col-sm-6 mb10"
            name="City"
            id="cityInput2"
            :disabled="disable_city_fields"
            :selectOptions="cityOptions"
            :selected="shipping.city"
            :placeholder="$t('City *')"
            remoteQueryMethod="getCitiesList"
            @remoteResults="addToCities"
            selectLabel="city_name"
            valueKey="site_id"
            :remoteParentSelected="shipping.ISO_code"
            :validations="[
              {
                condition: $v.shipping.city.$error && !$v.shipping.city.required,
                text: $t('Field is required')
              }
            ]"
            v-model="shipping.site_id"
            autocomplete="country-name"
            @blur="$v.shipping.city.$touch()"
            @change="selectCity"
          />

          <base-input
            class="col-xs-12 col-sm-6 mb10"
            type="text"
            id="postalCode"
            name="zip-code"
            :placeholder="$t('Zip-code *')"
            v-model.trim="shipping.zipCode"
            @blur="$v.shipping.zipCode.$touch()"
            autocomplete="postal-code"
            :validations="[
              {
                condition: $v.shipping.zipCode.$error && !$v.shipping.zipCode.required,
                text: $t('Field is required')
              },
              {
                condition: !$v.shipping.zipCode.minLength,
                text: $t('Code must have at least 3 letters.')
              }
            ]"
          />

          <base-input v-if="no_streets_available"
            class="col-xs-12 col-sm-9 mb10"
            type="text"
            name="street-address"
            id="streetName"
            :placeholder="$t('Street name *')"
            v-model.trim="shipping.streetAddress"
            @blur="$v.shipping.streetAddress.$touch()"
            autocomplete="address-line1"
            :disabled="disable_street_fields"
            :validations="[{
              condition: $v.shipping.streetAddress.$error && !$v.shipping.streetAddress.required,
              text: $t('Field is required')
            }]"
          />
          <base-select v-else
            class="col-xs-12 col-sm-9 mb10"
            name="street-address"
            id="streetName2"
            :selectOptions="streetsOptions"
            :selected="shipping.street_id"
            :disabled="disable_street_fields"
            :placeholder="$t('Street name *')"
            :validations="[
              {
                condition: $v.shipping.streetAddress.$error && !$v.shipping.streetAddress.required,
                text: $t('Field is required')
              }
            ]"
            v-model="shipping.street_id"
            autocomplete="country-name"
            @blur="$v.shipping.streetAddress.$touch()"
            @change.native="$v.shipping.streetAddress.$touch(); selectStreet();"
          />

          <base-input
            class="col-xs-12 col-sm-3 mb10"
            type="text"
            name="apartment-number"
            :placeholder="$t('House/Apartment')"
            v-model.trim="shipping.apartmentNumber"
            @blur="$v.shipping.apartmentNumber.$touch()"
            autocomplete="address-line2"
            :validations="[{
              condition: $v.shipping.apartmentNumber.$error && !$v.shipping.apartmentNumber.required,
              text: $t('Field is required')
            }]"
          />
        </div>
      </div>
    </div>
    <div class="row" v-if="isActive">
      <div class="hidden-xs col-sm-2 col-md-1" />
      <div class="col-xs-12 col-sm-9 col-md-11">
        <div class="row">
          <div class="col-xs-12 col-md-8 my30 px20">
            <button-full
              data-testid="shippingSubmit"
              @click.native="sendDataToCheckout"
              :disabled="$v.shipping.$invalid || shippingMethods.length <= 0"
            >
              {{ $t('Continue to payment') }}
            </button-full>
          </div>
        </div>
      </div>
    </div>
    <div class="row pl20" v-if="!isActive && isFilled">
      <div class="hidden-xs col-sm-2 col-md-1" />
      <div class="col-xs-12 col-sm-9 col-md-11">
        <div class="row fs16 mb35">
          <div class="col-xs-12 h4" data-testid="shippingAddressSummary">
            <p>
              {{ shipping.firstName }} {{ shipping.lastName }}
            </p>
            <p>
              {{ shipping.streetAddress }} {{ shipping.apartmentNumber }}
            </p>
            <p>
              {{ shipping.city }} {{ shipping.zipCode }}
            </p>
            <p>
              <span v-if="shipping.state">{{ shipping.state }}, </span>
              <span>{{ getCountryName() }}</span>
            </p>
            <div v-if="shipping.phoneNumber">
              <span class="pr15">{{ shipping.phoneNumber }}</span>
              <tooltip>{{ $t('Phone number may be needed by carrier') }}</tooltip>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { required, minLength } from 'vuelidate/lib/validators'
import { unicodeAlpha, unicodeAlphaNum } from '@vue-storefront/core/helpers/validators'
import { Shipping } from '@vue-storefront/core/modules/checkout/components/Shipping'

import BaseCheckbox from 'theme/components/core/blocks/Form/BaseCheckbox'
import BaseInput from 'theme/components/core/blocks/Form/BaseInput'
import BaseSelect from 'theme/components/core/blocks/Form/BaseSelect'
import ButtonFull from 'theme/components/theme/ButtonFull'
import Tooltip from 'theme/components/core/Tooltip'

export default {
  components: {
    ButtonFull,
    Tooltip,
    BaseCheckbox,
    BaseInput,
    BaseSelect
  },
  mixins: [Shipping],
  computed: {
    countryOptions () {
      let cntrys = []
      for (let cntry of this.ProCC_Countries){
        cntrys.push({
          ...cntry,
          value: cntry.ISO_code,
          label: cntry.name
        })
      }
      return cntrys
    },
    cityOptions () {
      return this.cities.map((item) => {
        return {
          ...item,
          value: item.site_id,
          label: this.shipping.site_id === item.site_id ? item.city_type && item.city_type !== 0 ? item.city_type + ' ' + item.city_name : item.city_name : item.city_type && item.city_type !== 0 ? item.city_type + ' ' + item.city_name + ', ' + item.post_code : item.city_name + ', ' + item.post_code
        }
      })
    },
    streetsOptions () {
      return this.streets.map((item) => {
        return {
          value: item.street_id,
          label: item && item.street_type ? `${item.street_type} ${item.streetName}` : item.streetName
        }
      })
    }
  },
  validations: {
    shipping: {
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
      phoneNumber: {
        required
        // TODO: Need to add proper phone validation and maybe sms verification with twilio
      },
      /*state: {
        required,
        minLength: minLength(3),
        unicodeAlphaNum
      },*/
      zipCode: {
        required,
        minLength: minLength(3),
        unicodeAlphaNum
      },
      city: {
        required,
        unicodeAlpha
      }
    }
  }
}
</script>
