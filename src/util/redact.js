/*****
 License
 --------------
 Copyright © 2020-2025 Mojaloop Foundation
 The Mojaloop files are made available by the Mojaloop Foundation under the Apache License, Version 2.0 (the "License") and you may not use these files except in compliance with the License. You may obtain a copy of the License at
 http://www.apache.org/licenses/LICENSE-2.0
 Unless required by applicable law or agreed to in writing, the Mojaloop files are distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 Contributors
 --------------
 This is the official list of the Mojaloop project contributors for this file.
 Names of the original copyright holders (individuals or organizations)
 should be listed with a '*' in the first column. People who have
 contributed from an organization can be listed under the organization
 that actually holds the copyright for their contributions (see the
 Mojaloop Foundation for an example). Those individuals should have
 their names indented and be marked with a '-'. Email address can be added
 optionally within square brackets <email>.

 * Mojaloop Foundation
 - Name Surname <name.surname@mojaloop.io>

 * Infitx
 - Kevin Leyow <kevin.leyow@infitx.com>

 --------------
 ******/

/**
 * Recursively redacts sensitive information from an object by replacing values of sensitive keys or values with '[REDACTED]'.
 *
 * Sensitive keys are determined by a default list, optional extra keys, and key name patterns (e.g., containing 'secret', 'password', 'private', 'token', or 'key').
 * Sensitive values are detected by matching against common patterns (e.g., JWTs, private keys, or containing sensitive words).
 *
 * @param {Object} obj - The object to redact sensitive information from.
 * @param {string[]} [extraKeys=[]] - Additional keys to treat as sensitive.
 * @param {RegExp[]} [extraPatterns=[]] - Additional regex patterns to identify sensitive values.
 * @returns {Object} A new object with sensitive values replaced by '[REDACTED]'.
 *
 * @example
 * const input = { password: '1234', user: 'alice', nested: { token: 'abcd' } };
 * const redacted = redact(input);
 * // redacted: { password: '[REDACTED]', user: 'alice', nested: { token: '[REDACTED]' } }
 */
function redact (obj, extraKeys = [], extraPatterns = []) {
  const DEFAULT_SENSITIVE_KEYS = [
    'APP_OAUTH_CLIENT_KEY',
    'APP_OAUTH_CLIENT_SECRET',
    'TOTP_ADMIN_AUTH_USER',
    'TOTP_ADMIN_AUTH_PASSWORD',
    'WSO2_MANAGER_SERVICE_USER',
    'WSO2_MANAGER_SERVICE_PASSWORD',
    'DATABASE_USER',
    'DATABASE_PASSWORD',
    'OAUTH_RESET_PASSWORD_AUTH_PASSWORD',
    'token',
    'access_token',
    'refresh_token',
    'id_token',
    'auth_token',
    'authorization',
    'api_key',
    'apikey',
    'secret',
    'client_secret',
    'client_id',
    'password',
    'passphrase',
    'private_key',
    'rsa_private_key',
    'jwt',
    'sessionid',
    'session_id',
    'cookie',
    'set-cookie',
    'RSA PRIVATE KEY'
  ]

  const SENSITIVE_KEYS = DEFAULT_SENSITIVE_KEYS.concat(extraKeys)

  function isSensitiveKey (key = '') {
    const lowerKey = key.toLowerCase()
    return (
      SENSITIVE_KEYS.map(k => k.toLowerCase()).includes(lowerKey) ||
      lowerKey.includes('secret') ||
      lowerKey.includes('password') ||
      lowerKey.includes('private') ||
      lowerKey.includes('token') ||
      lowerKey.includes('key') ||
      lowerKey.includes('auth') ||
      lowerKey.includes('session') ||
      lowerKey.includes('cookie')
    )
  }

  function isSensitiveValue (val) {
    if (typeof val !== 'string') return false
    const patterns = [
      /^-----BEGIN (RSA |EC |DSA )?PRIVATE KEY-----/,
      /^-----BEGIN PRIVATE KEY-----/,
      /^eyJ[a-zA-Z0-9-_]+\.[a-zA-Z0-9-_]+\.[a-zA-Z0-9-_]+$/, // JWT
      /password/i,
      /secret/i,
      /token/i,
      /private/i,
      /key/i,
      /bearer\s+[a-z0-9-_.]+/i,
      /sessionid/i,
      /cookie/i
    ].concat(extraPatterns)
    return patterns.some(pattern => pattern.test(val))
  }

  function _redact (val, key) {
    if (typeof val === 'object' && val !== null) {
      if (Array.isArray(val)) {
        return val.map((v) => _redact(v))
      }
      const out = {}
      for (const k in val) {
        out[k] = _redact(val[k], k)
      }
      return out
    }
    if (isSensitiveKey(key) || isSensitiveValue(val)) {
      return '[REDACTED]'
    }
    return val
  }
  return _redact(obj)
}

module.exports = { redact }
