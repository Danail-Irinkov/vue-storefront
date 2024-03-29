<template>
  <div id="product" itemscope itemtype="http://schema.org/Product">
    <section class="bg-cl-secondary px20 product-top-section">
      <div class="container">
        <section class="row m0 between-xs">
          <div class="col-xs-12 col-md-6 center-xs middle-xs image">
            <product-gallery
              :offline="getOfflineImage"
              :gallery="getProductGallery"
              :configuration="getCurrentProductConfiguration"
              :product="getCurrentProduct"
            />
          </div>
          <div class="col-xs-12 col-md-5 data">
            <breadcrumbs
              class="pt40 pb20 hidden-xs"
            />
            <h4
              class="mb20 mt0 cl-mine-shaft product-name"
              data-testid="productName"
              itemprop="name"
            >
              {{ getCurrentProduct.name | htmlDecode }}
              <web-share
                :title="getCurrentProduct.name | htmlDecode"
                text="Check this product!"
                class="web-share"
              />
            </h4>
            <div
              class="mb20 uppercase cl-secondary"
              itemprop="sku"
              style="font-size: 15px;"
              :content="getCurrentProduct.sku"
            >
              {{ $t('SKU: {sku}', { sku: getCurrentProduct.sku.replace('-default', '').replace('-Default', '') }) }}
            </div>
            <div itemprop="offers" itemscope itemtype="http://schema.org/Offer">
              <meta itemprop="priceCurrency" :content="$store.state.storeView.i18n.currencyCode">
              <meta itemprop="price" :content="parseFloat(getCurrentProduct.price_incl_tax).toFixed(2)">
              <meta itemprop="availability" :content="structuredData.availability">
              <meta itemprop="url" :content="getCurrentProduct.url_path">
              <div class="mb30 price serif" v-if="getCurrentProduct.type_id !== 'grouped'">
                <div
                  class="h3 cl-secondary"
                  v-if="getCurrentProduct.special_price && getCurrentProduct.price_incl_tax && getCurrentProduct.original_price_incl_tax"
                >
                  <span
                    class="price-original h2"
                  >{{ getCurrentProduct.original_price_incl_tax * getCurrentProduct.qty | price }}</span>
                  <span
                    class="h2 cl-mine-shaft weight-700 discount"
                  >{{ getCurrentProduct.price_incl_tax * getCurrentProduct.qty | price }}</span>&nbsp;
                </div>
                <span
                  class="h2 cl-mine-shaft weight-700"
                  v-if="!getCurrentProduct.special_price && getCurrentProduct.price_incl_tax"
                >
                  {{ getCurrentProduct.qty > 0 ? getCurrentProduct.price_incl_tax * getCurrentProduct.qty : getCurrentProduct.price_incl_tax | price }}
                </span>
              </div>
              <div class="cl-primary variants" v-if="getCurrentProduct.type_id === 'configurable' && !isDefaultProductSize">
                <div
                  class="error"
                  v-if="getCurrentProduct.errors && Object.keys(getCurrentProduct.errors).length > 0"
                >
                  {{ getCurrentProduct.errors | formatProductMessages }}
                </div>
                <div class="h5" v-for="option in getProductOptions" :key="option.id">
                  <div class="variants-label" data-testid="variantsLabel" v-if="(option.label == 'Size' && !isDefaultProductSize) || option.label !== 'Size'">
                    {{ option.label }}
                    <span
                      class="weight-700"
                    >{{ getOptionLabel(option) }}</span>
                  </div>
                  <div class="row top-xs m0 pt15 pb40 variants-wrapper">
                    <div v-if="option.label == 'Color'">
                      <color-selector
                        v-for="filter in getAvailableFilters[option.attribute_code]"
                        :key="filter.id"
                        :variant="filter"
                        :selected-filters="getSelectedFilters"
                        @change="changeFilter"
                      />
                    </div>
                    <div class="sizes" v-else-if="option.label == 'Size'" v-show="!isDefaultProductSize">
                      <size-selector
                        class="mr10 mb10"
                        v-for="filter in getAvailableFilters[option.attribute_code]"
                        :key="filter.id"
                        ref="sizes"
                        :variant="filter"
                        :selected-filters="getSelectedFilters"
                        @change="changeFilter"
                      />
                    </div>
                    <div :class="option.attribute_code" v-else>
                      <generic-selector
                        class="mr10 mb10"
                        v-for="filter in getAvailableFilters[option.attribute_code]"
                        :key="filter.id"
                        :variant="filter"
                        :selected-filters="getSelectedFilters"
                        @change="changeFilter"
                      />
                    </div>
                    <span
                      v-if="option.label == 'Size' && !isDefaultProductSize"
                      @click="openSizeGuide"
                      class="p0 ml30 inline-flex middle-xs no-underline h5 action size-guide pointer cl-secondary"
                    >
                      <i class="pr5 material-icons">accessibility</i>
                      <span>{{ $t('Size guide') }}</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <product-links
              v-if="getCurrentProduct.type_id =='grouped'"
              :products="getCurrentProduct.product_links"
            />
            <product-bundle-options
              v-if="getCurrentProduct.bundle_options && getCurrentProduct.bundle_options.length > 0"
              :product="getCurrentProduct"
            />
            <product-custom-options
              v-else-if="getCurrentProduct.custom_options && getCurrentProduct.custom_options.length > 0"
              :product="getCurrentProduct"
            />
            <product-quantity
              class="row m0 mb35"
              v-if="getCurrentProduct.type_id !== 'grouped' && getCurrentProduct.type_id !== 'bundle'"
              v-model="ProCCCurrentProductVariant.qty"
              :max-quantity="maxQuantity"
              :loading="isStockInfoLoading"
              :is_selector="true"
              :is-simple-or-configurable="isSimpleOrConfigurable"
              :show-quantity="size_has_been_selected"
              @error="handleQuantityError"
            />
            <div class="row m0">
              <!--              // Edited by dan to fix issue with product variants SKUs-->
              <add-to-cart
                :product="ProCCCurrentProductVariant"
                :disabled="isAddToCartDisabled"
                class="col-xs-12 col-sm-4 col-md-6"
              />
            </div>
            <div class="row py40 add-to-buttons">
              <div class="col-xs-6 col-sm-3 col-md-6">
                <AddToWishlist :product="getCurrentProduct" />
              </div>
              <div class="col-xs-6 col-sm-3 col-md-6">
                <AddToCompare :product="getCurrentProduct" />
              </div>
            </div>
          </div>
        </section>
      </div>
    </section>
    <section class="container px15 pb35 cl-accent details">
      <tabs :options="{ useUrlFragment: false }">
        <tab :name="$t('Product Details')">
          <div class="row">
            <div class="col-12">
              <div class="row">
                <div class="col-sm-10" style="padding: 0">
                  <h3 class="m0">
                    {{ $t('Description') }}
                  </h3>
                  <p>{{ getCurrentProduct.description }}</p>
                </div>
                <div class="col-sm-2" v-if="isCCStore" style="padding: 0">
                  <div class="row store-brand">
                    <div class="col mt5">
                      <div>
                        <img
                          width="50px"
                          height="50px"
                          :src="getCurrentProduct.brand_logo"
                          alt="Brand logo"
                        >
                      </div>
                      <div class="align-center">
                        <h4 class="m0">
                          {{ getCurrentProduct.brand_name }}
                        </h4>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="row" v-if="!isDefaultProductSize">
                <h3>{{ $t('Size Chart') }}</h3>
              </div>
              <div class="row mb10" v-if="!isDefaultProductSize">
                <size-chart-view class="align-center" :product="getCurrentProduct" />
              </div>
            </div>
          </div>
        </tab>
        <!--        <tab name="Delivery">-->
        <!--          Third tab content-->
        <!--        </tab>-->
      </tabs>
    </section>
    <!--    <section class="container px15 pt50 pb35 cl-accent details">-->
    <!--      <h2 class="h3 m0 mb10 serif lh20 details-title">-->
    <!--        {{ $t('Product details') }}-->
    <!--      </h2>-->
    <!--      <div class="h4 details-wrapper" :class="{'details-wrapper&#45;&#45;open': detailsOpen}"      >-->
    <!--        <div class="row between-md m0">-->
    <!--          <div class="col-xs-12 col-sm-6">-->
    <!--            <div class="lh30 h5" itemprop="description" v-html="getCurrentProduct.description"            />-->
    <!--          </div>-->
    <!--          <div class="col-xs-12 col-sm-5">-->
    <!--            <ul class="attributes p0 pt5 m0">-->
    <!--              <product-attribute-->
    <!--                :key="attr.attribute_code"-->
    <!--                v-for="attr in getCustomAttributes"-->
    <!--                :product="getCurrentProduct"-->
    <!--                :attribute="attr"-->
    <!--                empty-placeholder="N/A"-->
    <!--              />-->
    <!--            </ul>-->
    <!--          </div>-->
    <!--          <div class="details-overlay" @click="showDetails"          />-->
    <!--        </div>-->
    <!--      </div>-->
    <!--    </section>-->
    <lazy-hydrate when-idle>
      <reviews
        :product-name="getOriginalProduct.name"
        :product-id="getOriginalProduct.id"
        v-show="isOnline"
      />
    </lazy-hydrate>
    <lazy-hydrate when-idle>
      <related-products type="upsell" :heading="$t('We found other products you might like')" />
    </lazy-hydrate>
    <!--    <lazy-hydrate when-idle>-->
    <!--      <promoted-offers single-banner />-->
    <!--    </lazy-hydrate>-->
    <lazy-hydrate when-idle>
      <related-products type="related" />
    </lazy-hydrate>
    <SizeGuide />
  </div>
</template>

<script>
// import i18n from '@vue-storefront/i18n'
// import Product from '@vue-storefront/core/pages/Product'
// import VueOfflineMixin from 'vue-offline/mixin'
import config from 'config'
import RelatedProducts from 'theme/components/core/blocks/Product/Related.vue'
import Reviews from 'theme/components/core/blocks/Reviews/Reviews.vue'
import AddToCart from 'theme/components/core/AddToCart.vue'
import GenericSelector from 'theme/components/core/GenericSelector'
import ColorSelector from 'theme/components/core/ColorSelector.vue'
import SizeSelector from 'theme/components/core/SizeSelector.vue'
import Breadcrumbs from 'theme/components/core/Breadcrumbs.vue'
// import ProductAttribute from 'theme/components/core/ProductAttribute.vue'
import ProductQuantity from 'theme/components/core/ProductQuantity.vue'
import ProductLinks from 'theme/components/core/ProductLinks.vue'
import ProductCustomOptions from 'theme/components/core/ProductCustomOptions.vue'
import ProductBundleOptions from 'theme/components/core/ProductBundleOptions.vue'
import ProductGallery from 'theme/components/core/ProductGallery'
// import Spinner from 'theme/components/core/Spinner'
// import PromotedOffers from 'theme/components/theme/blocks/PromotedOffers/PromotedOffers'
import focusClean from 'theme/components/theme/directives/focusClean'
import WebShare from 'theme/components/theme/WebShare'
// import BaseInputNumber from 'theme/components/core/blocks/Form/BaseInputNumber'
import SizeGuide from 'theme/components/core/blocks/Product/SizeGuide'
import AddToWishlist from 'theme/components/core/blocks/Wishlist/AddToWishlist'
import AddToCompare from 'theme/components/core/blocks/Compare/AddToCompare'
import { mapGetters } from 'vuex'
import LazyHydrate from 'vue-lazy-hydration'
import { ProductOption } from '@vue-storefront/core/modules/catalog/components/ProductOption.ts'
import { getAvailableFiltersByProduct, getSelectedFiltersByProduct } from '@vue-storefront/core/modules/catalog/helpers/filters'
import { isOptionAvailableAsync } from '@vue-storefront/core/modules/catalog/helpers/index'
import { localizedRoute, currentStoreView } from '@vue-storefront/core/lib/multistore'
import { htmlDecode } from '@vue-storefront/core/filters'
import { ReviewModule } from '@vue-storefront/core/modules/review'
import { RecentlyViewedModule } from '@vue-storefront/core/modules/recently-viewed'
import { registerModule, isModuleRegistered } from '@vue-storefront/core/lib/modules'
import { onlineHelper, isServer } from '@vue-storefront/core/helpers'
import { catalogHooksExecutors } from '@vue-storefront/core/modules/catalog-next/hooks'

// ProCC Imports
// import StoreBanners from 'theme/components/procc/StoreBanners/StoreBanners'
import _ from 'lodash'
import currencyInfo from '../assets/js/currency_info.js'
import {Tab, Tabs} from 'vue-tabs-component'
// import BaseSelect from 'theme/components/core/blocks/Form/BaseSelect'
// import BaseInput from 'theme/components/core/blocks/Form/BaseInput'
// import ProductTile from 'theme/components/core/ProductTile.vue'
import SizeChartView from 'theme/components/procc/Product/SizeChartView.vue'
import {minValue} from 'vuelidate/lib/validators'
// import EventBus from '@vue-storefront/core/compatibility/plugins/event-bus'
import isObject from 'lodash-es/isObject'

export default {
  components: {
    AddToCart,
    AddToCompare,
    AddToWishlist,
    Breadcrumbs,
    ColorSelector,
    GenericSelector,
    // ProductAttribute,
    ProductBundleOptions,
    ProductCustomOptions,
    ProductGallery,
    ProductLinks,
    // PromotedOffers,
    RelatedProducts,
    Reviews,
    // ProCC IMPORTS
    Tabs,
    Tab,
    // BaseSelect,
    // ProductTile,
    // BaseInput,
    // StoreBanners,
    SizeChartView,
    // BaseInputNumber,
    SizeSelector,
    WebShare,
    SizeGuide,
    LazyHydrate,
    ProductQuantity
  },
  mixins: [ProductOption],
  directives: { focusClean },
  beforeCreate () {
    registerModule(ReviewModule)
    registerModule(RecentlyViewedModule)
  },
  data () {
    return {
      size_has_been_selected: false, // Added by Dan
      detailsOpen: false,
      maxQuantity: 0,
      quantityError: false,
      isStockInfoLoading: false,
      hasAttributesLoaded: false,
      delivery_policy: {},
      countries: [],
      courier: {},
      selected_delivery_policy: {},
      selected_country: 'Bulgaria',
      product_quantity: 1,
      ProCCCurrentProductVariant: {qty: 1},
      isCCStore: false
    }
  },
  beforeUpdate () {

  },
  computed: {
    ...mapGetters({
      storeLogo: 'procc/getStoreLogo',
      currentImage: 'procc/getHeadImage',
      getCurrentCategory: 'category-next/getCurrentCategory',
      getCurrentProduct: 'product/getCurrentProduct',
      getProductGallery: 'product/getProductGallery',
      getCurrentProductConfiguration: 'product/getCurrentProductConfiguration',
      getOriginalProduct: 'product/getOriginalProduct',
      attributesByCode: 'attribute/attributeListByCode',
      getProductAvailableQuantity: 'product/getProductAvailableQuantity'
    }),
    getOptionLabel () {
      return (option) => {
        // console.log('this.ProCCCurrentProductVariant.size_label', this.ProCCCurrentProductVariant.size_label)
        return this.ProCCCurrentProductVariant.size_label // Added By Dan To dynamically change the selected Size
        // const configName = option.attribute_code ? option.attribute_code : option.label.toLowerCase()
        // return this.getCurrentProductConfiguration[configName] ? this.getCurrentProductConfiguration[configName].label : configName
      }
    },
    isOnline (value) {
      return onlineHelper.isOnline
    },
    structuredData () {
      return {
        availability: this.getCurrentProduct.stock && this.getCurrentProduct.stock.is_in_stock ? 'InStock' : 'OutOfStock'
      }
    },
    getProductOptions () {
      if (
        this.getCurrentProduct.errors &&
        Object.keys(this.getCurrentProduct.errors).length &&
        Object.keys(this.getCurrentProductConfiguration).length
      ) {
        return []
      }
      return this.getCurrentProduct.configurable_options
    },
    getOfflineImage () {
      return {
        src: this.getThumbnail(this.getCurrentProduct.image, config.products.thumbnails.width, config.products.thumbnails.height),
        error: this.getThumbnail(this.getCurrentProduct.image, config.products.thumbnails.width, config.products.thumbnails.height),
        loading: this.getThumbnail(this.getCurrentProduct.image, config.products.thumbnails.width, config.products.thumbnails.height)
      }
    },
    getCustomAttributes () {
      return Object.values(this.attributesByCode).filter(a => {
        return a.is_visible && a.is_user_defined && (parseInt(a.is_visible_on_front) || a.is_visible_on_front === true) && this.getCurrentProduct[a.attribute_code]
      }).sort((a, b) => { return a.attribute_id > b.attribute_id })
    },
    getAvailableFilters () {
      return getAvailableFiltersByProduct(this.getCurrentProduct)
    },
    getSelectedFilters () {
      // console.log('this.getCurrentProduct', this.getCurrentProduct)
      // console.log('this.getCurrentProductConfiguration', this.getCurrentProductConfiguration)
      return getSelectedFiltersByProduct(this.getCurrentProduct, this.getCurrentProductConfiguration)
    },
    isDefaultProductSize () { // check if the size option is default
      // console.log('isDefaultProductSize product', this.getCurrentProduct)
      const available_filters = getAvailableFiltersByProduct(this.getCurrentProduct)
      return !!((available_filters.size && available_filters.size.length === 1 && available_filters.size[0].label.toLowerCase() === 'default'))
    },
    isSimpleOrConfigurable () {
      return ['simple', 'configurable'].includes(this.getCurrentProduct.type_id)
    },
    isAddToCartDisabled () {
      return this.quantityError ||
        this.isStockInfoLoading ||
        (this.isOnline && !this.maxQuantity && this.isSimpleOrConfigurable)
    }
  },
  async mounted () {
    await this.$store.dispatch('recently-viewed/addItem', this.getCurrentProduct)
    this.isCCStore = this.currentImage.is_cc_store
    let selected_filters = this.getSelectedFilters

    if (selected_filters.size.id) { // Added By dan, because missing size label
      this.changeFilter(selected_filters.size)
    }
  },
  async asyncData ({ store, route }) {
    // console.log('product/loadProduct asyncData Product.vue')
    const product = await store.dispatch('product/loadProduct', { parentSku: route.params.parentSku, childSku: route && route.params && route.params.childSku ? route.params.childSku : null })
    const loadBreadcrumbsPromise = store.dispatch('product/loadProductBreadcrumbs', { product })
    if (isServer) await loadBreadcrumbsPromise
    catalogHooksExecutors.productPageVisited(product)
  },
  beforeRouteEnter (to, from, next) {
    if (isServer) {
      next()
    } else {
      next((vm) => {
        vm.getQuantity()
      })
    }
  },
  watch: {
    isOnline: {
      handler (isOnline) {
        if (isOnline) {
          this.getQuantity()
        }
      }
    },
    getCurrentProduct: {
      async handler (product) {
        // console.log('getCurrentProduct Variant set1', product.sku)
        // console.log('getCurrentProduct Variant set2', this.ProCCCurrentProductVariant.sku)
        // console.log('getCurrentProduct Variant set3', this.ProCCCurrentProductVariant.size_label)
        console.log('getCurrentProduct Variant selectedVariant', product)
        if (product.size_label && product.sku !== this.ProCCCurrentProductVariant.sku) { this.ProCCCurrentProductVariant = product }
      },
      immediate: true
    },
    isDefaultProductSize: {
      async handler (value) {
        const available_filters = this.getAvailableFilters
        if (value && value === true && available_filters.size && available_filters.size[0]) {
          this.changeFilter(available_filters.size[0])
        }
      },
      immediate: true
    }
  },
  methods: {
    getDeliveryPolicy () {
      this.ProCcAPI.getProductDeliveryPolicy().then((resp) => {
        this.delivery_policy = resp.data.delivery_policy;
        this.countries = resp.data.delivery_policy.countries;
        this.updateShippingCost()
      })
    },
    updateShippingCost () {
      let couriers = this.delivery_policy.courier;
      let country = this.selected_country;
      let quantity = parseInt(this.getCurrentProduct.qty);
      let courierPolicy = _.get(_.filter(couriers, (x, y) => y === country), '0');
      let currencySymbol = currencyInfo[courierPolicy.currency].symbol;
      let weight = (typeof parseFloat(_.get(this.getCurrentProduct, 'weight')) !== 'undefined') ? parseFloat((_.get(this.getCurrentProduct, 'weight') * quantity)) : parseFloat(0.8 * quantity);
      let pricePerKg = (weight < 1) ? parseFloat(courierPolicy.price_first_kg) : parseFloat(parseInt(courierPolicy.price_first_kg) + ((weight - 1) * parseInt(courierPolicy.price_each_next_kg)));
      let shippingCost = (pricePerKg * (1 + parseFloat(courierPolicy.insurance))).toPrecision(3);
      let higherShippingCost = (parseFloat(shippingCost) / 0.7).toPrecision(3);
      let shippingCostDifference = (parseFloat(higherShippingCost) - parseFloat(shippingCost)).toPrecision(3);
      let productPrice = parseFloat(parseFloat(_.get(this.getCurrentProduct, 'priceInclTax') * quantity));
      let codFee = parseFloat(productPrice * parseFloat(courierPolicy.cash_on_delivery_fee)).toPrecision(3);
      let cashOnDeliveryFee = (codFee < parseFloat(courierPolicy.cash_on_delivery_minimum)) ? parseFloat(courierPolicy.cash_on_delivery_minimum) : codFee;
      this.selected_delivery_policy = {
        ...courierPolicy,
        currencySymbol,
        shippingCost,
        cashOnDeliveryFee,
        higherShippingCost,
        shippingCostDifference
      }
    },
    openSizeGuide () {
      this.$bus.$emit('modal-show', 'modal-sizeguide')
    },
    showDetails (event) {
      this.detailsOpen = true
      event.target.classList.add('hidden')
    },
    notifyOutStock () {
      this.$store.dispatch('notification/spawnNotification', {
        type: 'error',
        message: this.$t(
          'The product is out of stock and cannot be added to Cart!'
        ),
        action1: { label: this.$t('OK') }
      })
    },
    notifyWrongAttributes () {
      this.$store.dispatch('notification/spawnNotification', {
        type: 'warning',
        message: this.$t(
          'No such configuration for the product. Please do choose another combination of attributes.'
        ),
        action1: { label: this.$t('OK') }
      })
    },
    changeFilter (variant) {
      this.$bus.$emit(
        'filter-changed-product',
        Object.assign({ attribute_code: variant.type }, variant)
      )
      this.size_has_been_selected = true // Added by Dan
      // this.getQuantity()
      // this.getQuantity(variant) // Edited by dan to allow for querying the variant of the SKU
      this.checkQuantity(variant) // Edited by shabbir to check quantity
    },
    // Created function for get quantity from  vuex if not found then get from API
    checkQuantity (variant) {
      if (this.getProductAvailableQuantity && this.getProductAvailableQuantity.product_id && this.getProductAvailableQuantity.product_id === this.getCurrentProduct.procc_product_id && this.getProductAvailableQuantity[variant.label]) {
        this.maxQuantity = this.getProductAvailableQuantity[variant.label]
      } else {
        this.getQuantity(variant)
      }
    },
    isOptionAvailable (option) { // check if the option is available
      const currentConfig = Object.assign({}, this.getCurrentProductConfiguration)
      currentConfig[option.type] = option
      return isOptionAvailableAsync(this.$store, { product: this.getCurrentProduct, configuration: currentConfig })
    },
    async getQuantity (variant = null) {
      // Edited By dan 30-12-2019
      let product = {...this.getCurrentProduct}
      // console.log('getQuantity product', product)
      // console.log('stock/check product1', product)
      // console.log('stock/check variant1', variant)
      let selectedVariant = {...product}
      if (variant && variant.label && variant.label !== ' ') {
        if (selectedVariant.sku && selectedVariant.sku.indexOf('-' + variant.label) === -1) {
          selectedVariant.sku = selectedVariant.parentSku + '-' + variant.label // adjusting from parentSKU to size variant sku
        }
        // selectedVariant.qty = 1
        console.log('getQuantity Variant selectedVariant', selectedVariant)
        this.ProCCCurrentProductVariant = selectedVariant

        // EventBus.$emit('product-after-priceupdate', product)
      }
      // Edited By dan 30-12-2019 - END

      if (this.isStockInfoLoading) return // stock info is already loading
      this.isStockInfoLoading = true

      try { // Edited by dan to select first option for configurable products
        if (product && product.configurable_options && product.configurable_options[0] &&
          product.configurable_options[0].values && product.configurable_options[0].values.length > 0 &&
          product.sku === product.parentSku && product.type_id === 'configurable') {
          // console.log('stock/check product2', product)
          // AutoSelect first Option ProCC
          if (this.getProductOptions[0] && this.getProductOptions[0].attribute_code) {
            let variant = this.getAvailableFilters[this.getProductOptions[0].attribute_code][0]
            // console.log('stock/check variant', variant)
            if (variant) {
              // console.log('stock/check variant2', variant)
              this.isStockInfoLoading = false
              return this.changeFilter(variant)
            }
          }
        } else if (variant) {
          const res = await this.$store.dispatch('stock/check', {
            product: product, // Edited by dan
            qty: this.ProCCCurrentProductVariant.qty // Edited by dan
          })
          // added code for get quantity from  vuex
          this.maxQuantity = res.qty[variant.label] || res.qty[variant.label.toLowerCase()]
        }
      } finally {
        this.isStockInfoLoading = false
      }
    },
    handleQuantityError (error) {
      this.quantityError = error
    },
    stringifyTags (tags_obj) {
      if (!isObject(tags_obj)) return String(tags_obj);

      // console.log('stringifyTags tags_obj', tags_obj)
      let tags_string = ''
      for (let key in tags_obj) {
        const tcat = tags_obj[key]
        for (let tag of tcat) {
          if (tags_string) tags_string += ' '
          tags_string += tag
        }
      }
      return tags_string
    }
  },
  metaInfo () {
    // ProCC product Description Meta by Dan
    const storeView = currentStoreView()
    let productDescription = ''
    if (this.getCurrentProduct && this.getCurrentProduct.description) {
      productDescription += this.getCurrentProduct.description
    }
    if (this.getCurrentProduct && this.getCurrentProduct.tags) {
      productDescription += ' ' + this.stringifyTags(this.getCurrentProduct.tags)
    } else {
      console.log('NO PRODUCT TAGS')
    }
    // console.log('productDescription:', productDescription)

    const currentStoreBrand = this.$store.getters['procc/getCurrentStoreBrand']
    let currentBrandName = currentStoreBrand.name
    // console.log('currentBrandName:', currentBrandName)
    return {
      link: [
        { rel: 'amphtml',
          href: this.$router.resolve(localizedRoute({
            name: this.getCurrentProduct.type_id + '-product-amp',
            params: {
              parentSku: this.getCurrentProduct.parentSku ? this.getCurrentProduct.parentSku : this.getCurrentProduct.sku,
              slug: this.getCurrentProduct.slug,
              childSku: this.getCurrentProduct.sku
            }
          }, storeView.storeCode)).href
        }
      ],
      title: htmlDecode(this.getCurrentProduct.meta_title || ((currentBrandName ? currentBrandName + ' - ' : '') + this.getCurrentProduct.name)),
      meta: this.getCurrentProduct.meta_description ? [{ vmid: 'description', name: 'description', content: htmlDecode(this.getCurrentProduct.meta_description) }] : productDescription ? [{ vmid: 'description', name: 'description', content: htmlDecode(productDescription) }] : []
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
    padding: 0px 15px 15px;
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
  /*// TODO: need to properly define the css for the tabs*/
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

  @media (max-width: 700px) {
    .tabs-component-tabs {
      display: none;
    }
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

  @media (max-width: 700px) {
    .tabs-component-panels {
      padding: 0 2em;
    }
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
    background-color: #17151500;
    border: none !important;
    font-size: 18px;
    height: -webkit-fill-available;
    width: 100%;
    overflow: hidden;
  }
.card-header > img {
  border-radius: 20%;
}
</style>
