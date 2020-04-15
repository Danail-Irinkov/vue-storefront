<template>
  <div
    class="inline-flex relative dropdown"
    @click.self="showMenu = true"
    @keyup.enter="showMenu = true"
    tabindex="0"
    role="button"
    @mouseover="showMenu = true"
    @mouseout="showMenu = false"
    :aria-label="$t('Change Language')">
    <button type="button"  class="bg-cl-transparent brdr-none p0 weight-700" style="font-size: 18px;">
      {{getSelectedLanguage}}
    </button>
    <no-ssr>
      <div :class="['dropdown-content bg-cl-primary align-left sans-serif lh20 weight-400', !showMenu ? 'dropdown-content__hidden' : '']">
        <div class="py5">
          <div v-for="(country, index) in country_list" :key="index" @click="changeLanguage(country)" class="block py5 px10">
            {{ $t(country.lang_name) }}
          </div>
        </div>
      </div>
    </no-ssr>
  </div>
</template>

<script>
import NoSSR from 'vue-no-ssr'
import {countries} from 'src/themes/default-procc/helpers/countries.js'
import {loadLanguageAsync} from "@vue-storefront/i18n"
import i18n from '@vue-storefront/i18n'
export default {
  name: 'LanguageSelection',
  components: {
    'no-ssr': NoSSR
  },
  data () {
    return {
      showMenu: false,
      country_list: countries
    }
  },
  computed: {
    getSelectedLanguage () {
      // return i18n.locale
      if(i18n.locale) {
        const country = this.country_list.find((c) => {
          return c.language === i18n.locale
        })
        return country.lang_name
      } else
        return i18n.t('English')
    }
  },
  methods: {
    changeLanguage (country) {
      console.log('Changing Lang to: ', country)
      // i18n.locale = country.language
      loadLanguageAsync(country.language)
        .then((res)=>{
          console.log('changeLanguage RES:', res)
        })
        .catch((e)=>{
          console.log('changeLanguage Error:', e)
        })
    },
  }
}
</script>

<style lang="scss" scoped>
  @import '~theme/css/base/global_vars';
  @import '~theme/css/variables/colors';
  @import '~theme/css/helpers/functions/color';
  $color-icon-hover: color(secondary, $colors-background);

  .dropdown {

    button {
      pointer-events: none;
    }

    .dropdown-content {
      display: none;
      position: absolute;
      right: 0;
      top: 100%;
      width: 120px;
      z-index: 1;
      box-shadow: 0 0 10px rgba(0,0,0,0.1);
    }

    a {
      opacity: .6;

      &:hover,
      &:focus {
        background-color: $color-icon-hover;
        opacity: 1;
      }

    }

    @media (min-width: 768px) {
      &:hover .dropdown-content:not(.dropdown-content__hidden),
      &:focus .dropdown-content:not(.dropdown-content__hidden) {
        display: block;
      }

      &:focus-within {
        background-color: $color-icon-hover;
        opacity: 1;
        .dropdown-content:not(.dropdown-content__hidden) {
          display: block;
        }
      }
    }

  }
</style>
