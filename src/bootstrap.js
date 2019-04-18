import { store, auth, HOMEPAGE, updateAuthenticated, showSnackbar, updateUser } from '@things-factory/shell'
import { UPDATE_BASE_URL } from '@things-factory/shell'

import SessionAuthProvider from './session-auth-provider'

function onProfileChanged(e) {
  store.dispatch(updateUser(e.detail.profile))
}

function onAuthenticatedChanged(e) {
  var auth = e.detail
  store.dispatch(updateAuthenticated(auth))
}

function onAuthErrorChanged(e) {
  store.dispatch(showSnackbar(e.detail))
}

export default function bootstrap() {
  auth.on('signin', accessToken => {
    dispatchEvent(
      new CustomEvent('authenticated-changed', {
        bubbles: true,
        composed: true,
        detail: { authenticated: true, accessToken }
      })
    )
  })

  auth.on('signout', () => {
    document.dispatchEvent(
      new CustomEvent('authenticated-changed', { bubbles: true, composed: true, detail: { authenticated: false } })
    )
  })

  auth.on('profile', profile => {
    document.dispatchEvent(new CustomEvent('profile-changed', { bubbles: true, composed: true, detail: { profile } }))
  })

  auth.on('error', error => {
    console.error(error)

    document.dispatchEvent(new CustomEvent('auth-error-changed', { bubbles: true, composed: true, detail: { error } }))
  })

  store.subscribe(() => {
    var state = store.getState()

    var baseUrl = state.app.baseUrl

    auth.contextPath = state.app.contextPath
    auth.defaultRoutePage = state.app.defaultRoutePage

    if (baseUrl && baseUrl !== auth.endpoint) {
      auth.endpoint = baseUrl

      auth.profile()
    }
  })

  auth.authProvider = SessionAuthProvider

  auth.signinPath = 'login'
  auth.signupPath = ''
  auth.signoutPath = 'logout'
  auth.profilePath = 'session_info'

  auth.signinPage = 'signin'
  auth.signupPage = 'signup'
  auth.signoutPage = ''

  auth.contextPath = ''
  auth.defaultRoutePage = HOMEPAGE

  document.addEventListener('profile-changed', onProfileChanged)
  document.addEventListener('authenticated-changed', onAuthenticatedChanged)
  document.addEventListener('auth-error-changed', onAuthErrorChanged)

  store.dispatch({
    type: UPDATE_BASE_URL,
    baseUrl: 'http://board-demo.hatiolab.com/rest' //'http://52.231.75.202/rest'
  })
}
