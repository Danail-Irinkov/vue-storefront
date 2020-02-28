import { getThumbnailForProduct, getProductConfiguration } from '@vue-storefront/core/modules/cart/helpers'

// @deprecated moved to theme
export const MicrocartProduct = {
  name: 'MicrocartProduct',
  props: {
    product: {
      type: Object,
      required: true
    }
  },
  computed: {
    thumbnail () {
      return getThumbnailForProduct(this.product)
    },
    configuration () {
      return getProductConfiguration(this.product)
    }
  },
  methods: {
    removeFromCart () {
      this.$store.dispatch('cart/removeItem', { product: this.product })
    },
    async updateQuantity (quantity) {
      this.$bus.$emit('loading-summary', true)
      await this.$store.dispatch('cart/updateQuantity', { product: this.product, qty: quantity })
      this.$bus.$emit('loading-summary', false)
    }
  }
}
