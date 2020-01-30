import i18n from '@vue-storefront/i18n'
import config from 'config'
export const Product = {
  name: 'Product',
  props: {
    product: {
      type: Object,
      required: true
    }
  },
  data () {
    return {
      isStockInfoLoading: false,
      maxQuantity: 0
    }
  },
  computed: {
    thumbnail () {
      return this.getThumbnail(this.product.image, 150, 150)
    }
  },
  watch: {
    product: {
      async handler (product) {
        if (product) {
          const maxQuantity = await this.getQuantity()
          this.maxQuantity = maxQuantity
        }
      },
      immediate: true
    }
  },
  methods: {
    onProductChanged (event) {
      if (event.item.sku === this.product.sku) {
        this.$forceUpdate()
      }
    },
    // for check max Quantity of product
    async getQuantity (product) {
      if (this.isStockInfoLoading) return // stock info is already loading
      this.isStockInfoLoading = true
      try {
        const validProduct = product || this.product
        const res = await this.$store.dispatch('stock/check', {
          product: validProduct,
          qty: this.productQty
        })
        return parseInt(res.qty)
      } finally {
        this.isStockInfoLoading = false
      }
    },
    updateQuantity (quantity) {
      this.$store.dispatch('cart/updateQuantity', { product: this.product, qty: quantity })
    },
    removeItem () {
      if (config.cart.askBeforeRemoveProduct) {
        this.$store.dispatch('notification/spawnNotification', {
          type: 'warning',
          item: this.product,
          message: i18n.t('Are you sure you would like to remove this item from the shopping cart?'),
          action2: { label: i18n.t('OK'), action: this.removeFromCart },
          action1: { label: i18n.t('Cancel'), action: 'close' },
          hasNoTimeout: true
        })
      } else {
        this.removeFromCart()
      }
    },
    removeFromCart () {
      this.$store.dispatch('cart/removeItem', { product: this.product })
    }
  },
  beforeMount () {
    this.$bus.$on('cart-after-itemchanged', this.onProductChanged)
  },
  beforeDestroy () {
    this.$bus.$off('cart-after-itemchanged', this.onProductChanged)
  }
}
