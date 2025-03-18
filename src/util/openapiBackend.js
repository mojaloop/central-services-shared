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

 * Rajiv Mothilal <rajiv.mothilal@modusbox.com>
 --------------
 ******/
'use strict'

const ErrorHandler = require('@mojaloop/central-services-error-handling')
const OpenAPIBackend = require('openapi-backend').default
const Ajv = require('ajv')
const addFormats = require("ajv-formats")

/// The below custom OpenAPIValidator is no longer needed when using AJV v8.x as it supports unicode by default - https://ajv.js.org/v6-to-v8-migration.html. Keeping this code snippet if we need to downgrade to AJV v6.x.
// const OpenAPIValidator = require('openapi-backend').OpenAPIValidator
// const schemaValidator = require('./schema').OpenapiSchemaValidator

const initialise = async (definitionPath, handlers, ajvOpts = { $data: true, coerceTypes: true }, regexFlags = 'u') => {
  if (ajvOpts.coerceTypes === undefined) {
    ajvOpts.coerceTypes = true
  }
  const ajv = new Ajv(ajvOpts)
  addFormats(ajv)
  ajv.addVocabulary(['example'])
  await require('ajv-keywords')(ajv)
  const api = new OpenAPIBackend({
    definition: definitionPath,
    strict: false,
    validate: true,
    ajvOpts: {
      coerceTypes: true
    },
    customizeAjv: () => ajv,
    handlers
  })
  await api.init()
  /// The below custom OpenAPIValidator is no longer needed when using AJV v8.x as it supports unicode by default - https://ajv.js.org/v6-to-v8-migration.html. Keeping this code snippet if we need to downgrade to AJV v6.x.
  // const updatedDefinition = schemaValidator.generateNewDefinition(api.definition, regexFlags)
  // api.validator = new OpenAPIValidator({
  //   definition: updatedDefinition,
  //   ajvOpts: {
  //     coerceTypes: true
  //   },
  //   customizeAjv: () => ajv
  // })
  return api
}

/**
 * Default method to handle validation errors for OpenAPI Backend.
 *
 * @param context {Object} - the OpenAPI backend context
 * @throws {FSPIOPError}
 */
const validationFail = async (context) => {
  const fspiopError = ErrorHandler.Factory.createFSPIOPErrorFromOpenapiError(context.validation.errors[0])
  throw fspiopError
}

/**
 * Default method to handle not found URI errors for OpenAPI Backend.
 *
 * @param context {Object} - the OpenAPI backend context
 * @throws {FSPIOPError}
 */
const notFound = async (context) => {
  const error = {
    keyword: 'notFound',
    dataPath: context.request.method + ' ' + context.request.path,
    message: context.request.method + ' ' + context.request.path
  }
  throw ErrorHandler.Factory.createFSPIOPErrorFromOpenapiError(error)
}

/**
 * Default method to handle method not allowed errors for OpenAPI Backend.
 *
 * @param context {Object} - the OpenAPI backend context
 * @throws {FSPIOPError}
 */
const methodNotAllowed = async (context) => {
  const error = {
    keyword: 'methodNotAllowed',
    dataPath: context.request.method + ' ' + context.request.path
  }
  throw ErrorHandler.Factory.createFSPIOPErrorFromOpenapiError(error)
}

module.exports = {
  initialise,
  validationFail,
  notFound,
  methodNotAllowed
}
