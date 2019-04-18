import { encodeFormParams } from '@things-shell/client-utils'

function hexString(buffer) {
  const byteArray = new Uint8Array(buffer)

  const hexCodes = [...byteArray].map(value => {
    const hexCode = value.toString(16)
    const paddedHexCode = hexCode.padStart(2, '0')
    return paddedHexCode
  })

  return hexCodes.join('')
}

async function encodeSha256(password) {
  const encoder = new TextEncoder()
  const encoded = encoder.encode(password)

  const buffer = await crypto.subtle.digest('SHA-256', encoded)
  return hexString(buffer)
}

export default {
  signinPath: 'login',
  signupPath: 'signup',
  profilePath: 'session_info',
  signoutPath: 'logout',
  signinPage: 'signin',
  signupPage: 'signup',

  async signup(formProps) {
    var { password } = formProps
    formProps.password = await encodeSha256(password)

    try {
      const response = await fetch(this.fullpath(this.signupPath), {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Accept: 'application/json'
        },
        body: encodeFormParams(formProps)
      })

      if (response.ok) {
        const data = await response.json()

        if (data && data.error) {
          this.onAuthError(data.error)
          return
        }
      } else {
        throw new Error(response.status)
      }
    } catch (e) {
      this.onAuthError(e)
    }
  },

  async signin(formProps) {
    var { password } = formProps
    formProps.password = await encodeSha256(password)

    try {
      const response = await fetch(this.fullpath(this.signinPath), {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Accept: 'application/json'
        },
        body: encodeFormParams(formProps)
      })

      if (response.ok) {
        const data = await response.json()

        this.onSignedIn('SESSION Cookie for server')
        this.onProfileFetched(data, 'SESSION Cookie for server')

        return
      } else {
        throw new Error(response.status)
      }
    } catch (e) {
      this.onAuthError(e)
    }
  },

  async profile() {
    try {
      const response = await fetch(this.fullpath(this.profilePath), {
        method: 'GET',
        credentials: 'include',
        headers: {}
      })

      if (response.ok) {
        const data = await response.json()

        this.onProfileFetched(data, 'SESSION Cookie for server')

        return
      } else {
        let status = Number(response.status)
        if (status == 401) {
          this.onAuthRequired(response.status)
          return
        }
        throw new Error(response)
      }
    } catch (e) {
      this.onAuthError(e)
    }
  },

  async signout() {
    const response = await fetch(this.fullpath(this.signoutPath), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      credentials: 'include',
      mode: 'cors'
    })

    if (response.ok) {
      this.onSignedOut('signed out')
    } else {
    }
  }
}
