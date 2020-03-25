import i18n from '@vue-storefront/i18n'
import { Logger } from '@vue-storefront/core/lib/logger'

export const Login = {
  name: 'Login',
  data () {
    return {
      remember: false,
      email: '',
      password: ''
    }
  },
  methods: {
    callLogin () {
      this.$bus.$emit('notification-progress-start', i18n.t('Authorization in progress ...'))
      this.$store.dispatch('user/login', { email: this.email, password: this.password }).then((result) => {
        this.$bus.$emit('notification-progress-stop', {})
        // edited by shabbir for check API response type
        if (result.message_type !== 'success') {
          this.onFailure(result)
        } else {
          this.onSuccess()
          this.close()
        }
      }).catch(err => {
        Logger.error(err, 'user')()
        this.onFailure({ result: {message: 'Unexpected authorization error. Check your Network conection.'} })
        // TODO Move to theme
        this.$bus.$emit('notification-progress-stop')
      })
    },
    switchElem () {
      // TODO Move to theme
      this.$store.commit('ui/setAuthElem', 'register')
    },
    callForgotPassword () {
      // TODO Move to theme
      this.$store.commit('ui/setAuthElem', 'forgot-pass')
    }
  }
}
