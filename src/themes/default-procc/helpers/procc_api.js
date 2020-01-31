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
  if (process.env.NODE_APP_INSTANCE === 'kube') {
    private_key = process.env.JWT_PRIVATE_KEY
  } else if (!isServer) { // Adding this case to avoid Breaking the Header Calculation flow, but not used for Browser API Calls
    private_key = '-----BEGIN RSA PRIVATE KEY-----\n' +
      'MIICXAIBAAKBgQDk6soMG1p8EnVHi5Q/AcS1Y/Kxw8cAuWWrnysj61WbZBnaeeoz\n' +
      'pL4yzLFvj4ZNwuuxU89kjmKnnIjxR+ux5M5qzEP5al1cFFt1WXaHnZf1NTfjqVAG\n' +
      'speE898224GVwHy/3gK72Zzthg+ORDqeJJLjdjY01o+ebM5BY/LZJCB+IwIDAQAB\n' +
      'AoGAXgl9Wp/Z+eHzP6K9EWz+i601Q4UzOL7wXyIRrL29+wmR/Ufbx79DSsb/lN6W\n' +
      'w1bxT3UoWxyKtmP9dXCgCAIAMOQWZ1usNt0PkJnXpRKt4ayFBcFo96gaNdkRHa7M\n' +
      'mZoYSmce99cLcbNXYF2Uf60EYXvd69hGgZH3XmEHCKFC2JECQQD7EXHKIumuOR6+\n' +
      'TJTqKwFKmgX0MX6q7GYOo4Pd0DUr4k/YWb1G5y+NN1dUKCqw9RJybjhB8nfbQNtM\n' +
      'IuK+EInvAkEA6Wn0BveTJ5lkwtU27x0cvn0Ou0YxTFMHvQ7npwGvoZzPYitQop2e\n' +
      'y1MSsxerQTfuy2E3dUTe+w4Dez5YfX9TDQJASq8iwTVne+sD6SnQtmO6i52LndtH\n' +
      'ScLujPY5GLeByZ8Vj08KjdfhfklzEdas9FzCcwW0eHGPE8qUMW7DMjSrQwJAD1Uf\n' +
      'a4m9x98iqE27Mw/VgInUeubMfDgEDR46h1TsBZC4arlvrY7vDGojk1IdtMYI0KFN\n' +
      'NE3W2+T6w5C/3VaMzQJBAOqeTfHy5WO8I3VUab64tGxa1ktJLBun1Kr2ujqRqtLl\n' +
      'Q+4Brrutzfz6eHfrK6kMjNDjFCdOYtMrLPWX5E3Ey1g=\n' +
      '-----END RSA PRIVATE KEY-----'
  }
  if (!private_key || (private_key === 'NO TOKEN' && isServer)) {
    console.error(private_key)
    throw new Error('No JWT API TOKEN SUPPLIED')
  }

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
  const VSFOrderPayment = (data, brandId) => api.post('mangopay/VSFOrderPayment', data, getHeader(brandId))
  const updateTransactionStatus = (data, brandId) => api.post('mangopay/updateTransactionStatusVSF', data, getHeader(brandId))
  const getVSFSizeChartById = (product, brandId) => api.get(`sizeChart/getVSFSizeChartById/${product}?brand_id=${brandId}`, getHeader(brandId))
  const updateVsfSyncStatus = (brandData) => api.post('vsf/updateVsfSyncStatus', {brandData}, getHeader(brandData.brand_id))
  const getProductDeliveryPolicy = () => api.get('policy/getProductDeliveryPolicy')
  const getShippingMethodByBrand = (brand_ids) => api.post(`shipping-method/getShippingMethodByBrand`, {brand_ids})
  const getStoreData = (storeCode, brandId) => api.get('storefront/getStoreDataVSF/' + storeCode, getHeader(brandId))
  const checkProductQty = (data, brandId) => api.post(`product/checkProductQty`, data, getHeader(brandId))

  return {
    addNewOrder,
    getProductDeliveryPolicy,
    getVSFSizeChartById,
    VSFOrderPayment,
    updateTransactionStatus,
    updateVsfSyncStatus,
    saveTransactionInOrder,
    getShippingMethodByBrand,
    getStoreData,
    checkProductQty
  }
}
