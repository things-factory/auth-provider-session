import { store, auth, HOMEPAGE } from '@things-factory/shell'

import SessionAuthProvider from './session-auth-provider'

export default function bootstrap() {
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
}
