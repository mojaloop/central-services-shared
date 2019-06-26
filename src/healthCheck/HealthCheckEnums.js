const statusEnum = {
  OK: 'OK',
  DOWN: 'DOWN'
}

const serviceName = {
  participantEndpointService: 'participantEndpointService',
  datastore: 'datastore',
  broker: 'broker',
  sidecar: 'sidecar',
  cache: 'cache'
}

module.exports = {
  serviceName,
  statusEnum
}
