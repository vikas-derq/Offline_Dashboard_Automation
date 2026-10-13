import { After, Before, setDefaultTimeout, Status } from '@cucumber/cucumber';
import { ApiClient } from '../api/utils/apiClient';
import { CustomWorld } from './world';
import { captureFailure } from './screenshotManager';
import { loginConfiguredCustomer } from './auth';

// Some report endpoints (e.g. cpu_health_summary with an unbounded timestamp range) can be
// slow on the shared staging backend; 30s was occasionally too tight and caused flaky timeouts.
setDefaultTimeout(60 * 1000);

Before(async function (this: CustomWorld) {
  this.api = new ApiClient();
  await this.api.init(this.bearerToken);
  await loginConfiguredCustomer(this);
});

After(async function (this: CustomWorld, scenario) {
  if (scenario.result?.status === Status.FAILED) await captureFailure(this, scenario.pickle.name);
  await this.api?.dispose();
});
