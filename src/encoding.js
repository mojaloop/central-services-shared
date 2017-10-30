'use strict'

exports.toBase64 = (value) => {
  return new Buffer(value).toString('base64')
}

exports.fromBase64 = (value) => {
  return new Buffer(value, 'base64').toString()
}
