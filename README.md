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

```
const Logger = require('central-services-shared').Logger
```

Then you simply need to call the appropriate method for the logging level you desire:

```
Logger.debug('this is only a debug statement')
Logger.info('this is some info')
Logger.warn('warning')
Logger.error('an error has occurred')
```

The Logger class is backed by [Winston](https://github.com/winstonjs/winston), which allows you to do things like [string interpolation](https://github.com/winstonjs/winston#string-interpolation):

```
Logger.info('test message %s', 'my string');
```

You can also call the Logger.log method which directly calls the Winston log method and gives even more flexibility.

By default, the Logger class is setup to log to the console only, with timestamps and colorized output.

#### nvm 

######(This is optional, you can install node directly from the website, node version manager(nvm) isn't really needed unless you want to use multiple versions of node)

If you are on **Ubuntu** refer to [nvm github page](https://github.com/creationix/nvm) for installation

If you are **MacOS** download the nvm install via Homebrew:

```
brew update
brew install nvm
mkdir ~/.nvm
vi ~/.bash_profile
```

* Ensure that nvm was installed correctly with `nvm --version`, which should return the version of nvm installed
* Install the version (at time of publish 10.15.3 current LTS) of Node.js you want:
  * Install the latest LTS version with `nvm install --lts`
  * Use the latest LTS verison with `nvm use --lts`
  * Install the latest version with `nvm install node`
  * Use the latest version with `nvm use node`
  * If necessary, fallback to `nvm install 10.15.3`

##### Setup nvm
Create a *.bash_profile* file with `touch ~/.bash_profile`, then `nano ~/.bash_profile` and *write*:
```
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh" # This loads nvm
```

#### npm
By installing *node* during *nvm* installation above, you should have the corresponding npm version installed

##### Setup npm
* The _.npmrc_ file in your user root just needs to be present as the repository it will use is 
http://npmjs.org If it doesn't exist just create it.

* Then **cd** into the central_services_stream project and run the following command:
```
npm install
```

#### Testing
* Run the following command for unit test:
```
npm test
```

For test coverage run:
```
npm run test:coverage
```

For test coverage checks run:
```
npm run test:coverage-check
```