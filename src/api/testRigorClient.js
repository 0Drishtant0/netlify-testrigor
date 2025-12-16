const axios = require('axios');

/**
 * TestRigor API Client
 * Handles all interactions with the TestRigor API
 */
class TestRigorClient {
    constructor(authToken, testSuiteId) {
        this.authToken = authToken;
        this.testSuiteId = testSuiteId;
        this.baseUrl = 'https://api.testrigor.com/api/v1';
        this.api2BaseUrl = 'https://api2.testrigor.com/api/v1';
    }

    /**
     * Get default headers for API requests
     */
    getHeaders(acceptJson = false) {
        const headers = {
            'auth-token': this.authToken,
            'Content-Type': 'application/json'
        };

        if (acceptJson) {
            headers['Accept'] = 'application/json';
        }

        return headers;
    }

    /**
     * Trigger a retest with the given configuration
     * @param {Object} config - Test configuration
     * @returns {Promise<Object>} API response
     */
    async triggerRetest(config) {
        const url = `${this.baseUrl}/apps/${this.testSuiteId}/retest`;
        
        try {
            const response = await axios.post(url, config, {
                headers: this.getHeaders()
            });
            
            return response.data;
        } catch (error) {
            this.handleApiError(error, 'Failed to trigger retest');
        }
    }

    /**
     * Get the status of the current test run
     * @param {Object} params - Query parameters (branchName, labels)
     * @returns {Promise<Object>} Status response with HTTP status code
     */
    async getStatus(params = {}) {
        const url = `${this.baseUrl}/apps/${this.testSuiteId}/status`;
        const queryParams = new URLSearchParams();

        if (params.branchName) {
            queryParams.append('branchName', params.branchName);
        }

        if (params.labels) {
            queryParams.append('labels', params.labels);
        }

        const fullUrl = queryParams.toString() ? `${url}?${queryParams.toString()}` : url;

        try {
            const response = await axios.get(fullUrl, {
                headers: this.getHeaders(true),
                validateStatus: (status) => {
                    // Accept all 2xx status codes including custom ones like 227-230
                    return status >= 200 && status < 300;
                }
            });

            return {
                status: response.status,
                data: response.data
            };
        } catch (error) {
            // Handle 4xx and 5xx errors
            if (error.response && error.response.status >= 400) {
                return {
                    status: error.response.status,
                    data: error.response.data,
                    error: true
                };
            }
            this.handleApiError(error, 'Failed to get test status');
        }
    }

    /**
     * Cancel a test run
     * @param {string} runId - The run ID to cancel
     * @returns {Promise<Object>} API response
     */
    async cancelRun(runId) {
        const url = `${this.api2BaseUrl}/apps/${this.testSuiteId}/runs/${runId}/cancel`;
        
        try {
            const response = await axios.put(url, {}, {
                headers: { 'auth-token': this.authToken }
            });
            
            return response.data;
        } catch (error) {
            this.handleApiError(error, 'Failed to cancel test run');
        }
    }

    /**
     * Get test cases from the suite
     * @param {Object} params - Pagination parameters (page, size)
     * @returns {Promise<Object>} API response
     */
    async getTestCases(params = {}) {
        const { page = 0, size = 20 } = params;
        const url = `${this.api2BaseUrl}/apps/${this.testSuiteId}/test_cases?page=${page}&size=${size}`;
        
        try {
            const response = await axios.get(url, {
                headers: { 'auth-token': this.authToken }
            });
            
            return response.data;
        } catch (error) {
            this.handleApiError(error, 'Failed to get test cases');
        }
    }

    /**
     * Handle API errors with detailed information
     * @private
     */
    handleApiError(error, message) {
        if (error.response) {
            const errorDetails = {
                message,
                status: error.response.status,
                statusText: error.response.statusText,
                data: error.response.data
            };
            
            const detailedError = new Error(
                `${message}: ${error.response.status} ${error.response.statusText}`
            );
            detailedError.details = errorDetails;
            throw detailedError;
        } else if (error.request) {
            const networkError = new Error(`${message}: No response received from server`);
            networkError.details = { message, originalError: error.message };
            throw networkError;
        } else {
            const genericError = new Error(`${message}: ${error.message}`);
            genericError.details = { message, originalError: error.message };
            throw genericError;
        }
    }
}

module.exports = TestRigorClient;
