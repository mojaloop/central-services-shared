# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [18.26.0](https://github.com/mojaloop/central-services-shared/compare/v18.25.0...v18.26.0) (2025-05-13)


### Features

* add sharded pubsub support ([#450](https://github.com/mojaloop/central-services-shared/issues/450)) ([d98675c](https://github.com/mojaloop/central-services-shared/commit/d98675c4d403ad835f462affc06cbab55344958d))

## [18.25.0](https://github.com/mojaloop/central-services-shared/compare/v18.24.0...v18.25.0) (2025-05-13)


### Features

* bump up node to v22.15.0 ([#449](https://github.com/mojaloop/central-services-shared/issues/449)) ([8000922](https://github.com/mojaloop/central-services-shared/commit/8000922127549f1699850c1d5049f5328942b838))

## [18.24.0](https://github.com/mojaloop/central-services-shared/compare/v18.23.3...v18.24.0) (2025-04-17)


### Features

* add pub sub class ([#447](https://github.com/mojaloop/central-services-shared/issues/447)) ([10f5edf](https://github.com/mojaloop/central-services-shared/commit/10f5edf5377715e0193bb295536ef56b06fcb14e))

### [18.23.3](https://github.com/mojaloop/central-services-shared/compare/v18.23.2...v18.23.3) (2025-04-15)


### Chore

* **csi-1348:** used updated @mojaloop/sdk-standard-components ([#446](https://github.com/mojaloop/central-services-shared/issues/446)) ([e64297c](https://github.com/mojaloop/central-services-shared/commit/e64297c14a97f257d71e9d09330f6ac2e11bcd8d))

### [18.23.2](https://github.com/mojaloop/central-services-shared/compare/v18.23.1...v18.23.2) (2025-03-31)


### Bug Fixes

* do not log http agent internals, due to excessive object nesting ([#445](https://github.com/mojaloop/central-services-shared/issues/445)) ([46ecaba](https://github.com/mojaloop/central-services-shared/commit/46ecabaec3fc5695ffbef8ff072f5fa43000f612))

### [18.23.1](https://github.com/mojaloop/central-services-shared/compare/v18.23.0...v18.23.1) (2025-03-25)


### Chore

* **csi-1266:** fixed logging in countFspiopError ([#444](https://github.com/mojaloop/central-services-shared/issues/444)) ([2d9f8dd](https://github.com/mojaloop/central-services-shared/commit/2d9f8dd4d952b507ced988ab4d1e49de2aa7d863))

## [18.23.0](https://github.com/mojaloop/central-services-shared/compare/v18.22.4...v18.23.0) (2025-03-18)


### Features

* add context and expected labels to errorCount metric ([#443](https://github.com/mojaloop/central-services-shared/issues/443)) ([f794188](https://github.com/mojaloop/central-services-shared/commit/f794188b8a37dfcf35f7df858e672d1f2e075454))

### [18.22.4](https://github.com/mojaloop/central-services-shared/compare/v18.22.3...v18.22.4) (2025-03-13)


### Chore

* **csi-1233:** improved participantEndpointCache logging ([#440](https://github.com/mojaloop/central-services-shared/issues/440)) ([94eb898](https://github.com/mojaloop/central-services-shared/commit/94eb898a0d3cb9152390162d5fefca24a6c6082e))

### [18.22.3](https://github.com/mojaloop/central-services-shared/compare/v18.22.2...v18.22.3) (2025-03-12)


### Chore

* fix dependency loop ([#442](https://github.com/mojaloop/central-services-shared/issues/442)) ([f9f853e](https://github.com/mojaloop/central-services-shared/commit/f9f853e9c77e9c0e9c1dbbf46e555300470dd1d1))

### [18.22.2](https://github.com/mojaloop/central-services-shared/compare/v18.22.1...v18.22.2) (2025-03-12)


### Chore

* fix dependency loop ([#441](https://github.com/mojaloop/central-services-shared/issues/441)) ([13fa3a5](https://github.com/mojaloop/central-services-shared/commit/13fa3a533f96503ba8dce56c26846b5014f9e103))

### [18.22.1](https://github.com/mojaloop/central-services-shared/compare/v18.22.0...v18.22.1) (2025-03-07)


### Bug Fixes

* **csi-1297:** used logger.child() to create a new logger ([#439](https://github.com/mojaloop/central-services-shared/issues/439)) ([3e25d16](https://github.com/mojaloop/central-services-shared/commit/3e25d163b63147b93def4058b9bb8aecb6716bf9))

## [18.22.0](https://github.com/mojaloop/central-services-shared/compare/v18.21.0...v18.22.0) (2025-03-06)


### Features

* **csi-1252:** added error output to final request log ([#438](https://github.com/mojaloop/central-services-shared/issues/438)) ([314e16a](https://github.com/mojaloop/central-services-shared/commit/314e16a54045b09b674f03b0cf70ccb54cc74251))

## [18.21.0](https://github.com/mojaloop/central-services-shared/compare/v18.20.0...v18.21.0) (2025-02-28)


### Features

* added enums for audit tags ([#437](https://github.com/mojaloop/central-services-shared/issues/437)) ([06a2f6c](https://github.com/mojaloop/central-services-shared/commit/06a2f6cfcf2d6dbab4ea71e3d1c43edf6147f5b3))

## [18.20.0](https://github.com/mojaloop/central-services-shared/compare/v18.19.0...v18.20.0) (2025-02-26)


### Features

* **csi-1194:** add audit query tags for ml-api ([#435](https://github.com/mojaloop/central-services-shared/issues/435)) ([6ffc75d](https://github.com/mojaloop/central-services-shared/commit/6ffc75de3bf50b7da072a25ff1bea8e317c21695))

## [18.19.0](https://github.com/mojaloop/central-services-shared/compare/v18.18.2...v18.19.0) (2025-02-25)


### Features

* add option to count error only ([#436](https://github.com/mojaloop/central-services-shared/issues/436)) ([7703a67](https://github.com/mojaloop/central-services-shared/commit/7703a671d85021c2954d686fb3317d3c1bc18e78))

### [18.18.2](https://github.com/mojaloop/central-services-shared/compare/v18.18.1...v18.18.2) (2025-02-21)


### Chore

* maintenance updates ([#434](https://github.com/mojaloop/central-services-shared/issues/434)) ([ef90f8c](https://github.com/mojaloop/central-services-shared/commit/ef90f8c338e20db0642e749365d14e5a7c38c40b))

### [18.18.1](https://github.com/mojaloop/central-services-shared/compare/v18.18.0...v18.18.1) (2025-02-20)


### Chore

* update src code headers pi26 ([#433](https://github.com/mojaloop/central-services-shared/issues/433)) ([0ddb11b](https://github.com/mojaloop/central-services-shared/commit/0ddb11ba0e50348e95b71c9c0669334f09d8aa6e))

## [18.18.0](https://github.com/mojaloop/central-services-shared/compare/v18.17.0...v18.18.0) (2025-02-17)


### Features

* align audits ALS ([#432](https://github.com/mojaloop/central-services-shared/issues/432)) ([1a7bd9c](https://github.com/mojaloop/central-services-shared/commit/1a7bd9c26a5d2c6b052950a1ff8450a8caead305))

## [18.17.0](https://github.com/mojaloop/central-services-shared/compare/v18.16.2...v18.17.0) (2025-01-30)


### Features

* throw better error for missing date header ([#431](https://github.com/mojaloop/central-services-shared/issues/431)) ([1125b1e](https://github.com/mojaloop/central-services-shared/commit/1125b1e48d2a0918188563386eb69495f0521a9c))

### [18.16.2](https://github.com/mojaloop/central-services-shared/compare/v18.16.1...v18.16.2) (2025-01-27)


### Chore

* clean unused import ([#430](https://github.com/mojaloop/central-services-shared/issues/430)) ([59bb08c](https://github.com/mojaloop/central-services-shared/commit/59bb08c20fd679a89f4e282163276267596f5e5e))

### [18.16.1](https://github.com/mojaloop/central-services-shared/compare/v18.16.0...v18.16.1) (2025-01-27)


### Bug Fixes

* fixed type definition ([#429](https://github.com/mojaloop/central-services-shared/issues/429)) ([0acce0b](https://github.com/mojaloop/central-services-shared/commit/0acce0b68fc5827bbb8fe3e36f4d38c42407629b))

## [18.16.0](https://github.com/mojaloop/central-services-shared/compare/v18.15.2...v18.16.0) (2025-01-24)


### Features

* added missing types and maintenance fixes ([#428](https://github.com/mojaloop/central-services-shared/issues/428)) ([f8e84e5](https://github.com/mojaloop/central-services-shared/commit/f8e84e52c3052196de23b51994297b35fd6ac757))

### [18.15.2](https://github.com/mojaloop/central-services-shared/compare/v18.15.1...v18.15.2) (2025-01-20)


### Chore

* add date validation ([#427](https://github.com/mojaloop/central-services-shared/issues/427)) ([96b3e34](https://github.com/mojaloop/central-services-shared/commit/96b3e34cf9732178b197daa488079f1bb7ea6bf9))

### [18.15.1](https://github.com/mojaloop/central-services-shared/compare/v18.15.0...v18.15.1) (2025-01-07)


### Chore

* fix vulnerabilities and clean audit-ci.jsonc ([#426](https://github.com/mojaloop/central-services-shared/issues/426)) ([d6728eb](https://github.com/mojaloop/central-services-shared/commit/d6728ebe4cae3d1b0d12eb547d9962c6c4a08098))

## [18.15.0](https://github.com/mojaloop/central-services-shared/compare/v18.14.2...v18.15.0) (2025-01-06)


### Features

* add rethrow functions ([#425](https://github.com/mojaloop/central-services-shared/issues/425)) ([82758d4](https://github.com/mojaloop/central-services-shared/commit/82758d4a3ffcd9cefadfcd1d22b5e2dab6aa3358))

### [18.14.2](https://github.com/mojaloop/central-services-shared/compare/v18.14.1...v18.14.2) (2024-12-20)


### Bug Fixes

* modify internal routes for logging ([#424](https://github.com/mojaloop/central-services-shared/issues/424)) ([262cb0d](https://github.com/mojaloop/central-services-shared/commit/262cb0d7ead0705896c259abb2a68878d456259c))

### [18.14.1](https://github.com/mojaloop/central-services-shared/compare/v18.14.0...v18.14.1) (2024-12-12)


### Chore

* standardize egress audit key ([#423](https://github.com/mojaloop/central-services-shared/issues/423)) ([fa5ff1e](https://github.com/mojaloop/central-services-shared/commit/fa5ff1e9f428815db6d3cbea89d0e9a760fd6c27))

## [18.14.0](https://github.com/mojaloop/central-services-shared/compare/v18.13.0...v18.14.0) (2024-12-11)


### Features

* update event type ([#422](https://github.com/mojaloop/central-services-shared/issues/422)) ([e33d748](https://github.com/mojaloop/central-services-shared/commit/e33d748e1face53022d4c4a2a9eac84f8d0b3bec))

## [18.13.0](https://github.com/mojaloop/central-services-shared/compare/v18.12.1...v18.13.0) (2024-12-10)


### Features

* **csi-927:** added loggingPlugin to util/hapi ([#421](https://github.com/mojaloop/central-services-shared/issues/421)) ([1676221](https://github.com/mojaloop/central-services-shared/commit/1676221faecfbb28d4838268099c7eeb0c2d836f))

### [18.12.1](https://github.com/mojaloop/central-services-shared/compare/v18.12.0...v18.12.1) (2024-12-02)


### Chore

* **moja-tools-bot:** update license md file ([#406](https://github.com/mojaloop/central-services-shared/issues/406)) ([dddff62](https://github.com/mojaloop/central-services-shared/commit/dddff625c50307bf833f8de49168f576040f2bc9))

## [18.12.0](https://github.com/mojaloop/central-services-shared/compare/v18.11.3...v18.12.0) (2024-11-29)


### Features

* log request error details ([#418](https://github.com/mojaloop/central-services-shared/issues/418)) ([5511386](https://github.com/mojaloop/central-services-shared/commit/551138626de6a5fa04c388e65c7c724ee222011b))

### [18.11.3](https://github.com/mojaloop/central-services-shared/compare/v18.11.2...v18.11.3) (2024-11-26)


### Chore

* **deps:** bump express from 4.19.2 to 4.21.1 ([#417](https://github.com/mojaloop/central-services-shared/issues/417)) ([a76199a](https://github.com/mojaloop/central-services-shared/commit/a76199a3e72fb54fa183adc9ba0e6f900b0c698f))

### [18.11.2](https://github.com/mojaloop/central-services-shared/compare/v18.11.1...v18.11.2) (2024-11-21)


### Bug Fixes

* **csi-933:** added http error response.data to logs ([#410](https://github.com/mojaloop/central-services-shared/issues/410)) ([809a633](https://github.com/mojaloop/central-services-shared/commit/809a633f2105d461704899c1c684b11fc72d91d0))

### [18.11.1](https://github.com/mojaloop/central-services-shared/compare/v18.11.0...v18.11.1) (2024-11-13)


### Bug Fixes

* **csi-421:** misleading error in fetchParticipant ([#409](https://github.com/mojaloop/central-services-shared/issues/409)) ([62fdfce](https://github.com/mojaloop/central-services-shared/commit/62fdfceef9be2df5e3cc3f2d799a3f493acf4485))

## [18.11.0](https://github.com/mojaloop/central-services-shared/compare/v18.10.0...v18.11.0) (2024-10-24)


### Features

* add generic redis get/set cache ([#403](https://github.com/mojaloop/central-services-shared/issues/403)) ([365f2d4](https://github.com/mojaloop/central-services-shared/commit/365f2d45e349d3d262c1e14ffd1245500537a633)), closes [#405](https://github.com/mojaloop/central-services-shared/issues/405)
* **csi-106:** added iso-20022 headers support ([#402](https://github.com/mojaloop/central-services-shared/issues/402)) ([290cad3](https://github.com/mojaloop/central-services-shared/commit/290cad3f04db1ff5d8bf042b96dffc0cf3e9f746))


### Chore

* fix bad version ([#408](https://github.com/mojaloop/central-services-shared/issues/408)) ([e100a24](https://github.com/mojaloop/central-services-shared/commit/e100a248f67c5da6c84c5b9a0fae234749f768a0))

## [18.10.0](https://github.com/mojaloop/central-services-shared/compare/v18.9.0...v18.10.0) (2024-10-14)


### Features

* add argument to add context to kafka message ([#404](https://github.com/mojaloop/central-services-shared/issues/404)) ([4d8f8de](https://github.com/mojaloop/central-services-shared/commit/4d8f8de33b613da1795d9b1765c81a108c212c39))

## [18.9.0](https://github.com/mojaloop/central-services-shared/compare/v18.8.0...v18.9.0) (2024-09-18)


### Features

* ulid generator ([#401](https://github.com/mojaloop/central-services-shared/issues/401)) ([080f55b](https://github.com/mojaloop/central-services-shared/commit/080f55b1f2782b4797f72ebfbe17d77a18094f2a))

## [18.8.0](https://github.com/mojaloop/central-services-shared/compare/v18.7.6...v18.8.0) (2024-09-17)


### Features

* **csi/643:** add fx-notify event for patch fxTransfer updates ([#400](https://github.com/mojaloop/central-services-shared/issues/400)) ([8be247a](https://github.com/mojaloop/central-services-shared/commit/8be247a8b3258838fae590ea4572ef5f5237e5bb))

### [18.7.6](https://github.com/mojaloop/central-services-shared/compare/v18.7.5...v18.7.6) (2024-09-12)


### Bug Fixes

* fx-get-map ([#399](https://github.com/mojaloop/central-services-shared/issues/399)) ([f1184a6](https://github.com/mojaloop/central-services-shared/commit/f1184a6bd82fd2344ca5d2f74f410f1b19275975))

### [18.7.5](https://github.com/mojaloop/central-services-shared/compare/v18.7.4...v18.7.5) (2024-09-12)


### Chore

* add fx-prepare-duplicate to kakfa map ([#398](https://github.com/mojaloop/central-services-shared/issues/398)) ([ab33676](https://github.com/mojaloop/central-services-shared/commit/ab33676b6f7dd873eec2f88a3c9ae476448e3144))

### [18.7.4](https://github.com/mojaloop/central-services-shared/compare/v18.7.3...v18.7.4) (2024-09-11)


### Bug Fixes

* fx duplicate map ([#397](https://github.com/mojaloop/central-services-shared/issues/397)) ([9b5dfce](https://github.com/mojaloop/central-services-shared/commit/9b5dfce7bf29ef3d7f5aaec3648fd49f62b42042))

### [18.7.3](https://github.com/mojaloop/central-services-shared/compare/v18.7.2...v18.7.3) (2024-08-27)


### Chore

* **csi/551:** add enums for fx-forwarded event ([#396](https://github.com/mojaloop/central-services-shared/issues/396)) ([fe87436](https://github.com/mojaloop/central-services-shared/commit/fe874360da7b7af2251abb2bdd1846dd08217546))

### [18.7.2](https://github.com/mojaloop/central-services-shared/compare/v18.7.1...v18.7.2) (2024-08-22)


### Bug Fixes

* added action map for fx abort validation ([#395](https://github.com/mojaloop/central-services-shared/issues/395)) ([90dd015](https://github.com/mojaloop/central-services-shared/commit/90dd01512b268907f315d72d6ac08f6bd94f696b))

### [18.7.1](https://github.com/mojaloop/central-services-shared/compare/v18.7.0...v18.7.1) (2024-08-20)


### Bug Fixes

* axios vulnerability GHSA-8hc4-vh64-cxmj ([#394](https://github.com/mojaloop/central-services-shared/issues/394)) ([8cf6e33](https://github.com/mojaloop/central-services-shared/commit/8cf6e336114d391fd2ec63fbb69aa99af707cbf5))

## [18.7.0](https://github.com/mojaloop/central-services-shared/compare/v18.6.3...v18.7.0) (2024-07-26)


### Features

* **csi-16:** added getAllProxiesNames method ([#387](https://github.com/mojaloop/central-services-shared/issues/387)) ([3fd95ac](https://github.com/mojaloop/central-services-shared/commit/3fd95ac128a1cb0c60afb4e359aef75230b49b69)), closes [#393](https://github.com/mojaloop/central-services-shared/issues/393)

### [18.6.3](https://github.com/mojaloop/central-services-shared/compare/v18.6.2...v18.6.3) (2024-07-12)


### Chore

* add forwarded notification to kafka topic map ([#392](https://github.com/mojaloop/central-services-shared/issues/392)) ([fe60cda](https://github.com/mojaloop/central-services-shared/commit/fe60cdad7bd0c66f1e03e3a8ff2cc1eae57af358))

### [18.6.2](https://github.com/mojaloop/central-services-shared/compare/v18.6.1...v18.6.2) (2024-07-08)


### Chore

* align proxy config ([#391](https://github.com/mojaloop/central-services-shared/issues/391)) ([d92f8db](https://github.com/mojaloop/central-services-shared/commit/d92f8db4694b1e40a84060b5df46ceccb71063ff))

### [18.6.1](https://github.com/mojaloop/central-services-shared/compare/v18.6.0...v18.6.1) (2024-07-08)


### Chore

* update index.d file ([#390](https://github.com/mojaloop/central-services-shared/issues/390)) ([93b8048](https://github.com/mojaloop/central-services-shared/commit/93b8048310b71f89993dede5a8d58d0f6283d00f))

## [18.6.0](https://github.com/mojaloop/central-services-shared/compare/v18.5.2...v18.6.0) (2024-07-05)


### Features

* proxy calling ([#389](https://github.com/mojaloop/central-services-shared/issues/389)) ([b7a1615](https://github.com/mojaloop/central-services-shared/commit/b7a1615116214466a240d244376a8aaaa165951d))

### [18.5.2](https://github.com/mojaloop/central-services-shared/compare/v18.5.1...v18.5.2) (2024-07-04)


### Chore

* **mojaloop/csi-190:** update enums for proxy transfer states ([#388](https://github.com/mojaloop/central-services-shared/issues/388)) ([735d30a](https://github.com/mojaloop/central-services-shared/commit/735d30a92416ec024d094affd69b41781c0e11e3))

### [18.5.1](https://github.com/mojaloop/central-services-shared/compare/v18.5.0...v18.5.1) (2024-06-28)


### Bug Fixes

* **mojaloop/#3984:** add type definition for HeaderValidation ([#386](https://github.com/mojaloop/central-services-shared/issues/386)) ([3f79b90](https://github.com/mojaloop/central-services-shared/commit/3f79b90e87e2aeca669783bfc4f4d068055aaf58)), closes [mojaloop/#3984](https://github.com/mojaloop/project/issues/3984)

## [18.5.0](https://github.com/mojaloop/central-services-shared/compare/v18.4.0...v18.5.0) (2024-06-25)


### Features

* **csi-164:** parameterize switch id [BREAKING CHANGES] ([#385](https://github.com/mojaloop/central-services-shared/issues/385)) ([9cb880e](https://github.com/mojaloop/central-services-shared/commit/9cb880ecec57d8eb3d6870eeb6a891b1d4d9ad89))

## [18.4.0](https://github.com/mojaloop/central-services-shared/compare/v18.3.8...v18.4.0) (2024-06-20)


### Features

* add shared resources for fx functionality ([#384](https://github.com/mojaloop/central-services-shared/issues/384)) ([8bec55c](https://github.com/mojaloop/central-services-shared/commit/8bec55c7077882e8c1b9e767a15396f2c59b7220)), closes [mojaloop/#3689](https://github.com/mojaloop/project/issues/3689)

### [18.3.8](https://github.com/mojaloop/central-services-shared/compare/v18.3.7...v18.3.8) (2024-06-11)


### Chore

* dependency updates and minor maintenance ([#383](https://github.com/mojaloop/central-services-shared/issues/383)) ([764f6b0](https://github.com/mojaloop/central-services-shared/commit/764f6b082f04a187f561f0fc17ea1eafa4736929))

### [18.3.7](https://github.com/mojaloop/central-services-shared/compare/v18.3.6...v18.3.7) (2024-06-07)


### Chore

* dependency updates to sub dependencies in widdershins for ajv ([#381](https://github.com/mojaloop/central-services-shared/issues/381)) ([b64403d](https://github.com/mojaloop/central-services-shared/commit/b64403d4936f7ca584938dd5614b10d532d2b48b))

### [18.3.6](https://github.com/mojaloop/central-services-shared/compare/v18.3.5...v18.3.6) (2024-05-24)


### Bug Fixes

* await span.audit ([#375](https://github.com/mojaloop/central-services-shared/issues/375)) ([3b1c8cb](https://github.com/mojaloop/central-services-shared/commit/3b1c8cb9c7357dbe28b55dba5b2885387827329b))

### [18.3.5](https://github.com/mojaloop/central-services-shared/compare/v18.3.4...v18.3.5) (2024-04-23)


### Bug Fixes

* excessive logging of agent internals ([0073c37](https://github.com/mojaloop/central-services-shared/commit/0073c37724b96909cdabd43055ac8ce653f1516a))

### [18.3.4](https://github.com/mojaloop/central-services-shared/compare/v18.3.3...v18.3.4) (2024-04-09)


### Chore

* updated 3p dependencies to address moderate vulns ([#367](https://github.com/mojaloop/central-services-shared/issues/367)) ([08d1c74](https://github.com/mojaloop/central-services-shared/commit/08d1c7474e00fd12585274f39f349f8dea65ffb9))

### [18.3.3](https://github.com/mojaloop/central-services-shared/compare/v18.3.2...v18.3.3) (2024-04-05)


### Chore

* overrides to 3p dependencies to address vulnerabilities ([#366](https://github.com/mojaloop/central-services-shared/issues/366)) ([8e87809](https://github.com/mojaloop/central-services-shared/commit/8e87809c8f552d18dd644fe1242987cec178414c))

### [18.3.2](https://github.com/mojaloop/central-services-shared/compare/v18.3.1...v18.3.2) (2024-04-05)


### Chore

* dependency updates to address issues ([#365](https://github.com/mojaloop/central-services-shared/issues/365)) ([6dd4a53](https://github.com/mojaloop/central-services-shared/commit/6dd4a53fd5092a3af566032fd7a8f4a968778d4d))

### [18.3.1](https://github.com/mojaloop/central-services-shared/compare/v18.3.0...v18.3.1) (2024-04-04)


### Chore

* **deps:** bump express from 4.18.2 to 4.19.2 ([#363](https://github.com/mojaloop/central-services-shared/issues/363)) ([248bad2](https://github.com/mojaloop/central-services-shared/commit/248bad29d36ad9a09832792f45d3a2d8d66ae2da))
* **deps:** bump follow-redirects from 1.15.5 to 1.15.6 ([#364](https://github.com/mojaloop/central-services-shared/issues/364)) ([eed3eeb](https://github.com/mojaloop/central-services-shared/commit/eed3eebf0adefeed5f954d5aa31eddc730e04325))

## [18.3.0](https://github.com/mojaloop/central-services-shared/compare/v18.2.0...v18.3.0) (2024-03-07)


### Features

* **mojaloop/#3759:** fix faulty cache implementation and add invalidation feature ([#360](https://github.com/mojaloop/central-services-shared/issues/360)) ([459291f](https://github.com/mojaloop/central-services-shared/commit/459291ffccc9d089605fc6dd8ed306285cb43772))

## [18.2.0](https://github.com/mojaloop/central-services-shared/compare/v18.1.3...v18.2.0) (2023-11-23)


### Features

* **mojaloop/#3426:** add participant request caching, axios override and metrics ([#357](https://github.com/mojaloop/central-services-shared/issues/357)) ([c5329a2](https://github.com/mojaloop/central-services-shared/commit/c5329a2f92c63fd9c9319f07ae01e5d3a4f2c11b)), closes [mojaloop/#3426](https://github.com/mojaloop/project/issues/3426)

### [18.1.3](https://github.com/mojaloop/central-services-shared/compare/v18.1.2...v18.1.3) (2023-11-02)


### Bug Fixes

* **mojaloop/#3604:** update dependencies ([#356](https://github.com/mojaloop/central-services-shared/issues/356)) ([b626266](https://github.com/mojaloop/central-services-shared/commit/b626266276c272de7b75dc0551f1d3ced6f72258)), closes [mojaloop/#3604](https://github.com/mojaloop/project/issues/3604)

### [18.1.2](https://github.com/mojaloop/central-services-shared/compare/v18.1.1...v18.1.2) (2023-09-18)


### Bug Fixes

* fix type declaration ([#353](https://github.com/mojaloop/central-services-shared/issues/353)) ([07aa30e](https://github.com/mojaloop/central-services-shared/commit/07aa30e72a5c89fcb0020927eb562d359221f8b2))


### Chore

* update ci config ([#355](https://github.com/mojaloop/central-services-shared/issues/355)) ([d3e6810](https://github.com/mojaloop/central-services-shared/commit/d3e6810e944fdddb4f6a5a09de4a9c051e3e17ca))

### [18.1.1](https://github.com/mojaloop/central-services-shared/compare/v18.1.0...v18.1.1) (2023-09-12)


### Chore

* migrate master to main ([#352](https://github.com/mojaloop/central-services-shared/issues/352)) ([80aeece](https://github.com/mojaloop/central-services-shared/commit/80aeecee5657ddb2243b18536d1045efb044bb17))

## [18.1.0](https://github.com/mojaloop/central-services-shared/compare/v18.0.0...v18.1.0) (2023-09-06)


### Features

* **mojaloop/#3519:** add topic name override to proceed and produce message ([#351](https://github.com/mojaloop/central-services-shared/issues/351)) ([305566b](https://github.com/mojaloop/central-services-shared/commit/305566bdfd5e09c8916760d57b52a2d31562aa85)), closes [mojaloop/#3519](https://github.com/mojaloop/project/issues/3519)

## [18.0.0](https://github.com/mojaloop/central-services-shared/compare/v17.6.3...v18.0.0) (2023-08-31)


### ⚠ BREAKING CHANGES

* **mojaloop/#3498:** refactor message keying logic in proceed function (#350)

* **mojaloop/#3498:** refactor message keying logic in proceed function ([#350](https://github.com/mojaloop/central-services-shared/issues/350)) ([664f454](https://github.com/mojaloop/central-services-shared/commit/664f4546346e9ab3d4b377f473c25e02d151c72c)), closes [mojaloop/#3498](https://github.com/mojaloop/project/issues/3498)

### [17.6.3](https://github.com/mojaloop/central-services-shared/compare/v17.6.2...v17.6.3) (2023-08-29)

### [17.6.2](https://github.com/mojaloop/central-services-shared/compare/v17.6.1...v17.6.2) (2023-08-24)

### [17.6.1](https://github.com/mojaloop/central-services-shared/compare/v17.6.0...v17.6.1) (2023-08-17)

## [17.6.0](https://github.com/mojaloop/central-services-shared/compare/v17.5.3...v17.6.0) (2023-08-17)


### Features

* configure keepalive ([#342](https://github.com/mojaloop/central-services-shared/issues/342)) ([b753382](https://github.com/mojaloop/central-services-shared/commit/b753382c5ea1864eb8a869bc7a75c16d9da433d8))

### [17.5.3](https://github.com/mojaloop/central-services-shared/compare/v17.5.2...v17.5.3) (2023-08-17)


### Bug Fixes

* add null check before passing payload to getRawBody ([#344](https://github.com/mojaloop/central-services-shared/issues/344)) ([a4dcccc](https://github.com/mojaloop/central-services-shared/commit/a4dccccef9224bdd0dba85b5cd751ca1477d4082))

### [17.5.2](https://github.com/mojaloop/central-services-shared/compare/v17.5.1...v17.5.2) (2023-08-16)


### Bug Fixes

* **mojaloop/#3480:** change performance impacting log statements to debug ([#343](https://github.com/mojaloop/central-services-shared/issues/343)) ([20c2fdb](https://github.com/mojaloop/central-services-shared/commit/20c2fdb3d1b1ad86308c602b0d69e95038d1c91a)), closes [mojaloop/#3480](https://github.com/mojaloop/project/issues/3480)

### [17.5.1](https://github.com/mojaloop/central-services-shared/compare/v17.5.0...v17.5.1) (2023-02-23)

## [17.5.0](https://github.com/mojaloop/central-services-shared/compare/v17.4.0...v17.5.0) (2023-01-16)


### Features

* added enum types of ledger account types ([#337](https://github.com/mojaloop/central-services-shared/issues/337)) ([bc3399a](https://github.com/mojaloop/central-services-shared/commit/bc3399a53ee0713cd81c06de8078a3100bee9e52))

## [17.4.0](https://github.com/mojaloop/central-services-shared/compare/v17.3.1...v17.4.0) (2023-01-13)


### Features

* expose useful parseDataURI function ([#338](https://github.com/mojaloop/central-services-shared/issues/338)) ([733188c](https://github.com/mojaloop/central-services-shared/commit/733188c749a3689412f8b0e371048e42d7bf9040))

### [17.3.1](https://github.com/mojaloop/central-services-shared/compare/v17.3.0...v17.3.1) (2022-09-29)

## [17.3.0](https://github.com/mojaloop/central-services-shared/compare/v17.2.1...v17.3.0) (2022-08-15)


### Features

* **mojaloop/#2801:** add ABORTING bulk transfer state ([#333](https://github.com/mojaloop/central-services-shared/issues/333)) ([8b26635](https://github.com/mojaloop/central-services-shared/commit/8b266358999574727882c6a5c723ead7f12c2df8)), closes [mojaloop/#2801](https://github.com/mojaloop/project/issues/2801)

### [17.2.1](https://github.com/mojaloop/central-services-shared/compare/v17.2.0...v17.2.1) (2022-08-15)


### Bug Fixes

* **mojaloop/#2814:** added bulk quotes to header validation ([#334](https://github.com/mojaloop/central-services-shared/issues/334)) ([ab6c3f6](https://github.com/mojaloop/central-services-shared/commit/ab6c3f6f9ed5968c1f154f3c78fab080e03a1534)), closes [mojaloop/#2814](https://github.com/mojaloop/project/issues/2814)

## [17.2.0](https://github.com/mojaloop/central-services-shared/compare/v17.1.0...v17.2.0) (2022-08-11)


### Features

* **mojaloop/#2796:** duplicate transaction not getting callback for post /bulkTransfers ([#332](https://github.com/mojaloop/central-services-shared/issues/332)) ([5427a53](https://github.com/mojaloop/central-services-shared/commit/5427a5307fe8f3be319888ec83ecf3eab1d85cdd)), closes [mojaloop/#2796](https://github.com/mojaloop/project/issues/2796)

## [17.1.0](https://github.com/mojaloop/central-services-shared/compare/v17.0.2...v17.1.0) (2022-08-05)


### Features

* **mojaloop/#2796:** duplicate transaction not getting callback for post /bulkTransfers ([#331](https://github.com/mojaloop/central-services-shared/issues/331)) ([b7f6ba6](https://github.com/mojaloop/central-services-shared/commit/b7f6ba6cb90565b1f50a6574408f33f41388be68)), closes [mojaloop/#2796](https://github.com/mojaloop/project/issues/2796)

### [17.0.2](https://github.com/mojaloop/central-services-shared/compare/v17.0.1...v17.0.2) (2022-05-19)


### Bug Fixes

* updated peerDependencies as NPM v7+ handles their resolution for us ([968da97](https://github.com/mojaloop/central-services-shared/commit/968da97051e0a59f6108ff86b1b51c0670b967bd))

### [17.0.1](https://github.com/mojaloop/central-services-shared/compare/v17.0.0...v17.0.1) (2022-05-19)


### Bug Fixes

* removed typescript build from ci config ([cc75c8a](https://github.com/mojaloop/central-services-shared/commit/cc75c8ab6326b2ef3fb1116a328f3aa3792bcd7e))

## [17.0.0](https://github.com/mojaloop/central-services-shared/compare/v16.0.0...v17.0.0) (2022-05-19)


### ⚠ BREAKING CHANGES

* **mojaloop/#2092:** major version bump for node v16 LTS support, and re-structuring of project directories to align to core Mojaloop repositories!

### Features

* **mojaloop/#2092:** upgrade nodeJS version for core services ([#330](https://github.com/mojaloop/central-services-shared/issues/330)) ([4778864](https://github.com/mojaloop/central-services-shared/commit/477886485299940b08a29d3db5a4ceaab431d47d)), closes [mojaloop/#2092](https://github.com/mojaloop/project/issues/2092)

## [16.0.0](https://github.com/mojaloop/central-services-shared/compare/v15.3.0...v16.0.0) (2022-03-03)


### ⚠ BREAKING CHANGES

* **mojaloop/#2704:** - headerValidation.FSPIOPHeaderValidation now expects the`supportedProtocolContentVersions` options argument to be a list, the same as `supportedProtocolAcceptVersions`

### Features

* **mojaloop/#2704:** core-services support for non-breaking backward api compatibility ([#325](https://github.com/mojaloop/central-services-shared/issues/325)) ([cb81f7e](https://github.com/mojaloop/central-services-shared/commit/cb81f7ec92376e0d6ce45e2ce046379ce1996167)), closes [mojaloop/#2704](https://github.com/mojaloop/project/issues/2704)

## [15.3.0](https://github.com/mojaloop/central-services-shared/compare/v15.2.0...v15.3.0) (2022-02-07)


### Features

* **mojaloop/project#2556:** implement patch notification for failure scenarios (following v1.1 update) ([#321](https://github.com/mojaloop/central-services-shared/issues/321)) ([92015a7](https://github.com/mojaloop/central-services-shared/commit/92015a7d9eec7e01e85eff86af5cc6e6147e5f20)), closes [mojaloop/project#2556](https://github.com/mojaloop/project/issues/2556)

## [15.2.0](https://github.com/mojaloop/central-services-shared/compare/v15.1.0...v15.2.0) (2021-12-13)


### Features

* **mojaloop/#2608:** injected resource versions config for outbound requests ([#319](https://github.com/mojaloop/central-services-shared/issues/319)) ([13a3d9d](https://github.com/mojaloop/central-services-shared/commit/13a3d9dc8ab8d4815db2aea22563317e3670a19b)), closes [mojaloop/#2608](https://github.com/mojaloop/project/issues/2608)

## [15.1.0](https://github.com/mojaloop/central-services-shared/compare/v15.0.1...v15.1.0) (2021-11-17)


### Features

* add a new action enum for `RESERVED_ABORTED` ([#317](https://github.com/mojaloop/central-services-shared/issues/317)) ([0e743b8](https://github.com/mojaloop/central-services-shared/commit/0e743b82a90dd0c97ce3c72454621c191d2a6675))

### [15.0.1](https://github.com/mojaloop/central-services-shared/compare/v15.0.0...v15.0.1) (2021-11-08)


### Bug Fixes

* **#2557:** error notification to payer fsp, header for source having wrong value ([#316](https://github.com/mojaloop/central-services-shared/issues/316)) ([d4b95b6](https://github.com/mojaloop/central-services-shared/commit/d4b95b619ce2c4f810ae6909859ef6dbf5894ad0)), closes [#2557](https://github.com/mojaloop/central-services-shared/issues/2557)

## [15.0.0](https://github.com/mojaloop/central-services-shared/compare/v14.0.0...v15.0.0) (2021-10-18)


### ⚠ BREAKING CHANGES

* **mojaloop/#2536:** split options config for supportedProtocolVersions to supportedProtocolVersions & supportedProtocolAcceptVersions of HeaderValidation Hapi Plugin. It should be backward compatible, but forcing a major version bump to reflect this new functionality.

### Bug Fixes

* **mojaloop/#2536:** fspiop api version negotiation not handled by transfers service ([#315](https://github.com/mojaloop/central-services-shared/issues/315)) ([e3a8748](https://github.com/mojaloop/central-services-shared/commit/e3a874829794ed8b85b6487dd58bcb58f31a5dd1)), closes [mojaloop/#2536](https://github.com/mojaloop/project/issues/2536)

## [14.0.0](https://github.com/mojaloop/central-services-shared/compare/v13.4.1...v14.0.0) (2021-09-10)


### ⚠ BREAKING CHANGES

* **mojaloop/#2470:** Adding this for a major bump. The change of encoding should not impact anyone, but I want users of this library to be aware of a potential issue with regard to how the messages are encoded/decoded!

### Bug Fixes

* **mojaloop/#2470:** central-services-shared streamingprotocol encode/decode functionality fix ([#313](https://github.com/mojaloop/central-services-shared/issues/313)) ([cedc359](https://github.com/mojaloop/central-services-shared/commit/cedc3595508ebe2fd67517f732e8e1da35635171)), closes [mojaloop/#2470](https://github.com/mojaloop/project/issues/2470)

### [13.4.1](https://github.com/mojaloop/central-services-shared/compare/v13.4.0...v13.4.1) (2021-08-25)


### Bug Fixes

* **index.d.ts:** missing eventTypeEnum ([#312](https://github.com/mojaloop/central-services-shared/issues/312)) ([0dc78fc](https://github.com/mojaloop/central-services-shared/commit/0dc78fc228b65e52d5a4fc814fb88ad871952bdb))

## [13.4.0](https://github.com/mojaloop/central-services-shared/compare/v13.0.5...v13.4.0) (2021-08-25)


### Features

* **ci:** automate releases ([#311](https://github.com/mojaloop/central-services-shared/issues/311)) ([3ec7998](https://github.com/mojaloop/central-services-shared/commit/3ec79987a4acaddba83c74b41fe61ec3200946cc))
* **enums:** add enums for /tpr/authorizations and /tpr/verifications ([#310](https://github.com/mojaloop/central-services-shared/issues/310)) ([332869b](https://github.com/mojaloop/central-services-shared/commit/332869bcefbb08d4fbc766b85c14a0bfb12c11bb))

## [13.3.0](https://github.com/mojaloop/central-services-shared/compare/v13.0.5...v13.3.0) (2021-08-25)


### Features

* add verification eventType ([d7efe85](https://github.com/mojaloop/central-services-shared/commit/d7efe85424c756087886d51b21da79156fc627c2))
* **ci:** adding automated release support, removing dependency check, as it's now covered by dependabot ([7f52097](https://github.com/mojaloop/central-services-shared/commit/7f520970a4b36d866b427f9467fadf845617d348))
* **enums:** add enums for /tpr/authorizations and /tpr/verifications ([95ec42e](https://github.com/mojaloop/central-services-shared/commit/95ec42e5363846ccc99995ee85e50bd012e5febc))
* **enums:** add enums for /tpr/authorizations and /tpr/verifications ([#310](https://github.com/mojaloop/central-services-shared/issues/310)) ([332869b](https://github.com/mojaloop/central-services-shared/commit/332869bcefbb08d4fbc766b85c14a0bfb12c11bb))


### Bug Fixes

* **vulns:** run npm audit, fix and ignore unfixable and unused ([501f683](https://github.com/mojaloop/central-services-shared/commit/501f683f17ee2e1fa619429d95a1988611f39e43))

## [13.2.0](https://github.com/mojaloop/central-services-shared/compare/v13.0.5...v13.2.0) (2021-08-25)


### Features

* add verification eventType ([d7efe85](https://github.com/mojaloop/central-services-shared/commit/d7efe85424c756087886d51b21da79156fc627c2))
* **ci:** adding automated release support, removing dependency check, as it's now covered by dependabot ([7f52097](https://github.com/mojaloop/central-services-shared/commit/7f520970a4b36d866b427f9467fadf845617d348))
* **enums:** add enums for /tpr/authorizations and /tpr/verifications ([95ec42e](https://github.com/mojaloop/central-services-shared/commit/95ec42e5363846ccc99995ee85e50bd012e5febc))
* **enums:** add enums for /tpr/authorizations and /tpr/verifications ([#310](https://github.com/mojaloop/central-services-shared/issues/310)) ([332869b](https://github.com/mojaloop/central-services-shared/commit/332869bcefbb08d4fbc766b85c14a0bfb12c11bb))


### Bug Fixes

* **vulns:** run npm audit, fix and ignore unfixable and unused ([501f683](https://github.com/mojaloop/central-services-shared/commit/501f683f17ee2e1fa619429d95a1988611f39e43))

## [13.1.0](https://github.com/mojaloop/central-services-shared/compare/v13.0.5...v13.1.0) (2021-08-25)


### Features

* add verification eventType ([d7efe85](https://github.com/mojaloop/central-services-shared/commit/d7efe85424c756087886d51b21da79156fc627c2))
* **enums:** add enums for /tpr/authorizations and /tpr/verifications ([95ec42e](https://github.com/mojaloop/central-services-shared/commit/95ec42e5363846ccc99995ee85e50bd012e5febc))


### Bug Fixes

* **vulns:** run npm audit, fix and ignore unfixable and unused ([501f683](https://github.com/mojaloop/central-services-shared/commit/501f683f17ee2e1fa619429d95a1988611f39e43))
