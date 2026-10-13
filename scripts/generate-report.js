const os = require('os');
const reporter = require('multiple-cucumber-html-reporter');

reporter.generate({
  jsonDir: 'reports',
  reportPath: 'reports/cucumber-html-reports',
  reportName: 'Dashboard API Automation Report',
  pageTitle: 'Dashboard API Automation',
  displayDuration: true,
  metadata: {
    browser: { name: 'API', version: 'n/a' },
    device: 'Local test machine',
    platform: { name: process.platform, version: os.release() }
  }
});
