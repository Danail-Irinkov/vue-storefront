<template>
  <li class="row py10 bg-cl-white" :class="{ 'relative': editMode }">
    <div class="mx10 w-100 py10 mb15 edit-mode flex between-xs middle-xs" v-if="editMode">
      Edit mode
      <button class="brdr-none bg-cl-transparent" @click="closeEditMode">
        <span class="cl-accent">
          <i class="material-icons cl-accent mr5">
            close
          </i>
        </span>
      </button>
    </div>
    <div class="blend">
      <div class="ml10 bg-cl-secondary">
        <product-image :image="image" :calc-ratio="false" />
      </div>
    </div>
    <div class="col-xs pt5 flex pl35 flex-wrap">
      <div class="flex flex-nowrap details">
        <div class="flex w-100 flex-wrap between-xs product-name-and-qty">
          <div>
            <router-link
              class="serif h4"
              style="line-height: 20px;"
              :to="productLink"
              data-testid="productLink"
              @click.native="$store.commit('ui/setMicrocart', false)"
            >
              {{ product.name ? product.name : product.product ? product.product.name : '' | htmlDecode }}
            </router-link>
            <div v-if="product.size" class="h4 cl-bg-tertiary pt5" data-testid="productSku">
              {{ $t('Size') }}: {{ product.size }}
            </div>
            <div class="h5 cl-bg-tertiary pt5" data-testid="productSku">
              {{ product.sku }}
            </div>
            <div class="h4 cl-bg-tertiary pt5" v-if="isTotalsActive">
              <div v-for="opt in product.options" :key="opt.label">
                <span class="opn">{{ opt.label }}: </span>
                <span class="opv" v-html="opt.value" />
              </div>
            </div>
            <div class="h5 cl-bg-tertiary pt5 options" v-else-if="!editMode && product.options">
              <div v-for="opt in product.options" :key="opt.label">
                <span class="opn">{{ opt.label }}: </span>
                <span class="opv" v-html="opt.value" />
              </div>
            </div>
            <div class="h6 pt5 cl-error" v-if="hasProductErrors && !isDisabledInputs">
              {{ product.errors | formatProductMessages }}
            </div>
            <div class="h6 pt5 cl-success" v-if="hasProductInfo && !hasProductErrors && !isDisabledInputs">
              {{ product.info | formatProductMessages }}
            </div>
          </div>
          <div class="" style="min-width: 160px;"
               v-if="product.type_id !== 'grouped' && product.type_id !== 'bundle' && !isDisabledInputs"
          >
            <button class="btn brdr-none" @click="updateQuantity(parseInt(product.qty)-1)"
                    style="display: inline-block;height: 26px; width: 35px; padding-left: 6px;"
                    :disabled="isStockInfoLoading || parseInt(product.qty) < 2"
            >
              <i class="material-icons">remove</i>
            </button>
            <product-quantity
              class="h5 cl-accent lh25 prod-qty-procc"
              :value="productQty"
              :max-quantity="maxQuantity"
              :loading="isStockInfoLoading"
              :is-simple-or-configurable="isSimpleOrConfigurable"
              @input="updateProductQty"
              @error="handleQuantityError"
            />
            <button class="btn brdr-none" @click="updateQuantity(parseInt(product.qty)+1)"
                    style="display: inline-block;height: 26px; width: 35px; padding-left: 6px;"
                    :disabled="isStockInfoLoading || parseInt(product.qty) >= maxQuantity"
            >
              <i class="material-icons">add</i>
            </button>
          </div>
          <div v-else class="product-quantity"
               style="margin-top: 5px!important"
          >
            {{ $t("Quantity")+" : "+ productQty }}
          </div>
        </div>
        <div class="flex mr10 align-right start-xs between-sm prices" style="margin-top: 5px!important">
          <div class="prices" v-if="!displayItemDiscounts || !isOnline">
            <span class="h4 serif cl-error price-special" v-if="product.special_price">
              {{ product.price_incl_tax * product.qty | price }}
            </span>
            <span class="h6 serif price-original" v-if="product.special_price">
              {{ product.original_price_incl_tax * product.qty | price }}
            </span>
            <span class="h4 serif price-regular" v-else data-testid="productPrice">
              {{ (product.original_price_incl_tax ? product.original_price_incl_tax : product.price_incl_tax) * product.qty | price }}
            </span>
          </div>
          <div class="prices" v-else-if="isOnline && product.totals">
            <span class="h4 serif cl-error price-special" v-if="product.totals.discount_amount">
              {{ product.totals.row_total - product.totals.discount_amount + product.totals.tax_amount | price }}
            </span>
            <span class="h6 serif price-original" v-if="product.totals.discount_amount">
              {{ product.totals.row_total_incl_tax | price }}
            </span>
            <span class="h4 serif price-regular" v-if="!product.totals.discount_amount">
              {{ product.totals.row_total_incl_tax | price }}
            </span>
          </div>
          <div class="prices" v-else>
            <span class="h4 serif price-regular">
              {{ (product.regular_price || product.price_incl_tax) * product.qty | price }}
            </span>
          </div>
        </div>
      </div>
      <div class="w-100 pb15 flex flex-wrap bottom-xs" v-if="editMode">
        <div class="ml0 flex flex-wrap filters" v-if="productsAreReconfigurable">
          <div class="h5 pt5 w-100" v-for="(option, index) in product.configurable_options" :key="index">
            <div class="h6 cl-bg-tertiary mr10">
              {{ option.label }}:
            </div>
            <div class="flex flex-wrap pt5" v-if="option.label == 'Color' && editMode">
              <color-selector
                v-for="filter in getAvailableFilters[option.attribute_code]"
                v-if="isOptionAvailable(filter)"
                :key="filter.id"
                :variant="filter"
                :selected-filters="getSelectedOptions"
                @change="changeEditModeFilter"
              />
            </div>
            <div class="flex flex-wrap pt5" v-else-if="option.label == 'Size' && editMode">
              <size-selector
                class="mr10 mb10"
                v-for="filter in getAvailableFilters[option.attribute_code]"
                v-if="isOptionAvailable(filter)"
                :key="filter.id"
                :variant="filter"
                :selected-filters="getSelectedOptions"
                @change="changeEditModeFilter"
              />
            </div>
          </div>
        </div>
        <button-full
          class="update-button mb10 mr10"
          @click.native="updateProductVariant"
          :disabled="isUpdateCartDisabled"
        >
          {{ $t('Update item') }}
        </button-full>
      </div>
      <div class="w-100 flex middle-xs actions" v-if="!editMode">
        <edit-button class="mx5" @click="openEditMode" v-if="productsAreReconfigurable && !editMode" />
        <remove-button class="mx5" @click="removeItem" v-if="!isDisabledInputs" />
      </div>
    </div>
  </li>
</template>

<script>
import {mapActions, mapGetters} from 'vuex'
import config from 'config'
import { currentStoreView } from '@vue-storefront/core/lib/multistore'
import { formatProductLink } from '@vue-storefront/core/modules/url/helpers'
import Product from '@vue-storefront/core/compatibility/components/blocks/Microcart/Product'

import ProductQuantity from 'theme/components/core/ProductQuantity.vue'
import ProductImage from 'theme/components/core/ProductImage'
import ColorSelector from 'theme/components/core/ColorSelector.vue'
import SizeSelector from 'theme/components/core/SizeSelector.vue'
import RemoveButton from './RemoveButton'
import EditButton from './EditButton'
import { onlineHelper } from '@vue-storefront/core/helpers'
import { ProductOption } from '@vue-storefront/core/modules/catalog/components/ProductOption'
import { getThumbnailForProduct, getProductConfiguration } from '@vue-storefront/core/modules/cart/helpers'
import ButtonFull from 'theme/components/theme/ButtonFull'
import EditMode from './EditMode'
import split from 'lodash-es/split'
import last from 'lodash-es/last'
import isEmpty from 'lodash-es/isEmpty'

export default {
  data () {
    return {
      maxQuantity: 0,
      quantityError: false,
      isStockInfoLoading: false
    }
  },
  props: {
    product: {
      type: Object,
      required: true
    },
    isDisabledInputs: {
      type: Boolean,
      required: false
    }
  },
  mounted () {
    console.log('MicroCart Product Mounted: ', this.product)
  },
  components: {
    RemoveButton,
    ProductImage,
    ColorSelector,
    SizeSelector,
    EditButton,
    ButtonFull,
    ProductQuantity
  },
  mixins: [Product, ProductOption, EditMode],
  computed: {
    ...mapGetters({
      getProductAvailableQuantity: 'product/getProductAvailableQuantity'
    }),
    hasProductInfo () {
      return this.product.info && Object.keys(this.product.info).length > 0
    },
    hasProductErrors () {
      return this.product.errors && Object.keys(this.product.errors).length > 0
    },
    isTotalsActive () {
      return this.isOnline && !this.editMode && this.product && this.product.options
    },
    isOnline () {
      return onlineHelper.isOnline
    },
    productsAreReconfigurable () {
      return config.cart.productsAreReconfigurable && this.product.type_id === 'configurable' && this.isOnline
    },
    displayItemDiscounts () {
      return config.cart.displayItemDiscounts
    },
    image () {
      if (this.isDisabledInputs) {
        return {
          loading: this.product.thumb,
          src: this.product.thumb
        }
      } else {
        return {
          loading: this.thumbnail,
          src: this.thumbnail
        }
      }
    },
    thumbnail () {
      return getThumbnailForProduct(this.product)
    },
    configuration () {
      return getProductConfiguration(this.product)
    },
    productLink () {
      return formatProductLink(this.product, currentStoreView().storeCode)
    },
    editMode () {
      return this.getEditingProductId === this.product.id
    },
    productQty () {
      return this.editMode ? this.getEditingQty : this.product.qty
    },
    isSimpleOrConfigurable () {
      return ['simple', 'configurable'].includes(this.product.type_id)
    },
    isUpdateCartDisabled () {
      return this.quantityError ||
        this.isStockInfoLoading ||
        (this.isOnline && !this.maxQuantity && this.isSimpleOrConfigurable)
    }
  },
  methods: {
    updateProductVariant () {
      this.updateVariant()
      this.closeEditMode()
    },
    updateProductQty (qty) {
      if (this.editMode) {
        this.editModeSetQty(qty)
        return
      }

      this.updateQuantity(qty)
    },
    removeFromCart () {
      this.$store.dispatch('cart/removeItem', { product: this.product })
    },
    updateQuantity (quantity) {
      this.$store.dispatch('cart/updateQuantity', { product: this.product, qty: quantity })
    },
    async getQuantity (product) {
      if (this.isStockInfoLoading) return // stock info is already loading
      this.isStockInfoLoading = true
      try {
        const validProduct = product || this.product
        let size_name = last(split(validProduct.sku, '-'))
        if (!isEmpty(this.getProductAvailableQuantity) && this.getProductAvailableQuantity && this.getProductAvailableQuantity.product_id === validProduct.procc_product_id && this.getProductAvailableQuantity[size_name]) {
          return this.getProductAvailableQuantity[size_name]
        } else {
          const res = await this.$store.dispatch('stock/check', {
            product: validProduct,
            qty: this.productQty
          })
          return res.qty
        }
      } finally {
        this.isStockInfoLoading = false
      }
    },
    handleQuantityError (error) {
      this.quantityError = error
    },
    async changeEditModeFilter (filter) {
      const editedProduct = this.getEditedProduct(filter)
      const maxQuantity = this.isDisabledInputs ? 0 : await this.getQuantity(editedProduct)
      if (!maxQuantity) {
        this.$store.dispatch('notification/spawnNotification', {
          type: 'error',
          message: this.$t(
            'The product is out of stock and cannot be added to the cart!'
          ),
          action1: { label: this.$t('OK') }
        })
      } else if (maxQuantity < this.productQty) {
        this.$store.dispatch('notification/spawnNotification', {
          type: 'error',
          message: this.$t('Only {maxQuantity} products of this type are available!', { maxQuantity }),
          action1: { label: this.$t('OK') }
        })
      } else {
        this.maxQuantity = maxQuantity
        this.editModeSetFilters(filter)
      }
    }
  },
  watch: {
    isOnline: {
      async handler (isOnline) {
        if (isOnline && !this.isDisabledInputs) {
          const maxQuantity = await this.getQuantity()
          this.maxQuantity = maxQuantity
        }
      },
      immediate: true
    }
  }
}
</script>

<style lang="scss" scoped>
@import '~theme/css/variables/colors';
@import '~theme/css/helpers/functions/color';
  .blend {
    flex: 0 0 150px;
  }

  .image {
    mix-blend-mode: multiply;
    vertical-align: top;
    width: 150px;
    @media (max-width: 767px) {
      width: 100px;
    }
  }

  .details {
    flex: 1 1 auto;
    display: flex;
    flex-flow: row wrap;
  }

  .name {
    @media (max-width: 767px) {
      font-size: 14px;
    }
  }

  .options, .sku {
    @media (max-width: 767px) {
      font-size: 10px;
    }
  }

  .qty {
    padding-right: 30px;

    @media (max-width: 767px) {
      font-size: 12px;
      padding: 0;
      text-align: right;
    }
  }

  .actions {
    margin: 0 -5px;
  }

  .prices {
    flex-direction: column;
    @media (max-width: 767px) {
      padding: 0;
      font-size: 12px;
      margin: 0;
    }
  }

  .price-special {
    @media (max-width: 767px) {
      font-size: 14px;
    }
  }

  .price-original {
    text-decoration: line-through;
  }

  input {
    width: 30px;
  }

  .flex-nowrap {
    flex-wrap: nowrap;
  }

  .flex-wrap {
    flex-wrap: wrap;
  }

  .edit-mode {
    border-bottom: 1px solid color(white-smoke);
  }

  .filters {
    flex: 1 1 200px;
  }

  .update-button {
    font-size: 14px;
    min-width: 150px;
    width: 150px;
    padding: 10px;
  }
</style>
<style lang="scss">
  .prod-qty-procc {
    display: inline-block;
    padding-right: 0;
    margin: 10px;
    & > div > input {
      padding-left: 9px;
    }
  }
  /*@media (max-width: 767px) {*/
  /*.base-input-number {*/
  /*  display: flex;*/
  /*  align-items: center;*/
  /*  label.base-input-number__label {*/
  /*    margin-right: 10px;*/
  /*}*/
  /*}*/
  /*}*/
</style>
