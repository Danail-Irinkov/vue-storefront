<template>
  <section class="head-image w-100 bg-cl-th-accent cl-white">
    <!--        // Changes by Dan-->
    <div class="container w-100 h-100" v-if="!isDefaultStore && currentImage && currentImage.image"
         v-lazy:background-image="encodeURI(currentImage.image)"
    >
      <div class="head-image-content">
        <h1 :style="{color: currentImage.title_color}" class="title"
            data-testid="mainSliderTitle"
        >
          {{ currentImage.title }}
        </h1>
        <p
          :style="{color: currentImage.subtitle_color}"
          data-testid="mainSliderSubtitle"
          style="margin-top: 4px"
          class="subtitle mb0 serif h3 procc-title-style text-shadow"
        >
          {{ currentImage.subtitle }}
        </p>
      </div>
    </div>

    <div class="container w-100 h-100" v-else-if="isDefaultStore && defaultStore && defaultStore.image"
         v-lazy:background-image="encodeURI(defaultStore.image)"
    >
      <div class="default-store-class head-image-content">
        <h1 :style="{ color: defaultStore.title_color }" class="title text-shadow"
            data-testid="mainSliderTitle"
        >
<!--          {{ defaultStore.title }}-->
        </h1>
        <p
          :style="{color: defaultStore.subtitle_color }"
          data-testid="mainSliderSubtitle"
          class="subtitle mb0 mt0 serif h2 procc-title-style text-shadow"
        >
          {{ $t(defaultStore.subtitle) }}
        </p>
        <p
          :style="{color: defaultStore.subtitle_color }"
          data-testid="mainSliderSubtitle"
          class="subtitle mb0 mt0 serif h2 procc-title-style text-shadow"
        >
          {{ $t(defaultStore.subtitle2) }}
        </p>
        <div class="default-store-btn-class align-center inline-flex"
             v-if="isDefaultStore"
        >
          <button-outline :link="defaultStore.link" color="light">
            {{ $t(defaultStore.button_text) }}
          </button-outline>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
import ButtonOutline from 'theme/components/procc/ButtonOutlineOutsideLink'
import {mapGetters} from 'vuex'

export default {
  components: {
    ButtonOutline
  },
  props: {
    isDefaultStore: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      defaultStore: {
        image: 'https://cloudinary.hbscdn.org/image/upload/s--9_mD60iD--/q_auto,c_fill,h_1296,w_2800,/v20071006/D9F534C9985893BE25AA7782CEDA7CEE.jpg',
        title: 'ProCC',
        title_color: '#ffffff',
        subtitle: 'Can you make amazing photos?',
        subtitle2: 'Sign up as a CC!',
        subtitle_color: '#ffffff',
        link: 'https://work.procc.co/signup/cc',
        button_text: 'Sign Up'
      },
      currentImage: null
    }
  },
  mounted () {
    // Fixing SSR issue with loading the headImage at client
    this.currentImage = {...this.currentImageGetter}
  },
  computed: {
    ...mapGetters({
      currentImageGetter: 'procc/getHeadImage'
    })
  }
}
</script>

<style lang="scss" scoped>
  .procc-title-style {
    padding-left: 10px !important;
    line-height: 30px !important;
  }
  .text-shadow{
    text-shadow: 1px 1px 0px rgba(244, 222, 242, 0.08), 1px 1px 1px rgba(80, 80, 80, 0.55) !important;
  }

  .default-store-class {
    /*margin-left: 10rem !important;*/
  }

  .default-store-btn-class {
    /*width: 123px;*/
    height: 60px;
    margin: 1rem 0 0 4%;

    & > a {
      width: 100%;
      height: 100%;
    }

    & > button {
      width: 100%;
      min-width: 150px;
      height: 100%;
    }
  }
.head-image {
  /*display: none;*/
  display: inherit; // Edited by Dan
  @media (min-width: 767px) {
    display: inherit;
  }

  .head-image-content {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    margin-left: 15%;

    .title {
      font-size: 2.4rem;
      margin-bottom: 0;
      font-family: 'Roboto', sans-serif;
    }

    .subtitle {
      font-size: 1.2rem;
      max-width: 340px;
      font-family: 'Roboto', sans-serif;
      line-height: 1.2rem;
    }
  }
}

.head-image {
  height: 640px;
}
.container {
  background-size: cover;
  background-position: top center;
  background-repeat: no-repeat;
}
.row {
  height: 640px;
}
@media (max-width: 75em) {
  .head-image {
    height: 400px;
  }
  .title {
    font-size: 50px;
  }
  .subtitle {
    font-size: 20px;
  }
  .row {
    height: 400px;
  }
}
@media (max-width: 64em) {
  .head-image {
    height: 359px;
  }
  .container {
    background-position: left;
  }
  .title {
    font-size: 48px;
  }
  .subtitle {
    font-size: 18px;
  }
  .button {
    font-size: 16px;
  }
  .row {
    height: 359px;
  }
}
</style>
