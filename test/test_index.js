const { controlStatusCakeMonitor } = require('../src/index');

async function testControlStatusCakeMonitor() {
    const monitorIds = ['12345', '67890'];
    const apiToken = 'fake_token';

    for (const monitorId of monitorIds) {
        try {
            await controlStatusCakeMonitor(monitorId, true, apiToken);
            console.log(`Test passed for monitor ${monitorId} (pause)`);
        } catch (error) {
            console.error(`Test failed for monitor ${monitorId} (pause): ${error}`);
        }

        try {
            await controlStatusCakeMonitor(monitorId, false, apiToken);
            console.log(`Test passed for monitor ${monitorId} (restart)`);
        } catch (error) {
            console.error(`Test failed for monitor ${monitorId} (restart): ${error}`);
        }
    }
}

testControlStatusCakeMonitor();
