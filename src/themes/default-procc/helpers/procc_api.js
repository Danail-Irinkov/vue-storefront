import axios from 'axios'
import jwt from 'jsonwebtoken'
// import jwtPrivateKey from '../../config/jwt.jst'
import config from 'config';
import { isServer } from '@vue-storefront/core/helpers'
import jwt_token from '@vue-storefront/config/jwt'
import SBuffer from 'safer-buffer'
import store from '@vue-storefront/core/store'
import map from 'lodash-es/map'
import find from 'lodash-es/find';
import defaults from 'lodash-es/defaults';
import { currentStoreView, localizedRoute } from '@vue-storefront/core/lib/multistore'
const Buffer = SBuffer.Buffer

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
  let api = axios.create({
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
  api.interceptors.request.use(
    (config) => {
      const auth_token = store.getters['user/getUserToken']
      if (auth_token) {
        config.headers.Authorization = `Bearer ${auth_token}`
      }
      return config
    },
    error => Promise.reject(error)
  )
  api.interceptors.response.use((response) => {
    if (response.data && response.data.token_expired) {
      // console.log('response.data.token_expired', response.data)
      // DEPRECATED By Dan !! It was not working at all ... why did you put it here Shab?
      // store.dispatch('user/logout', { silent: true })
      // localStorage.setItem('redirect', this.$route.path)
      // this.$router.push(localizedRoute('/', currentStoreView().storeCode))
    }
    return response
  }, (error) => {
    console.log('token Expired error', error)
    return Promise.reject(error)
  })

  // JWT TOKEN MANAGEMENT
  let private_key = jwt_token.private_key
  if (process.env.NODE_APP_INSTANCE === 'kube') {
    /* eslint-disable */
    let Buff = new Buffer.from(process.env.JWT_PRIVATE_KEY_1, 'base64')
    private_key = Buff.toString('ascii')
    /* eslint-disable */
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
  // pass token in request
  const auth_token = store.getters['user/getUserToken']
  const getHeaderWithToken = () => ({
    headers: {
      'Authorization': `Bearer ${auth_token}`
    }
  })

  const validateVATNumber = (data, brandId) => api.post('payment/validateVATNumber', data, getHeader(brandId))
  const addNewOrder = (orderData, brandId) => api.post('order/addNewOrder', orderData, getHeader(brandId))
  const saveTransactionInOrder = (orderData, brandId) => api.post('order/saveTransactionInOrder', orderData, getHeader(brandId))
  const VSFOrderPayment = (data, brandId) => api.post('mangopay/VSFOrderPayment', data, getHeader(brandId))
  const updateTransactionStatus = (data, brandId) => api.post('mangopay/updateTransactionStatusVSF', data, getHeader(brandId))
  const getVSFSizeChartById = (product, brandId) => api.get(`sizeChart/getVSFSizeChartById/${product}?brand_id=${brandId}`, getHeader(brandId))
  const updateVsfSyncStatus = (brandData) => api.post('vsf/updateVsfSyncStatus', {brandData}, getHeader(brandData.brand_id))
  const getShippingCountriesList = () => api.get('vsf/getShippingCountriesList').then((response) => {
    // console.log('getShippingCountriesList response', response.data)
    return response.data && response.data.countries ? response.data.countries : response.data
  })
  const getProductDeliveryPolicy = () => api.get('policy/getProductDeliveryPolicy')
  const updateSelectedRapidoShipmentCost = async (brand_id) => {
    // console.log('updateSelectedRapidoShipmentCost START', brand_id)
    try {
      let rapido_cost = await store.dispatch('cart/calculateRapidoShippingFee', { brandId: brand_id })
      let selectedShippingMethods = {...await store.getters['checkout/getSelectedShippingMethods']}

      for (let key in selectedShippingMethods) {
        if(!selectedShippingMethods.hasOwnProperty(key)) continue

        // console.log('updateSelectedRapidoShipmentCost selectedShippingMethods[key].brand', selectedShippingMethods[key].brand)
        if(String(selectedShippingMethods[key].brand) === String(brand_id) && selectedShippingMethods[key].isRapido){
          selectedShippingMethods[key].cost = rapido_cost
        }
      }
      // console.log('updateSelectedRapidoShipmentCost brand_id', brand_id)
      // console.log('updateSelectedRapidoShipmentCost rapido_cost', rapido_cost)
      // console.log('updateSelectedRapidoShipmentCost selectedShippingMethods', selectedShippingMethods)
      await store.dispatch('cart/updateSelectedShippingMethods', {selectedShippingMethods})
    }catch (e) {
      console.log('updateSelectedRapidoShipmentCost ERR:', e)
    }
  }
  const updateShippingMethodsFromProCC = (data) => api.post(`shipping-method/updateShippingMethodsFromProCC`, data)
    .then(async (result) => {
      // console.log('updateShippingMethodsFromProCC result', result)
      let default_shipping_methods = {}
      let shipping_methods = {}
      let selected_shipping_methods = store.getters['checkout/getSelectedShippingMethods']
      // console.log('updateShippingMethodsFromProCC result.data.shipping_methods', result.data.shipping_methods)
      // console.log('updateShippingMethodsFromProCC selected_shipping_methods Start', selected_shipping_methods)

      for (let brand_id in result.data.shipping_methods) {
        // console.log('updateShippingMethodsFromProCC brand_id', brand_id)
        let store_data = result.data.shipping_methods[brand_id]
        // console.log('updateShippingMethodsFromProCC store_data', store_data)
        shipping_methods[brand_id] = result.data.shipping_methods[brand_id]['shipping_methods']
        // console.log('updateShippingMethodsFromProCC shipping_methods['+brand_id+']', shipping_methods[brand_id])
        let shipping_method_data = {...find(result.data.shipping_methods[brand_id]['shipping_methods'], (m) => { return m._id === store_data['default_shipping_method'] })}
        // console.log('updateShippingMethodsFromProCC brand_id', brand_id)
        // console.log('updateShippingMethodsFromProCC selected_shipping_methods[brand_id]', selected_shipping_methods[brand_id])

        // if(selected_shipping_methods && selected_shipping_methods[brand_id]){
        //   shipping_method_data = selected_shipping_methods[brand_id]
        // } else {
        //   shipping_method_data = find(result.data.shipping_methods[brand_id]['shipping_methods'], (m) => { return m._id === store_data['default_shipping_method'] })
        // }

        // console.log('updateShippingMethodsFromProCC shipping_method_data', shipping_method_data)
        // console.log('updateShippingMethodsFromProCC (!shipping_method_data.cost || parseFloat(shipping_method_data.cost) == 0 || shipping_method_data.isRapido)', (!shipping_method_data.cost || shipping_method_data.cost == 0 || shipping_method_data.isRapido))
        // console.log('updateShippingMethodsFromProCC shipping_method_data.cost', shipping_method_data.cost)
        // console.log('updateShippingMethodsFromProCC parseFloat(shipping_method_data.cost)', parseFloat(shipping_method_data.cost))
        // if (shipping_method_data && (!shipping_method_data.cost || shipping_method_data.isRapido)) {
        //   shipping_method_data.cost = null // Resetting the price temporarily until it gets updated by syncTotals
        //   // updateSelectedRapidoShipmentCost(brand_id)
        //   // shipping_method_data.isRapido = true
        // }
        if (shipping_method_data){
          shipping_method_data.brand = brand_id
          shipping_method_data.cost = parseInt(shipping_method_data.cost);
          default_shipping_methods[brand_id] = shipping_method_data
        }
      }
      // console.log('store.getters[checkout/getSelectedShippingMethods]', store.getters['checkout/getSelectedShippingMethods'])
      // console.log('updateShippingMethodsFromProCC selected_shipping_methods @END1', selected_shipping_methods)
      // console.log('updateShippingMethodsFromProCC default_shipping_methods @END2', default_shipping_methods)

      let shippingMethods = shipping_methods
      let selectedShippingMethods = defaults(selected_shipping_methods, default_shipping_methods)
      // console.log('updateShippingMethodsFromProCC selectedShippingMethods @END3', selectedShippingMethods)
      // let selectedShippingMethods = defaults(default_shipping_methods, store.getters['checkout/getSelectedShippingMethods'])

      // console.log('updateShippingMethodsFromProCC selectedShippingMethods @END4', selectedShippingMethods)

      // console.log('shippingMethods', shippingMethods)
      // console.log('selectedShippingMethods', selectedShippingMethods)
      let brandsDetails = map(result.data.shipping_methods, (o) => { return o.brand; })
      await store.dispatch('cart/updateShippingMethods', {shippingMethods})
      await store.dispatch('cart/updateSelectedShippingMethods', {selectedShippingMethods})
      await store.dispatch('cart/updateBrandsDetails', {brandsDetails})
      await store.dispatch('cart/setCheckoutShippingMethods')
      return {
        shippingMethods,
        selectedShippingMethods,
        brandsDetails
      }
    }).catch((err)=>{
      console.log('updateShippingMethodsFromProCC ERR: ', err)
      return Promise.reject(err)
    })

  const getStoreDataVSF = (storeCode, brandId) => api.get('storefront/getStoreDataVSF/' + storeCode, getHeader(brandId))
  const checkProductQty = (data, brandId) => api.post(`product/checkProductQty`, data, getHeader(brandId))
  // Customer
  const createVSFCustomer = (data) => api.post(`customer/createVSFCustomer`, data)
  const VSFCustomerLogin = (data) => api.post(`customer/VSFCustomerLogin`, data)
  const getCustomer = (token) => api.get(`customer/getCustomer`)
  const getCustomerOrders = (token, pageSize, currentPage) => api.post(`order/getCustomerOrders`, {pageSize, currentPage}, getHeaderWithToken(token))
  const updateCustomerProfile = (token, data) => api.post(`customer/updateCustomerProfile`, data)
  const changePassword = (token, data) => api.post(`customer/changePassword`, data)
  const updateCustomerAddress = (token, data) => api.post(`address/updateCustomerAddress`, data)
  const verifyCustomerEmail = (data) => api.post(`customer/verifyCustomerEmail`, data)
  const resendVerificationEmail = (data) => api.post(`customer/resendVerificationEmail`, data)
  const forgotPassword = (data) => api.post(`auth/forgotPassword`, data)
  const resetPassword = (data) => api.post(`auth/resetPassword`, data)
  const calculateShipmentCost = ({cartId, brandId}) => api.get(`cart/calculateRapidoShipmentCost?cartId=${cartId}&brandId=${brandId}`)
  const getOrderInvoicePDF = (orderId) => api.get(`invoice/getOrderInvoicePDF/${orderId}`,{responseType: 'arraybuffer'})
  const cancelOrder = (data,user_id,brand_id) => api.post(`order/cancelOrder?user_id=${user_id}&brand_id=${brand_id}`,data)
  const getCountriesList = () => api.get(`country/getCountriesList`)
  const getCitiesList = (country_id, query) => api.get(`address/getCitiesList`, { params: { country_id, query}})
  const getStreetList = (site_id, query) => api.get(`address/getStreetList`, {params:{site_id, query }})
  const saveFeedback = (data) => api.post(`feedback/saveFeedback`,data)

  return {
    validateVATNumber,
    addNewOrder,
    getProductDeliveryPolicy,
    getVSFSizeChartById,
    VSFOrderPayment,
    updateTransactionStatus,
    updateVsfSyncStatus,
    getShippingCountriesList,
    saveTransactionInOrder,
    updateShippingMethodsFromProCC,
    getStoreDataVSF,
    checkProductQty,
    createVSFCustomer,
    VSFCustomerLogin,
    getCustomer,
    getCustomerOrders,
    updateCustomerProfile,
    changePassword,
    updateCustomerAddress,
    verifyCustomerEmail,
    resendVerificationEmail,
    forgotPassword,
    resetPassword,
    calculateShipmentCost,
    getOrderInvoicePDF,
    cancelOrder,
    getCountriesList,
    getCitiesList,
    getStreetList,
    saveFeedback
  }
}
