# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

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
