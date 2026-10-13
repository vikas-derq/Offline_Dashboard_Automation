import { DataTable, Then, When } from '@cucumber/cucumber';
import assert from 'node:assert/strict';
import { SPEED_BASIC_ENDPOINT } from '../../constants';
import { ENV_CONFIG } from '../../support/env';
import { CustomWorld } from '../../support/world';

function buildQuery(params: Record<string, string>): string {
  return Object.entries(params)
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join('&');
}

function authHeaders(world: CustomWorld): Record<string, string> {
  return {
    Accept: 'application/json',
    'X-FEClient-Key': ENV_CONFIG.feClientKey,
    ...(world.customerApiKey ? { 'X-Customer-API-Key': world.customerApiKey } : {})
  };
}

const VALID_QUERY_PARAMS: Record<string, string> = {
  'class_type[]': 'vehicle',
  sid: 'site-247',
  'timestamp[start]': '2026-08-22T00:00:00',
  'timestamp[end]': '2026-09-27T23:59:59',
  timezone: 'America/New_York',
  speed_unit: 'kph',
  speed_buckets: '10,15'
};

async function speedBasic(world: CustomWorld, params: Record<string, string>, headers: Record<string, string>): Promise<void> {
  const response = await world.api.get(ENV_CONFIG.altApiUrl, `${SPEED_BASIC_ENDPOINT}?${buildQuery(params)}`, headers);
  const text = await response.text();
  const json = text ? JSON.parse(text) : null;
  world.response = { status: () => response.status(), json: () => Promise.resolve(json), text: () => Promise.resolve(text) };
}

When('I request speed basic with the following query parameters:', async function (this: CustomWorld, dataTable: DataTable) {
  await speedBasic(this, dataTable.rowsHash(), authHeaders(this));
});

When('I request speed basic without the X-Customer-API-Key header', async function (this: CustomWorld) {
  await speedBasic(this, VALID_QUERY_PARAMS, { Accept: 'application/json', 'X-FEClient-Key': ENV_CONFIG.feClientKey });
});

When('I request speed basic without the X-FEClient-Key header', async function (this: CustomWorld) {
  await speedBasic(this, VALID_QUERY_PARAMS, { Accept: 'application/json', ...(this.customerApiKey ? { 'X-Customer-API-Key': this.customerApiKey } : {}) });
});

interface SpeedBasicEntry {
  group_key?: string;
  group_value?: number;
  aggregation_type?: string;
  aggregation_value?: number;
  aggregation_field?: unknown;
}

Then('the response body should contain basic speed bucket entries', async function (this: CustomWorld) {
  const body = (await this.response?.json()) as { data?: SpeedBasicEntry[] };
  assert.ok(Array.isArray(body?.data) && body.data.length > 0, 'expected "data" to be a non-empty array');
  for (const entry of body.data) {
    assert.equal(entry.group_key, 'speed_bucket');
    assert.equal(typeof entry.group_value, 'number');
    assert.equal(entry.aggregation_type, 'average');
    assert.equal(typeof entry.aggregation_value, 'number');
  }
});
