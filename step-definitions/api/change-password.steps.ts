import { DataTable, When } from '@cucumber/cucumber';
import { CUSTOMER_CHANGE_PASSWORD_ENDPOINT } from '../../constants';
import { ENV_CONFIG } from '../../support/env';
import { CustomWorld } from '../../support/world';

// change_password has an aggressive brute-force throttle that took ~12 minutes to clear once tripped
// during testing, so requests are spaced out to stay well under whatever triggers it.
const REQUEST_SPACING_MS = 6000;

async function changePassword(world: CustomWorld, body: unknown, headers: Record<string, string>): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, REQUEST_SPACING_MS));
  const response = await world.api.post(ENV_CONFIG.altApiUrl, CUSTOMER_CHANGE_PASSWORD_ENDPOINT, body, headers);
  const text = await response.text();
  const json = text ? JSON.parse(text) : null;
  world.response = { status: () => response.status(), json: () => Promise.resolve(json), text: () => Promise.resolve(text) };
}

function authHeaders(world: CustomWorld): Record<string, string> {
  return {
    Accept: '*/*',
    'X-FEClient-Key': ENV_CONFIG.feClientKey,
    ...(world.customerApiKey ? { 'X-Customer-API-Key': world.customerApiKey } : {})
  };
}

When('I send a change password request with current password {string} and new password {string}', async function (this: CustomWorld, currentPassword: string, newPassword: string) {
  await changePassword(this, { current_password: currentPassword, password: newPassword, password_confirmation: newPassword }, authHeaders(this));
});

When("I send a change password request with the configured customer's current password and new password {string}", async function (this: CustomWorld, newPassword: string) {
  await changePassword(this, { current_password: ENV_CONFIG.customerPassword, password: newPassword, password_confirmation: newPassword }, authHeaders(this));
});

When("I send a change password request with the configured customer's current password and the same new password", async function (this: CustomWorld) {
  await changePassword(this, {
    current_password: ENV_CONFIG.customerPassword,
    password: ENV_CONFIG.customerPassword,
    password_confirmation: ENV_CONFIG.customerPassword
  }, authHeaders(this));
});

When('I send a change password request with the following details:', async function (this: CustomWorld, dataTable: DataTable) {
  await changePassword(this, dataTable.rowsHash(), authHeaders(this));
});

When('I send a change password request with an empty body', async function (this: CustomWorld) {
  await changePassword(this, {}, authHeaders(this));
});

When('I send a change password request without the X-Customer-API-Key header', async function (this: CustomWorld) {
  await changePassword(this, {
    current_password: 'wrong-current-password',
    password: 'NewPassw0rd!1',
    password_confirmation: 'NewPassw0rd!1'
  }, { Accept: '*/*', 'X-FEClient-Key': ENV_CONFIG.feClientKey });
});

When('I send a change password request without the X-FEClient-Key header', async function (this: CustomWorld) {
  await changePassword(this, {
    current_password: 'wrong-current-password',
    password: 'NewPassw0rd!1',
    password_confirmation: 'NewPassw0rd!1'
  }, { Accept: '*/*', ...(this.customerApiKey ? { 'X-Customer-API-Key': this.customerApiKey } : {}) });
});
