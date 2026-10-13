module.exports = {
  default: {
    require: ['support/env.ts', 'step-definitions/**/*.ts', 'support/*.ts'],
    publishQuiet: true,
    requireModule: ['ts-node/register'],
    format: ['progress', 'html:reports/report.html', 'json:reports/cucumber.json']
  }
};
