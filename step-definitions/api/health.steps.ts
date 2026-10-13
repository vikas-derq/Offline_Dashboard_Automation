import { When } from '@cucumber/cucumber';
import { ENV_CONFIG } from '../../support/env';
import { CustomWorld } from '../../support/world';

When('I send a GET request to {string}', async function (this: CustomWorld, endpoint: string) {
  const response = await this.api.get(ENV_CONFIG.baseApiUrl, endpoint, {
    ...(ENV_CONFIG.apiKey ? { 'x-api-key': ENV_CONFIG.apiKey } : {})
  });
  const text = await response.text();
  const json = text ? JSON.parse(text) : null;
  this.response = { status: () => response.status(), json: () => Promise.resolve(json), text: () => Promise.resolve(text) };
});
