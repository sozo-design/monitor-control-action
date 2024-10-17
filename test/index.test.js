const axios = require('axios');
const core = require('@actions/core');
const statusCake = require("@statuscake/statuscake-js");

jest.mock('@actions/core');
jest.mock('axios');
jest.mock('@statuscake/statuscake-js');

describe('Monitor Control Action', () => {
  let mockUptimeApi;

  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();

    // Default mock implementations
    core.getInput.mockImplementation((name) => {
      console.log(`core.getInput called with: ${name}`);
      switch (name) {
        case 'action':
          return 'pause';
        case 'statuscake_api_token':
          return 'fake_statuscake_token';
        case 'uptimerobot_api_key':
          return 'fake_uptimerobot_key';
        case 'statuscake_monitor_ids':
          return '12345,67890';
        case 'uptimerobot_monitor_ids':
          return '98765,43210';
        default:
          return '';
      }
    });

    // Mock StatusCake API
    mockUptimeApi = {
      updateUptimeTest: jest.fn().mockResolvedValue({}),
    };
    statusCake.UptimeApi.mockImplementation(() => {
      console.log('UptimeApi constructor called');
      return mockUptimeApi;
    });

    // Mock UptimeRobot API
    axios.post.mockResolvedValue({ data: { stat: 'ok' } });

    // Add some debugging for core functions
    core.debug.mockImplementation(console.log);
    core.info.mockImplementation(console.log);
    core.setFailed.mockImplementation(console.error);
  });

  it('should attempt to control monitors', async () => {
    await jest.isolateModules(async () => {
      try {
        await require('../index');
      } catch (error) {
        console.error('Error in test:', error);
      }
    });

    // Check if any StatusCake calls were made
    console.log('StatusCake calls:', mockUptimeApi.updateUptimeTest.mock.calls);
    expect(mockUptimeApi.updateUptimeTest).toHaveBeenCalled();

    // Check if any UptimeRobot calls were made
    console.log('UptimeRobot calls:', axios.post.mock.calls);
    expect(axios.post).toHaveBeenCalled();

    // Check if any output was set
    console.log('core.setOutput calls:', core.setOutput.mock.calls);
    expect(core.setOutput).toHaveBeenCalled();
  });

  it('should handle errors', async () => {
    // Simulate an error with StatusCake
    mockUptimeApi.updateUptimeTest.mockRejectedValue(new Error('StatusCake API Error'));

    await jest.isolateModules(async () => {
      try {
        await require('../index');
      } catch (error) {
        console.error('Error in test:', error);
      }
    });

    // Check if error was handled
    console.log('core.setFailed calls:', core.setFailed.mock.calls);
    expect(core.setFailed).toHaveBeenCalled();
  });
});
