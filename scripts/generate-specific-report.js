const reporter = require('multiple-cucumber-html-reporter');

reporter.generate({
  jsonDir: 'reports',
  reportPath: 'reports/cucumber-html-reports/specific',
  reportName: `Filtered Dashboard API Report (${process.env.TAG || 'all'})`,
  pageTitle: 'Filtered Dashboard API Automation',
  displayDuration: true
});
