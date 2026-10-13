import { DataTable, Then, When } from '@cucumber/cucumber';
import assert from 'node:assert/strict';
import { DOWWISE_COUNTS_ENDPOINT } from '../../constants';
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
  time_interval: '5'
};

async function dowwiseCounts(world: CustomWorld, params: Record<string, string>, headers: Record<string, string>): Promise<void> {
  const response = await world.api.get(ENV_CONFIG.altApiUrl, `${DOWWISE_COUNTS_ENDPOINT}?${buildQuery(params)}`, headers);
  const text = await response.text();
  const json = text ? JSON.parse(text) : null;
  world.response = { status: () => response.status(), json: () => Promise.resolve(json), text: () => Promise.resolve(text) };
}

When('I request dowwise counts with the following query parameters:', async function (this: CustomWorld, dataTable: DataTable) {
  await dowwiseCounts(this, dataTable.rowsHash(), authHeaders(this));
});

When('I request dowwise counts without the X-Customer-API-Key header', async function (this: CustomWorld) {
  await dowwiseCounts(this, VALID_QUERY_PARAMS, { Accept: 'application/json', 'X-FEClient-Key': ENV_CONFIG.feClientKey });
});

When('I request dowwise counts without the X-FEClient-Key header', async function (this: CustomWorld) {
  await dowwiseCounts(this, VALID_QUERY_PARAMS, { Accept: 'application/json', ...(this.customerApiKey ? { 'X-Customer-API-Key': this.customerApiKey } : {}) });
});

interface DowEntry {
  group_key?: string;
  group_value?: { dow?: number; tIdx?: number };
  aggregation_type?: string;
  aggregation_value?: number;
  aggregation_field?: unknown;
}

Then('the response body should contain day-of-week entries', async function (this: CustomWorld) {
  const body = (await this.response?.json()) as { data?: DowEntry[] };
  assert.ok(Array.isArray(body?.data) && body.data.length > 0, 'expected "data" to be a non-empty array');
  for (const entry of body.data) {
    assert.equal(entry.group_key, 'dow_wise');
    assert.equal(typeof entry.group_value?.dow, 'number');
    assert.ok(entry.group_value && entry.group_value.dow! >= 0 && entry.group_value.dow! <= 6, 'expected "dow" to be between 0 and 6');
    assert.equal(typeof entry.group_value?.tIdx, 'number');
    assert.equal(entry.aggregation_type, 'count');
    assert.equal(typeof entry.aggregation_value, 'number');
  }
});
