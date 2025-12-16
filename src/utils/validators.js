/**
 * Input validation utilities
 */

/**
 * Validate and parse stored values JSON
 * @param {string} storedValues - JSON string of stored values
 * @returns {Object|null} Parsed object or null if invalid
 */
function parseStoredValues(storedValues) {
    if (!storedValues) {
        return null;
    }

    try {
        const parsed = JSON.parse(storedValues);
        if (typeof parsed !== 'object' || Array.isArray(parsed)) {
            throw new Error('storedValues must be a JSON object');
        }
        return parsed;
    } catch (error) {
        throw new Error(`Invalid storedValues JSON: ${error.message}`);
    }
}

/**
 * Parse comma-separated string into array
 * @param {string} input - Comma-separated string
 * @returns {Array|null} Array of trimmed strings or null
 */
function parseCommaSeparated(input) {
    if (!input || typeof input !== 'string') {
        return null;
    }

    return input
        .split(',')
        .map(item => item.trim())
        .filter(item => item.length > 0);
}

/**
 * Validate branch testing configuration
 * @param {Object} inputs - Plugin inputs
 * @returns {Object|null} Error object if validation fails
 */
function validateBranchConfig(inputs) {
    const { branchName, commitHash, deployUrl } = inputs;

    if ((branchName || commitHash) && !deployUrl) {
        return {
            valid: false,
            error: 'deployUrl is required when using branch/commit testing'
        };
    }

    return { valid: true };
}

/**
 * Validate test case UUID configuration
 * @param {Object} inputs - Plugin inputs
 * @returns {Object|null} Error object if validation fails
 */
function validateTestCaseConfig(inputs) {
    const { testCaseUuids, deployUrl } = inputs;

    if (testCaseUuids && !deployUrl) {
        return {
            valid: false,
            error: 'deployUrl is required when using testCaseUuids'
        };
    }

    return { valid: true };
}

/**
 * Validate all plugin inputs
 * @param {Object} inputs - Plugin inputs
 * @returns {Object} Validation result
 */
function validateInputs(inputs) {
    if (!inputs.authenticationToken) {
        return {
            valid: false,
            error: 'authenticationToken is required'
        };
    }

    if (!inputs.testSuiteId) {
        return {
            valid: false,
            error: 'testSuiteId is required'
        };
    }

    const branchValidation = validateBranchConfig(inputs);
    if (!branchValidation.valid) {
        return branchValidation;
    }

    const testCaseValidation = validateTestCaseConfig(inputs);
    if (!testCaseValidation.valid) {
        return testCaseValidation;
    }

    return { valid: true };
}

module.exports = {
    parseStoredValues,
    parseCommaSeparated,
    validateBranchConfig,
    validateTestCaseConfig,
    validateInputs
};
