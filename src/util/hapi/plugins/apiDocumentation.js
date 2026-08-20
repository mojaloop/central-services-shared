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

 * Steven Oderayi <steven.oderayi@modusbox.com>
 * Lewis Daly     <lewis@tigerbeetle.com>
 --------------
 ******/
'use strict'

const assert = require('node:assert')
const fs = require('node:fs')
const yaml = require('yaml')

/**
 * Hapi plugin to add '/swagger.json' and '/documentation' endpoints.
 * Embeds a small html page which uses @scalar/api-reference to render the documentation.
 *
 * options.pathToSwaggerFile - Full path to the OpenAPI (fka Swagger) document (JSON or YAML).
 * options.documentPath - Legacy (pre-18.38) alias for pathToSwaggerFile; still accepted.
 */
const plugin = {
  name: 'apiDocumentation',
  register: (server, options) => {
    // 18.38.0 renamed the option from `documentPath` to `pathToSwaggerFile`; accept the
    // legacy name so pre-18.38 consumers keep registering (mojaloop/#4479).
    const pathToSwaggerFile = options.pathToSwaggerFile || options.documentPath
    assert(pathToSwaggerFile, 'Expected `options.pathToSwaggerFile` (or legacy `options.documentPath`).')

    // Check the file exists.
    let file
    let contents
    try {
      file = fs.readFileSync(pathToSwaggerFile)
      contents = parseJsonOrYaml(file.toString())
    } catch (err) {
      const errorMessage = `documentation - failed to read pathToSwaggerFile with error: ${err.message}`
      console.error(errorMessage)
      throw new Error(errorMessage)
    }

    const page = `<!DOCTYPE html>
    <html>
    <head><title>API Docs</title></head>
    <body>
      <script id="api-reference" data-url="/swagger.json"></script>
      <script src="https://cdn.jsdelivr.net/npm/@scalar/api-reference"></script>
    </body>
    </html>`

    server.route([
      {
        method: 'GET',
        path: '/swagger.json',
        options: {
          tags: ['api', 'documentation'],
          handler: (request, h) => {
            return h.response(contents).type('application/json')
          },
          plugins: {
            apiDocumentation: false
          }
        }
      },
      {
        method: 'GET',
        path: '/documentation',
        options: {
          tags: ['api', 'documentation'],
          handler: (_request, h) => {
            return h.response(page)
              .type('text/html')
          },
          plugins: {
            apiDocumentation: false
          }
        }
      }
    ])
  }
}

/**
 * Json parse, then yaml parse, otherwise throw
 */
const parseJsonOrYaml = (text) => {
  assert(text)
  try {
    return JSON.parse(text)
  } catch (_) {
  }
  try {
    return yaml.parse(text)
  } catch (_) {

  }

  throw new Error('parseJsonOrYaml text was neither JSON nor YAML.')
}

module.exports = { plugin }
