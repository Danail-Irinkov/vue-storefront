// import axios from 'axios'
// import jwt from 'jsonwebtoken'
// // import jwtPrivateKey from '../../config/jwt.jst'
// import config from 'config';
// import { isServer } from '@vue-storefront/core/helpers'
const axios = require('axios')
const jwt = require('jsonwebtoken')
// const jwtPrivateKey = require('../../config/jwt.jst')
const config = require('config')
let jwt_token = require('../../config/jwt_es5')()
// console.log('procc_api_es5 config', config)
// console.log('jwt_token', jwt_token)
// const jwt_token = require('@vue-storefront/config/jwt_es5')
const SBuffer = require('safer-buffer')
const Buffer = SBuffer.Buffer

// const { isServer } = require('@vue-storefront/core/helpers')

module.exports = (baseURL = '') => {
// export default (baseURL = '') => {
//   baseURL = config.PROCC.URL + '/api/'
  // if (isServer) {
  baseURL = config.PROCC.API + '/api/'
  // }

  // ------
  // STEP 1
  // ------
  //
  // Create and configure an apisauce-based api object.
  //
  const api = axios.create({
    // base URL is read from the "constructor"
    baseURL,
    // here are some default headers
    headers: {
      'Cache-Control': 'no-cache',
      'Content-type': 'application/json'
    },
    // 10 second timeout...
    timeout: 150000
  })

  // JWT TOKEN MANAGEMENT
  let private_key = jwt_token.private_key
  if (process.env.NODE_APP_INSTANCE === 'kube') {
    /* eslint-disable */
    let Buff = new Buffer.from(process.env.JWT_PRIVATE_KEY_1, 'base64')
    private_key = Buff.toString('ascii')
    /* eslint-disable */
  }
  // console.log('private_key after ENV: ', private_key)
  if (!private_key || private_key === 'NO TOKEN') throw new Error('No JWT API TOKEN SUPPLIED')
  const createToken = (brandId) => jwt.sign({ brand_id: brandId },
    private_key, {
      expiresIn: '7d',
      algorithm: 'RS256'
    })

  const getHeader = (brandId = 0) => ({
    headers: {
      'Authorization': `Bearer ${createToken(brandId)}`
    }
  })

  // const addNewOrder = (orderData, brandId) => api.post('order/addNewOrder', orderData, getHeader(brandId))
  // const saveTransactionInOrder = (orderData, brandId) => api.post('order/saveTransactionInOrder', orderData, getHeader(brandId))
  // const VSFOrderPayment = (data, brandId) => api.post('mangopay/VSFOrderPayment', data, getHeader(brandId))
  // const updateTransactionStatus = (data, brandId) => api.post('mangopay/updateTransactionStatusVSF', data, getHeader(brandId))
  // const getVSFSizeChartById = (product, brandId) => api.get(`sizeChart/getVSFSizeChartById/${product}?brand_id=${brandId}`, getHeader(brandId))
  // const updateVsfSyncStatus = (brandData) => api.post('vsf/updateVsfSyncStatus', {brandData}, getHeader(brandData.brand_id))
  // const getProductDeliveryPolicy = () => api.get('policy/getProductDeliveryPolicy')
  const getStoreDataVSF = (storeCode, brandId) => api.get('storefront/getStoreDataVSF/' + storeCode, getHeader(brandId))
  const translateJSONArray = (data, DEVBrandId='5d8dcbf5781ec61454fc7873') => api.post('translateJSONArray', data, getHeader(DEVBrandId))

  return {
    // addNewOrder,
    // getProductDeliveryPolicy,
    // getVSFSizeChartById,
    // VSFOrderPayment,
    // updateTransactionStatus,
    // updateVsfSyncStatus,
    // saveTransactionInOrder,
    getStoreDataVSF,
    translateJSONArray
  }
}
