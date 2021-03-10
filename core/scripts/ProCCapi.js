const {kebabForLink} = require('./KebabForLink');
const path = require('path');
const bodyParser = require('body-parser');
const apiStatus = require('./utils/api-status');
const Store = require('data-store');
const _ = require('lodash');
const request = require('request');
// const ProCCAPI = require('../../src/themes/default-procc/helpers/procc_api.js'); // NOT WORKING DUE TO ES6 syntax...
const ProCCAPI = require('./procc_api_es5.js')();
// console.log('ProCCAPI.getStoreData', ProCCAPI.getStoreData)
// !!!!! CORE MODULES AREN'T TRIGGERING HOT-RELOAD !!!!!

// CSV PROCESSING
const csv = require('csv-parser');
const fs = require('fs');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

let storefrontConfig;
if (process.env.NODE_ENV === 'development') {
  storefrontConfig = new Store({path: path.resolve('./config/local.json')});
} else {
  storefrontConfig = new Store({path: path.resolve('./config/production.json')});
}
console.log('START process.env.NODE_ENV: ', process.env.NODE_ENV);
// console.log('START storefrontConfig: ', storefrontConfig.clone());
console.log('START storefrontConfig: ');
let fileWritePromise = null
module.exports = (config, app) => {
  app.use(bodyParser.urlencoded({extended: false}));
  app.use(bodyParser.json());

  app.get('/health', (req, res) => {
    try {
      return apiStatus(res, 'ProCC VSF Online', 200);
    } catch (e) {
      return apiStatus(res, e, 502);
    }
  });

  app.get('/translateTranslation', async (req, res) => {
    try {
      if (process.env.NODE_ENV === 'development') {
        let file_name = './temp/out.csv'
        let lang = 'bg'
        let source_array = await convertCSVToJSONArray(file_name)
        let translated_data = (await ProCCAPI.translateJSONArray({lang, source_array})).data.translated_data

        let output_path = './temp/out_translated.csv'
        if (fs.existsSync(output_path)) {
          output_path = output_path.replace('.csv', '_' + Math.random().toFixed(3) * 1000 + '.csv')
        }
        const csvWriter = createCsvWriter({
          path: output_path,
          alwaysQuote: true,
          header: [
            {id: 'key', title: 'keys'},
            {id: 'value', title: 'values'}
          ]
        })

        await csvWriter.writeRecords(translated_data)
        console.log('The CSV file was written')
        apiStatus(res, 'Translation Translated and Saved', 200)
      } else {
        return apiStatus(res, 'Not working in Production', 502);
      }
    } catch (e) {
      return apiStatus(res, e, 502);
    }
  });

  app.post('/fillInMissingTranslation', async (req, res) => {
    try {
      const oldPromise = _.cloneDeep(fileWritePromise)
      fileWritePromise = new Promise(async (resolve, reject) => {
        if (oldPromise) await oldPromise
        try {
          let locale = req.body.locale
          let missingText = req.body.missingText
          let file_path = './core/i18n/resource/i18n/'
          let input_file_path = file_path + locale + '.csv'
          let output_file_path = './temp/out.csv'
          let original_data = await convertCSVToJSONArray(input_file_path)
          let extracted_data = [{value: 'asd'}]

          if (fs.existsSync('./temp/out.csv')) {
            extracted_data = await convertCSVToJSONArray(output_file_path)
          }
          let append_data = []

          if (!_.some(original_data, (node) => node.value === missingText) &&
            !_.some(extracted_data, (node) => node.value === missingText)) {
            console.log('MissingTranslation input', locale, missingText)
            append_data.push({
              key: String(missingText),
              value: String(missingText)
            })
            const csvWriter = createCsvWriter({
              path: output_file_path,
              alwaysQuote: true,
              append: true,
              header: [
                {id: 'key', title: 'keys'},
                {id: 'value', title: 'values'}
              ]
            })

            return csvWriter
              .writeRecords(append_data)
              .then(() => {
                // console.log('The CSV file was written')
                resolve(apiStatus(res, 'Translation Added', 200))
              })
          } else {
            resolve(apiStatus(res, 'Translation Skipped', 200))
          }
        } catch (e) {
          console.log('Error: failed to write csv')
          reject(e)
        }
      })
    } catch (e) {
      return apiStatus(res, e, 502);
    }
  });

  app.post('/test', (req, res) => {
    apiStatus(res, testKebab(), 200)
  });
  app.post('/updateStorefrontSettings', (req, res) => {
    let storeData = req.body;
    // Setting VSF configs for new store
    // set Store Policies
    setStorePolicies(config, storeData);
    // set Main Image
    // console.log('setStoreMainImage', storeData, 'setStoreMainImage')
    setStoreMainImage(config, storeData);

    // set Store Categories - DISABLED DUE TO also running it separately in /category-link
    // setCategoryBanner(storeData)

    // Set 'mapStoreUrlsFor' to enable routing to the store
    setMapStoreUrlsFor(storeData);

    // set Store Data
    setStoreData(config, storeData);

    // I DONT UNDERSTAND ! If Store has then delete store related all the data
    // if ((storefrontConfig.has(`storeViews.${store_data.storeCode}`))) {
    //   storefrontConfig.del(`storeViews.${store_data.storeCode}`);
    //   mainImage.unlink();
    //   StoreBanners.unlink();
    // }
    //  I DONT UNDERSTAND !  start set the store config file
    // if ((storefrontConfig.has(`storeViews.${store_data.storeCode}`))) {
    //   storefrontConfig.del(`storeViews.${store_data.storeCode}`);
    //   // mainImage.unlink();
    //   // StoreBanners.unlink();
    // }

    // end set store config file

    apiStatus(res, 'Vue Storefront: /updateStorefrontSettings Success', 200)
  });
  app.post('/category-link', async (req, res) => {
    console.log('/category-link STARTED');
    let storeData;
    // console.log('storeData = req.body;', req.body)
    if (req.body.storefront_url && req.body.store_categories) { // DEPRECATED
      storeData = req.body;
    } else if (req.body.storeCode && req.body.brand_id) {
      const storeData_res = await ProCCAPI.getStoreDataVSF(req.body.storeCode, req.body.brand_id)
      // console.log('storeData_res.data.storeData', storeData_res.data.storeData)
      storeData = storeData_res.data.storeData
    } else {
      return apiStatus(res, 'Bad Data Input', 400);
    }
    // set Store Categories
    // console.log(storeData, 'setCategoryBanner DATA:');
    setCategoryBanner(config, storeData);

    apiStatus(res, 'Vue Storefront: /category-link Success', 200);
    // end set to product banners
  });
  app.post('/setProductBanners', (req, res) => {
    // start set to product banners link in vue storefront
    let products = req.body.products;
    let storeCode = req.body.storeCode;
    let imagesRootURL = req.body.imagesRootURL;
    console.log(products, 'setProductBanners DATA:', storeCode, imagesRootURL);
    setProductBanners(config, products, storeCode, imagesRootURL);

    if (process.env.NODE_ENV === 'development' && process.env.NODE_APP_INSTANCE === 'dev') {
      restartVueStorefrontDevDocker()
    }
    apiStatus(res, 'Vue Storefront: /product-link Success', 200);
    // end set to product banners
  });

  app.post('/disable-store', (req, res) => {
    // TODO: add authentication for these API Calls
    let storeData = req.body.storeData;
    let status = storeData.status;
    if (storefrontConfig.has(`storeViews.${storeData.store_code}.disabled`)) {
      storefrontConfig.set(`storeViews.${storeData.store_code}.disabled`, status)
    }
    apiStatus(res, 200);
  });
  app.post('/delete-store', (req, res) => {
    // TODO: add authentication for these API Calls
    let storeData = req.body
    const mainImage = new Store({path: path.resolve(config.themeDir + `/resource/banners/${storeData.storeCode}_main-image.json`)})
    const StoreBanners = new Store({path: path.resolve(config.themeDir + `/resource/banners/${storeData.storeCode}_store_banners.json`)})
    const storePolicies = new Store({path: path.resolve(config.themeDir + `/resource/policies/${storeData.storeCode}_store_policies.json`)})
    console.log('Configs loaded for deletion')
    // TODO: Add better check for all assets of the store -> return success if it is missing or error if exists but fail to delete the store properly
    if (storefrontConfig.has(`storeViews.${storeData.storeCode}`)) {
      console.log('Configs deletion started')
      storefrontConfig.del(`storeViews.${storeData.storeCode}`)
      storefrontConfig.set('storeViews.mapStoreUrlsFor', _.pull(storefrontConfig.get('storeViews.mapStoreUrlsFor'), storeData.storeCode))
      console.log('Configs deletion pulled from config')
      mainImage.unlink()
      StoreBanners.unlink()
      storePolicies.unlink()
      console.log('Configs deletion deleted store configs')
      apiStatus(res, 200)
    } else {
      console.log('Store does not exist', storeData)
      apiStatus(res, 200)
    }
  });
  app.post('/backup-config', (req, res) => {
    // TODO: add authentication for these API Calls
    console.log('/backup-config', config);
    apiStatus(res, config, 200);
  });
  app.post('/rebuild-storefront', async (req, res) => {
    // TODO: add authentication for these API Calls
    console.log('/rebuild-storefront');
    console.log('Rebuilding Vue Storefront ~ 3 min');
    await exec('yarn', ['build-silent'], { shell: true }, true, true);
    apiStatus(res, config, 200);
  });
};

function setStorePolicies (config, storeData) {
  let storefront_setting = storeData.storefront_setting;
  const storePolicies = new Store({path: path.resolve(config.themeDir + `/resource/policies/${storeData.storefront_url}_store_policies.json`)});

  // Reset the file to avoid bad config
  if (storePolicies && storePolicies.get('policy'))storePolicies.unlink();

  let policies = [];

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
  return storePolicies.get('policy');
}

function setStoreMainImage (config, storeData) {
  let storeCode = storeData.storefront_url;
  let storefront_setting = storeData.storefront_setting;
  const mainImage = new Store({path: path.resolve(config.themeDir + `/resource/banners/${storeCode}_main-image.json`)});

  // Main Image Object
  let storeMainImage = {
    'working_hours': storefront_setting.working_hours,
    'title': storefront_setting.banner.title,
    'subtitle': storefront_setting.banner.subtitle,
    'title_color': storefront_setting.banner.title_color,
    'subtitle_color': storefront_setting.banner.subtitle_color,
    'logo': storefront_setting.store_logo.original,
    'link': storefront_setting.banner.link,
    'image': storefront_setting.banner.banner_photo.optimized,
    'contact_information': storefront_setting.contact_information,
    'about_text': storefront_setting.about_text,
    'brand': storeData.brand._id,
    'is_cc_store': storeData.brand.is_cc
  };

  // Reset the file to avoid bad config
  if (mainImage && mainImage.get('image'))mainImage.del('image');

  mainImage.set('image', storeMainImage);
  return mainImage.get('image');
}

// function getStoreData (config, storeCode) {
//   return new Promise(async (resolve, reject) => {
//     request({
//       uri: config.PROCC.API + '/api/storefront/getStoreDataVSF/' + storeCode,
//       method: 'GET'
//     }, (_err, _res, _resBody) => {
//       console.log('GETTING URL: ', config.PROCC.API + '/api/storefront/getStoreDataVSF/' + storeCode);
//       // console.log('_resBody', _resBody)
//       if (_err) reject(_err);
//       let obj
//       if (_resBody) { obj = JSON.parse(_resBody); }
//       // console.log('getStoreData _resBody', obj)
//       resolve(obj.storeData);
//     })
//   });
// }

function setCategoryBanner (config, storeData) {
  let storeCode = storeData.storefront_url;
  const StoreBanners = new Store({path: path.resolve(config.themeDir + `/resource/banners/${storeCode}_store_banners.json`)});
  console.log('storefrontConfig themeDir', config.themeDir);
  console.log('storefrontConfig path', path.resolve(config.themeDir + `/resource/banners/${storeCode}_store_banners.json`));
  // console.log('storeData.store_categories', storeData.store_categories)
  // start set store categories main Banner and samll Banners
  let top3Categories = _.take(_.orderBy(_.filter(storeData.store_categories, {'isCategoryCreatedInMagento': true}), 'position', 'desc'), 3);
  let countCategories = top3Categories.length;
  let mainBanners = [];
  let smallBanners = [];
  console.log('storefrontConfig top3Categories', top3Categories);
  console.log('storefrontConfig top3Categories');
  if (countCategories >= 1 && top3Categories[0] && top3Categories[0].cover_photo) {
    mainBanners = [
      {
        'title': top3Categories[0].name,
        'subtitle': top3Categories[0].description,
        'title_color': top3Categories[0].name_color,
        'subtitle_color': top3Categories[0].description_color,
        'image': top3Categories[0].cover_photo.optimized,
        // 'link': '/' + kebabForLink(top3Categories[0].name) + '/' + kebabForLink(top3Categories[0].name),
        'link': '/c/' + kebabForLink(top3Categories[0].name) + '-' + top3Categories[0].magento_category_id,
        'storeCode': storeData.storefront_url,
        'productCount': top3Categories[0].products.length,
        'category_id': parseInt(top3Categories[0].magento_category_id)
      }
    ];
    if (countCategories >= 2 && top3Categories[1] && top3Categories[1].cover_photo) {
      smallBanners = [
        {
          'title': top3Categories[1].name,
          'subtitle': top3Categories[1].description,
          'title_color': top3Categories[1].name_color,
          'subtitle_color': top3Categories[1].description_color,
          'image': top3Categories[1].cover_photo.optimized,
          // 'link': '/' + kebabForLink(top3Categories[1].name) + '/' + kebabForLink(top3Categories[1].name),
          'link': '/c/' + kebabForLink(top3Categories[1].name) + '-' + top3Categories[1].magento_category_id,
          'storeCode': storeData.storefront_url,
          'productCount': top3Categories[1].products.length,
          'category_id': parseInt(top3Categories[1].magento_category_id)
        }
      ];
      if (countCategories >= 3 && top3Categories[2] && top3Categories[2].cover_photo) {
        smallBanners.push({
          'title': top3Categories[2].name,
          'subtitle': top3Categories[2].description,
          'title_color': top3Categories[2].name_color,
          'subtitle_color': top3Categories[2].description_color,
          'image': top3Categories[2].cover_photo.optimized,
          // 'link': '/' + kebabForLink(top3Categories[2].name) + '/' + kebabForLink(top3Categories[2].name),
          'link': '/c/' + kebabForLink(top3Categories[2].name) + '-' + top3Categories[2].magento_category_id,
          'storeCode': storeData.storefront_url,
          'productCount': top3Categories[2].products.length,
          'category_id': parseInt(top3Categories[2].magento_category_id)
        });
      }
    }
    // console.log(mainBanners, ' mainBanners data');
    // console.log(smallBanners, ' smallBanners data');

    // Reset the file to avoid bad config
    if (StoreBanners && StoreBanners.get('mainBanners'))StoreBanners.del('mainBanners');
    if (StoreBanners && StoreBanners.get('smallBanners'))StoreBanners.del('smallBanners');

    StoreBanners.set('mainBanners', mainBanners);
    StoreBanners.set('smallBanners', smallBanners);
  }
  // end set store categories main Banner and small Banner

  // DEBUG LOGGING
  // console.log('mainBanners GET', StoreBanners.get('mainBanners'));
  // console.log('smallBanners GET', StoreBanners.get('smallBanners'));
  console.log('BANNERS SET END -----======]]]');
  // DEBUG LOGGING

  return {
    mainBanners: StoreBanners.get('mainBanners'),
    smallBanners: StoreBanners.get('smallBanners')
  };
}

function setProductBanners (config, products, storeCode, imagesRootURL) {
  const StoreBanners = new Store({path: path.resolve(config.themeDir + `/resource/banners/${storeCode}_store_banners.json`)});

  let productBanners = [];

  for (let product of products) {
    // console.log('/product-link loop product', _.get(product, '_source'));
    let link = !_.isUndefined(product._source.url_path) ? product._source.url_path : product._source.url_key;
    let Banner = {
      'title': product._source.name,
      'subtitle': product._source.description,
      'image': imagesRootURL + product._source.image, // need to magento url which is in config of api
      'link': `/p/${product._source.sku}/${link}`,
      'category': product._source.category
    };
    productBanners.push(Banner);
    // }
  }

  // Reset the file to avoid bad config
  if (StoreBanners && StoreBanners.get('productBanners'))StoreBanners.del('productBanners');

  StoreBanners.set('productBanners', productBanners);
  // console.log('productBanners', productBanners)
  console.log('productBanners2', StoreBanners.get('productBanners'));
  console.log('productBanners3 -----======]]]');
  return StoreBanners.get('productBanners')
}

function setMapStoreUrlsFor (storeData) {
  let storeCode = storeData.storefront_url;
  let mapStoreUrlsFor = storefrontConfig.get('storeViews.mapStoreUrlsFor');

  if ((!_.includes(mapStoreUrlsFor, storeCode)) || (!_.includes(storefrontConfig.get('storeViews.mapStoreUrlsFor'), storeCode))) {
    // set value in mapStoreUrlsFor
    mapStoreUrlsFor = _.concat(mapStoreUrlsFor, storeCode);

    // Reset the file to avoid bad config
    if (mapStoreUrlsFor) storefrontConfig.del('storeViews.mapStoreUrlsFor');

    storefrontConfig.set('storeViews.mapStoreUrlsFor', mapStoreUrlsFor);
  }
}

function setStoreData (config, storeData) {
  let store_data = getDefaultStoreData(config, storeData);
  console.log('setStoreData store_data', store_data)
  storefrontConfig.set(`storeViews.${storeData.storefront_url}`, store_data);
}

function stringifyTags (tags_obj) {
  if (!_.isObject(tags_obj)) return String(tags_obj);

  let tags_string = ''
  for (let key in tags_obj) {
    const tcat = tags_obj[key]
    for (let tag of tcat) {
      if (tags_string) tags_string += ' '
      tags_string += tag
    }
  }
  return tags_string
}
function getDefaultStoreData (config, storeData) {
  console.log('getDefaultStoreData', storeData)
  let template = {
    store_brand_id: storeData.brand._id,
    store_brand_name: storeData.brand.name,
    store_brand_tags: stringifyTags(storeData.brand.tags),
    is_test: storeData.is_test,
    storeCode: storeData.storefront_url,
    // storeName: _.startCase(storeData.magento_store_name),
    storeName: storeData.brand.name,
    disabled: false,
    storeId: parseInt(storeData.magento_store_id),
    name: _.startCase(storeData.magento_store_name),
    url: `/${storeData.storefront_url}`,
    appendStoreCode: true,
    elasticsearch: {
      host: config.api.url + '/api/catalog',
      index: `vue_storefront_catalog_${_.snakeCase(storeData.storefront_url)}`
    },
    tax: {
      defaultCountry: 'Bulgaria',
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
      currencySign: '€',
      dateFormat: 'HH:mm D-M-YYYY'
    }
  }
  if (storeData && storeData.storefront_setting && storeData.storefront_setting.language)
    template.i18n = {...template.i18n, ...storeData.storefront_setting.language}
  return template
}

const spawn = require('child_process').spawn;
function exec (cmd, args, opts, enableLogging = false, limit_output = false) {
  return new Promise((resolve, reject) => {
    let child = spawn(cmd, args, opts);
    child.on('close', (data) => {
      resolve(data);
    });

    child.on('error', (error) => {
      console.error(error);
      reject(error);
    });

    let log_counter = 0;
    if (enableLogging) {
      console.log('child = spawn(cmd, args, opts)', cmd, args, opts);
      child.stdout.on('data', (data) => {
        if (limit_output) {
          let data2 = data.toString();
          data2.replace(' ', '');
          if (Number.isInteger(log_counter / 400) && data2.length > 10) {
            console.log('stdout: ', data.toString());
          }
          log_counter++
        } else {
          console.log('stdout: ', data.toString());
        }
      });
    }
    child.stderr.on('data', (data) => {
      if (limit_output) {
        let data_str = data.toString();
        if ((Number.isInteger(log_counter / 400) && data_str.length > 10) || data_str.indexOf('Error') !== -1) {
          console.log('stderrO: ', data.toString());
        }
        log_counter++
      } else {
        console.log('stderr ERROR: ', data.toString());
      }
    })
  })
}

function testKebab () {
  console.time('testKebab took');
  let array = ['Desigual Неща 358', 'Sets&OO &P & A', 'Ирра Спорт', 'Women\'s', 'RRrr', 'GG 533', 'GG-5 !', 'GG 5-5 <3', 'GG 5.5 mega', 'GG-5 :)', 'GG 5 my love <3', 'GG5 :)', 'GG5 66.5-7'];
  let expected = ['desigual--358', 'sets-and-oo-and-p-and-a', '--', 'womens', 'rrrr', 'gg-533', 'gg-5-', 'gg-5-5-3', 'gg-55-mega', 'gg-5-', 'gg-5-my-love-3', 'gg5-', 'gg5-665-7'];
  let result = [];
  for (let key in array) {
    let word1 = array[key];
    let word2 = kebabForLink(word1);
    let res = 'testKebab TEST ' + key + '  -  input: ' + word1 + '  -  result: ' + word2 + '  -  expected: ' + expected[key];
    console.log(res);
    result.push(res)
  }
  console.timeEnd('testKebab took');
  return result
}

testKebab();

function restartVueStorefrontDevDocker () {
  console.log(' == RESTARTING Vuestorefront Docker Dev ==');
  return exec('pm2', [ 'restart', '0' ], { shell: true });
}

function convertCSVToJSONArray (file_name) {
  let data = []
  return new Promise(async (resolve, reject) => {
    fs.createReadStream(file_name)
      .pipe(csv())
      .on('data', (row) => {
        // console.log('ProCCMissingTranslationHandler row', row);
        for (let key in row) {
          let value = String(row[key])
          data.push({key: value, value})
        }
      })
      .on('end', () => {
        resolve(data)
      })
      .on('error', (e) => {
        reject(e)
      })
  })
}
