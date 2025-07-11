const DEFAULT_RETRY_ATTEMPTS = 3
const DEFAULT_RETRY_DELAY_MS = 100

async function retryCommand (fn, log, attempts = DEFAULT_RETRY_ATTEMPTS, delay = DEFAULT_RETRY_DELAY_MS) {
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
  retryCommand
}
