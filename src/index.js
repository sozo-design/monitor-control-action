const core = require("@actions/core");
const { Configuration, UptimeApi } = require("@statuscake/statuscake-js");
const axios = require("axios");

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
    core.debug(`Processing StatusCake monitor ID: ${id}`);
    await service.updateUptimeTest({ testId: id, paused: pause });
    core.info(`StatusCake monitor ${id} ${pause ? "paused" : "resumed"}`);
  }
}

async function handleUptimeRobot(monitorIds, pause, apiKey) {
  for (const id of monitorIds) {
    core.debug(`Processing UptimeRobot monitor ID: ${id}`);
    const result = await controlUptimeRobotMonitor(id, pause, apiKey);
    if (result.stat === "ok") {
      core.info(`UptimeRobot monitor ${id} ${pause ? "paused" : "resumed"}`);
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

    core.debug(`Action: ${action}`);
    core.debug(`StatusCake API Token provided: ${!!statusCakeApiToken}`);
    core.debug(`UptimeRobot API Key provided: ${!!uptimeRobotApiKey}`);

    if (statusCakeApiToken) {
      const statusCakeMonitorIds = core
        .getInput("statuscake_monitor_ids")
        .split(",")
        .map((id) => id.trim());
      await handleStatusCake(statusCakeMonitorIds, pause, statusCakeApiToken);
    }

    if (uptimeRobotApiKey) {
      const uptimeRobotMonitorIds = core
        .getInput("uptimerobot_monitor_ids")
        .split(",")
        .map((id) => id.trim());
      await handleUptimeRobot(uptimeRobotMonitorIds, pause, uptimeRobotApiKey);
    }

    core.setOutput(
      "result",
      `Monitoring ${pause ? "paused" : "resumed"} successfully`,
    );
  } catch (error) {
    core.setFailed(`Action failed with error: ${error.message}`);
  }
}

run();
