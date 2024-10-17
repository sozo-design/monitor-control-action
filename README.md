# StatusCake and UptimeRobot Monitor Control GitHub Action

This GitHub Action allows you to pause and resume monitors on both StatusCake and UptimeRobot platforms during your deployment process. It's particularly useful for preventing false alerts during planned maintenance or deployments.

## Features

- Supports both StatusCake and UptimeRobot
- Can handle multiple monitor IDs for each service
- Allows pausing monitors before deployment and resuming them after
- Easy integration with existing GitHub workflows

## Inputs

| Input | Description | Required |
|-------|-------------|----------|
| `statuscake_api_token` | StatusCake API token | No |
| `uptimerobot_api_key` | UptimeRobot API key | No |
| `statuscake_monitor_ids` | Comma-separated list of StatusCake monitor IDs | No |
| `uptimerobot_monitor_ids` | Comma-separated list of UptimeRobot monitor IDs | No |
| `action` | Action to perform: 'pause' or 'resume' | Yes |

Note: You must provide at least one of `statuscake_api_token` or `uptimerobot_api_key`, along with the corresponding monitor IDs.

## Usage

Here's an example of how to use this action in your workflow:

```yaml
name: Deploy with Monitor Control

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2

    - name: Pause Monitoring
      uses: sozo-design/statuscake-uptimerobot-monitor-control@v1
      with:
        action: pause
        statuscake_monitor_ids: '123456,789012'
        uptimerobot_monitor_ids: '345678,901234'
        statuscake_api_token: ${{ secrets.STATUSCAKE_API_TOKEN }}
        uptimerobot_api_key: ${{ secrets.UPTIMEROBOT_API_KEY }}

    - name: Deploy to Production
      run: |
        # Your deployment steps here

    - name: Resume Monitoring
      uses: sozo-design/statuscake-uptimerobot-monitor-control@v1
      with:
        action: resume
        statuscake_monitor_ids: '123456,789012'
        uptimerobot_monitor_ids: '345678,901234'
        statuscake_api_token: ${{ secrets.STATUSCAKE_API_TOKEN }}
        uptimerobot_api_key: ${{ secrets.UPTIMEROBOT_API_KEY }}
```

## Setup

1. Add your StatusCake API token and/or UptimeRobot API key as secrets in your GitHub repository settings.
2. Create a workflow file (e.g., `.github/workflows/deploy.yml`) in your repository and add the steps as shown in the usage example above.
3. Replace `sozo-design/statuscake-uptimerobot-monitor-control@v1` with the actual path to this action in your organization.
4. Update the `statuscake_monitor_ids` and `uptimerobot_monitor_ids` with your actual monitor IDs.

## Security

This action requires access to your StatusCake and/or UptimeRobot API credentials. Always use GitHub Secrets to store these sensitive values and never hardcode them in your workflow files.

## Contributing

Contributions to improve this action are welcome. Please feel free to submit issues or pull requests.
