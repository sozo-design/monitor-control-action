const core = require("@actions/core");
const { Configuration, UptimeApi } = require("@statuscake/statuscake-js");
const axios = require("axios");

const debugMode = core.getInput("debug").toLowerCase() === "true";

function debugLog(message) {
  if (debugMode) {
    core.info(`[DEBUG] ${message}`);
  }
}

function logInfo(message, id = null) {
  if (debugMode && id) {
    core.info(`${message} ${id}`);
  } else {
    core.info(message.replace(/\s+\{id\}$/, ""));
  }
}

async function controlUptimeRobotMonitor(monitorId, pause, apiKey) {
  const status = pause ? 0 : 1;
  const { data } = await axios.post(
    "https://api.uptimerobot.com/v2/editMonitor",
    {
      api_key: apiKey,
      id: monitorId,
      status,
      format: "json",
    },
    {
      headers: { "content-type": "application/x-www-form-urlencoded" },
    },
  );
  return data;
}

async function handleStatusCake(monitorIds, pause, apiToken) {
  const config = new Configuration({
    headers: { Authorization: `Bearer ${apiToken}` },
  });
  const service = new UptimeApi(config);

  for (const id of monitorIds) {
    debugLog(`Processing StatusCake monitor ID: ${id}`);
    const response = await service.updateUptimeTest({
      testId: id,
      paused: pause,
    });
    logInfo(`StatusCake monitor ${pause ? "paused" : "resumed"}`, id);
    debugLog(
      `StatusCake API response for monitor ${id}: ${JSON.stringify(response)}`,
    );
  }
}

async function handleUptimeRobot(monitorIds, pause, apiKey) {
  for (const id of monitorIds) {
    debugLog(`Processing UptimeRobot monitor ID: ${id}`);
    const result = await controlUptimeRobotMonitor(id, pause, apiKey);
    if (result.stat === "ok") {
      logInfo(`UptimeRobot monitor ${pause ? "paused" : "resumed"}`, id);
      debugLog(
        `UptimeRobot API response for monitor ${id}: ${JSON.stringify(result)}`,
      );
    } else {
      throw new Error(
        `Failed to ${pause ? "pause" : "resume"} UptimeRobot monitor ${id}`,
      );
    }
  }
}

async function run() {
  try {
    const action = core.getInput("action");
    const pause = action === "pause";
    const statusCakeApiToken = core.getInput("statuscake_api_token");
    const uptimeRobotApiKey = core.getInput("uptimerobot_api_key");

    debugLog(`Action: ${action}`);
    debugLog(`StatusCake API Token provided: ${!!statusCakeApiToken}`);
    debugLog(`UptimeRobot API Key provided: ${!!uptimeRobotApiKey}`);

    if (statusCakeApiToken) {
      const statusCakeMonitorIds = core
        .getInput("statuscake_monitor_ids")
        .split(",")
        .map((id) => id.trim());
      debugLog(`StatusCake Monitor IDs: ${statusCakeMonitorIds.join(", ")}`);
      await handleStatusCake(statusCakeMonitorIds, pause, statusCakeApiToken);
    }

    if (uptimeRobotApiKey) {
      const uptimeRobotMonitorIds = core
        .getInput("uptimerobot_monitor_ids")
        .split(",")
        .map((id) => id.trim());
      debugLog(`UptimeRobot Monitor IDs: ${uptimeRobotMonitorIds.join(", ")}`);
      await handleUptimeRobot(uptimeRobotMonitorIds, pause, uptimeRobotApiKey);
    }

    core.setOutput(
      "result",
      `Monitoring ${pause ? "paused" : "resumed"} successfully`,
    );
  } catch (error) {
    core.setFailed(`Action failed with error: ${error.message}`);
    if (debugMode) {
      core.error(`Full error details: ${JSON.stringify(error)}`);
    }
  }
}

run();
