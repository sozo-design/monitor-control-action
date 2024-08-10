const core = require("@actions/core");
const axios = require("axios");

async function controlStatusCakeMonitor(monitorId, pause, apiToken) {
  try {
    const url = `https://app.statuscake.com/API/v1/uptime/${monitorId}`;
    const data = { paused: pause };
    const headers = {
      Authorization: `Bearer ${apiToken}`,
      "Content-Type": "application/json",
    };

    const response = await axios.put(url, data, { headers });

    console.log(`Monitor ${monitorId} updated successfully: ${response.data}`);
  } catch (error) {
    console.error(`Error updating monitor ${monitorId}: ${error}`);
    throw error;
  }
}

async function run() {
  try {
    const monitorIds = core.getInput("statuscake_monitor_ids").split(",");
    const action = core.getInput("action");
    const apiToken = core.getInput("statuscake_api_token");

    const pause = action === "pause";

    for (const monitorId of monitorIds) {
      await controlStatusCakeMonitor(monitorId, pause, apiToken);
    }
  } catch (error) {
    core.setFailed(`Action failed with error: ${error}`);
  }
}

run();
