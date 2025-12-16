const TestRigorClient = require('../src/api/testRigorClient');
const axios = require('axios');

jest.mock('axios');

describe('TestRigorClient', () => {
    let client;
    const authToken = 'test-token';
    const testSuiteId = 'test-suite-123';

    beforeEach(() => {
        client = new TestRigorClient(authToken, testSuiteId);
        jest.clearAllMocks();
    });

    describe('triggerRetest', () => {
        test('should trigger retest with correct parameters', async () => {
            const mockResponse = { data: { success: true } };
            axios.post.mockResolvedValue(mockResponse);

            const config = {
                forceCancelPreviousTesting: true,
                storedValues: { key: 'value' }
            };

            const result = await client.triggerRetest(config);

            expect(axios.post).toHaveBeenCalledWith(
                `https://api.testrigor.com/api/v1/apps/${testSuiteId}/retest`,
                config,
                {
                    headers: {
                        'auth-token': authToken,
                        'Content-Type': 'application/json'
                    }
                }
            );
            expect(result).toEqual({ success: true });
        });

        test('should handle API errors', async () => {
            const mockError = {
                response: {
                    status: 400,
                    statusText: 'Bad Request',
                    data: { error: 'Invalid input' }
                }
            };
            axios.post.mockRejectedValue(mockError);

            await expect(client.triggerRetest({})).rejects.toThrow('Failed to trigger retest');
        });
    });

    describe('getStatus', () => {
        test('should get status with default parameters', async () => {
            const mockResponse = {
                status: 200,
                data: { status: 'success' }
            };
            axios.get.mockResolvedValue(mockResponse);

            const result = await client.getStatus();

            expect(axios.get).toHaveBeenCalledWith(
                `https://api.testrigor.com/api/v1/apps/${testSuiteId}/status`,
                expect.objectContaining({
                    headers: expect.objectContaining({
                        'auth-token': authToken,
                        'Accept': 'application/json'
                    })
                })
            );
            expect(result).toEqual({
                status: 200,
                data: { status: 'success' }
            });
        });

        test('should include query parameters', async () => {
            const mockResponse = { status: 227, data: {} };
            axios.get.mockResolvedValue(mockResponse);

            await client.getStatus({ branchName: 'feature', labels: 'smoke' });

            expect(axios.get).toHaveBeenCalledWith(
                expect.stringContaining('branchName=feature'),
                expect.any(Object)
            );
            expect(axios.get).toHaveBeenCalledWith(
                expect.stringContaining('labels=smoke'),
                expect.any(Object)
            );
        });

        test('should handle error responses', async () => {
            const mockError = {
                response: {
                    status: 404,
                    data: { error: 'Not found' }
                }
            };
            axios.get.mockRejectedValue(mockError);

            const result = await client.getStatus();

            expect(result).toEqual({
                status: 404,
                data: { error: 'Not found' },
                error: true
            });
        });
    });
});
