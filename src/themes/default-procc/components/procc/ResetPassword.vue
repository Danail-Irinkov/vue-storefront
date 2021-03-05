<template>
  <div>
    <div class="bg-cl-primary pt30 pb60 px65 cl-secondary w-50 m-auto">
      <form @submit.prevent="resetPassword" novalidate>
        <div class="row">
          <base-input
            class="col-xs-12 col-md-8 mb10 pt25"
            type="password"
            name="newPassword"
            v-model="newPassword"
            @blur="$v.newPassword.$touch()"
            :placeholder="$t('New Password *')"
            :validations="[{
              condition: !$v.newPassword.required && $v.newPassword.$error,
              text: $t('The field is required.')
            }]"
          />
          <button-full class="col-xs-12 col-md-4 mb10" type="submit">
            {{ $t('Save Password') }}
          </button-full>
        </div>
      </form>
    </div>
  </div>
</template>
<script>
import isUndefined from 'lodash-es/isUndefined'
import { required } from 'vuelidate/lib/validators'
import BaseInput from 'theme/components/core/blocks/Form/BaseInput.vue'
import ButtonFull from 'theme/components/theme/ButtonFull.vue'
import i18n from '@vue-storefront/i18n'
export default {
  name: 'ResetPassword',
  data () {
    return {
      newPassword: '',
      password_reset_code: ''
    };
  },
  components: {
    ButtonFull,
    BaseInput
  },
  mounted () {
    if (!isUndefined(this.$route.params.code) && this.$route.params.code) {
      this.password_reset_code = this.$route.params.code
    }
  },
  validations: {
    newPassword: {
      required
    }
  },
  methods: {
    resetPassword () {
      console.log(this.password_reset_code, this.newPassword)
      // todo: send email with reset password instructions

      if (this.$v.$invalid) {
        this.$v.$touch()
        this.$store.dispatch('notification/spawnNotification', {
          type: 'error',
          message: i18n.t('Please fix the validation errors'),
          action1: { label: i18n.t('OK') }
        })
        return
      }

      this.$bus.$emit('notification-progress-start', i18n.t('Resetting the password ... '))
      this.$store.dispatch('user/resetPassword', { password: this.newPassword, password_reset_code: this.password_reset_code }).then((response) => {
        this.$bus.$emit('notification-progress-stop')
        console.log('response', response)
        let message_type = 'success'
        let message = ''
        if (response.message_type === 'success') {
          // this.passwordSent = true
          this.newPassword = ''
          this.password_reset_code = ''
          message = i18n.t('Password successfully changed')
          this.$router.push(this.localizedRoute('/'))
        } else {
          message_type = 'error'
          message = response.message || i18n.t('Error while sending reset password e-mail')
        }
        this.$store.dispatch('notification/spawnNotification', {
          type: message_type,
          message: message,
          action1: { label: i18n.t('OK'), action: 'close' }
        })
      }).catch((err) => {
        console.error(err)
        this.$bus.$emit('notification-progress-stop')
      })
    }

  }
};
</script>
<style scoped>
.m-auto{
  margin: auto
}
</style>
