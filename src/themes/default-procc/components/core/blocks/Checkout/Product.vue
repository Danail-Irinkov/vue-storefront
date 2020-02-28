<template>
  <div class="row p10 between-xs order-item">
    <div class="blend">
      <product-image :image="image" />
    </div>
    <div class="col-xs px10">
      <div class="row">
        <div class="col-xs-12 col-md-9 col-sm-8 pb15">
          <div class="mb15">
            <router-link
              class="h4 weight-400 cl-accent serif"
              :to="productLink"
              data-testid="productLink"
            >
              {{ product.name ? product.name : product.product ? product.product.name : '' | htmlDecode }}
            </router-link>
            <div class="cl-error" v-if="product.errors && Object.keys(product.errors).length > 0">
              {{ product.errors | formatProductMessages }}
            </div>
            <div class="h6 cl-tertiary pt5">
              {{ product.sku }}
            </div>
            <div class="h5 cl-bg-tertiary pt5 options" v-if="product && product.options">
              <div v-for="opt in product.options" :key="opt.label">
                <span class="opn">{{ opt.label }}: </span>
                <span class="opv" v-html="opt.value" />
              </div>
            </div>
            <div class="h5 cl-bg-tertiary pt5 options" v-else-if="product.options">
              <div v-for="opt in product.options" :key="opt.label">
                <span class="opn">{{ opt.label }}: </span>
                <span class="opv" v-html="opt.value" />
              </div>
            </div>
          </div>
          <div>
            <div v-if="isOnline && product.totals && product.totals.discount_amount">
              <span class="h4 cl-error" v-if="product.totals.discount_amount">{{ product.totals.row_total - product.totals.discount_amount + product.totals.tax_amount | price }} </span>
              <span class="price-original h5" v-if="product.totals.discount_amount">{{ product.totals.row_total_incl_tax | price }}</span>
              <span v-if="!product.totals.discount_amount" class="h4">{{ product.price_incl_tax | price }}</span>
              <span v-if="!product.totals.discount_amount && product.qty > 1" class="h5" style="margin-left: 1rem; vertical-align: text-top;">( {{ product.price_incl_tax * product.qty | price }} )</span>
            </div>
            <div v-else>
              <span class="h4 cl-error" v-if="product.special_price">{{ product.price_incl_tax * product.qty | price }} </span>
              <span class="price-original h5" v-if="product.special_price">{{ product.original_price_incl_tax * product.qty | price }}</span>
              <span v-if="!product.special_price" class="h4">{{ product.price_incl_tax | price }}</span>
              <span v-if="!product.special_price && product.qty > 1" class="h5" style="margin-left: 1rem; vertical-align: text-top;">({{ product.price_incl_tax * product.qty | price }})</span>
            </div>
          </div>
        </div>
        <div class="col-xs-12 col-md-3 col-sm-4 serif text-c-dt float-left">
          <div class="flex qty-fav-delete">
            <AddToWishlist :product="product">
              <div
                class="product__icon normal-icon-btn"
                :class="{'product__icon--active': isOnWishlist }"
                :title="isOnWishlist ? $t('Remove') : $t('Add to favorite') "
              >
                <i class="material-icons">{{ favoriteIcon }}</i>
              </div>
            </AddToWishlist>
            <button class="btn normal-icon-btn">
              <i class="material-icons" @click="removeItem">delete</i>
            </button>
            <div class="qty-add-dlt">
              <button class="btn" @click="updateQuantity(parseInt(product.qty)-1)" :disabled="isStockInfoLoading || parseInt(product.qty) < 2">
                <i class="material-icons">remove</i>
              </button>
              <span>{{ product.qty }}</span>
              <button class="btn" @click="updateQuantity(parseInt(product.qty)+1)" :disabled="isStockInfoLoading || parseInt(product.qty) >= maxQuantity">
                <i class="material-icons">add</i>
              </button>
            </div>
          </div>
          <div class="static-available mt15" v-if="maxQuantity < 20">
            {{ $t('Limited quantity available') }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { Product } from '@vue-storefront/core/modules/checkout/components/Product'
import { onlineHelper } from '@vue-storefront/core/helpers'
import ProductImage from 'theme/components/core/ProductImage'
import AddToWishlist from 'theme/components/core/blocks/Wishlist/AddToWishlist'
import { IsOnWishlist } from '@vue-storefront/core/modules/wishlist/components/IsOnWishlist'
import { currentStoreView } from '@vue-storefront/core/lib/multistore'
import { formatProductLink } from '@vue-storefront/core/modules/url/helpers'

export default {
  computed: {
    isOnline () {
      return onlineHelper.isOnline
    },
    image () {
      return {
        loading: this.thumbnail,
        src: this.thumbnail
      }
    },
    favoriteIcon () {
      return this.isOnWishlist ? 'favorite' : 'favorite_border'
    },
    productLink () {
      return formatProductLink(this.product, currentStoreView().storeCode)
    }
  },
  mixins: [Product, IsOnWishlist],
  components: {
    ProductImage,
    AddToWishlist
  }
}
</script>

<style scoped>
.price-original {
  text-decoration: line-through;
}
.blend {
  flex: 0 0 121px;
  overflow: hidden; /*Added BY Dan 30-12-2019*/
}
</style>
