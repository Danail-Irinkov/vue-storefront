import Vue from 'vue'
import VueI18n from 'vue-i18n'
import { Logger } from '@vue-storefront/core/lib/logger'
import { once } from '@vue-storefront/core/helpers'
import config from 'config'
import axios from 'axios'

const api = axios.create({
  // base URL is read from the "constructor"
  baseURL: 'http://localhost:3000/',
  // here are some default headers
  headers: {
    'Cache-Control': 'no-cache',
    'Content-type': 'application/json'
  },
  // 10 second timeout...
  timeout: 150000
})

once('__VUE_EXTEND_I18N__', () => {
  Vue.use(VueI18n)
})

const loadedLanguages = ['en-US','de-DE', 'bg-BG', 'fr-FR', 'es-ES', 'nl-NL', 'ja-JP', 'ru-RU', 'it-IT', 'pt-BR', 'pl-PL', 'cs-CZ']
//VueI18n.MissingHandler
const ProCCMissingTranslationHandler = (locale: string, missingText: string): void => {
  console.log('Translation Missing for ', locale, missingText)
  if (process.env.NODE_ENV === 'development') {
    api.post('fillInMissingTranslation', {locale, missingText})
      .then((res)=>{
        // console.log('fillInMissingTranslation RES: ', res.status)
      })
      .catch((e)=>{
        console.log('fillInMissingTranslation Error', e)
      })
  }
}
const i18n = new VueI18n({
  locale: config.i18n.bundleAllStoreviewLanguages ? config.i18n.defaultLocale : 'en-US', // set locale
  fallbackLocale: 'en-US',
  missing: ProCCMissingTranslationHandler,
  messages: config.i18n.bundleAllStoreviewLanguages ? require('./resource/i18n/multistoreLanguages.json') : {
    'en-US': require('./resource/i18n/en-US.json')
  }
})

function setI18nLanguage (lang: string): string {
  i18n.locale = lang
  return lang
}


/**
 * Lazy load date locales file for current switched language.
 */
const loadDateLocales = async (lang: string = 'en'): Promise<void> => {
  let localeCode = lang.toLocaleLowerCase()
  try { // try to load full locale name
    await import(/* webpackChunkName: "dayjs-locales-[request]" */ `dayjs/locale/${localeCode}`)
  } catch (e) { // load simplified locale name, example: de-DE -> de
    const separatorIndex = localeCode.indexOf('-')
    if (separatorIndex) {
      localeCode = separatorIndex ? localeCode.substr(0, separatorIndex) : localeCode
      try {
        await import(/* webpackChunkName: "dayjs-locales-[request]" */ `dayjs/locale/${localeCode}`)
      } catch (err) {
        Logger.debug('Unable to load translation from dayjs')()
      }
    }
  }
}

export async function loadLanguageAsync (lang: string): Promise<string> {
  await loadDateLocales(lang)
  if (!config.i18n.bundleAllStoreviewLanguages) {
    if (i18n.locale !== lang) {
      if (!loadedLanguages.includes(lang)) {
        try {
          const msgs = await import(/* webpackChunkName: "lang-[request]" */ `./resource/i18n/${lang}.json`)
          i18n.setLocaleMessage(lang, msgs.default)
          loadedLanguages.push(lang)
          return setI18nLanguage(lang)
        } catch (e) { // eslint-disable-line handle-callback-err
          Logger.debug('Unable to load translation')()
          return ''
        }
      }
      return setI18nLanguage(lang)
    }
  } else {
    loadedLanguages.push(lang)
    return setI18nLanguage(lang)
  }
  return lang
}

export default i18n
