<template>
  <div class="card store-card animated fadeIn" @click="openLink(storeUrl)">
    <div class="card-image" >
        <div class="store-card-cover-image"
             v-lazy:background-image="storeImage.image"
             :alt="$t('noImage')">
        <div class="store-card-cover-image-overlay"></div>
      </div>
    </div>
    <div class="card-body">
        <div class="store-info">
          <div class="author">
            <div class="images">
              <div v-lazy:background-image="storeImage.logo" class="avatar" />
            </div>
          </div>

          <h4 class="title">
            {{ storeName }}
          </h4>
        </div>
        <div class="store-categories">
          <div class="category-row">
            <div v-for="category in storeCategories"
                 class="category-image-wrapper"
                 @click.stop="openLink('/'+storeCode+category.link)">
              <div class="category-image"
                   v-lazy:background-image="category.image">
              </div>
            </div>
          </div>
        </div>
    </div>
  </div>
</template>
<script>
export default {
  components: {
  },
  mounted () {
    this.getStoreImages()
  },
  methods: {
    async openLink (link) {
      // console.log('openLink', link)
      window.location.href = link
    },
    async getStoreImages () {
      const storeImages = await import(/* webpackChunkName: "vsf-head-img-[request]" */ `theme/resource/banners/${this.storeCode}_main-image.json`)
      const storeBanners = await import(/* webpackChunkName: "vsf-head-img-[request]" */ `theme/resource/banners/${this.storeCode}_store_banners.json`)
      this.storeImage = storeImages.image
      this.storeCategories = [...storeBanners.mainBanners, ...storeBanners.smallBanners]
    }
  },
  data () {
    return {
      storeImage: {},
      storeCategories: [],
    }
  },
  props: {
    storeUrl: {
      type: [String],
      required: true
    },
    storeCode: {
      type: [String],
      required: true
    },
    storeName: {
      type: [String],
      required: true
    }
  }
}
</script>
<style lang="scss" scoped>
  .store-card{
    cursor: pointer;
    border-radius: 10px;
    width: 100%;
    height: calc(10vw + 230px);
    .card-image{
      width: 100%;
      overflow: hidden;
      height: 100%;
      border-radius: 10px;
      position: relative;
      -webkit-transform-style: preserve-3d;
      -moz-transform-style: preserve-3d;
      transform-style: preserve-3d;

      img {
        width: 100%;
      }
    }

    .store-card-cover-image{
      width: 100%;
      height: 100%;
      background-repeat: no-repeat;
      background-position: center;
      background-size: cover;
      border-radius: 10px;
      & > .store-card-cover-image-overlay{
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background:  linear-gradient(
            to bottom,
            rgba(0, 0, 0, 0),
            rgba(0, 0, 0, 0.6) 500%
        );
      }
    }
    .card-body {
      position: absolute;
      top: 0;
      width: 100%;
      /*height: 100%;*/
      height: calc(10vw + 230px);
      border-radius: 10px;
      padding-left: 10px!important;
      padding-top: 0!important;
      padding-bottom: 0!important;

      .store-info {
        display: inline-block;
        height: 100%;
        width: 174px;
        position: absolute;
        top: 0;
        left: 0;
        .author{
          text-align: center;
          text-transform: none;
          margin: 7px;
          position: relative;
          height: 175px;
        }
        .avatar {
          width: calc(10vw + 80px);
          height: calc(10vw + 80px);
          max-width: 150px;
          max-height: 150px;
          border: 4px solid #EEEEEE;
          position: relative;
          margin: 0;
          background-repeat: no-repeat;
          background-position: center;
          background-size: cover;
        }
        .title{
          font-family: 'Roboto', sans-serif;
          line-height: 24px;
          font-size: 24px;
          color: white;
          text-shadow: 1px 1px 0px rgba(244, 222, 242, 0.08), 1px 1px 1px rgba(80, 80, 80, 0.55) !important;
          margin-top: 10px;
          margin-bottom: 10px;
          position: absolute;
          bottom: 0;
          width: calc(100% - 25px);
          text-align: start;
          margin-left: 15px;
        }
      }
      .store-categories {
        display: inline-block;
        width: calc(100% - 208px);
        margin-left: 180px;
        height: 100%;
        text-align: end;
        justify-content: end;

        .category-row{
          position: absolute;
          right: 46px;
          bottom: -2px;

          .category-image-wrapper {
            z-index: 99;
            display: inline-block;
            width: 14vw;
            max-width: 120px;
            height: 120px;
            position: relative;
            margin: 0px 1px;
            border-radius: 10px;
            border: 2px solid #EEEEEE;
            overflow: hidden;
            cursor: pointer;
            background-color: #ffffff;

            .category-image {
              display: block;
              width: 100%;
              height: 100%;
              background-repeat: no-repeat;
              background-position: center;
              background-size: cover;
              transform: scale(1.25);

              &:hover {
                opacity: 0.85!important;
              }
            }
          }
        }
      }
    }
  }
</style>
