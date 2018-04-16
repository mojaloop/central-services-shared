*Example Consumer*

```JSON
const testConsumer = async () => {
  console.log('Instantiate consumer')
  var c = new Consumer(['test1'])

  console.log('Connect consumer')
  var connectionResult = await c.connect()

  console.log(`Connected result=${connectionResult}`)

  console.log('Consume messages')

  c.consume((error, message) => {
    return new Promise((resolve, reject) => {
      if (error) {
        console.log(`WTDSDSD!!! error ${error}`)
        // resolve(false)
        reject(error)
      }
      if (message) { // check if there is a valid message comming back
        console.log(`Message Received by callback function - ${JSON.stringify(message)}`)
        // lets check if we have received a batch of messages or single. This is dependant on the Consumer Mode
        if (Array.isArray(message) && message.length != null && message.length > 0) {
          message.forEach(msg => {
            c.commitMessage(msg)
          })
        } else {
          c.commitMessage(message)
        }
        resolve(true)
      } else {
        resolve(false)
      }
      // resolve(true)
    })
  })

  // consume 'ready' event
  c.on('ready', arg => console.log(`onReady: ${JSON.stringify(arg)}`))
  // consume 'message' event
  c.on('message', message => console.log(`onMessage: ${message.offset}, ${JSON.stringify(message.value)}`))
  // consume 'batch' event
  c.on('batch', message => console.log(`onBatch: ${JSON.stringify(message)}`))

  console.log('testConsumer::end')
}

testConsumer()
```