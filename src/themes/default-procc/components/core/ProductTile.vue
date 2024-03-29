<template>
  <div class="product align-center w-100 pb20" v-observe-visibility="visibilityChanged">
    <div class="product__icons">
      <AddToWishlist :product="product">
        <div
          class="product__icon"
          :class="{'product__icon--active': isOnWishlist }"
          :title="isOnWishlist ? $t('Remove') : $t('Add to favorite') "
        >
          <i class="material-icons">{{ favoriteIcon }}</i>
        </div>
      </AddToWishlist>
<!--      <AddToCompare :product="product">-->
<!--        <div-->
<!--          class="product__icon"-->
<!--          :class="{'product__icon&#45;&#45;active':isOnCompare } "-->
<!--          :title="isOnCompare ? $t('Remove from compare') : $t('Add to compare')"-->
<!--        >-->
<!--          <i class="material-icons">compare</i>-->
<!--        </div>-->
<!--      </AddToCompare>-->
    </div>
    <router-link
      class="block no-underline product-link"
      :to="productLink"
      data-testid="productLink"
    >
      <div
        class="product-cover bg-cl-secondary"
        :class="[{ sale: labelsActive && isOnSale }, { new: labelsActive && isNew }]"
      >
        <!--        // Changes Shab-->
        <div class="card relative brdr-none">
          <div class="brand_logo" v-if="isCCStore">
            <img
              :src="product.brand_logo"
              width="50"
              height="50"
            >
          </div>
          <div class="card-body">
            <product-image
              class="product-image__content"
              :image="thumbnailObj"
              :alt="product.name | htmlDecode"
              data-testid="productImage"
            />
          </div>
        </div>
      </div>

      <p class="mb0 cl-accent mt10" v-if="!onlyImage">
        {{ product.name | htmlDecode }}
      </p>

      <span
        class="price-original mr5 lh30 cl-secondary"
        v-if="product.special_price && parseFloat(product.original_price_incl_tax) > 0 && !onlyImage"
      >{{ product.original_price_incl_tax | price }}</span>

      <span
        class="price-special lh30 cl-accent weight-700 discount"
        v-if="product.special_price && parseFloat(product.special_price) > 0 && !onlyImage"
      >{{ product.price_incl_tax | price }}</span>
      <span
        class="lh30 cl-secondary"
        v-if="!product.special_price && parseFloat(product.price_incl_tax) > 0 && !onlyImage"
      >{{ product.price_incl_tax | price }}</span>
    </router-link>
  </div>
</template>

<script>
import rootStore from '@vue-storefront/core/store'
import { ProductTile } from '@vue-storefront/core/modules/catalog/components/ProductTile.ts'
import config from 'config'
import ProductImage from './ProductImage'
import AddToWishlist from 'theme/components/core/blocks/Wishlist/AddToWishlist'
import AddToCompare from 'theme/components/core/blocks/Compare/AddToCompare'
import { IsOnWishlist } from '@vue-storefront/core/modules/wishlist/components/IsOnWishlist'
import { IsOnCompare } from '@vue-storefront/core/modules/compare/components/IsOnCompare'

import {mapGetters} from 'vuex'

export default {
  mixins: [ProductTile, IsOnWishlist, IsOnCompare],
  components: {
    ProductImage,
    AddToWishlist,
    AddToCompare
  },
  props: {
    labelsActive: {
      type: Boolean,
      default: true
    },
    onlyImage: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      isCCStore: false
    }
  },
  computed: {
    ...mapGetters({
      currentImage: 'procc/getHeadImage'
    }),
    thumbnailObj () {
      return {
        src: this.thumbnail,
        loading: this.thumbnail
      }
    },
    favoriteIcon () {
      return this.isOnWishlist ? 'favorite' : 'favorite_border'
    }
  },
  methods: {
    onProductPriceUpdate (product) {
      if (product.sku === this.product.sku) {
        Object.assign(this.product, product)
      }
    },
    visibilityChanged (isVisible, entry) {
      if (
        isVisible &&
        config.products.configurableChildrenStockPrefetchDynamic &&
        config.products.filterUnavailableVariants &&
        this.product.type_id === 'configurable' &&
        this.product.configurable_children &&
        this.product.configurable_children.length > 0
      ) {
        const skus = [this.product.sku]
        for (const confChild of this.product.configurable_children) {
          const cachedItem = rootStore.state.stock.cache[confChild.id]
          if (typeof cachedItem === 'undefined' || cachedItem === null) {
            skus.push(confChild.sku)
          }
        }
        if (skus.length > 0) {
          rootStore.dispatch('stock/list', { skus: skus }) // store it in the cache
        }
      }
    }
  },
  beforeMount () {
    this.$bus.$on('product-after-priceupdate', this.onProductPriceUpdate)
  },
  mounted () {
    this.isCCStore = this.currentImage.is_cc_store
  },
  beforeDestroy () {
    this.$bus.$off('product-after-priceupdate', this.onProductPriceUpdate)
  }
}
</script>

<style lang="scss" scoped>
@import '~theme/css/animations/transitions';
@import '~theme/css/variables/colors';
@import '~theme/css/helpers/functions/color';

$bg-secondary: color(secondary, $colors-background);
$border-secondary: color(secondary, $colors-border);
$color-white: color(white);

.product {
  position: relative;
  @media (max-width: 767px) {
    padding-bottom: 10px;
  }
  &__icons {
    position: absolute;
    top: 0;
    right: 0;
    display: flex;
    flex-direction: column;
    padding-right: 20px;
    padding-top: 10px;
  }
  &__icon {
    color: #eb5757;
    padding-top: 10px;
    opacity: 0.7;
    z-index: 2;
    transition: 0.3s opacity $motion-main;
    /*@media (max-width: 767px) {*/
    /*  opacity: 1;*/
    /*}*/
    &--active {
      opacity: 1;
    }
    &:hover {
      opacity: 1;
    }
  }
}

.price-original {
  text-decoration: line-through;
}

%label {
  position: absolute;
  top: 0;
  left: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 40px;
  height: 40px;
  background-color: $border-secondary;
  text-transform: uppercase;
  color: $color-white;
  font-size: 12px;
}

.product-cover {
  overflow: hidden;
  width:100%;
  height: 100%;
  max-height: 500px;

  & > .card{
    padding: 0!important; // Added By Dan to maximise photos
    & > .card-body{
      padding: 0!important; // Added By Dan to maximise photos
    }
  }

  &__thumb {
    padding-bottom: calc(143.88% / (164.5 / 100));
    @media screen and (min-width: 768px) {
      padding-bottom: calc(300% / (276.5 / 100));
    }
    opacity: 0.8;
    will-change: opacity, transform;
    transition: 0.3s opacity $motion-main, 0.3s transform $motion-main;
  }

  @media screen and (min-width: 768px) {
    &:hover {
      .product-cover__thumb {
        opacity: 1;
        transform: scale(1.1);
      }
      &.sale::after,
      &.new::after {
        opacity: 0.8;
      }
    }
  }

  &.sale {
    &::after {
      @extend %label;
      content: 'Sale';
    }
  }
  &.new {
    &::after {
      @extend %label;
      content: 'New';
    }
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
.brand_logo {
  z-index: 1;
  margin: auto;
  position: absolute;
  & > img {
    border-radius: 0% 50% 50% 50%;
  }
}
.card-body {
  float: none;
  margin: auto;
}
</style>
