import AppliedCoupon from '../types/AppliedCoupon'
import Product from '@vue-storefront/core/modules/catalog/types/Product'
import CartTotalSegments from '../types/CartTotalSegments'

// @deprecated moved to store
export const Microcart = {
  name: 'Microcart',
  computed: {
    productsInCart (): Product[] {
      return this.$store.state.cart.cartItems
    },
    productsInCartByBrand (): {} {
      return this.$store.getters['cart/getCartItemsByBrand']
    },

    appliedCoupon (): AppliedCoupon | false {
      return this.$store.getters['cart/getCoupon']
    },
    totals (): CartTotalSegments {
      return this.$store.getters['cart/getTotals']
    },
    isOpen (): boolean {
      return this.$store.state.cart.isMicrocartOpen
    }
  },
  methods: {
    productsInCartByBrandProCC (brand_id: string): Promise<boolean> { // Added by Dan to split items by Brand
      console.log('his.$store.state.cart.brand_id', brand_id)
      console.log('his.$store.state.cart.cartItems', this.$store.state.cart.cartItems)
      let products = this.$store.state.cart.cartItems.filter(product => product.procc_brand_id === brand_id)
      console.log('his.$store.state.cart.products', products)
      return products
    },
    applyCoupon (code: string): Promise<boolean> {
      return this.$store.dispatch('cart/applyCoupon', code)
    },
    removeCoupon (): Promise<boolean> {
      return this.$store.dispatch('cart/removeCoupon')
    },
    toggleMicrocart (): void {
      this.$store.dispatch('ui/toggleMicrocart')
    }
  }
}
