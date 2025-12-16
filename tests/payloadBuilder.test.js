const { buildRetestPayload, buildStatusParams } = require('../src/utils/payloadBuilder');

describe('Payload Builder', () => {
    describe('buildRetestPayload', () => {
        test('should build basic payload', () => {
            const inputs = {
                forceCancelPreviousTesting: true
            };
            const result = buildRetestPayload(inputs);
            expect(result).toEqual({
                forceCancelPreviousTesting: true
            });
        });

        test('should include stored values', () => {
            const inputs = {
                forceCancelPreviousTesting: false,
                storedValues: '{"key": "value"}'
            };
            const result = buildRetestPayload(inputs);
            expect(result.storedValues).toEqual({ key: 'value' });
        });

        test('should include branch configuration', () => {
            const inputs = {
                forceCancelPreviousTesting: true,
                branchName: 'feature',
                commitHash: 'abc123',
                deployUrl: 'https://example.com',
                allowKnownIssues: true
            };
            const result = buildRetestPayload(inputs);
            expect(result.branch).toEqual({
                name: 'feature',
                commit: 'abc123',
                allowKnownIssues: true
            });
            expect(result.url).toBe('https://example.com');
        });

        test('should include labels', () => {
            const inputs = {
                forceCancelPreviousTesting: true,
                labels: 'smoke, regression',
                excludedLabels: 'slow'
            };
            const result = buildRetestPayload(inputs);
            expect(result.labels).toEqual(['smoke', 'regression']);
            expect(result.excludedLabels).toEqual(['slow']);
        });

        test('should include test case UUIDs', () => {
            const inputs = {
                forceCancelPreviousTesting: true,
                testCaseUuids: 'uuid1, uuid2',
                deployUrl: 'https://example.com'
            };
            const result = buildRetestPayload(inputs);
            expect(result.testCaseUuids).toEqual(['uuid1', 'uuid2']);
            expect(result.url).toBe('https://example.com');
        });

        test('should include custom name', () => {
            const inputs = {
                forceCancelPreviousTesting: true,
                customName: 'My Custom Test Run'
            };
            const result = buildRetestPayload(inputs);
            expect(result.customName).toBe('My Custom Test Run');
        });
    });

    describe('buildStatusParams', () => {
        test('should build empty params', () => {
            const result = buildStatusParams({});
            expect(result).toEqual({});
        });

        test('should include branch name', () => {
            const result = buildStatusParams({ branchName: 'feature' });
            expect(result).toEqual({ branchName: 'feature' });
        });

        test('should include labels', () => {
            const result = buildStatusParams({ labels: 'smoke,regression' });
            expect(result).toEqual({ labels: 'smoke,regression' });
        });
    });
});
