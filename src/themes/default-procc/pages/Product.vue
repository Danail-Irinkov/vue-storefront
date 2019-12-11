<template>
  <div id="product" itemscope itemtype="http://schema.org/Product">
    <section class="bg-cl-secondary px20 product-top-section">
      <div class="container">
        <section class="row m0 between-xs">
          <div class="col-xs-12 col-md-6 center-xs middle-xs image">
            <product-gallery
              :offline="image"
              :gallery="gallery"
              :configuration="configuration"
              :product="product"
            />
          </div>
          <div class="col-xs-12 col-md-5 data">
            <breadcrumbs
              class="pt40 pb20 hidden-xs"
              :routes="breadcrumbs.routes"
              :active-route="breadcrumbs.name"
            />
            <h1 class="mb20 mt0 cl-mine-shaft product-name" data-testid="productName" itemprop="name">
              {{ product.name | htmlDecode }}
              <web-share :title="product.name | htmlDecode" text="Check this product!" class="web-share" />
            </h1>
            <div class="mb20 uppercase cl-secondary" itemprop="sku" :content="product.sku">
              {{ $t('SKU') }}: {{ product.sku }}
            </div>
            <div itemprop="offers" itemscope itemtype="http://schema.org/Offer">
              <meta itemprop="priceCurrency" :content="currentStore.i18n.currencyCode">
              <meta itemprop="price" :content="parseFloat(product.priceInclTax).toFixed(2)">
              <meta itemprop="availability" :content="structuredData.availability">
              <meta itemprop="url" :content="product.url_path">
              <div
                class="mb40 price serif"
                v-if="product.type_id !== 'grouped'"
              >
                <div
                  class="h3 cl-secondary"
                  v-if="product.special_price && product.priceInclTax && product.originalPriceInclTax"
                >
                  <span class="h2 cl-mine-shaft weight-700">
                    {{ product.priceInclTax * product.qty | price }}
                  </span>&nbsp;
                  <span class="price-original h3">
                    {{ product.originalPriceInclTax * product.qty | price }}
                  </span>
                </div>
                <div
                  class="h2 cl-mine-shaft weight-700"
                  v-if="!product.special_price && product.priceInclTax"
                >
                  {{ product.qty > 0 ? product.priceInclTax * product.qty : product.priceInclTax | price }}
                </div>
              </div>
              <div
                class="cl-primary variants"
                v-if="product.type_id =='configurable' && !loading"
              >
                <div class="error" v-if="product.errors && Object.keys(product.errors).length > 0">
                  {{ product.errors | formatProductMessages }}
                </div>
                <div
                  class="h5"
                  v-for="(option, index) in product.configurable_options"
                  v-if="(!product.errors || Object.keys(product.errors).length === 0) && Object.keys(configuration).length > 0"
                  :key="index"
                >
                  <div class="variants-label" data-testid="variantsLabel">
                    {{ option.label }}
                    <span class="weight-700">
                      {{ configuration[option.attribute_code ? option.attribute_code : option.label.toLowerCase()].label }}
                    </span>
                  </div>
                  <div class="row top-xs m0 pt15 pb40 variants-wrapper">
                    <div v-if="option.label == 'Color'">
                      <color-selector
                        v-for="(c, i) in options[option.attribute_code]"
                        v-if="isOptionAvailable(c)"
                        :key="i"
                        :id="c.id"
                        :label="c.label"
                        context="product"
                        :code="option.attribute_code"
                        :class="{ active: c.id == configuration[option.attribute_code].id }"
                      />
                    </div>
                    <div class="sizes" v-else-if="option.label == 'Size'">
                      <size-selector
                        v-for="(s, i) in options[option.attribute_code]"
                        v-if="isOptionAvailable(s)"
                        :key="i"
                        :id="s.id"
                        :label="s.label"
                        context="product"
                        :code="option.attribute_code"
                        class="mr10 mb10"
                        :class="{ active: s.id == configuration[option.attribute_code].id }"
                        v-focus-clean
                      />
                    </div>
                    <div :class="option.attribute_code" v-else>
                      <generic-selector
                        v-for="(s, i) in options[option.attribute_code]"
                        v-if="isOptionAvailable(s)"
                        :key="i"
                        :id="s.id"
                        :label="s.label"
                        context="product"
                        :code="option.attribute_code"
                        class="mr10 mb10"
                        :class="{ active: s.id == configuration[option.attribute_code].id }"
                        v-focus-clean
                      />
                    </div>
                    <span
                      v-if="option.label == 'Size'"
                      @click="openSizeGuide"
                      class="
                        p0 ml30 inline-flex middle-xs no-underline h5
                        action size-guide pointer cl-secondary
                      "
                    >
                      <i class="pr5 material-icons">accessibility</i>
                      <span>
                        {{ $t('Size guide') }}
                      </span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <product-links
              v-if="product.type_id =='grouped' && !loading"
              :products="product.product_links"
            />
            <product-bundle-options
              v-if="product.bundle_options && product.bundle_options.length > 0 && !loading"
              :product="product"
            />
            <product-custom-options
              v-else-if="product.custom_options && product.custom_options.length > 0 && !loading"
              :product="product"
            />
            <div class="row m0 mb35" v-if="product.type_id !== 'grouped' && product.type_id !== 'bundle'">
              <base-input-number
                :name="$t('Quantity')"
                v-model="product.qty"
                :min="1"
                @blur="$v.$touch()"
                :validations="[
                  {
                    condition: $v.product.qty.$error && !$v.product.qty.minValue,
                    text: $t('Quantity must be above 0')
                  }
                ]"
              />
            </div>
            <div class="row m0">
              <add-to-cart
                :product="product"
                :disabled="$v.product.qty.$error && !$v.product.qty.minValue"
                class="col-xs-12 col-sm-4 col-md-6"
              />
            </div>
            <div class="row py40 add-to-buttons">
              <div class="col-xs-6 col-sm-3 col-md-6">
                <wishlist-button :product="product" />
              </div>
              <div class="col-xs-6 col-sm-3 col-md-6 product__add-to-compare">
                <button
                  @click="isOnCompare ? removeFromList('compare') : addToList('compare')"
                  class="
                    p0 inline-flex middle-xs bg-cl-transparent brdr-none
                    action h5 pointer cl-secondary
                  "
                  type="button"
                  data-testid="addToCompare"
                >
                  <i class="pr5 material-icons">compare</i>
                  <template v-if="!isOnCompare">
                    {{ $t('Add to compare') }}
                  </template>
                  <template v-else>
                    {{ $t('Remove from compare') }}
                  </template>
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </section>
    <section class="container px15 pt50 pb35 cl-accent details">
      <tabs :options="{ useUrlFragment: false }">
        <tab name="Product Details">
          <div class="row">
            <div class="col-xs-11 col-sm-9 col-md-10">
              <div class="row">
                <div class="col-sm-10" style="padding: 0">
                  <h3 class="m0">
                    Description
                  </h3>
                  <p>{{ product.description }}</p>
                </div>
                <div class="col-sm-2" v-if="isCCStore" style="padding: 0">
                  <div class="row store-brand">
                    <div class="col mt5">
                      <div>
                        <img
                          width="50px"
                          height="50px"
                          :src="product.brand_logo"
                          alt="Vuestore logo"
                        >
                      </div>
                      <div class="align-center">
                        <h4 class="m0">
                          {{ product.brand_name }}
                        </h4>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="row">
                <h3>Size Chart</h3>
              </div>
              <div class="row mb10">
                <size-chart-view class="align-center" :product="product" />
              </div>
            </div>
          </div>
        </tab>
        <!--<tab name="Delivery Policy">-->
        <!--  <div class="row">-->
        <!--    <div class="col-xs-11 col-sm-9 col-md-10">-->
        <!--      <div class="row">-->

        <!--<base-input-->
        <!--  class="col-xs-6 col-sm-2 mb25"-->
        <!--  type="number"-->
        <!--  name="product_quantity"-->
        <!--  :placeholder="$t('Qty')"-->
        <!--  v-model="product_quantity"-->
        <!--  @input="updateShippingCost();"-->
        <!--/>-->

        <!--<base-select-->
        <!--  class="col-xs-6 col-sm-2 mb25"-->
        <!--  name="countries"-->
        <!--  :options="countryOptions"-->
        <!--  :selected="selected_country"-->
        <!--  :placeholder="$t('Country')"-->
        <!--  v-model="selected_country"-->
        <!--  @input="updateShippingCost();"-->
        <!--/>-->
        <!--      </div>-->
        <!--    </div>-->
        <!--  </div>-->
        <!--  <table class="table table-bordered">-->
        <!--    <thead>-->
        <!--      <tr>-->
        <!--<th scope="col">Courier Info</th>-->
        <!--<th scope="col">Shipping Cost</th>-->
        <!--<th scope="col">Estimate Delivery Time</th>-->
        <!--<th scope="col">Tracking Information</th>-->
        <!--      </tr>-->
        <!--    </thead>-->
        <!--    <tbody>-->
        <!--      <tr>-->
        <!--<td>{{ selected_delivery_policy.name }} <br>{{ selected_delivery_policy.telephone }} <br>{{ selected_delivery_policy.email }} <br>{{ selected_delivery_policy.website }}</td>-->
        <!--<td><span class="shipping_cost del">{{ selected_delivery_policy.currencySymbol }} {{ selected_delivery_policy.higherShippingCost }}</span> <span class="shipping_cost new">{{ selected_delivery_policy.currencySymbol }} {{ selected_delivery_policy.shippingCost }}</span> + COD: {{ selected_delivery_policy.currencySymbol }} {{ selected_delivery_policy.cashOnDeliveryFee }} <br> You save: <span class="shipping_cost new">{{ selected_delivery_policy.currencySymbol }} {{ selected_delivery_policy.shippingCostDifference }} (about - 30%)</span></td>-->
        <!--<td>{{ selected_delivery_policy.min_delivery_days }}-{{ selected_delivery_policy.max_delivery_days }} days</td>-->
        <!--<td>{{ selected_delivery_policy.api_status }}</td>-->
        <!--      </tr>-->
        <!--    </tbody>-->
        <!--  </table>-->
        <!--</tab>-->
      </tabs>

      <!--      <h2 class="h3 m0 mb10 serif lh20 details-title">-->
      <!--        {{ $t('Product details') }}-->
      <!--      </h2>-->
      <!--      <div-->
      <!--        class="h4 details-wrapper"-->
      <!--        :class="{'details-wrapper&#45;&#45;open': detailsOpen}"-->
      <!--      >-->
      <!--        <div class="row between-md m0">-->
      <!--          <div class="col-xs-12 col-sm-6">-->
      <!--            <div-->
      <!--              class="lh30 h5"-->
      <!--              itemprop="description"-->
      <!--              v-html="product.description"-->
      <!--            />-->
      <!--          </div>-->
      <!--          <div class="col-xs-12 col-sm-5">-->
      <!--            <ul class="attributes p0 pt5 m0">-->
      <!--              <product-attribute-->
      <!--                :key="attr.attribute_code"-->
      <!--                v-for="attr in customAttributes"-->
      <!--                :product="product"-->
      <!--                :attribute="attr"-->
      <!--                empty-placeholder="N/A"-->
      <!--              />-->
      <!--            </ul>-->
      <!--          </div>-->
      <!--          <div-->
      <!--            class="details-overlay"-->
      <!--            @click="showDetails"-->
      <!--          />-->
      <!--        </div>-->
      <!--      </div>-->
    </section>
    <reviews :product-id="originalProduct.id" v-show="OnlineOnly" />
    <related-products
      type="upsell"
      :heading="$t('Other products you might like')"
    />
  <!--    <promoted-offers single-banner />-->
  <!--    <related-products type="related" />-->
  </div>
</template>

<script>
import { minValue } from 'vuelidate/lib/validators'
import { mapGetters } from 'vuex'
import Product from '@vue-storefront/core/pages/Product'
import VueOfflineMixin from 'vue-offline/mixin'
import RelatedProducts from 'theme/components/core/blocks/Product/Related.vue'
import SizeChartView from 'theme/components/core/blocks/Product/SizeChartView.vue'
import Reviews from 'theme/components/core/blocks/Reviews/Reviews.vue'
import AddToCart from 'theme/components/core/AddToCart.vue'
import GenericSelector from 'theme/components/core/GenericSelector'
import ColorSelector from 'theme/components/core/ColorSelector.vue'
import SizeSelector from 'theme/components/core/SizeSelector.vue'
import Breadcrumbs from 'theme/components/core/Breadcrumbs.vue'
import ProductAttribute from 'theme/components/core/ProductAttribute.vue'
import ProductTile from 'theme/components/core/ProductTile.vue'
import ProductLinks from 'theme/components/core/ProductLinks.vue'
import ProductCustomOptions from 'theme/components/core/ProductCustomOptions.vue'
import ProductBundleOptions from 'theme/components/core/ProductBundleOptions.vue'
import ProductGallery from 'theme/components/core/ProductGallery'
import PromotedOffers from 'theme/components/theme/blocks/PromotedOffers/PromotedOffers'
import focusClean from 'theme/components/theme/directives/focusClean'
import WebShare from '@vue-storefront/core/modules/social-share/components/WebShare'
import {Tabs, Tab} from 'vue-tabs-component'
import BaseSelect from 'theme/components/core/blocks/Form/BaseSelect'
import BaseInput from 'theme/components/core/blocks/Form/BaseInput'
import BaseInputNumber from 'theme/components/core/blocks/Form/BaseInputNumber'
import SizeGuide from 'theme/components/core/blocks/Product/SizeGuide'
import StoreCategories from 'theme/components/theme/blocks/StoreCategories/StoreCategories'
import _ from 'lodash'
import currencyInfo from '../assets/js/currency_info.js'

export default {
  components: {
    'WishlistButton': () => import(/* webpackChunkName: "wishlist" */'theme/components/core/blocks/Wishlist/AddToWishlist'),
    AddToCart,
    Breadcrumbs,
    ColorSelector,
    GenericSelector,
    ProductAttribute,
    ProductBundleOptions,
    ProductCustomOptions,
    ProductGallery,
    ProductLinks,
    ProductTile,
    PromotedOffers,
    StoreCategories,
    SizeChartView,
    RelatedProducts,
    Reviews,
    SizeSelector,
    WebShare,
    Tabs,
    Tab,
    BaseSelect,
    BaseInput,
    BaseInputNumber
  },
  mixins: [Product, VueOfflineMixin],
  data () {
    return {
      detailsOpen: false,
      delivery_policy: {},
      countries: [],
      courier: {},
      selected_delivery_policy: {},
      selected_country: 'BG',
      product_quantity: 1,
      isCCStore: false
    }
  },
  directives: { focusClean },
  mounted () {
    this.isCCStore = this.currentImage.is_cc_store
  },
  beforeUpdate () {
    console.log('cc Store', this.currentImage)
  },
  computed: {
    countryOptions () {
      return this.countries.map((item) => {
        return {
          value: item,
          label: item
        }
      })
    },
    structuredData () {
      return {
        availability: (this.product.stock.is_in_stock) ? 'InStock' : 'OutOfStock'
      }
    },
    ...mapGetters({
      storeLogo: 'procc/getStoreLogo',
      currentImage: 'procc/getHeadImage'
    })
  },
  methods: {
    showDetails (event) {
      this.detailsOpen = true
      event.target.classList.add('hidden')
    },
    notifyOutStock () {
      this.$store.dispatch('notification/spawnNotification', {
        type: 'error',
        message: this.$t('The product is out of stock and cannot be added to the cart!'),
        action1: { label: this.$t('OK') }
      })
    },
    notifyWrongAttributes () {
      this.$store.dispatch('notification/spawnNotification', {
        type: 'warning',
        message: this.$t('No such configuration for the product. Please do choose another combination of attributes.'),
        action1: { label: this.$t('OK') }
      })
    },
    getDeliveryPolicy () {
      this.ProCcAPI.getProductDeliveryPolicy().then((resp) => {
        this.delivery_policy = resp.data.delivery_policy
        this.countries = resp.data.delivery_policy.countries
        this.updateShippingCost()
      })
    },
    updateShippingCost () {
      let couriers = this.delivery_policy.courier
      let country = this.selected_country
      let quantity = parseInt(this.product_quantity)
      let courierPolicy = _.get(_.filter(couriers, (x, y) => y === country), '0')
      let currencySymbol = currencyInfo[courierPolicy.currency].symbol
      let weight = (typeof parseFloat(_.get(this.product, 'weight')) !== 'undefined') ? parseFloat((_.get(this.product, 'weight') * quantity)) : parseFloat(0.8 * quantity)
      let pricePerKg = (weight < 1) ? parseFloat(courierPolicy.price_first_kg) : parseFloat(parseInt(courierPolicy.price_first_kg) + ((weight - 1) * parseInt(courierPolicy.price_each_next_kg)))
      let shippingCost = (pricePerKg * (1 + parseFloat(courierPolicy.insurance))).toPrecision(3)
      let higherShippingCost = (parseFloat(shippingCost) / 0.7).toPrecision(3)
      let shippingCostDifference = (parseFloat(higherShippingCost) - parseFloat(shippingCost)).toPrecision(3)
      let productPrice = parseFloat(parseFloat(_.get(this.product, 'priceInclTax') * quantity))
      let codFee = parseFloat(productPrice * parseFloat(courierPolicy.cash_on_delivery_fee)).toPrecision(3)
      let cashOnDeliveryFee = (codFee < parseFloat(courierPolicy.cash_on_delivery_minimum)) ? parseFloat(courierPolicy.cash_on_delivery_minimum) : codFee
      this.selected_delivery_policy = {...courierPolicy, currencySymbol, shippingCost, cashOnDeliveryFee, higherShippingCost, shippingCostDifference}
    },
    openSizeGuide () {
      this.$bus.$emit('modal-show', 'modal-sizeguide')
    }
  },
  validations: {
    product: {
      qty: {
        minValue: minValue(1)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import '~theme/css/variables/colors';
@import '~theme/css/helpers/functions/color';
$color-primary: color(primary);
$color-tertiary: color(tertiary);
$color-secondary: color(secondary);
$color-white: color(white);
$bg-secondary: color(secondary, $colors-background);

.product {
  &__add-to-compare {
    display: none;
    @media (min-width: 767px) {
      display: block;
    }
  }
}

.breadcrumbs {
  @media (max-width: 767px) {
    margin: 15px 0;
    padding: 15px 0 0 15px;
  }
}

.error {
  color: red;
  font-weight: bold;
  padding-bottom: 15px;
}
.data {
  @media (max-width: 767px) {
    border-bottom: 1px solid $bg-secondary;
  }
}

.image {
  @media (max-width: 1023px) {
    margin-bottom: 20px;
  }
}

.product-name {
  @media (max-width: 767px) {
    font-size: 36px;
  }
}

.price {
  @media (max-width: 767px) {
    color: $color-primary;
  }
}

.variants-label {
  @media (max-width: 767px) {
    font-size: 14px;
  }
}

.variants-wrapper {
  @media (max-width: 767px) {
    padding-bottom: 30px;
  }

 .sizes {
    @media (max-width: 767px) {
      width: 100%;
    }
  }

  .size-guide {
    height: 40px;
    @media (max-width: 767px) {
      width: 100%;
      margin-left: 0;
    }
  }
}

.product-top-section {
  @media (max-width: 767px) {
    padding: 0;
    background-color: $color-white;
  }
}

.add-to-buttons {
  @media (max-width: 767px) {
    padding-top: 30px;
    margin-bottom: 40px;
  }
}

.details {
  @media (max-width: 767px) {
    padding: 50px 15px 15px;
  }
}

.details-title {
  padding: 0 8px;

  @media (max-width: 767px) {
    font-size: 18px;
    margin: 0;
  }
}

.details-wrapper {
  @media (max-width: 767px) {
    position: relative;
    max-height: 140px;
    overflow: hidden;
    transition: all 0.3s ease;
    font-size: 14px;
  }

  &--open {
    max-height: none;
  }
}

.details-overlay {
  @media (max-width: 767px) {
    position: absolute;
    height: 75%;
    bottom: 0;
    left: 0;
    width: 100%;
    margin: 0;
    cursor: pointer;
    background: linear-gradient(rgba($color-white, 0), rgba($color-white, 1));
    &.hidden {
      display: none;
    }
  }
}

.price-original {
  text-decoration: line-through;
}

.action {
  &:hover {
    color: $color-tertiary;
  }
}

.attributes {
  list-style-type: none;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter,
.fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
  opacity: 0;
}

.product-image {
  mix-blend-mode: multiply;
  width: 460px;
}

.qty-input {
  border-style: solid;
  border-width: 0 0 1px 0;
  width: 90px;
}

.qty-label {
  margin-bottom: 12px;
  cursor: pointer;
  font-size: 14px;
}

.web-share {
  float: right;
}
</style>

<style>

  .shipping_cost.del{
    color: #666;
    min-width: 68px;
    display: inline-block;
    text-decoration: line-through;
  }
  .shipping_cost.new{
    color: #f60;
  }

  .sku-pt{
    margin-top: 40%;
  }

  .tabs-component {
    margin-top: 2em;
  }

  .tabs-component-tabs {
    border: solid 1px #ddd;
    border-radius: 6px;
    margin-bottom: 5px;
  }

  @media (min-width: 700px) {
    .tabs-component-tabs {
      border: 0;
      align-items: stretch;
      display: flex;
      justify-content: flex-start;
      margin-bottom: -1px;
    }
  }

  .tabs-component-tab {
    color: #999;
    font-size: 14px;
    font-weight: 600;
    margin-right: 0;
    list-style: none;
  }

  .tabs-component-tab:not(:last-child) {
    border-bottom: dotted 1px #ddd;
  }

  .tabs-component-tab:hover {
    color: #666;
  }

  .tabs-component-tab.is-active {
    color: #000;
  }

  .tabs-component-tab.is-disabled * {
    color: #cdcdcd;
    cursor: not-allowed !important;
  }

  @media (min-width: 700px) {
    .tabs-component-tab {
      background-color: #fff;
      border: solid 1px #ddd;
      border-radius: 3px 3px 0 0;
      margin-right: .5em;
      transform: translateY(2px);
      transition: transform .3s ease;
    }

    .tabs-component-tab.is-active {
      border-bottom: solid 1px #fff;
      z-index: 2;
      transform: translateY(0);
    }
  }

  .tabs-component-tab-a {
    align-items: center;
    color: inherit;
    display: flex;
    padding: .75em 1em;
    text-decoration: none;
  }

  .tabs-component-panels {
    padding: 4em 0;
  }

  @media (min-width: 700px) {
    .tabs-component-panels {
      border-top-left-radius: 0;
      background-color: #fff;
      border: solid 1px #ddd;
      border-radius: 0 6px 6px 6px;
      box-shadow: 0 0 10px rgba(0, 0, 0, .05);
      padding: 4em 2em;
    }
  }
.card {
  margin: auto;
  mix-blend-mode: darken;
  padding: 15px 15px 0;
  background-color: #17151500;
  border-bottom: none !important;
  top: 0px;
  right: 16px;
  font-size: 18px;
  height: -webkit-fill-available;
  width: inherit;
  overflow: hidden;
}
.card-header > img {
  border-radius: 20%;
}
</style>