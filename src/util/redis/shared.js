const DEFAULT_RETRY_ATTEMPTS = 3
const DEFAULT_RETRY_DELAY_MS = 200

async function retryCommand (fn, attempts, delay, log) {
  console.log('hello from retryCommand')
  let lastError
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn()
    } catch (err) {
      lastError = err
      if (log) log.warn(`Retrying Redis command (${i + 1}/${attempts}) due to error:`, err)
      if (i < attempts - 1) await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
  throw lastError
}

module.exports = {
  DEFAULT_RETRY_ATTEMPTS,
  DEFAULT_RETRY_DELAY_MS,
  retryCommand
}
