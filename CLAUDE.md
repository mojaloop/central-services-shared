# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is `@mojaloop/central-services-shared` - a shared utility library for Mojaloop central services that provides common functionality including:
- Caching and Redis utilities
- Database wrappers (MySQL/Knex)
- HTTP/Hapi plugins and utilities  
- Kafka event handling
- OpenAPI validation
- Distributed locking
- Health check components
- Extensive enumerations for FSPIOP protocol

## Development Commands

### Testing
- `npm test` - Run all unit tests (includes pretest linting)
- `npm run test:unit` - Run unit tests with TAP spec output
- `npm run test:coverage` - Run tests with coverage reporting
- `npm run test:coverage-check` - Run coverage with threshold checking

### Specific Test Suites
- `npm run test:distLock` - Test distributed locking components
- `npm run test:header` - Test header validation utilities
- `npm run test:mysql` - Test MySQL/database components
- `npm run test:logging` - Test logging plugin functionality

### Jest Testing (Modern Framework)
- `npm run test-jest:unit` - Run all Jest unit tests
- `npm run test-jest:unit:coverage-check` - Run Jest tests with coverage thresholds
- Jest tests are located in `test-jest/unit/` directory
- Uses Jest with Sinon for mocking (hybrid approach)
- Module imports support `#src/*` and `#test-jest/*` patterns

### Linting and Code Quality
- `npm run lint` - Run JavaScript Standard Style linting
- `npm run lint:fix` - Auto-fix linting issues
- `npm run standard` - Run standard linter directly

### Security and Auditing
- `npm run audit:check` - Check for security vulnerabilities using audit-ci
- `npm run audit:fix` - Attempt to fix audit issues automatically

### Dependency Management  
- `npm run dep:check` - Check for outdated dependencies
- `npm run dep:update` - Update dependencies to latest versions

### Release Management
- `npm run release` - Create standard-version release with changelog
- `npm run snapshot` - Create snapshot prerelease

## Architecture Overview

### Core Module Structure
The library is organized into main modules accessible via `src/index.js`:
- **HealthCheck** (`src/healthCheck/`) - Health check utilities and enums
- **Enum** (`src/enums/`) - Comprehensive enumerations for accounts, endpoints, events, transfers, HTTP, Kafka, settlements, tags, and FX
- **Util** (`src/util/`) - Large collection of utilities including caching, database, HTTP, validation
- **mysql** (`src/mysql/`) - Database connection and transaction handling via KnexWrapper

### Key Utility Categories
- **Caching**: Participants, endpoints, and proxy caching with Redis support
- **HTTP/API**: Hapi plugins for validation, logging, documentation, and FSPIOP header handling  
- **Event System**: Kafka utilities and event framework for Mojaloop messaging
- **Database**: MySQL connection wrapper with retry logic and metrics
- **Validation**: OpenAPI backend validation and header validation
- **Security**: Distributed locking, hash utilities, encoding/decoding

### Important Dependencies
- **Hapi.js** - Web framework and plugin system
- **Knex** - Database query builder (peer dependency)
- **Redis/IORedis** - Caching and pub/sub
- **Kafka** - Event streaming (via various Mojaloop Kafka libraries)
- **OpenAPI** - API validation and documentation
- **Standard.js** - Code linting and formatting

## Development Guidelines

### Testing Framework
- **Legacy**: Uses **Tape** testing framework with TAP output formatting. Tests are located in `test/unit/` with comprehensive coverage requirements.
- **Modern**: Uses **Jest** testing framework for new tests. Tests are located in `test-jest/unit/` with built-in coverage reporting and better developer experience.

### Code Style
Follows **JavaScript Standard Style** with no additional configuration. All code must pass linting before testing.

### TypeScript Support
Includes comprehensive TypeScript definitions in `src/index.d.ts` covering all exported interfaces and enums.

### Security Practices
- Uses `audit-ci` with moderate severity threshold
- Peer dependencies for security-critical libraries (logger, metrics, error handling)
- Sensitive audit exceptions tracked in `audit-ci.jsonc`

### Release Process
Automated releases via CircleCI using standard-version with conventional commits. Manual releases use `npm run release`.

## Key Integration Points

### Database Integration
MySQL integration via KnexWrapper requires peer dependencies:
- `knex@3.x` 
- `mysql2@3.x`

### Logging Integration  
Logging via peer dependency `@mojaloop/central-services-logger@11.x.x` with structured logging support.

### Metrics Integration
Metrics collection via peer dependency `@mojaloop/central-services-metrics@12.x.x`.

### Event Integration
Event handling via peer dependency `@mojaloop/event-sdk@14.x.x` for Kafka-based messaging.


## Environment Variables

The library supports several environment variables for HTTP configuration:

### HTTP Request Configuration
- `HTTP_REQUEST_TIMEOUT_MS` - HTTP request timeout in milliseconds (default: 25000)
- `HTTP_AGENT_KEEP_ALIVE` - Enable HTTP keep-alive connections (default: 'true')

### HTTP Retry Configuration
- `HTTP_RETRY_COUNT` - Number of retry attempts for failed HTTP requests (default: 0, no retries)
- `HTTP_RETRY_DELAY_MS` - Delay between retry attempts in milliseconds (default: 100)

**Retry Logic**: HTTP retries are only enabled when `HTTP_RETRY_COUNT` > 0. The retry logic applies to:
- HTTP 503 (Service Unavailable) responses
- `EAI_AGAIN` DNS resolution errors
