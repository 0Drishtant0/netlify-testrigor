const { runTestRigor } = require('./src/plugin');

/**
 * Netlify Build Plugin for TestRigor
 * Triggers and monitors TestRigor test executions during Netlify builds
 */
module.exports = {
    /**
     * onSuccess event - Runs after a successful build
     */
    async onSuccess(context) {
        return runTestRigor(context);
    }
};
