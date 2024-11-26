/*****
 License
 --------------
 Copyright © 2017 Bill & Melinda Gates Foundation
 The Mojaloop files are made available by the Bill & Melinda Gates Foundation under the Apache License, Version 2.0 (the "License") and you may not use these files except in compliance with the License. You may obtain a copy of the License at
 http://www.apache.org/licenses/LICENSE-2.0
 Unless required by applicable law or agreed to in writing, the Mojaloop files are distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 Contributors
 --------------
 This is the official list of the Mojaloop project contributors for this file.
 Names of the original copyright holders (individuals or organizations)
 should be listed with a '*' in the first column. People who have
 contributed from an organization can be listed under the organization
 that actually holds the copyright for their contributions (see the
 Gates Foundation organization for an example). Those individuals should have
 their names indented and be marked with a '-'. Email address can be added
 optionally within square brackets <email>.
 * Gates Foundation
 * Name Surname <name.surname@gatesfoundation.com>

 * ModusBox
 - Georgi Georgiev <georgi.georgiev@modusbox.com>
 - Miguel de Barros <miguel.debarros@modusbox.com>
 - Rajiv Mothilal <rajiv.mothilal@modusbox.com>
 --------------
 ******/
'use strict'

const _ = require('lodash')
const Kafka = require('./kafka')
const Endpoints = require('./endpoints')
const Participants = require('./participants')
const proxies = require('./proxies')
const Request = require('./request')
const Http = require('./http')
const Hapi = require('./hapi')
const Headers = require('./headers/transformer')
const HeaderValidation = require('./headerValidation')
const Encoding = require('./encoding')
const StreamingProtocol = require('./streaming/protocol')
const Time = require('./time')
const Hash = require('./hash')
const Comparators = require('./comparators/index')
const Helpers = require('./helpers') // prevent circular module require
const Settlement = require('./settlement')
const EventFramework = require('./eventFramework')
const Schema = require('./schema')
const OpenapiBackend = require('./openapiBackend')
const id = require('./id')
const config = require('../config')
const { loggerFactory } = require('@mojaloop/central-services-logger/src/contextLogger')

const omitNil = (object) => {
  return _.omitBy(object, _.isNil)
}

const pick = (object, properties) => {
  return _.pick(object, properties)
}

const assign = (target, source) => {
  return Object.assign(target, source)
}

const merge = (target, source) => {
  return Object.assign({}, target, source)
}

const mergeAndOmitNil = (target, source) => {
  return omitNil(merge(target, source))
}

const formatAmount = (amount, scale = 2) => {
  return Number(amount).toFixed(scale).toString()
}

const parseJson = (value) => {
  if (typeof value !== 'string') {
    return value
  }

  try {
    return JSON.parse(value)
  } catch (e) {
    return value
  }
}

const squish = (array) => {
  return _.join(array, '|')
}

const expand = (value) => {
  return (value) ? _.split(value, '|') : value
}

const filterUndefined = (fields) => {
  for (const key in fields) {
    if (fields[key] === undefined) {
      delete fields[key]
    }
  }
  return fields
}

/**
 * Method to provide object cloning
 *
 * TODO:
 *  Implement a better deep copy method
 *
 * @param value
 * @returns {any}
 */
const clone = (value) => {
  return _.cloneDeep(value)
}

/**
 * Method to delete a field from an object, using case insensitive comparison
 *
 * TODO:
 *  Implement a better delete method
 *
 * @param obj Object to have specified field deleted from
 * @param key Key to be deleted from the target Object
 */
const deleteFieldByCaseInsensitiveKey = (obj, key) => {
  for (const objKey in obj) {
    switch (objKey.toLowerCase()) {
      case (key.toLowerCase()):
        delete obj[objKey]
        break
      default:
        break
    }
  }
}

/**
 * Method to get a value based on a field (key) from an object, using case insensitive comparison
 *
 * TODO:
 *  Implement a better get method
 *
 * @param obj Object to have specified field searched for
 * @param key Key to be compared using case insensitive comparison
 * @returns value from case insensitive comparison search
 */
const getValueByCaseInsensitiveKey = (obj, key) => {
  return obj[Object.keys(obj).find(objKey => objKey.toLowerCase() === key.toLowerCase())]
}

/**
 * Method to set a value based on a field (key) from an object, using case insensitive comparison
 *
 * TODO:
 *  Implement a better set method
 *
 * @param obj Object to have specified field searched for
 * @param key Key to be compared using case insensitive comparison
 * @param value Value to be assigned to the associated key map
 * @returns value from case insensitive comparison search
 */
const setValueByCaseInsensitiveKey = (obj, key, value) => {
  for (const objKey in obj) {
    switch (objKey.toLowerCase()) {
      case (key.toLowerCase()):
        obj[objKey] = value
        break
      default:
        break
    }
  }
}

const breadcrumb = (location, message) => {
  if (typeof message === 'object') {
    if (message.method) {
      location.method = message.method
      location.path = `${location.module}::${location.method}`
    }
    if (message.path) {
      location.path = `${location.module}::${location.method}::${message.path}`
    }
  } else if (typeof message === 'string') {
    location.path += `::${message}`
  }
  return location.path
}

const getCircularReplacer = () => {
  const seen = new WeakSet()
  return (key, value) => {
    if (typeof value === 'object' && value !== null) {
      if (seen.has(value)) {
        return
      }
      seen.add(value)
    }
    return value
  }
}

const filterExtensions = (extensionsArray, exclKeysArray, exclValuesArray) => {
  const extensions = extensionsArray != null && typeof extensionsArray[Symbol.iterator] === 'function' ? extensionsArray : []
  const exclKeys = exclKeysArray != null && typeof exclKeysArray[Symbol.iterator] === 'function' ? exclKeysArray : []
  const exclValues = exclValuesArray != null && typeof exclValuesArray[Symbol.iterator] === 'function' ? exclValuesArray : []
  return extensions.filter(ext => {
    let match = false
    for (const key of exclKeys) {
      match = ext.key && (ext.key.search(key) + 1)
      if (match) return false
    }
    for (const value of exclValues) {
      match = ext.value && (ext.value.search(value) + 1)
      if (match) return false
    }
    return true
  })
}

const createLogger = (context) => {
  const log = loggerFactory(context)
  log.setLevel(config.get('logLevel'))
  return log
}

module.exports = {
  createLogger,
  assign,
  expand,
  formatAmount,
  merge,
  mergeAndOmitNil,
  omitNil,
  parseJson,
  pick,
  squish,
  filterUndefined,
  clone,
  deleteFieldByCaseInsensitiveKey,
  getValueByCaseInsensitiveKey,
  setValueByCaseInsensitiveKey,
  breadcrumb,
  transpose: Helpers.transpose,
  getCircularReplacer,
  filterExtensions,
  Kafka,
  Participants,
  proxies,
  Endpoints,
  Request,
  Http,
  Hapi,
  Headers,
  HeaderValidation,
  Encoding,
  StreamingProtocol,
  Time,
  Hash,
  Comparators,
  EventFramework,
  Settlement,
  Schema,
  OpenapiBackend,
  id,
  resourceVersions: Helpers.resourceVersions
}
