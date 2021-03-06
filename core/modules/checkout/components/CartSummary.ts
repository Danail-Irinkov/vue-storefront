import { mapGetters } from 'vuex'
import Microcart from '@vue-storefront/core/compatibility/components/blocks/Microcart/Microcart'
import find from 'lodash-es/find'
export const CartSummary = {
  name: 'CartSummary',
  mixins: [Microcart],
  data () {
    return {
      loadShippingMethod: false
    }
  },
  computed: {
    ...mapGetters({
      totals: 'cart/getTotals',
      isVirtualCart: 'cart/isVirtualCart',
      shippingMethods: 'checkout/getShippingMethods',
      getBrandsDetails: 'checkout/getBrandsDetails',
      getDefaultShippingMethods: 'checkout/getDefaultShippingMethods',
      getSelectedShippingMethods: 'checkout/getSelectedShippingMethods'
    })

  },
  watch: {
    shippingMethods: {
      handler () {
        //    this.checkDefaultShippingMethod()
      }
    }
  },
  methods: {
    getBrandData (id) {
      if (this.getBrandsDetails) {
        return find(this.getBrandsDetails, (o) => {
          return o._id === id
        });
      } else {
        return {
          name: '',
          logo: {thumb: ''},
          customer_support_email: ''
        }
      }
    },
    getDefaultShippingMethod (id) {
      if (this.getDefaultShippingMethods) {
        let result = find(this.getDefaultShippingMethods, (o) => {
          return o.brand_id === id
        });
        return result.default_shipping_method
      } else { return {} }
    },
    getShippingMethod () {
      for (let i = 0; i < this.shippingMethods.length; i++) {
        if (this.shippingMethods[i]._id === this.shipping.shippingMethod) {
          return {
            name: this.shippingMethods[i].name,
            cost: this.shippingMethods[i].cost
          }
        }
      }
      return {
        name: '',
        cost: ''
      }
    },
    showShippingModel (brand_id, isDisabledInputs = false) {
      // console.log('showShippingModel', brand_id)
      // Added By Dan to disable courier input at ThankYOu page Post sale
      if (!isDisabledInputs) {
        this.$bus.$emit('show-shipping-method-modal', brand_id)
      }
    }
  }
}
