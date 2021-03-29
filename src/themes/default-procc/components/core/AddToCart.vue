<template>
  <button-full @click.native="addToCart(product)" :disabled="isProductDisabled" data-testid="addToCart">
    {{ $t('Add to cart') }}
  </button-full>
</template>

<script>
import { formatProductMessages } from '@vue-storefront/core/filters/product-messages'
import { notifications } from '@vue-storefront/core/modules/cart/helpers'
import focusClean from 'theme/components/theme/directives/focusClean'
import ButtonFull from 'theme/components/theme/ButtonFull.vue'
import { mapGetters } from 'vuex'

export default {
  directives: { focusClean },
  components: { ButtonFull },
  props: {
    product: {
      required: true,
      type: Object
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    onAfterRemovedVariant () {
      this.$forceUpdate()
    },
    async addToCart (product) {
      try {
        // TODO: KNOW ISSUE WHEN ADDING MULTIPLE VARIANTS OF THE SAME PRODUCT!!! NEED TO FIX FLOW
        product.store_brand = this.currentImage.brand // added for set store brand id in product
        // console.log('addToCart product', product)
        const diffLog = await this.$store.dispatch('cart/addItem', { productToAdd: product })
        diffLog.clientNotifications.forEach(notificationData => {
          this.notifyUser(notificationData)
        })
        // Added by Dan
        let default_shipping_method
        if (this.getDefaultShippingMethods) {
          for (let method of this.getDefaultShippingMethods){
            if (String(method.brand_id) === String(product.procc_brand_id)){
              default_shipping_method = {...method.default_shipping_method}
            }
          }

          console.log('result.default_shipping_method', default_shipping_method)
          if (default_shipping_method && default_shipping_method.offer_free_shipping) {
            this.$bus.$emit('toggleFreeShippingBanner', {
              brand_name: this.getBrandStore(product.procc_brand_id).store_brand_name,
              free_shipping_amount: default_shipping_method.free_shipping_amount
            })
          }

        }
      } catch (message) {
        this.notifyUser(notifications.createNotification({ type: 'error', message }))
      }
    },
    notifyUser (notificationData) {
      this.$store.dispatch('notification/spawnNotification', notificationData, { root: true })
    }
  },
  computed: {
    ...mapGetters({
      isAddingToCart: 'cart/getIsAdding',
      getDefaultShippingMethods: 'checkout/getDefaultShippingMethods', // by ProCC
      currentImage: 'procc/getHeadImage' // by ProCC
    }),
    isProductDisabled () {
      return this.disabled || formatProductMessages(this.product.errors) !== '' || this.isAddingToCart
    }
  },
  beforeMount () {
    this.$bus.$on('product-after-removevariant', this.onAfterRemovedVariant)
  },
  beforeDestroy () {
    this.$bus.$off('product-after-removevariant')
  }
}
</script>
