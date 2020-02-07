import { mapState, mapGetters } from 'vuex'
import RootState from '@vue-storefront/core/types/RootState'
import { Logger } from '@vue-storefront/core/lib/logger'

export const PersonalDetails = {
  name: 'PersonalDetails',
  props: {
    isActive: {
      type: Boolean,
      required: true
    },
    focusedField: {
      type: String,
      required: false
    }
  },
  data () {
    return {
      isFilled: false,
      personalDetails: this.$store.state.checkout.personalDetails,
      createAccount: false,
      acceptConditions: false,
      password: '',
      rPassword: '',
      isValidationError: false
    }
  },
  computed: {
    ...mapState({
      currentUser: (state: RootState) => state.user.current
    }),
    ...mapGetters({
      isVirtualCart: 'cart/isVirtualCart'
    })
  },
  created () {
    this.onLoggedIn(this.currentUser)
  },
  methods: {
    onLoggedIn (receivedData) {
      this.personalDetails = {
        firstName: receivedData.first_name,
        lastName: receivedData.last_name,
        emailAddress: receivedData.email
      }
    },
    sendDataToCheckout () {
      if (this.createAccount) {
        this.personalDetails.password = this.password
        this.personalDetails.createAccount = true
      } else {
        this.personalDetails.createAccount = false
      }
      this.$bus.$emit('checkout-after-personalDetails', this.personalDetails, this.$v)
      this.isFilled = true
      this.isValidationError = false
      if(this.personalDetails.createAccount)
        this.register()
    },
    async register () {
      this.$bus.$emit('notification-progress-start', this.$t('Registering the account ...'));

      try {
        const result = await this.$store.dispatch('user/register', {
          email: this.personalDetails.emailAddress,
          password: this.personalDetails.password,
          first_name: this.personalDetails.firstName,
          last_name: this.personalDetails.lastName,
        });
        debugger
        this.$bus.$emit('notification-progress-stop');
        if (result.data.message_type === 'error') {
          this.onFailure(result);
          // If error includes a word 'password', emit event that eventually focuses on a corresponding field
          if (result.result.includes(this.$t('password'))) {
            this.$bus.$emit('checkout-after-validationError', 'password')
          }
          // If error includes a word 'mail', emit event that eventually focuses on a corresponding field
          if (result.result.includes(this.$t('email'))) {
            this.$bus.$emit('checkout-after-validationError', 'email-address')
          }
        } else {
          this.$bus.$emit('modal-hide', 'modal-signup');
          await this.$store.dispatch('user/login', {
            username: this.personalDetails.emailAddress,
            password: this.personalDetails.password
          });
          this.onSuccess()
        }
      } catch (err) {
        this.$bus.$emit('notification-progress-stop');
        Logger.error(err, 'checkout')()
      }
    },
    edit () {
      if (this.isFilled) {
        this.$bus.$emit('checkout-before-edit', 'personalDetails')
      }
    },
    gotoAccount () {
      this.$bus.$emit('modal-show', 'modal-signup')
    }
  },
  updated () {
    // Perform focusing on a field, name of which is passed through 'focusedField' prop
    if (this.focusedField && !this.isValidationError) {
      if (this.focusedField === 'password') {
        this.isValidationError = true
        this.password = ''
        this.rPassword = ''
        this.$refs['password'].setFocus('password')
      }
    }
  },
  beforeMount () {
    this.$bus.$on('user-after-loggedin', this.onLoggedIn)
  },
  destroyed () {
    this.$bus.$off('user-after-loggedin', this.onLoggedIn)
  }
}
