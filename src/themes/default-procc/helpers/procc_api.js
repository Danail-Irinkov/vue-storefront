import axios from 'axios'
import jwt from 'jsonwebtoken'
// import jwtPrivateKey from '../../config/jwt.jst'
import config from 'config';
import { isServer } from '@vue-storefront/core/helpers'
import jwt_token from '@vue-storefront/config/jwt'

export default (baseURL = '') => {
  baseURL = config.PROCC.URL + '/api/'
  if (isServer) {
    baseURL = config.PROCC.API + '/api/'
  }

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
  console.log('private_key', private_key)
  if (process.env.NODE_APP_INSTANCE === 'kube') {
    private_key = process.env.JWT_PRIVATE_KEY
  }
  console.log('private_key2', private_key)
  if (!private_key || private_key === 'NO TOKEN') throw new Error('No JWT API TOKEN SUPPLIED')

  const createToken = (brandId) => jwt.sign({ brand_id: brandId },
    private_key, {
      expiresIn: 15000,
      algorithm: 'RS256'
    })

  const getHeader = (brandId = 0) => ({
    headers: {
      'Authorization': `Bearer ${createToken(brandId)}`
    }
  })

  const addNewOrder = (orderData, brandId) => api.post('order/addNewOrder', orderData, getHeader(brandId))
  const saveTransactionInOrder = (orderData, brandId) => api.post('order/saveTransactionInOrder', orderData, getHeader(brandId))
  const mangoPayCheckIn = (data, brandId) => api.post('mangopay/VSFOrderPayment', data, getHeader(brandId))
  const updateTransactionStatus = (data, brandId) => api.post('mangopay/updateTransactionStatusVSF', data, getHeader(brandId))
  const getSizeChart = (product, brandId) => api.get(`sizeChart/getVSFSizeChartById/${product}?brand_id=${brandId}`, getHeader(brandId))
  const updateVsfSyncStatus = (brandData) => api.post('vsf/updateVsfSyncStatus', {brandData}, getHeader(brandData.brand_id))
  const getProductDeliveryPolicy = () => api.get('policy/getProductDeliveryPolicy')
  const getShippingMethodByBrand = (brand_ids) => api.post(`shipping-method/getShippingMethodByBrand`, {brand_ids})
  const getStoreData = (storeCode, brandId) => api.get('storefront/getStoreDataVSF/' + storeCode, getHeader(brandId))
  const checkProductQty = (data, brandId) => api.post(`product/checkProductQty`, data, getHeader(brandId))

  return {
    addNewOrder,
    getProductDeliveryPolicy,
    getSizeChart,
    mangoPayCheckIn,
    updateTransactionStatus,
    updateVsfSyncStatus,
    saveTransactionInOrder,
    getShippingMethodByBrand,
    getStoreData,
    checkProductQty
  }
}
