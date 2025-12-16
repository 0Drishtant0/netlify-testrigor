# Netlify Plugin - TestRigor Integration

[![npm version](https://badge.fury.io/js/netlify-plugin-testrigor.svg)](https://badge.fury.io/js/netlify-plugin-testrigor)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A comprehensive Netlify Build Plugin that integrates TestRigor's automated testing platform into your Netlify deployment pipeline. This plugin triggers and monitors TestRigor test executions, ensuring your deployments are validated before going live.

##  Features

- **Automated Test Triggering**: Automatically triggers TestRigor tests after successful builds
- **Real-time Monitoring**: Polls test execution status with configurable intervals
- **Branch/Commit Testing**: Support for testing specific branches and commits
- **Label Filtering**: Run tests based on labels and exclude specific test groups
- **Test Case Selection**: Execute specific test cases by UUID
- **Flexible Configuration**: Wait for results or run tests asynchronously
- **Comprehensive Logging**: Detailed, color-coded console output
- **Error Handling**: Robust error handling with detailed error messages
- **Status Reporting**: Integration with Netlify's deploy summary

##  Installation

### Option 1: UI Installation

1. Go to your site in the Netlify UI
2. Navigate to **Project configuration** → **Build & deploy** → **Build plugins**
3. Search for "TestRigor"
4. Click **Enable**

### Option 2: File-based Installation

1. Install the plugin as a dev dependency:

```bash
npm install --save-dev netlify-plugin-testrigor
```

2. Add the plugin to your `netlify.toml`:

```toml
[[plugins]]
package = "netlify-plugin-testrigor"

  [plugins.inputs]
  authenticationToken = "${TESTRIGOR_AUTH_TOKEN}"
  testSuiteId = "${TESTRIGOR_TEST_SUITE_ID}"
```

3. Set environment variables in Netlify UI:
   - `TESTRIGOR_AUTH_TOKEN`: Your TestRigor authentication token
   - `TESTRIGOR_TEST_SUITE_ID`: Your TestRigor test suite ID

### Option 3: Local Plugin

For development or custom deployments:

```toml
[[plugins]]
package = "./plugins/netlify-plugin-testrigor"

  [plugins.inputs]
  authenticationToken = "${TESTRIGOR_AUTH_TOKEN}"
  testSuiteId = "${TESTRIGOR_TEST_SUITE_ID}"
```

##  Configuration

### Required Inputs

| Input | Description | Example |
|-------|-------------|---------|
| `authenticationToken` | TestRigor authentication token | `"41a7bc7a-d64a-4d00-8cf8-f73858a20c44"` |
| `testSuiteId` | TestRigor test suite ID | `"BnK5D8goWRRQhjiMQ"` |

### Optional Inputs

| Input | Type | Default | Description |
|-------|------|---------|-------------|
| `waitForResults` | boolean | `true` | Wait for test execution to complete |
| `forceCancelPreviousTesting` | boolean | `true` | Cancel any ongoing tests before starting |
| `pollingInterval` | number | `10` | Seconds between status checks |
| `customName` | string | - | Custom name for the test run |
| `storedValues` | string (JSON) | - | Pass variables to tests |
| `branchName` | string | - | Branch name for branch testing |
| `commitHash` | string | - | Commit hash for commit testing |
| `deployUrl` | string | - | URL of deployed site (required for branch/commit testing) |
| `allowKnownIssues` | boolean | `false` | Allow known issues in branch tests |
| `labels` | string | - | Comma-separated labels to include |
| `excludedLabels` | string | - | Comma-separated labels to exclude |
| `testCaseUuids` | string | - | Comma-separated test case UUIDs to execute |

##  Usage Examples

### Basic Configuration

```toml
[[plugins]]
package = "netlify-plugin-testrigor"

  [plugins.inputs]
  authenticationToken = "${TESTRIGOR_AUTH_TOKEN}"
  testSuiteId = "${TESTRIGOR_TEST_SUITE_ID}"
  waitForResults = true
```

### Branch Testing

```toml
[[plugins]]
package = "netlify-plugin-testrigor"

  [plugins.inputs]
  authenticationToken = "${TESTRIGOR_AUTH_TOKEN}"
  testSuiteId = "${TESTRIGOR_TEST_SUITE_ID}"
  branchName = "${BRANCH}"
  commitHash = "${COMMIT_REF}"
  deployUrl = "${DEPLOY_PRIME_URL}"
  allowKnownIssues = true
```

### Label-based Testing

```toml
[[plugins]]
package = "netlify-plugin-testrigor"

  [plugins.inputs]
  authenticationToken = "${TESTRIGOR_AUTH_TOKEN}"
  testSuiteId = "${TESTRIGOR_TEST_SUITE_ID}"
  labels = "smoke,critical"
  excludedLabels = "slow,experimental"
```

### Production-only Testing

```toml
# Only run tests on production deploys
[[context.production.plugins]]
package = "netlify-plugin-testrigor"

  [context.production.plugins.inputs]
  authenticationToken = "${TESTRIGOR_AUTH_TOKEN}"
  testSuiteId = "${TESTRIGOR_TEST_SUITE_ID}"
```

### Deploy Preview Testing (No Wait)

```toml
# Run tests but don't wait for results on Deploy Previews
[[context.deploy-preview.plugins]]
package = "netlify-plugin-testrigor"

  [context.deploy-preview.plugins.inputs]
  authenticationToken = "${TESTRIGOR_AUTH_TOKEN}"
  testSuiteId = "${TESTRIGOR_TEST_SUITE_ID}"
  waitForResults = false
```

### Advanced Configuration with Stored Values

```toml
[[plugins]]
package = "netlify-plugin-testrigor"

  [plugins.inputs]
  authenticationToken = "${TESTRIGOR_AUTH_TOKEN}"
  testSuiteId = "${TESTRIGOR_TEST_SUITE_ID}"
  customName = "Production Deploy - ${COMMIT_REF}"
  storedValues = '{"environment":"production","version":"${VERSION}"}'
  pollingInterval = 15
```

##  Deploy Contexts

You can configure the plugin differently for various deploy contexts:

```toml
# Default configuration for all contexts
[[plugins]]
package = "netlify-plugin-testrigor"
  [plugins.inputs]
  authenticationToken = "${TESTRIGOR_AUTH_TOKEN}"
  testSuiteId = "${TESTRIGOR_TEST_SUITE_ID}"

# Production: Full test suite, wait for results
[[context.production.plugins]]
package = "netlify-plugin-testrigor"
  [context.production.plugins.inputs]
  authenticationToken = "${TESTRIGOR_AUTH_TOKEN}"
  testSuiteId = "${TESTRIGOR_TEST_SUITE_ID}"
  labels = "smoke,regression,e2e"
  waitForResults = true

# Branch deploys: Smoke tests only
[[context.branch-deploy.plugins]]
package = "netlify-plugin-testrigor"
  [context.branch-deploy.plugins.inputs]
  authenticationToken = "${TESTRIGOR_AUTH_TOKEN}"
  testSuiteId = "${TESTRIGOR_TEST_SUITE_ID}"
  labels = "smoke"
  waitForResults = false

# Deploy Previews: No tests
# (omit plugin configuration to skip)
```


##  Build Output

The plugin provides detailed, color-coded output during execution:

```
==================================================
TestRigor Integration - Starting
==================================================

ℹ Configuration:
  Test Suite ID: BnK5D8goWRRQhjiMQ
  Wait for Results: true
  Polling Interval: 10s
  Branch: feature/new-feature
  Commit: abc123

→ Building test configuration...
→ Triggering TestRigor test execution...
✓ Test execution triggered successfully!

==================================================
Monitoring Test Execution
==================================================

ℹ Will check status every 10 seconds
◌ Status: IN PROGRESS (228)
  Tests are still running...
✓ Status: SUCCESS (200)
✓ Tests completed successfully! ✓

==================================================
TestRigor Plugin - Success
==================================================
```

##  Testing Locally

Test your plugin configuration locally using Netlify CLI:

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Run build locally
netlify build

# Run build with specific context
netlify build --context=deploy-preview
```


### Running Tests

```bash
# Install dependencies
npm install

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

### Linting

```bash
# Run linter
npm run lint

# Fix linting issues
npm run lint:fix
```

## Troubleshooting

### Tests not triggering

1. Verify your `authenticationToken` and `testSuiteId` are correct
2. Check that environment variables are set in Netlify UI
3. Review build logs for error messages

### Build failing on test failures

This is expected behavior when `waitForResults` is `true`. Options:

1. Fix failing tests in TestRigor
2. Set `waitForResults: false` to run tests asynchronously
3. Use different configurations per deploy context

### Timeout errors

Increase the polling interval or check TestRigor dashboard for test execution status:

```toml
[plugins.inputs]
pollingInterval = 30  # Check every 30 seconds instead of 10
```

### API errors

- **401 Unauthorized**: Check your authentication token
- **404 Not Found**: Verify your test suite ID
- **429 Too Many Requests**: Reduce polling frequency

##  TestRigor API Reference

For more information about TestRigor's API:
- [TestRigor API Documentation](https://testrigor.com/command-line/)
- [TestRigor Dashboard](https://app.testrigor.com/)


## 📄 License

MIT License - see LICENSE file for details



---

Made with ❤️ for automated testing
