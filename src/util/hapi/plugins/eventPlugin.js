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

 * Neal Donnan <neal.donnan@modusbox.com>
 --------------
 ******/
'use strict'

const EventSdk = require('@mojaloop/event-sdk')
const Logger = require('../../../logger')
const Enum = require('../../../enums')

const onPreAuth = (request, reply) => {
  if (request && request.route && request.route.settings && request.route.settings.tags && request.route.settings.tags.includes(Enum.Tags.RouteTags.SAMPLED)) {
    const context = EventSdk.Tracer.extractContextFromHttpRequest(request)
    const spanName = request.route.settings.id
    let span
    if (context) {
      span = EventSdk.Tracer.createChildSpanFromContext(spanName, context)
    } else {
      Logger.debug(`Starting parent span ${spanName}`)
      span = EventSdk.Tracer.createSpan(spanName)
    }
    reply.request.span = span
  }
  return reply.continue
}

const onPreResponse = (request, reply) => {
  const span = request.span
  const response = request.response
  if (span) {
    if (response instanceof Error || response.isBoom) {
      let state
      if (response.output.payload.errorInformation && response.output.payload.errorInformation.errorCode) {
        state = new EventSdk.EventStateMetadata(EventSdk.EventStatusType.failed, response.output.payload.errorInformation.errorCode, response.output.payload.errorInformation.errorDescription)
      } else {
        state = new EventSdk.EventStateMetadata(EventSdk.EventStatusType.failed, response.output.statusCode, response.message)
      }
      span.error(response, state)
      span.finish(response.message, state)
    } else {
      Logger.debug(`Finishing parent span ${span.spanContext.service}`)
      span.finish()
    }
  }
  return reply.continue
}

/**
 * HAPI plugin to start and stop a parent span on API requests.
 * In order to have a span created for a route the 'sampled' tag should be
 * applied to the route
 */
module.exports.plugin = {
  name: 'eventPlugin',
  register: function (server) {
    server.ext('onPreAuth', onPreAuth)
    server.ext('onPreResponse', onPreResponse)
  }
}
