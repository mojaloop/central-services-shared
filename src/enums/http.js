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

 * ModusBox
 - Georgi Georgiev <georgi.georgiev@modusbox.com>
 - Miguel de Barros <miguel.debarros@modusbox.com>
 - Rajiv Mothilal <rajiv.mothilal@modusbox.com>

 --------------
 ******/
'use strict'

const Headers = {
  FSPIOP: {
    SOURCE: 'fspiop-source',
    DESTINATION: 'fspiop-destination',
    PROXY: 'fspiop-proxy',
    HTTP_METHOD: 'fspiop-http-method',
    SIGNATURE: 'fspiop-signature',
    URI: 'fspiop-uri'
  },
  GENERAL: {
    ACCEPT: {
      regex: /application\/vnd.interoperability[.]/,
      value: 'accept'
    },
    DATE: 'date',
    CONTENT_LENGTH: 'content-length',
    HOST: 'host',
    CONTENT_TYPE: {
      regex: /application\/vnd.interoperability[.]/,
      value: 'content-type'
    }
  },
  DEFAULT: {
    APPLICATION_JSON: 'application/json'
  },
  DEFAULT_API_VERSIONS: {
    parties: {
      contentVersion: '1.0',
      acceptVersion: '1'
    },
    participants: {
      contentVersion: '1.0',
      acceptVersion: '1'
    },
    quotes: {
      contentVersion: '1.0',
      acceptVersion: '1'
    },
    fxQuotes: {
      contentVersion: '2.0',
      acceptVersion: '2'
    },
    bulkQuotes: {
      contentVersion: '1.0',
      acceptVersion: '1'
    },
    bulkTransfers: {
      contentVersion: '1.0',
      acceptVersion: '1'
    },
    transactionRequests: {
      contentVersion: '1.0',
      acceptVersion: '1'
    },
    authorizations: {
      contentVersion: '1.0',
      acceptVersion: '1'
    },
    transfers: {
      contentVersion: '1.0',
      acceptVersion: '1'
    },
    fxTransfers: {
      contentVersion: '2.0',
      acceptVersion: '2'
    },
    custom: {
      contentVersion: '1.0',
      acceptVersion: '1'
    },
    thirdparty: {
      contentVersion: '1.0',
      acceptVersion: '1'
    },
    services: {
      contentVersion: '1.0',
      acceptVersion: '1'
    }
  }
}

const RestMethods = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  DELETE: 'DELETE',
  PATCH: 'PATCH'
}

const HeaderResources = {
  PARTICIPANTS: 'participants',
  ORACLE: 'oracle',
  // SWITCH: 'switch', // @note: hub/switch name should now be passed in via service config.
  TRANSFERS: 'transfers',
  FX_TRANSFERS: 'fxTransfers',
  QUOTES: 'quotes',
  FX_QUOTES: 'fxQuotes'
}

const ServiceType = {
  API: 'api',
  HANDLER: 'handler'
}

const ResponseTypes = {
  JSON: 'json'
}

const ReturnCodes = {
  OK: {
    CODE: 200,
    DESCRIPTION: 'OK'
  },
  CREATED: {
    CODE: 201,
    DESCRIPTION: 'Created'
  },
  ACCEPTED: {
    CODE: 202,
    DESCRIPTION: 'Accepted'
  },
  NONAUTHORIZED: {
    CODE: 203,
    DESCRIPTION: 'Non-Authoritative Information (since HTTP/1.1)'
  },
  NOCONTENT: {
    CODE: 204,
    DESCRIPTION: 'No Content'
  },
  RESETCONTENT: {
    CODE: 205,
    DESCRIPTION: 'Reset Content'
  },
  PARTIALCONTENT: {
    CODE: 206,
    DESCRIPTION: 'Partial Content (RFC 7233)'
  },
  MULTISTATUS: {
    CODE: 207,
    DESCRIPTION: 'Multi-Status (WebDAV; RFC 4918)'
  },
  ALREADYREPORTED: {
    CODE: 208,
    DESCRIPTION: 'Already Reported (WebDAV; RFC 5842)'
  },
  IMUSED: {
    CODE: 226,
    DESCRIPTION: 'IM Used (RFC 3229)'
  },
  MULTIPLECHOICES: {
    CODE: 300,
    DESCRIPTION: 'Multiple Choices'
  },
  MOVEDPERMANETLY: {
    CODE: 301,
    DESCRIPTION: 'Moved Permanently'
  },
  FOUND: {
    CODE: 302,
    DESCRIPTION: 'Found (Previously "Moved temporarily")'
  },
  SEEOTHER: {
    CODE: 303,
    DESCRIPTION: 'See Other (since HTTP/1.1)'
  },
  NOTMODIFIED: {
    CODE: 304,
    DESCRIPTION: 'Not Modified (RFC 7232)'
  },
  USEPROXY: {
    CODE: 305,
    DESCRIPTION: 'Use Proxy (since HTTP/1.1)'
  },
  SWITCHPROXY: {
    CODE: 306,
    DESCRIPTION: 'Switch Proxy'
  },
  TEMPORARYREDIRECT: {
    CODE: 307,
    DESCRIPTION: 'Temporary Redirect (since HTTP/1.1)'
  },
  PAYMENTREDIRECT: {
    CODE: 308,
    DESCRIPTION: 'Permanent Redirect (RFC 7538)'
  },
  BADREQUEST: {
    CODE: 400,
    DESCRIPTION: 'Bad Request'
  },
  UNAUTHORIZED: {
    CODE: 401,
    DESCRIPTION: 'Unauthorized (RFC 7235)'
  },
  PAYMENREQUIRED: {
    CODE: 402,
    DESCRIPTION: 'Payment Required'
  },
  FORBIDDEN: {
    CODE: 403,
    DESCRIPTION: 'Forbidden'
  },
  NOTFOUND: {
    CODE: 404,
    DESCRIPTION: 'Not Found'
  },
  METHODNOTALLOWED: {
    CODE: 405,
    DESCRIPTION: 'Method Not Allowed'
  },
  NOTACCEPTABLE: {
    CODE: 406,
    DESCRIPTION: 'Not Acceptable'
  },
  PROXYAUTHENTICATIONREQUIRED: {
    CODE: 407,
    DESCRIPTION: 'Proxy Authentication Required (RFC 7235)'
  },
  REQUESTTIMEOUT: {
    CODE: 408,
    DESCRIPTION: 'Request Timeout'
  },
  CONFLICT: {
    CODE: 409,
    DESCRIPTION: 'Conflict'
  },
  GONE: {
    CODE: 410,
    DESCRIPTION: 'Gone'
  },
  LENGTHREQUIRED: {
    CODE: 411,
    DESCRIPTION: 'Length Required'
  },
  PRECONDITIONFAILED: {
    CODE: 412,
    DESCRIPTION: 'Precondition Failed (RFC 7232)'
  },
  PAYLOADTOOLARGE: {
    CODE: 413,
    DESCRIPTION: 'Payload Too Large (RFC 7231)'
  },
  URITOOLONG: {
    CODE: 414,
    DESCRIPTION: 'URI Too Long (RFC 7231)'
  },
  UNSUPPORTEDMEDIATYPE: {
    CODE: 415,
    DESCRIPTION: 'Unsupported Media Type (RFC 7231)'
  },
  RANGENOTSATISFIABLE: {
    CODE: 416,
    DESCRIPTION: 'Range Not Satisfiable (RFC 7233)'
  },
  EXPECTATIONFAILED: {
    CODE: 417,
    DESCRIPTION: 'Expectation Failed'
  },
  IMATEAPOT: {
    CODE: 418,
    DESCRIPTION: 'I\'m a teapot (RFC 2324, RFC 7168)'
  },
  MISDRECTEDREQUEST: {
    CODE: 421,
    DESCRIPTION: 'Misdirected Request (RFC 7540)'
  },
  UNPROCESSABLEENTITY: {
    CODE: 422,
    DESCRIPTION: 'Unprocessable Entity (WebDAV; RFC 4918)'
  },
  LOCKED: {
    CODE: 423,
    DESCRIPTION: 'Locked (WebDAV; RFC 4918)'
  },
  FAILEDDEPENDENCY: {
    CODE: 424,
    DESCRIPTION: 'Failed Dependency (WebDAV; RFC 4918)'
  },
  TOOEARLY: {
    CODE: 425,
    DESCRIPTION: 'Too Early (RFC 8470)'
  },
  UPGRADEREQUIRED: {
    CODE: 426,
    DESCRIPTION: 'Upgrade Required'
  },
  PRECONDITIONREQUIRED: {
    CODE: 428,
    DESCRIPTION: 'Precondition Required (RFC 6585)'
  },
  TOOMANYREQUESTS: {
    CODE: 429,
    DESCRIPTION: 'Too Many Requests (RFC 6585)'
  },
  REQUESTHEADERFIELDSTOOLARGE: {
    CODE: 431,
    DESCRIPTION: 'Request Header Fields Too Large (RFC 6585)'
  },
  INTERNALSERVERERRROR: {
    CODE: 500,
    DESCRIPTION: 'Internal Server Error'
  },
  NOTIMPLEMEMNTED: {
    CODE: 501,
    DESCRIPTION: 'Not Implemented'
  },
  BADGATEWAY: {
    CODE: 502,
    DESCRIPTION: 'Bad Gateway'
  },
  SERVICEANAVILABLE: {
    CODE: 503,
    DESCRIPTION: 'Service Unavailable'
  },
  GATEWAYTIMEOUT: {
    CODE: 504,
    DESCRIPTION: 'Gateway Timeout'
  },
  HTTPVERSIONNOTSUPPORTED: {
    CODE: 505,
    DESCRIPTION: 'HTTP Version Not Supported'
  },
  VARIANTALSONEGOTIATES: {
    CODE: 506,
    DESCRIPTION: 'Variant Also Negotiates (RFC 2295)'
  },
  INSUFFICIENTSTORAGE: {
    CODE: 507,
    DESCRIPTION: 'Insufficient Storage (WebDAV; RFC 4918)'
  },
  LOOPDETECTED: {
    CODE: 508,
    DESCRIPTION: 'Loop Detected (WebDAV; RFC 5842)'
  },
  NOTEXTENDED: {
    CODE: 510,
    DESCRIPTION: 'Not Extended (RFC 2774)'
  },
  NETWORKAUTHENTICATIONREQUIRED: {
    CODE: 51,
    DESCRIPTION: 'Network Authentication Required (RFC 6585)'
  }
}

module.exports = {
  Headers,
  ReturnCodes,
  RestMethods,
  ResponseTypes,
  HeaderResources,
  ServiceType
}
