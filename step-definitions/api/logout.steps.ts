import { When } from '@cucumber/cucumber';
import { CUSTOMER_LOGOUT_ENDPOINT } from '../../constants';
import { ENV_CONFIG } from '../../support/env';
import { CustomWorld } from '../../support/world';

async function logout(world: CustomWorld, headers: Record<string, string>): Promise<void> {
  const response = await world.api.post(ENV_CONFIG.altApiUrl, CUSTOMER_LOGOUT_ENDPOINT, '', {
    Accept: '*/*',
    'Content-Type': 'application/json',
    ...headers
  });
  const text = await response.text();
  const json = text ? JSON.parse(text) : null;
  world.response = { status: () => response.status(), json: () => Promise.resolve(json), text: () => Promise.resolve(text) };
}

When('I send a logout request', async function (this: CustomWorld) {
  await logout(this, {
    'X-FEClient-Key': ENV_CONFIG.feClientKey,
    ...(this.customerApiKey ? { 'X-Customer-API-Key': this.customerApiKey } : {})
  });
});

When('I send a logout request without the X-Customer-API-Key header', async function (this: CustomWorld) {
  await logout(this, { 'X-FEClient-Key': ENV_CONFIG.feClientKey });
});

When('I send a logout request with an invalid X-Customer-API-Key header', async function (this: CustomWorld) {
  await logout(this, { 'X-FEClient-Key': ENV_CONFIG.feClientKey, 'X-Customer-API-Key': 'invalid-not-a-real-key' });
});

When('I send a logout request without the X-FEClient-Key header', async function (this: CustomWorld) {
  await logout(this, { ...(this.customerApiKey ? { 'X-Customer-API-Key': this.customerApiKey } : {}) });
});
