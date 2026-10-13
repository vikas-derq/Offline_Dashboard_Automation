import { DataTable, When } from '@cucumber/cucumber';
import { loginCustomer, loginRaw, loginWithPayload } from '../../support/auth';
import { CustomWorld } from '../../support/world';
import { ENV_CONFIG } from '../../support/env';

When('I send a login request with the configured customer credentials', async function (this: CustomWorld) {
  await loginCustomer(this, ENV_CONFIG.customerEmail, ENV_CONFIG.customerPassword);
});

When('I send a login request with email {string} and password {string}', async function (this: CustomWorld, email: string, password: string) {
  await loginCustomer(this, email, password);
});

When('I send a login request with the following details:', async function (this: CustomWorld, dataTable: DataTable) {
  await loginWithPayload(this, dataTable.rowsHash());
});

When('I send a login request with an empty body', async function (this: CustomWorld) {
  await loginWithPayload(this, {});
});

When('I send a login request with the configured customer credentials and no X-FEClient-Key header', async function (this: CustomWorld) {
  await loginRaw(this, { email: ENV_CONFIG.customerEmail, password: ENV_CONFIG.customerPassword }, { Accept: '*/*' });
});

When('I send a login request with the configured customer credentials and an invalid X-FEClient-Key header', async function (this: CustomWorld) {
  await loginRaw(this, { email: ENV_CONFIG.customerEmail, password: ENV_CONFIG.customerPassword }, { Accept: '*/*', 'X-FEClient-Key': 'invalid-not-a-real-key' });
});
