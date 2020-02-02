<template>
  <router-link class="brdr-none no-underline bg-cl-transparent p0 middle-xs inline-flex cl-secondary weight-400 h4 sans-serif fs-medium"
          :to="redirectionLink">
    <span class="clearcart-btn cl-accent">
      {{ $t('Go to checkout') }}
      <i class="material-icons cl-accent" style="width: 18px;margin-left: 7px">
        shopping_cart
      </i>
    </span>
  </router-link>
</template>
<script>
  export default {
    name: 'go-to-checkout-btn-procc',
    props: {
      link: {
        type: Object,
        required: false,
        default: null
      }
    },
    computed: {
      redirectionLink () {
        return this.link ? this.localizedRoute(this.link) : null
      }
    }
  }
</script>
<style lang="scss" scoped>
  .clearcart {
    &-btn {
      display: flex;
      align-items: center;
    }
  }
</style>
