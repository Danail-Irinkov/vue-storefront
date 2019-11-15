const fs = require('fs')
const path = require('path')
const express = require('express')
const bodyParser = require('body-parser');
const ms = require('ms')
const compile = require('lodash.template')
const rootPath = require('app-root-path').path
const resolve = file => path.resolve(rootPath, file)

const cache = require('./utils/cache-instance')
const apiStatus = require('./utils/api-status')
const HTMLContent = require('../pages/Compilation')
let config = require('config')
const Store = require('data-store')
const _ = require('lodash')
const storefront = new Store({path: path.resolve('./config/production.json')});
// const localConfig = new Store({path: path.resolve('./config/local.json')});

const compileOptions = {
  escape: /{{([^{][\s\S]+?[^}])}}/g,
  interpolate: /{{{([\s\S]+?)}}}/g
}
const NOT_ALLOWED_SSR_EXTENSIONS_REGEX = new RegExp(`(.*)(${config.server.ssrDisabledFor.extensions.join('|')})$`)

const isProd = process.env.NODE_ENV === 'production'
process.noDeprecation = true

const app = express()
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

function createRenderer (bundle, clientManifest, template) {
  // https://github.com/vuejs/vue/blob/dev/packages/vue-server-renderer/README.md#why-use-bundlerenderer
  return require('vue-server-renderer').createBundleRenderer(bundle, {
    clientManifest,
    // runInNewContext: false,
    cache: require('lru-cache')({
      max: 1000,
      maxAge: 1000 * 60 * 15
    })
  })
}

const templatesCache = {}
let renderer
for (const tplName of Object.keys(config.ssr.templates)) {
  const fileName = resolve(config.ssr.templates[tplName])
  if (fs.existsSync(fileName)) {
    const template = fs.readFileSync(fileName, 'utf-8')
    templatesCache[tplName] = compile(template, compileOptions)
  }
}
if (isProd) {
  // In production: create server renderer using server bundle and index HTML
  // template from real fs.
  // The server bundle is generated by vue-ssr-webpack-plugin.
  const clientManifest = require(resolve('dist/vue-ssr-client-manifest.json'))
  const bundle = require(resolve('dist/vue-ssr-bundle.json'))
  // src/index.template.html is processed by html-webpack-plugin to inject
  // build assets and output as dist/index.html.
  // TODO: Add dynamic templates loading from (config based?) list
  renderer = createRenderer(bundle, clientManifest)
} else {
  // In development: setup the dev server with watch and hot-reload,
  // and create a new renderer on bundle / index template update.
  require(resolve('core/build/dev-server'))(app, (bundle, template) => {
    templatesCache['default'] = compile(template, compileOptions) // Important Notice: template switching doesn't work with dev server because of the HMR
    renderer = createRenderer(bundle)
  })
}

function invalidateCache (req, res) {
  if (config.server.useOutputCache) {
    if (req.query.tag && req.query.key) { // clear cache pages for specific query tag
      if (req.query.key !== config.server.invalidateCacheKey) {
        console.error('Invalid cache invalidation key')
        apiStatus(res, 'Invalid cache invalidation key', 500)
        return
      }
      console.log(`Clear cache request for [${req.query.tag}]`)
      let tags = []
      if (req.query.tag === '*') {
        tags = config.server.availableCacheTags
      } else {
        tags = req.query.tag.split(',')
      }
      const subPromises = []
      tags.forEach(tag => {
        if (config.server.availableCacheTags.indexOf(tag) >= 0 || config.server.availableCacheTags.find(t => {
          return tag.indexOf(t) === 0
        })) {
          subPromises.push(cache.invalidate(tag).then(() => {
            console.log(`Tags invalidated successfully for [${tag}]`)
          }))
        } else {
          console.error(`Invalid tag name ${tag}`)
        }
      })
      Promise.all(subPromises).then(r => {
        apiStatus(res, `Tags invalidated successfully [${req.query.tag}]`, 200)
      }).catch(error => {
        apiStatus(res, error, 500)
        console.error(error)
      })
    } else {
      apiStatus(res, 'Invalid parameters for Clear cache request', 500)
      console.error('Invalid parameters for Clear cache request')
    }
  } else {
    apiStatus(res, 'Cache invalidation is not required, output cache is disabled', 200)
  }
}

const serve = (path, cache, options) => express.static(resolve(path), Object.assign({
  fallthrough: false,
  setHeaders: cache && isProd ? function (res, path) {
    const mimeType = express.static.mime.lookup(path);
    let maxAge = config.expireHeaders.default;
    if (config.expireHeaders.hasOwnProperty(mimeType)) {
      maxAge = config.expireHeaders.get(mimeType);
    }
    res.setHeader('Cache-Control', 'public, max-age=' + ms(maxAge));
  } : null
}, options))

const themeRoot = require('../build/theme-path')

app.use('/dist', serve('dist', true))
app.use('/assets', serve(themeRoot + '/assets', true))
app.use('/service-worker.js', serve('dist/service-worker.js', false, {
  setHeaders: function (res, path, stat) {
    res.set('Content-Type', 'text/javascript; charset=UTF-8')
  }
}))

const serverExtensions = require(resolve('src/server'))
serverExtensions.registerUserServerRoutes(app)

app.get('/health', healthCheck)
app.post('/invalidate', invalidateCache)
app.post('/customCall', (req, res) => {
  let storeData = req.body;
  let mapStoreUrlsFor = storefront.get('storeViews.mapStoreUrlsFor');
  let store_data = {
    storeCode: storeData.storefront_url,
    storeName: _.startCase(storeData.magento_store_name),
    disabled: false,
    storeId: parseInt(storeData.magento_store_id),
    name: _.startCase(storeData.magento_store_name),
    url: `/${storeData.storefront_url}`,
    elasticsearch: {
      host: 'https://store.procc.co/api/catalog',
      index: `vue_storefront_catalog_${_.snakeCase(storeData.storefront_url)}`
    },
    tax: {
      defaultCountry: 'BG',
      defaultRegion: '',
      calculateServerSide: true,
      sourcePriceIncludesTax: false
    },
    i18n: {
      fullCountryName: 'Bulgaria',
      fullLanguageName: 'Bulgarian',
      defaultCountry: 'BG',
      defaultLanguage: 'EN',
      defaultLocale: 'en-US',
      currencyCode: 'EUR',
      currencySign: 'EUR',
      dateFormat: 'HH:mm D-M-YYYY'
    }
  }
  let storefront_setting = storeData.storefront_setting
  // Main Image Object
  let storeMainImage = {
    'working_hours': storefront_setting.working_hours,
    'title': storefront_setting.banner.title,
    'subtitle': storefront_setting.banner.subtitle,
    'logo': storefront_setting.store_logo.original,
    'link': storefront_setting.banner.link,
    'image': storefront_setting.banner.banner_photo.optimized,
    'contact_information': storefront_setting.contact_information,
    'about_text': storefront_setting.about_text,
    'brand': storeData.brand._id,
    'is_cc_store': storeData.brand.is_cc
  };
  // Main Banners and store categories and store policies
  const mainImage = new Store({path: path.resolve(`../vue-storefront/src/themes/default/resource/banners/${store_data.storeCode}_main-image.json`)});
  const StoreCategories = new Store({path: path.resolve(`../vue-storefront/src/themes/default/resource/banners/${store_data.storeCode}_store_categories.json`)});
  const storePolicies = new Store({path: path.resolve(`../vue-storefront/src/themes/default/resource/policies/${store_data.storeCode}_store_policies.json`)});
  // If Store has then delete store related all the data
  if ((storefront.has(`storeViews.${store_data.storeCode}`))) {
    storefront.del(`storeViews.${store_data.storeCode}`);
    mainImage.unlink();
    StoreCategories.unlink();
  }
  // start set the store config file
  if ((storefront.has(`storeViews.${store_data.storeCode}`))) {
    storefront.del(`storeViews.${store_data.storeCode}`);
    // mainImage.unlink();
    // StoreCategories.unlink();
  }
  if ((!_.includes(mapStoreUrlsFor, store_data.storeCode)) || (!_.includes(storefront.get('storeViews.mapStoreUrlsFor'), store_data.storeCode))) {
    // set value in mapStoreUrlsFor
    mapStoreUrlsFor = _.concat(mapStoreUrlsFor, store_data.storeCode)
    storefront.set('storeViews.mapStoreUrlsFor', mapStoreUrlsFor);
  }
  storefront.set(`storeViews.${store_data.storeCode}`, store_data);
  // end set store config file
  // start set store categories main Banner and samll Banners
  // let magentoStoreCategories = _.take(_.orderBy(_.filter(storeData.store_categories, {'isCategoryCreatedInMagento': true}), 'createdAt', 'desc'), 3);
  let magentoStoreCategories = _.take(_.orderBy(_.filter(storeData.store_category, {'isCategoryCreatedInMagento': true}), 'createdAt', 'desc'), 6)
  let countCategories = magentoStoreCategories.length;
  console.log('Categories >>>>>>>>>>>>>>>>>>>>>>>>>>')
  console.log(magentoStoreCategories)
  console.log('Category Count >>>>>>>>>>>>>>>>>>>>>')
  console.log(countCategories)
  console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>')
  let mainBanners = [];
  let smallBanners = [];
  if (countCategories >= 1) {
    mainBanners = [
      {
        'title': magentoStoreCategories[0].name,
        'subtitle': magentoStoreCategories[0].description,
        'image': magentoStoreCategories[0].cover_photo.optimized,
        'link': '/' + _.kebabCase(magentoStoreCategories[0].name),
        'storeCode': storeData.storefront_url,
        'productCount': magentoStoreCategories[0].products.length,
        'category_id': parseInt(magentoStoreCategories[0].magento_category_id)
      }
    ];
    if (countCategories >= 2) {
      smallBanners = [
        {
          'title': magentoStoreCategories[1].name,
          'subtitle': magentoStoreCategories[1].description,
          'image': magentoStoreCategories[1].cover_photo.optimized,
          'link': '/' + _.kebabCase(magentoStoreCategories[1].name),
          'storeCode': storeData.storefront_url,
          'productCount': magentoStoreCategories[1].products.length,
          'category_id': parseInt(magentoStoreCategories[1].magento_category_id)
        }
      ]
      if (countCategories >= 3) {
        smallBanners.push({
          'title': magentoStoreCategories[2].name,
          'subtitle': magentoStoreCategories[2].description,
          'image': magentoStoreCategories[2].cover_photo.optimized,
          'link': '/' + _.kebabCase(magentoStoreCategories[2].name),
          'storeCode': storeData.storefront_url,
          'productCount': magentoStoreCategories[2].products.length,
          'category_id': parseInt(magentoStoreCategories[2].magento_category_id)
        });
      }
    }
    StoreCategories.set('mainBanners', mainBanners);
    StoreCategories.set('smallBanners', smallBanners);
  }
  // end set store categories main Banner and small Banner
  // set Main Image
  mainImage.set('image', storeMainImage)

  let policies = []

  if (!_.isUndefined(storefront_setting.privacy_policy) && !_.isNull(storefront_setting.privacy_policy)) {
    policies.push(storefront_setting.privacy_policy.policy);
  }

  if (!_.isUndefined(storefront_setting.shipping_policy) && !_.isNull(storefront_setting.shipping_policy)) {
    policies.push(storefront_setting.shipping_policy.policy);
  }

  if (!_.isUndefined(storefront_setting.warranty_policy) && !_.isNull(storefront_setting.warranty_policy)) {
    policies.push(storefront_setting.warranty_policy.policy);
  }

  storePolicies.set('policy', policies);
  apiStatus(res, 'Vue Storefront: Custom Call found', 200)
})
app.post('category-link', (req, res) => {
  // start set to product banners link in vue storefront
  let children_data = req.body.children_data
  let storeCode = req.body.storeCode
  const StoreCategories = new Store({path: path.resolve(`../vue-storefront/src/themes/default/resource/banners/${storeCode}_store_categories.json`)});
  let MainBanners = !_.isUndefined(StoreCategories.get('mainBanners')) ? StoreCategories.get('mainBanners') : [];
  let TopAndBottomSideBanners = _.isUndefined(StoreCategories.get('smallBanners')) ? StoreCategories.get('smallBanners') : [];
  if (children_data.length >= 1 && MainBanners.length > 0) {
    MainBanners[0].link = `/${_.get(_.find(children_data, ['name', _.get(_.find(MainBanners, 'title'), 'title')]), 'url_path')}`;
    StoreCategories.set('mainBanners', MainBanners);
    if (children_data.length >= 2 && TopAndBottomSideBanners.length > 0) {
      TopAndBottomSideBanners[0].link = `/${_.get(_.find(children_data, ['name', _.get(_.find(TopAndBottomSideBanners, 'title'), 'title')]), 'url_path')}`;
      StoreCategories.set('smallBanners', TopAndBottomSideBanners);
      if (children_data.length >= 3 && TopAndBottomSideBanners.length > 1) {
        TopAndBottomSideBanners[1].link = `/${_.get(_.find(children_data, ['name', _.get(_.find(TopAndBottomSideBanners, 'title'), 'title')]), 'url_path')}`;
        StoreCategories.set('smallBanners', TopAndBottomSideBanners);
      }
    }
  }
  apiStatus(res, 'Vue Storefront: Custom Call found', 200)
  // end set to product banners
})
app.post('product-link', (req, res) => {
// start set to product banners link in vue storefront
  let products = req.body.products;
  let storeCode = req.body.storeCode
  const StoreCategories = new Store({path: path.resolve(`../vue-storefront/src/themes/default/resource/banners/${storeCode}_store_categories.json`)});
  let productBanners = [];
  let category_ids = [];
  if (StoreCategories.has('mainBanners')) {
    category_ids.push(StoreCategories.get('mainBanners.0.category_id'));
  }
  if (StoreCategories.has('smallBanners')) {
    category_ids.push(StoreCategories.get('smallBanners.0.category_id'));
  }
  if (StoreCategories.has('smallBanners')) {
    category_ids.push(StoreCategories.get('smallBanners.1.category_id'));
  }
  _.forEach(products, (product) => {
    if (_.includes(category_ids, _.get(_.find(_.get(product, '_source.category'), 'category_id'), 'category_id'))) {
      let link = !_.isUndefined(product._source.url_path) ? product._source.url_path : product._source.url_key;
      let Banner = {
        'title': product._source.name,
        'subtitle': product._source.description,
        'image': config.magento2.imgUrl + product._source.image,
        'link': `/p/${product._source.sku}/${link}`,
        'category': product._source.category
      };
      productBanners.push(Banner);
    }
  });
  StoreCategories.set('productBanners', productBanners);
  apiStatus(res, 'Vue Storefront: Custom Call found', 200)
  // end set to product banners
})
app.post('disable-store', (req, res) => {
  let storeData = req.body.storeData;
  let status = storeData.status;
  if (storefront.has(`storeViews.${storeData.store_code}.disabled`)) {
    storefront.set(`storeViews.${storeData.store_code}.disabled`, status)
  }
  apiStatus(res, 200);
})
app.post('delete-store', (req, res) => {
  let storeData = req.body
  const mainImage = new Store({path: path.resolve(`../vue-storefront/src/themes/default/resource/banners/${storeData.storeCode}_main-image.json`)});
  const StoreCategories = new Store({path: path.resolve(`../vue-storefront/src/themes/default/resource/banners/${storeData.storeCode}_store_categories.json`)});
  const storePolicies = new Store({path: path.resolve(`../vue-storefront/src/themes/default/resource/policies/${storeData.storeCode}_store_policies.json`)});
  if (storefront.has(`storeViews.${storeData.storeCode}`)) {
    storefront.del(`storeViews.${storeData.storeCode}`)
    storefront.set('storeViews.mapStoreUrlsFor', _.pull(storefront.get('storeViews.mapStoreUrlsFor'), storeData.storeCode))
    mainImage.unlink()
    StoreCategories.unlink()
    storePolicies.unlink()
  } else {
    console.log('Store does not exist', storeData)
    apiStatus(res, 500);
  }
})

app.get('/invalidate', invalidateCache)

app.get('*', (req, res, next) => {
  if (NOT_ALLOWED_SSR_EXTENSIONS_REGEX.test(req.url)) {
    apiStatus(res, 'Vue Storefront: Resource is not found', 404)
    return
  }

  const s = Date.now()
  const errorHandler = err => {
    if (err && err.code === 404) {
      if (NOT_ALLOWED_SSR_EXTENSIONS_REGEX.test(req.url)) {
        apiStatus(res, 'Vue Storefront: Resource is not found', 404)
        console.error(`Resource is not found : ${req.url}`)
        next()
      } else {
        res.redirect('/page-not-found')
        console.error(`Redirect for resource not found : ${req.url}`)
      }
    } else {
      res.redirect('/error')
      console.error(`Error during render : ${req.url}`)
      console.error(err)
      next()
    }
  }

  const dynamicRequestHandler = renderer => {
    if (!renderer) {
      res.setHeader('Content-Type', 'text/html')
      res.status(202).end(HTMLContent)
      return next()
    }
    const context = {
      url: decodeURI(req.url),
      output: {
        prepend: (context) => { return '' }, // these functions can be replaced in the Vue components to append or prepend some content AFTER all other things are rendered. So in this function You may call: output.prepend() { return context.renderStyles() } to attach styles
        append: (context) => { return '' },
        appendHead: (context) => { return '' },
        template: 'default',
        cacheTags: null
      },
      server: {
        app: app,
        response: res,
        request: req
      },
      meta: null,
      vs: {
        config: config,
        storeCode: req.header('x-vs-store-code') ? req.header('x-vs-store-code') : process.env.STORE_CODE
      }
    }
    renderer.renderToString(context).then(output => {
      if (!res.get('content-type')) {
        res.setHeader('Content-Type', 'text/html')
      }
      let tagsArray = []
      if (config.server.useOutputCacheTagging && context.output.cacheTags !== null) {
        tagsArray = Array.from(context.output.cacheTags)
        const cacheTags = tagsArray.join(' ')
        res.setHeader('X-VS-Cache-Tags', cacheTags)
        console.log(`cache tags for the request: ${cacheTags}`)
      }
      const contentPrepend = (typeof context.output.prepend === 'function') ? context.output.prepend(context) : ''
      const contentAppend = (typeof context.output.append === 'function') ? context.output.append(context) : ''

      output = contentPrepend + output + contentAppend
      if (context.output.template) { // case when we've got the template name back from vue app
        if (!isProd) context.output.template = 'default' // in dev mode we can not use pre-rendered HTML templates
        if (templatesCache[context.output.template]) { // please look at: https://github.com/vuejs/vue/blob/79cabadeace0e01fb63aa9f220f41193c0ca93af/src/server/template-renderer/index.js#L87 for reference
          output = templatesCache[context.output.template](context).replace('<!--vue-ssr-outlet-->', output)
        } else {
          throw new Error(`The given template name ${context.output.template} does not exist`)
        }
      }
      if (config.server.useOutputCache && cache) {
        cache.set(
          'page:' + req.url,
          { headers: res.getHeaders(), body: output },
          tagsArray
        ).catch(errorHandler)
      }
      res.end(output)
      console.log(`whole request [${req.url}]: ${Date.now() - s}ms`)
      next()
    }).catch(errorHandler)
  }

  const dynamicCacheHandler = () => {
    if (config.server.useOutputCache && cache) {
      cache.get(
        'page:' + req.url
      ).then(output => {
        if (output !== null) {
          if (output.headers) {
            for (const header of Object.keys(output.headers)) {
              res.setHeader(header, output.headers[header])
            }
          }
          res.setHeader('X-VS-Cache', 'Hit')
          if (output.body) {
            res.end(output.body)
          } else {
            res.setHeader('Content-Type', 'text/html')
            res.end(output.body)
          }
          res.end(output)
          console.log(`cache hit [${req.url}], cached request: ${Date.now() - s}ms`)
          next()
        } else {
          res.setHeader('Content-Type', 'text/html')
          res.setHeader('X-VS-Cache', 'Miss')
          console.log(`cache miss [${req.url}], request: ${Date.now() - s}ms`)
          dynamicRequestHandler(renderer) // render response
        }
      }).catch(errorHandler)
    } else {
      dynamicRequestHandler(renderer)
    }
  }

  if (config.server.dynamicConfigReload) {
    delete require.cache[require.resolve('config')]
    config = require('config') // reload config
    if (typeof serverExtensions.configProvider === 'function') {
      serverExtensions.configProvider(req).then(loadedConfig => {
        config = Object.assign(config, loadedConfig) // merge loaded conf with build time conf
        dynamicCacheHandler()
      }).catch(error => {
        if (config.server.dynamicConfigContinueOnError) {
          dynamicCacheHandler()
        } else {
          console.log('config provider error:', error)
          if (req.url !== '/error') {
            res.redirect('/error')
          }
          dynamicCacheHandler()
        }
      })
    } else {
      config = require('config') // reload config
      dynamicCacheHandler()
    }
  } else {
    dynamicCacheHandler()
  }
})

async function healthCheck (req, res) {
  try {
    return apiStatus(res, 'ProCC VSF Online', 200);
  } catch (e) {
    return apiStatus(res, e, 502);
    // return apiStatus(res, 'ERROR ProCC VSF-API Not Connected', 502);
  }
}

let port = process.env.PORT || config.server.port
const host = process.env.HOST || config.server.host
const start = () => {
  app.listen(port, host)
    .on('listening', () => {
      console.log(`Vue Storefront Server started at http://${host}:${port}`)
    })
    .on('error', (e) => {
      if (e.code === 'EADDRINUSE') {
        port = parseInt(port) + 1
        console.log(`The port is already in use, trying ${port}`)
        start()
      }
    })
}
start()
