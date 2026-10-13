import { DataTable, Then, When } from '@cucumber/cucumber';
import assert from 'node:assert/strict';
import { SPEED_DOWWISE_ENDPOINT } from '../../constants';
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
  'timestamp[start]': '2026-09-22T00:00:00',
  'timestamp[end]': '2026-09-27T23:59:59',
  timezone: 'America/New_York',
  speed_unit: 'kph',
  speed_buckets: '10,15'
};

async function speedDowwise(world: CustomWorld, params: Record<string, string>, headers: Record<string, string>): Promise<void> {
  const response = await world.api.get(ENV_CONFIG.altApiUrl, `${SPEED_DOWWISE_ENDPOINT}?${buildQuery(params)}`, headers);
  const text = await response.text();
  const json = text ? JSON.parse(text) : null;
  world.response = { status: () => response.status(), json: () => Promise.resolve(json), text: () => Promise.resolve(text) };
}

When('I request speed dowwise with the following query parameters:', async function (this: CustomWorld, dataTable: DataTable) {
  await speedDowwise(this, dataTable.rowsHash(), authHeaders(this));
});

When('I request speed dowwise without the X-Customer-API-Key header', async function (this: CustomWorld) {
  await speedDowwise(this, VALID_QUERY_PARAMS, { Accept: 'application/json', 'X-FEClient-Key': ENV_CONFIG.feClientKey });
});

When('I request speed dowwise without the X-FEClient-Key header', async function (this: CustomWorld) {
  await speedDowwise(this, VALID_QUERY_PARAMS, { Accept: 'application/json', ...(this.customerApiKey ? { 'X-Customer-API-Key': this.customerApiKey } : {}) });
});

interface SpeedBucketEntry {
  group_key?: string;
  group_value?: { bucket?: number; dow?: number };
  aggregation_type?: string;
  aggregation_value?: number;
  aggregation_field?: unknown;
}

Then('the response body should contain speed bucket entries', async function (this: CustomWorld) {
  const body = (await this.response?.json()) as { data?: SpeedBucketEntry[] };
  assert.ok(Array.isArray(body?.data) && body.data.length > 0, 'expected "data" to be a non-empty array');
  for (const entry of body.data) {
    assert.equal(entry.group_key, 'speed_bucket');
    assert.equal(typeof entry.group_value?.bucket, 'number');
    assert.equal(typeof entry.group_value?.dow, 'number');
    assert.ok(entry.group_value && entry.group_value.dow! >= 0 && entry.group_value.dow! <= 6, 'expected "dow" to be between 0 and 6');
    assert.equal(entry.aggregation_type, 'average');
    assert.equal(typeof entry.aggregation_value, 'number');
  }
});

Then('the response body should contain one zero-value entry per day', async function (this: CustomWorld) {
  const body = (await this.response?.json()) as { data?: SpeedBucketEntry[]; meta?: { total_groups?: number } };
  assert.ok(Array.isArray(body?.data), 'expected "data" to be an array');
  assert.equal(body.data!.length, 7);
  assert.equal(body?.meta?.total_groups, 7);
  for (const entry of body.data!) {
    assert.equal(entry.group_value?.bucket, 0);
    assert.equal(entry.aggregation_value, 0);
  }
});
