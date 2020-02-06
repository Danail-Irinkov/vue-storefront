import { ActionTree } from 'vuex'
import * as types from './mutation-types'
import i18n from '@vue-storefront/i18n'
import RootState from '@vue-storefront/core/types/RootState'
import UserState from '../types/UserState'
import { Logger } from '@vue-storefront/core/lib/logger'
import { UserProfile } from '../types/UserProfile'
import { onlineHelper } from '@vue-storefront/core/helpers'
import { isServer } from '@vue-storefront/core/helpers'
import { UserService } from '@vue-storefront/core/data-resolver'
import EventBus from '@vue-storefront/core/compatibility/plugins/event-bus'
import { StorageManager } from '@vue-storefront/core/lib/storage-manager'
import { userHooksExecutors, userHooks } from '../hooks'
import ProCcApi from 'src/themes/default-procc/helpers/procc_api.js'
import isUndefined from "lodash-es/isUndefined";

const actions: ActionTree<UserState, RootState> = {
  async startSession ({ commit, dispatch, getters }) {
    const usersCollection = StorageManager.get('user')
    const userData = await usersCollection.getItem('current-user')

    if (isServer || getters.isLocalDataLoaded) return
    commit(types.USER_LOCAL_DATA_LOADED, true)

    if (userData) {
      commit(types.USER_INFO_LOADED, userData)
    }

    commit(types.USER_START_SESSION)
    const lastUserToken = await usersCollection.getItem('current-token')

    if (lastUserToken) {
      commit(types.USER_TOKEN_CHANGED, { newToken: lastUserToken })
      await dispatch('sessionAfterAuthorized', {})

      if (userData) {
        dispatch('setUserGroup', userData)
      }
    } else {
      EventBus.$emit('session-after-nonauthorized')
    }

    EventBus.$emit('session-after-started')
  },
  /**
   * Send password reset link for specific e-mail
   */
  resetPassword (context, { email }) {
    return UserService.resetPassword(email)
  },
  /**
   * Login user and return user profile and current token
   */
  async login ({ commit, dispatch }, { email, password }) {
    console.log('BEFORE UserService.login', email, password)
    // Edited by shabbir for login customer in procc
    const resp = await ProCcApi().VSFCustomerLogin({email: email, password})
    userHooksExecutors.afterUserAuthorize(resp)
    if (!isUndefined(resp.data.email_not_verify) && resp.data.email_not_verify) {
      dispatch('handleResendVerificationEmail', {email:email})
    }
    else if (resp.data.message_type === 'success') {
      try {
        await dispatch('resetUserInvalidateLock', {}, { root: true })
        commit(types.USER_TOKEN_CHANGED, { newToken: resp.data.token, meta: resp.data.user }) // TODO: handle the "Refresh-token" header
        await dispatch('sessionAfterAuthorized', { refresh: true, useCache: false })
      } catch (err) {
        await dispatch('clearCurrentUser')
        throw new Error(err)
      }
    }

    return resp.data
  },
  /**
   * Login user and return user profile and current token
   */
  async register ({ dispatch }, { password, ...customer }) {
    // Edited by shabbir for save customer in procc
    return ProCcApi().createVSFCustomer({ password, ...customer }).then((result) => {
      console.log('result', result)
      dispatch('handleResendVerificationEmail', {email:customer.email})
      return result.data
    })
  },

  /**
  * Invalidate user token
  */
  async refresh ({ commit }) {
    const usersCollection = StorageManager.get('user')
    const refreshToken = await usersCollection.getItem('current-refresh-token')
    const newToken = await UserService.refreshToken(refreshToken)

    if (newToken) {
      commit(types.USER_TOKEN_CHANGED, { newToken })
    }

    return newToken
  },
  /**
   * Update user groupToken and groupId in state
   * @param context
   * @param userData
   */
  setUserGroup ({ commit }, userData) {
    if (userData.groupToken) {
      commit(types.USER_GROUP_TOKEN_CHANGED, userData.groupToken)
    }

    if (userData.group_id) {
      commit(types.USER_GROUP_CHANGED, userData.group_id)
    }
  },
  async restoreCurrentUserFromCache ({ commit, dispatch }) {
    const usersCollection = StorageManager.get('user')
    const currentUser = await usersCollection.getItem('current-user')

    if (currentUser) {
      commit(types.USER_INFO_LOADED, currentUser)
      await dispatch('setUserGroup', currentUser)
      EventBus.$emit('user-after-loggedin', currentUser)
      // dispatch('cart/authorize', {}, { root: true }) // temporary comment by shabbir

      return currentUser
    }

    return null
  },
  async refreshUserProfile ({ commit, dispatch, getters }, { resolvedFromCache }) {
    // modify by shabbir for get customer details from procc
    const resp = await ProCcApi().getCustomer(getters.getToken)

    if (resp.status === 200 && resp.data.message_type === 'success') {
      commit(types.USER_INFO_LOADED, resp.data.user) // this also stores the current user to localForage
      await dispatch('setUserGroup', resp.data.user)
    }
    if (!resolvedFromCache && resp.status === 200 && resp.data.message_type === 'success') {
      EventBus.$emit('user-after-loggedin', resp.data.user)
      // dispatch('cart/authorize', {}, { root: true })  // temporary comment by shabbir
      return resp.data
    }
  },
  /**
   * Load current user profile
   */
  async me ({ dispatch, getters }, { refresh = true, useCache = true } = {}) {
    if (!getters.getToken) {
      Logger.warn('No User token, user unauthorized', 'user')()
      return
    }

    let resolvedFromCache = false

    if (useCache) {
      const currentUser = await dispatch('restoreCurrentUserFromCache')

      if (currentUser) {
        resolvedFromCache = true
        Logger.log('Current user served from cache', 'user')()
      }
    }

    if (refresh) {
      return dispatch('refreshUserProfile', { resolvedFromCache })
    }
  },
  /**
   * Update user profile with data from My Account page
   */
  async update (_, profile: UserProfile) {
    await UserService.updateProfile(profile, 'user/handleUpdateProfile')
  },
  /**
   * Update user profile with data from My Account page by shabbir
   */
  async updateCustomerProfile ({ getters, dispatch }, userProfile) {
    await ProCcApi().updateCustomerProfile(getters.getToken, userProfile).then((result) => {
      dispatch('handleUpdateProfile', result.data)
    })
  },

  /**
   * Update user address with data from My Account page by shabbir
   */
  async updateCustomerAddress ({ getters, dispatch }, address) {
    return  await ProCcApi().updateCustomerAddress(getters.getToken, address).then((result) => {
      dispatch('handleUpdateProfile', result.data)
      return result.data
    })
  },

  /**
   * Resend email verification API by shabbir
   */
  async resendVerificationEmail ({ getters, dispatch },email) {
    return  await ProCcApi().resendVerificationEmail(email).then((result) => {
      return result.data
    })
  },

  /**
   * Update user address with data from My Account page by shabbir
   */
  async verifyCustomerEmail({ commit, getters, dispatch }, email_verification_code) {
    return  await ProCcApi().verifyCustomerEmail({ email_verification_code }).then(async (resp) => {
      if (resp.data.message_type === 'success') {
        try {
          await dispatch('resetUserInvalidateLock', {}, { root: true })
          commit(types.USER_TOKEN_CHANGED, { newToken: resp.data.token, meta: resp.data.user }) // TODO: handle the "Refresh-token" header
          await dispatch('sessionAfterAuthorized', { refresh: true, useCache: false })
        } catch (err) {
          await dispatch('clearCurrentUser')
          throw new Error(err)
        }
      }
      dispatch('notification/spawnNotification', {
        type: resp.data.message_type === 'success'? 'success':'error',
        message: resp.data.message,
        action1: { label: i18n.t('OK') }
      }, { root: true })

      return resp.data
    })
  },

  async handleResendVerificationEmail ({ dispatch }, {email, message }) {
    let msg = !isUndefined(message) && message ? message : i18n.t('Do you want to resend email ?')
    dispatch('notification/spawnNotification', {
      type: 'warning',
      message: msg,
      action1: { label: i18n.t('Yes'),
        action: () => {
          dispatch('resendVerificationEmail', { email: email }).then((result) => {
            console.log("result ",result)
            dispatch('handleResendVerificationEmail', {email, message: result.message})
          })
        }
      },
      action2: { label: i18n.t('No')},
      hasNoTimeout: true
    }, { root: true })

  },

  async handleUpdateProfile ({ dispatch }, event) {
    // edited by shabbir for check request status and display message
    if (event.message_type === 'success') {
      dispatch('notification/spawnNotification', {
        type: 'success',
        message: event.message,
        action1: { label: i18n.t('OK') }
      }, { root: true })
      dispatch('refreshUserProfile', { resolvedFromCache: true })
    }
  },
  setCurrentUser ({ commit }, userData) {
    commit(types.USER_INFO_LOADED, userData)
  },
  /**
   * Change user password
   */
  async changePassword ({ dispatch, getters }, passwordData) {
    if (!onlineHelper.isOnline) {
      dispatch('notification/spawnNotification', {
        type: 'error',
        message: i18n.t('Reset password feature does not work while offline!'),
        action1: { label: i18n.t('OK') }
      }, { root: true })

      return
    }
    // Edited by shabbir fro call change password procc API
    const resp = await ProCcApi().changePassword(getters.getToken, passwordData)

    if (resp.status === 200 && resp.data.message_type === 'success') {
      await dispatch('notification/spawnNotification', {
        type: 'success',
        message: 'Password has successfully been changed',
        action1: { label: i18n.t('OK') }
      }, { root: true })
      await dispatch('login', {
        email: getters.getUserEmail,
        password: passwordData.newPassword
      })
    } else {
      await dispatch('notification/spawnNotification', {
        type: 'error',
        message: i18n.t(resp.data.message), // display response message from API
        action1: { label: i18n.t('OK') }
      }, { root: true })
    }
  },
  clearCurrentUser ({ commit, dispatch }) {
    commit(types.USER_TOKEN_CHANGED, '')
    commit(types.USER_GROUP_TOKEN_CHANGED, '')
    commit(types.USER_GROUP_CHANGED, null)
    commit(types.USER_INFO_LOADED, null)
    dispatch('wishlist/clear', null, { root: true })
    dispatch('compare/clear', null, {root: true})
    dispatch('checkout/savePersonalDetails', {}, { root: true })
    dispatch('checkout/saveShippingDetails', {}, { root: true })
    dispatch('checkout/savePaymentDetails', {}, { root: true })
  },
  /**
   * Logout user
   */
  async logout ({ commit, dispatch }, { silent = false }) {
    commit(types.USER_END_SESSION)
    await dispatch('cart/disconnect', {}, { root: true })
    await dispatch('clearCurrentUser')
    EventBus.$emit('user-after-logout')
    await dispatch('cart/clear', { recreateAndSyncCart: true }, { root: true })

    if (!silent) {
      await dispatch('notification/spawnNotification', {
        type: 'success',
        message: i18n.t("You're logged out"),
        action1: { label: i18n.t('OK') }
      }, { root: true })
    }
    userHooksExecutors.afterUserUnauthorize()
  },
  async loadOrdersFromCache ({ commit }) {
    const ordersHistoryCollection = StorageManager.get('user')
    const ordersHistory = await ordersHistoryCollection.getItem('orders-history')

    if (ordersHistory) {
      commit(types.USER_ORDERS_HISTORY_LOADED, ordersHistory)
      EventBus.$emit('user-after-loaded-orders', ordersHistory)

      return ordersHistory
    }
  },
  async refreshOrdersHistory ({ commit, getters }, { resolvedFromCache, pageSize = 20, currentPage = 1 }) {
    // modify by shabbir for get customer orders from procc
    const resp = await ProCcApi().getCustomerOrders(getters.getToken, pageSize, currentPage).then((result) => { return result })

    if (resp.status === 200 && resp.data.message_type === 'success') {
      commit(types.USER_ORDERS_HISTORY_LOADED, resp.data.orders) // this also stores the current user to localForage
      EventBus.$emit('user-after-loaded-orders', resp.data.orders)
    }

    if (!resolvedFromCache) {
      Promise.resolve(resp.status === 200 && resp.data.message_type === 'success' ? resp : null)
    }

    return resp.data
  },
  /**
   * Load user's orders history
   */
  async getOrdersHistory ({ dispatch, getters }, { refresh = true, useCache = true, pageSize = 20, currentPage = 1 }) {
    if (!getters.getToken) {
      Logger.debug('No User token, user unathorized', 'user')()
      return Promise.resolve(null)
    }
    let resolvedFromCache = false

    if (useCache) {
      const ordersHistory = await dispatch('loadOrdersFromCache')

      if (ordersHistory) {
        resolvedFromCache = true
        Logger.log('Current user order history served from cache', 'user')()
      }
    }

    if (refresh) {
      return dispatch('refreshOrdersHistory', { resolvedFromCache, pageSize, currentPage })
    } else {
      if (!resolvedFromCache) {
        Promise.resolve(null)
      }
    }
  },
  async sessionAfterAuthorized ({ dispatch }, { refresh = onlineHelper.isOnline, useCache = true }) {
    Logger.info('User session authorised ', 'user')()
    await dispatch('me', { refresh, useCache })
    await dispatch('getOrdersHistory', { refresh, useCache })
  }
}

export default actions
