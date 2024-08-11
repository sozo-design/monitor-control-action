const core = require("@actions/core");
const { Configuration, UptimeApi } = require("@statuscake/statuscake-js");

async function run() {
  try {
    const monitorIds = core.getInput("statuscake_monitor_ids").split(",");
    const action = core.getInput("action");
    const apiToken = core.getInput("statuscake_api_token");

    const pause = action === "pause"; // Convert the action to a boolean

    const config = new Configuration({
      headers: {
        Authorization: `Bearer ${apiToken}`,
      },
    });
    const service = new UptimeApi(config);

    for (const monitorId of monitorIds) {
      // trim any whitespace
      monitorId.trim();
      core.debug(`Processing monitor ID: ${monitorId}`);
      core.debug(`Pausing monitor: ${pause}`);
      service
        .updateUptimeTest({ testId: monitorId, paused: pause })
        .then((tests) => core.info(JSON.stringify(tests)));
    }
  } catch (error) {
    core.setFailed(`Action failed with error: ${error}`);
  }
}

run();
