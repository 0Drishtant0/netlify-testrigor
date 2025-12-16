const { parseStoredValues, parseCommaSeparated } = require('./validators');

/**
 * Build the retest payload from plugin inputs
 * @param {Object} inputs - Plugin inputs
 * @returns {Object} Formatted payload for TestRigor API
 */
function buildRetestPayload(inputs) {
    const {
        storedValues,
        forceCancelPreviousTesting,
        customName,
        branchName,
        commitHash,
        deployUrl,
        allowKnownIssues,
        labels,
        excludedLabels,
        testCaseUuids
    } = inputs;

    const payload = {
        forceCancelPreviousTesting: forceCancelPreviousTesting === true
    };

    // Add stored values
    const parsedValues = parseStoredValues(storedValues);
    if (parsedValues) {
        payload.storedValues = parsedValues;
    }

    // Add custom name
    if (customName) {
        payload.customName = customName;
    }

    // Add branch/commit configuration
    if (branchName || commitHash) {
        payload.branch = {
            name: branchName || 'main',
            commit: commitHash || '',
            allowKnownIssues: allowKnownIssues === true
        };
        payload.url = deployUrl;
    }

    // Add labels filtering
    const parsedLabels = parseCommaSeparated(labels);
    if (parsedLabels && parsedLabels.length > 0) {
        payload.labels = parsedLabels;
    }

    const parsedExcludedLabels = parseCommaSeparated(excludedLabels);
    if (parsedExcludedLabels && parsedExcludedLabels.length > 0) {
        payload.excludedLabels = parsedExcludedLabels;
    }

    // Add test case UUIDs
    const parsedUuids = parseCommaSeparated(testCaseUuids);
    if (parsedUuids && parsedUuids.length > 0) {
        payload.testCaseUuids = parsedUuids;
        if (!payload.url) {
            payload.url = deployUrl;
        }
    }

    return payload;
}

/**
 * Build status query parameters
 * @param {Object} inputs - Plugin inputs
 * @returns {Object} Query parameters
 */
function buildStatusParams(inputs) {
    const params = {};

    if (inputs.branchName) {
        params.branchName = inputs.branchName;
    }

    if (inputs.labels) {
        params.labels = inputs.labels;
    }

    return params;
}

module.exports = {
    buildRetestPayload,
    buildStatusParams
};
