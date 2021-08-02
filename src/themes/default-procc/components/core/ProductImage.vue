<template>
  <div
    class="product-image"
    :class="{'product-image--height': basic, 'product-image--width': !basic}"
    :style="style"
    v-on="$listeners"
  >
    <img
      v-show="showPlaceholder"
      src="/assets/placeholder.svg"
      :alt="alt"
      class="product-image__placeholder"
    >
    <img
      v-if="!lowerQualityImageError || isOnline"
      v-show="showLowerQuality"
      :src="image.loading"
      :alt="alt"
      @load="imageLoaded('lower', true)"
      @error="imageLoaded('lower', false)"
      ref="lQ"
      class="product-image__thumb"
    >
    <img
      v-if="!highQualityImageError || isOnline"
      v-show="showHighQuality"
      :src="image.src"
      :alt="alt"
      @load="imageLoaded('high', true)"
      @error="imageLoaded('high', false)"
      class="product-image__thumb"
    >
  </div>
</template>

<script>
import { onlineHelper } from '@vue-storefront/core/helpers'

export default {
  props: {
    calcRatio: {
      type: Boolean,
      default: true
    },
    image: {
      type: Object,
      default: () => ({
        src: '',
        loading: ''
      })
    },
    alt: {
      type: String,
      default: ''
    }
  },
  data () {
    return {
      windowWidth: 1920, // Added By Dan
      windowHeight: 1080, // Added By Dan
      lowerQualityImage: false,
      lowerQualityImageError: false,
      highQualityImage: false,
      highQualityImageError: false,
      basic: true
    }
  },
  mounted() {// Added By Dan
    this.$nextTick(() => {
      window.addEventListener('resize', this.onResize);
      this.windowWidth = window.innerWidth
      this.windowHeight = window.innerHeight
    })
  },
  beforeDestroy() {// Added By Dan
    window.removeEventListener('resize', this.onResize);
  },
  watch: {
    lowerQualityImage (state) {
      if (state) {
        this.basic = this.$refs.lQ.naturalWidth < this.$refs.lQ.naturalHeight;
      }
    }
  },
  computed: {
    showPlaceholder () {
      return !this.showLowerQuality && !this.showHighQuality
    },
    showLowerQuality () {
      return this.lowerQualityImage && !this.showHighQuality
    },
    showHighQuality () {
      return this.highQualityImage
    },
    imageRatio () {
      const {width, height} = this.$store.state.config.products.gallery
      let coef = 0.9 // Added by Dan to dynamically resize the images across resolutions -> kind of a weird hack....
      // if (this.windowWidth > 500) {
      //   coef = 1 - (this.windowWidth/1920)
      //   if (coef < 0.63)
      //     coef = 1.26 - coef
      //   if (coef > 1)
      //     coef = 1.9 - coef
      // }
      let ratio = coef * height / (width / 100)
      // if (ratio > 120)
      //   ratio = 120
      return `${ratio}%`
    },
    style () {
      return this.calcRatio ? {paddingBottom: this.imageRatio} : {}
    },
    isOnline (value) {
      return onlineHelper.isOnline
    }
  },
  methods: {
    imageLoaded (type, success = true) {
      this[`${type}QualityImage`] = success
      this[`${type}QualityImageError`] = !success
    },
    onResize() { // Added By Dan
      this.windowWidth = window.innerWidth
      this.windowHeight = window.innerHeight
    }
  }
}
</script>

<style lang="scss" scoped>
  .product-image{
    position: relative;
    width: 100%;
    max-width: 100%;
    mix-blend-mode: multiply;
    &__placeholder,
    &__thumb {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
    }
    &__placeholder {
      max-width: 50%;
    }
    &--height {
      .product-image__thumb {
        height: 100%;
      }
    }
    &--width {
      .product-image__thumb {
        // Edited by Dan to maximise photo size
        width: auto;
        max-width: 100%;
        min-height: 100%;
      }
    }
  }
  .shopping-cart .product-image.product-image--width img {max-width: 100%;min-height: auto;}
</style>
