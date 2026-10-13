# Offline Dashboard Automation

API-focused Playwright and Cucumber framework for dashboard testing.

## Setup

```bash
npm install
npx playwright install
```

Select the active environment in `config/env.properties`, then replace the URLs and API keys in the matching file under `config/environments/`.

## Run

```bash
npm test
npm run test:api
npm run report
```

Features live in `features/api/`, with matching step definitions in `step-definitions/api/`. Reports are written to `reports/`; failed API responses are captured as JSON under `screenshots/failed-tests/`.
