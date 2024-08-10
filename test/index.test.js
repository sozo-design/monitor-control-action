const axios = require('axios');
const { controlStatusCakeMonitor } = require('../src/index');

// Mock axios to prevent actual API calls
jest.mock('axios');

describe('controlStatusCakeMonitor', () => {
    it('should pause and restart monitors correctly', async () => {
        const monitorIds = ['12345', '67890'];
        const apiToken = 'fake_token';

        // Mock the axios response
        axios.put.mockResolvedValue({ data: 'success' });

        // Loop through monitorIds and test each one
        for (const monitorId of monitorIds) {
            // Ensure monitorId is valid
            expect(monitorId).toBeTruthy();

            // Test pausing the monitor
            await controlStatusCakeMonitor(monitorId, true, apiToken);
            expect(axios.put).toHaveBeenCalledWith(
                `https://api.statuscake.com/v1/uptime/${monitorId}`,
                { paused: true },
                { headers: { Authorization: `Bearer ${apiToken}`, 'Content-Type': 'application/json' } }
            );

            // Test restarting the monitor
            await controlStatusCakeMonitor(monitorId, false, apiToken);
            expect(axios.put).toHaveBeenCalledWith(
                `https://api.statuscake.com/v1/uptime/${monitorId}`,
                { paused: false },
                { headers: { Authorization: `Bearer ${apiToken}`, 'Content-Type': 'application/json' } }
            );
        }

        // Ensure that axios.put was called twice per monitorId (once for pause, once for restart)
        expect(axios.put).toHaveBeenCalledTimes(monitorIds.length * 2);
    });
});
