const { parseStoredValues, parseCommaSeparated, validateInputs } = require('../src/utils/validators');

describe('Validators', () => {
    describe('parseStoredValues', () => {
        test('should parse valid JSON string', () => {
            const input = '{"key": "value", "number": 123}';
            const result = parseStoredValues(input);
            expect(result).toEqual({ key: 'value', number: 123 });
        });

        test('should return null for empty input', () => {
            expect(parseStoredValues('')).toBeNull();
            expect(parseStoredValues(null)).toBeNull();
            expect(parseStoredValues(undefined)).toBeNull();
        });

        test('should throw error for invalid JSON', () => {
            expect(() => parseStoredValues('invalid json')).toThrow('Invalid storedValues JSON');
        });

        test('should throw error for array input', () => {
            expect(() => parseStoredValues('["array"]')).toThrow('storedValues must be a JSON object');
        });
    });

    describe('parseCommaSeparated', () => {
        test('should parse comma-separated values', () => {
            const result = parseCommaSeparated('label1, label2, label3');
            expect(result).toEqual(['label1', 'label2', 'label3']);
        });

        test('should handle empty strings', () => {
            expect(parseCommaSeparated('')).toBeNull();
            expect(parseCommaSeparated(null)).toBeNull();
        });

        test('should filter empty values', () => {
            const result = parseCommaSeparated('label1, , label3');
            expect(result).toEqual(['label1', 'label3']);
        });

        test('should trim whitespace', () => {
            const result = parseCommaSeparated('  label1  ,  label2  ');
            expect(result).toEqual(['label1', 'label2']);
        });
    });

    describe('validateInputs', () => {
        test('should validate required fields', () => {
            const result = validateInputs({});
            expect(result.valid).toBe(false);
            expect(result.error).toContain('authenticationToken');
        });

        test('should pass with minimal valid inputs', () => {
            const result = validateInputs({
                authenticationToken: 'token',
                testSuiteId: 'suite123'
            });
            expect(result.valid).toBe(true);
        });

        test('should require deployUrl for branch testing', () => {
            const result = validateInputs({
                authenticationToken: 'token',
                testSuiteId: 'suite123',
                branchName: 'feature-branch'
            });
            expect(result.valid).toBe(false);
            expect(result.error).toContain('deployUrl');
        });

        test('should require deployUrl for testCaseUuids', () => {
            const result = validateInputs({
                authenticationToken: 'token',
                testSuiteId: 'suite123',
                testCaseUuids: 'uuid1,uuid2'
            });
            expect(result.valid).toBe(false);
            expect(result.error).toContain('deployUrl');
        });

        test('should pass with complete configuration', () => {
            const result = validateInputs({
                authenticationToken: 'token',
                testSuiteId: 'suite123',
                branchName: 'main',
                commitHash: 'abc123',
                deployUrl: 'https://example.com'
            });
            expect(result.valid).toBe(true);
        });
    });
});
