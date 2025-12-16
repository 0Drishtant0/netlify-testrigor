const TestRigorClient = require('./api/testRigorClient');
const Logger = require('./utils/logger');
const { validateInputs } = require('./utils/validators');
const { buildRetestPayload, buildStatusParams } = require('./utils/payloadBuilder');

/**
 * Main plugin logic
 */
async function runTestRigor({ inputs, utils }) {
    const logger = new Logger('TestRigor Plugin');

    try {
        // Header
        logger.header('TestRigor Integration - Starting');

        // Validate inputs
        const validation = validateInputs(inputs);
        if (!validation.valid) {
            return utils.build.failPlugin(validation.error);
        }

        // Extract configuration
        const {
            authenticationToken,
            testSuiteId,
            waitForResults,
            pollingInterval = 10
        } = inputs;

        // Log configuration
        logger.info('Configuration:');
        logger.config('Test Suite ID', testSuiteId);
        logger.config('Wait for Results', waitForResults);
        logger.config('Polling Interval', `${pollingInterval}s`);
        
        if (inputs.branchName) {
            logger.config('Branch', inputs.branchName);
        }
        if (inputs.commitHash) {
            logger.config('Commit', inputs.commitHash);
        }
        if (inputs.labels) {
            logger.config('Labels', inputs.labels);
        }
        if (inputs.customName) {
            logger.config('Custom Name', inputs.customName);
        }

        // Initialize API client
        const client = new TestRigorClient(authenticationToken, testSuiteId);

        // Build and trigger retest
        logger.progress('Building test configuration...');
        const payload = buildRetestPayload(inputs);
        
        logger.progress('Triggering TestRigor test execution...');
        const retestResponse = await client.triggerRetest(payload);
        
        logger.success('Test execution triggered successfully!');
        
        if (retestResponse) {
            logger.info('Response:');
            console.log(JSON.stringify(retestResponse, null, 2));
        }

        // If not waiting for results, exit early
        if (!waitForResults) {
            logger.info('Not waiting for test results (waitForResults=false)');
            logger.header('TestRigor Plugin - Completed');
            
            utils.status.show({
                title: 'TestRigor Tests Triggered',
                summary: 'Test execution started successfully',
                text: 'Tests are running in the background. Check TestRigor dashboard for results.'
            });
            
            return;
        }

        // Poll for results
        logger.header('Monitoring Test Execution');
        logger.info(`Will check status every ${pollingInterval} seconds`);

        const statusParams = buildStatusParams(inputs);
        let attempt = 0;
        const maxAttempts = 360; // 1 hour with 10s interval

        while (attempt < maxAttempts) {
            // Wait before polling (except first attempt)
            if (attempt > 0) {
                await sleep(pollingInterval * 1000);
            }
            
            attempt++;
            logger.polling(attempt, pollingInterval);

            try {
                const statusResponse = await client.getStatus(statusParams);
                const { status, data } = statusResponse;

                logger.status(status);

                // Handle different status codes
                if (status >= 400 && status < 600) {
                    logger.error(`API Error: ${status}`);
                    if (data) {
                        console.log(JSON.stringify(data, null, 2));
                    }
                    return utils.build.failPlugin(`TestRigor API returned error: ${status}`);
                }

                if (status === 200) {
                    // Test completed successfully
                    logger.success('Tests completed successfully! ✓');
                    
                    if (data) {
                        logger.info('Final Results:');
                        console.log(JSON.stringify(data, null, 2));
                    }

                    logger.header('TestRigor Plugin - Success');
                    
                    utils.status.show({
                        title: 'TestRigor Tests Passed ✓',
                        summary: 'All tests completed successfully',
                        text: data && data.detailsUrl ? `View details: ${data.detailsUrl}` : 'Tests passed'
                    });
                    
                    return;
                }

                if (status === 227 || status === 228) {
                    // Test is still running
                    logger.info('Tests are still running...');
                    
                    // Show test progress if available
                    if (data && data.overallResults) {
                        const results = data.overallResults;
                        console.log(`   Progress: ${results.Passed || 0} passed, ${results.Failed || 0} failed, ${results['In progress'] || 0} running, ${results['In queue'] || 0} queued (${results.Total || 0} total)`);
                    } else if (data && data.progress) {
                        logger.config('Progress', data.progress);
                    }
                    
                    continue;
                }

                if (status === 229) {
                    // Test was canceled
                    logger.error('Test execution was canceled');
                    if (data) {
                        console.log(JSON.stringify(data, null, 2));
                    }
                    return utils.build.failPlugin('TestRigor tests were canceled');
                }

                if (status === 230) {
                    // Test failed
                    logger.error('Tests failed ✗');
                    if (data) {
                        logger.info('Failure Details:');
                        console.log(JSON.stringify(data, null, 2));
                        
                        if (data.detailsUrl) {
                            logger.info(`View full report: ${data.detailsUrl}`);
                        }
                    }
                    return utils.build.failPlugin('TestRigor tests failed');
                }

                // Unknown status
                logger.warn(`Unexpected status code: ${status}`);
                return utils.build.failPlugin(`Unexpected status code from TestRigor: ${status}`);

            } catch (pollError) {
                logger.error('Error checking test status');
                console.error(pollError.message);
                
                // Retry on network errors, fail on other errors
                if (pollError.details && pollError.details.status >= 500) {
                    logger.warn('Server error, will retry...');
                    continue;
                }
                
                throw pollError;
            }
        }

        // Timeout
        logger.error('Test execution timed out');
        return utils.build.failPlugin(
            `TestRigor tests did not complete within the timeout period (${maxAttempts * pollingInterval}s)`
        );

    } catch (error) {
        logger.error('Plugin execution failed');
        console.error(error.message);
        
        if (error.details) {
            console.error('Error Details:', JSON.stringify(error.details, null, 2));
        }
        
        return utils.build.failPlugin(`TestRigor plugin error: ${error.message}`);
    }
}

/**
 * Sleep utility
 */
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = { runTestRigor };
