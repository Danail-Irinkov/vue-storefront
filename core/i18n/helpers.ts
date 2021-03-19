import config from 'config'

export const currentBuildLocales = (): string[] => {
  // REPLACED BY DAN TO LOAD ALL LOCALES
  // const defaultLocale = config.i18n.defaultLocale || 'en-US'
  // const multistoreLocales = config.storeViews.multistore
  //   ? Object.values(config.storeViews)
  //     .map((store: any) => store && typeof store === 'object' && store.i18n && store.i18n.defaultLocale)
  //     .filter(Boolean)
  //   : []
  // const locales = multistoreLocales.includes(defaultLocale)
  //   ? multistoreLocales
  //   : [defaultLocale, ...multistoreLocales]
  //
  // return locales

  return ['en-US', 'de-DE', 'bg-BG', 'fr-FR', 'es-ES', 'nl-NL', 'ja-JP', 'ru-RU', 'it-IT', 'pt-BR', 'pl-PL', 'cs-CZ']
}

export const transformToShortLocales = (locales: string[]): string[] => locales.map(locale => {
  const separatorIndex = locale.indexOf('-')
  const shortLocale = separatorIndex ? locale.substr(0, separatorIndex) : locale

  return shortLocale
})

export const buildLocaleIgnorePattern = (): RegExp => {
  const locales = transformToShortLocales(currentBuildLocales())
  const localesRegex = locales.map(locale => `${locale}$`).join('|')

  return new RegExp(localesRegex)
}
