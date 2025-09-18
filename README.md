# central-services-shared
[![Git Commit](https://img.shields.io/github/last-commit/mojaloop/central-services-shared.svg?style=flat)](https://github.com/mojaloop/central-services-shared/commits/main)
[![Git Releases](https://img.shields.io/github/release/mojaloop/central-services-shared.svg?style=flat)](https://github.com/mojaloop/central-services-shared/releases)
[![Npm Version](https://img.shields.io/npm/v/@mojaloop/central-services-shared.svg?style=flat)](https://www.npmjs.com/package/@mojaloop/central-services-shared)
[![NPM Vulnerabilities](https://img.shields.io/snyk/vulnerabilities/npm/@mojaloop/central-services-shared.svg?style=flat)](https://www.npmjs.com/package/@mojaloop/central-services-shared)
[![CircleCI](https://circleci.com/gh/mojaloop/central-services-shared.svg?style=svg)](https://circleci.com/gh/mojaloop/central-services-shared)

Shared code for central services

## Environment Variables

The following environment variables can be used to configure HTTP behavior:

### HTTP Request Configuration
- `HTTP_REQUEST_TIMEOUT_MS` - HTTP request timeout in milliseconds (default: 25000)
- `HTTP_AGENT_KEEP_ALIVE` - Enable HTTP keep-alive connections (default: 'true')

### HTTP Retry Configuration
- `HTTP_RETRY_COUNT` - Number of retry attempts for failed HTTP requests (default: 0, no retries)
- `HTTP_RETRY_DELAY_MS` - Delay between retry attempts in milliseconds (default: 100)

**Note**: HTTP retries are only enabled when `HTTP_RETRY_COUNT` > 0. The retry logic applies to:
- HTTP 503 (Service Unavailable) responses
- `EAI_AGAIN` DNS resolution errors

## Auditing Dependencies

We use `audit-ci` along with `npm audit` to check dependencies for node vulnerabilities, and keep track of resolved dependencies with an `audit-ci.jsonc` file.

To start a new resolution process, run:

```bash
npm run audit:fix
```

You can then check to see if the CI will pass based on the current dependencies with:

```bash
npm run audit:check
```

The [audit-ci.jsonc](./audit-ci.jsonc) contains any audit-exceptions that cannot be fixed to ensure that CircleCI will build correctly.

## Automated Releases

As part of our CI/CD process, we use a combination of CircleCI, standard-version
npm package and github-release CircleCI orb to automatically trigger our releases
and image builds. This process essentially mimics a manual tag and release.

On a merge to main, CircleCI is configured to use the mojaloopci github account
to push the latest generated CHANGELOG and package version number.

Once those changes are pushed, CircleCI will pull the updated main, tag and
push a release triggering another subsequent build that also publishes a docker image.

### Potential problems

* There is a case where the merge to main workflow will resolve successfully, triggering
  a release. Then that tagged release workflow subsequently failing due to the image scan,
  audit check, vulnerability check or other "live" checks.

  This will leave main without an associated published build. Fixes that require
  a new merge will essentially cause a skip in version number or require a clean up
  of the main branch to the commit before the CHANGELOG and bump.

  This may be resolved by relying solely on the previous checks of the
  merge to main workflow to assume that our tagged release is of sound quality.
  We are still mulling over this solution since catching bugs/vulnerabilities/etc earlier
  is a boon.

* It is unknown if a race condition might occur with multiple merges with main in
  quick succession, but this is a suspected edge case.
