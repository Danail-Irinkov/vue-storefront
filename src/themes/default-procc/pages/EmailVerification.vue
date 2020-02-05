<template>
  <div class="h4 email-verify">
    {{$t("Please wait email verification running")}}
  </div>
</template>

<script>
// query constructor
export default {
  data () {
    return {
      loading: true
    }
  },
  async beforeCreate () {
    let result = await this.$store.dispatch('user/verifyCustomer', this.$route.params.token)
    this.$router.push(this.localizedRoute('/'))
  }
}
</script>

<style lang="scss" scoped>
  .email-verify{
    height: 50vh;
    text-align: center;
    margin: auto;
    vertical-align: middle;
    display: flex;
    align-items: center;
    justify-content: center;
  }
</style>
