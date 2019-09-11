# central-services-shared
[![Git Commit](https://img.shields.io/github/last-commit/mojaloop/central-services-shared.svg?style=flat)](https://github.com/mojaloop/central-services-shared/commits/master)
[![Git Releases](https://img.shields.io/github/release/mojaloop/central-services-shared.svg?style=flat)](https://github.com/mojaloop/central-services-shared/releases)
[![Npm Version](https://img.shields.io/npm/v/@mojaloop/central-services-shared.svg?style=flat)](https://www.npmjs.com/package/@mojaloop/central-services-shared)
[![NPM Vulnerabilities](https://img.shields.io/snyk/vulnerabilities/npm/@mojaloop/central-services-shared.svg?style=flat)](https://www.npmjs.com/package/@mojaloop/central-services-shared)
[![CircleCI](https://circleci.com/gh/mojaloop/central-services-shared.svg?style=svg)](https://circleci.com/gh/mojaloop/central-services-shared)

Shared code for central services

## Usage
### Logger
To use the shared Logger class, you only need to require it in the file you want to perform logging in:

```javascript
const Logger = require('central-services-shared').Logger
```

Then you simply need to call the appropriate method for the logging level you desire:

```javascript
Logger.debug('this is only a debug statement')
Logger.info('this is some info')
Logger.warn('warning')
Logger.error('an error has occurred')
```

The Logger class is backed by [Winston](https://github.com/winstonjs/winston), which allows you to do things like [string interpolation](https://github.com/winstonjs/winston#string-interpolation):

```javascript
Logger.info('test message %s', 'my string');
```

You can also call the Logger.log method which directly calls the Winston log method and gives even more flexibility.

By default, the Logger class is setup to log to the console only, with timestamps and colorized output.
