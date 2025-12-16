// Quick test script for the plugin
const { runTestRigor } = require('./src/plugin');

// Test configuration - Add your credentials here
const testInputs = {
    authenticationToken: '0a8ae248-eba8-404e-96b9-868fa0937f55',
    testSuiteId: 'xvX7Z8cXSPQEABBtn',
    waitForResults: true,
    forceCancelPreviousTesting: false,
    pollingInterval: 10
    // Optional parameters:
    // customName: 'Manual Test Run',
    // storedValues: '{"key": "value"}',
    // branchName: 'main',
    // commitHash: 'abc123',
    // deployUrl: 'https://example.com',
    // labels: 'smoke,regression',
    // excludedLabels: 'slow',
    // testCaseUuids: 'uuid1,uuid2'
};

// Mock Netlify utils
const mockUtils = {
    build: {
        failPlugin: (message) => {
            console.error('\n❌ Plugin Failed:', message);
            process.exit(1);
        }
    },
    status: {
        show: (data) => {
            console.log('\n📊 Status:', JSON.stringify(data, null, 2));
        }
    }
};

// Run the test
console.log('🚀 Starting TestRigor Plugin Test...\n');

runTestRigor({ inputs: testInputs, utils: mockUtils, constants: {} })
    .then(() => {
        console.log('\n✅ Test completed successfully!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n❌ Test failed:', error);
        process.exit(1);
    });
