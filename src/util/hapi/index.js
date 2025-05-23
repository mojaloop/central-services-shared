'use strict'

const HapiRawPayload = require('./plugins/rawPayloadToDataUri')
const HapiEventPlugin = require('./plugins/eventPlugin')
const OpenapiBackendValidator = require('./plugins/openapiBackendValidator')
const FSPIOPHeaderValidation = require('./plugins/headerValidation')
const customCurrencyCodeValidation = require('./plugins/customCurrencyCodeExtension')
const APIDocumentation = require('./plugins/apiDocumentation')
const loggingPlugin = require('./plugins/loggingPlugin')
const { API_TYPES } = require('../../constants')

module.exports = {
  HapiRawPayload,
  HapiEventPlugin,
  OpenapiBackendValidator,
  FSPIOPHeaderValidation,
  customCurrencyCodeValidation,
  APIDocumentation,
  loggingPlugin,
  API_TYPES
}
