<template>
  <modal name="modal-switcher" :width="250">
    <p slot="header" style="font-size: 22px; margin-left: 1rem">
      {{ $t('Language') }}
    </p>
    <div slot="content">
      <div :class="{ 'columns': enableColumns }">
        <!--<div class="country country-current">
          <h3>{{ $t(fullCountryName) }}</h3>
          <ul>
            <li><a href="/">{{ $t(fullLanguageName) }}</a></li>
          </ul>
        </div>-->
        <div class="country country-available" v-for="country in country_list" :key="country.name">
          <!--          <h3>{{ $t(storeView.i18n.fullCountryName) }}</h3>-->
          <ul>
            <li style="text-align: center; width: 100%; margin-left: 0px">
              <a style="cursor: pointer; margin-left: auto;margin-right: auto" @click="changeLanguage(country)">
                {{ $t(country.lang_name) }}
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </modal>
</template>
<script>
import Modal from 'theme/components/core/Modal.vue'
import {countries} from 'src/themes/default-procc/helpers/countries.js'
import config from 'config'
import {loadLanguageAsync} from '@vue-storefront/i18n';
export default {
  components: {
    Modal
  },
  data () {
    return {
      minCountryPerColumn: 3,
      componentLoaded: false,
      country_list: countries
    }
  },
  computed: {
    fullCountryName () {
      return config.i18n.fullCountryName
    },
    fullLanguageName () {
      return config.i18n.fullLanguageName
    },
    enableColumns () {
      const enableStoreViews = Object.keys(this.storeViews)
      return enableStoreViews.length > this.minCountryPerColumn
    },
    storeViews () {
      console.log('config.storeViews', config.storeViews)
      console.log('config.i18n', config.i18n)
      return Object.keys(config.storeViews).reduce((storeViews, storeCode) => {
        if (this.isValidStoreCode(storeCode)) {
          storeViews[storeCode] = config.storeViews[storeCode]
        }
        return storeViews
      }, {})
    }
  },
  mounted () {
    this.$nextTick(() => {
      this.componentLoaded = true
      this.$bus.$emit('modal-show', 'modal-switcher')
    })
  },
  methods: {
    changeLanguage (country) {
      console.log('Changing Lang to: ', country)
      // i18n.locale = country.language
      loadLanguageAsync(country.language)
        .then((res) => {
          console.log('changeLanguage RES:', res)
        })
        .catch((e) => {
          console.log('changeLanguage Error:', e)
        })
    },
    close () {
      this.$bus.$emit('modal-hide', 'modal-switcher')
    },
    isValidStoreCode (storeCode) {
      const storeView = config.storeViews[storeCode]
      return !!(storeView && typeof storeView === 'object' && storeView.i18n)
    }
  }
}
</script>
<style lang="scss" scoped>
  ::v-deep .modal-close .material-icons {
    margin: 0px 0 47px 39px!important;
  }
  ::v-deep .modal-header  {
    padding: 10px 10px 20px 10px!important;
  }
  h3 {
    margin-top: 0;
    margin-bottom: 0.5em;
  }
  .columns {
    -moz-column-count: 2;
    column-count: 2;
    column-gap: 15px;
    .country {
      -webkit-column-break-inside: avoid;
      page-break-inside: avoid;
      break-inside: avoid;
    }
  }
  .country {
    margin-bottom: 2em;
    color: #4f4f4f;
  }
  ul {
    margin: 0;
    padding: 0;
    list-style-type: none;
    margin-left: -1em;
    li {
      display: inline-block;
      margin-left: 1em;
      a {
        font-size: 0.9em;
      }
    }
  }
</style>
