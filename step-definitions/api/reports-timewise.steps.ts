import { DataTable, Then, When } from '@cucumber/cucumber';
import assert from 'node:assert/strict';
import { TIMEWISE_COUNTS_ENDPOINT } from '../../constants';
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

// site-247 over this date range has real traffic data, unlike site-481 which always
// returns an empty data array - used so positive scenarios can assert on actual counts.
const VALID_QUERY_PARAMS: Record<string, string> = {
  'class_type[]': 'pedestrian',
  sid: 'site-247',
  'timestamp[start]': '2026-08-20T01:01:00',
  'timestamp[end]': '2026-08-22T01:01:00',
  time_interval: '5'
};

async function timewiseCounts(world: CustomWorld, params: Record<string, string>, headers: Record<string, string>): Promise<void> {
  const response = await world.api.get(ENV_CONFIG.altApiUrl, `${TIMEWISE_COUNTS_ENDPOINT}?${buildQuery(params)}`, headers);
  const text = await response.text();
  const json = text ? JSON.parse(text) : null;
  world.response = { status: () => response.status(), json: () => Promise.resolve(json), text: () => Promise.resolve(text) };
}

When('I request timewise counts with the following query parameters:', async function (this: CustomWorld, dataTable: DataTable) {
  await timewiseCounts(this, dataTable.rowsHash(), authHeaders(this));
});

When('I request timewise counts without the X-Customer-API-Key header', async function (this: CustomWorld) {
  await timewiseCounts(this, VALID_QUERY_PARAMS, { Accept: 'application/json', 'X-FEClient-Key': ENV_CONFIG.feClientKey });
});

When('I request timewise counts without the X-FEClient-Key header', async function (this: CustomWorld) {
  await timewiseCounts(this, VALID_QUERY_PARAMS, { Accept: 'application/json', ...(this.customerApiKey ? { 'X-Customer-API-Key': this.customerApiKey } : {}) });
});

interface TimewiseCountsBody {
  data?: unknown[];
  meta?: {
    total_groups?: number;
    grouping?: { time_interval?: number; timezone?: string };
  };
}

Then('the response body should have timewise counts metadata for a time interval of {int}', async function (this: CustomWorld, timeInterval: number) {
  const body = (await this.response?.json()) as TimewiseCountsBody;
  assert.ok(Array.isArray(body?.data), 'expected "data" to be an array');
  assert.equal(typeof body?.meta?.total_groups, 'number', 'expected "meta.total_groups" to be a number');
  assert.equal(body?.meta?.grouping?.time_interval, timeInterval);
});

interface TimeBucketEntry {
  group_key?: string;
  group_value?: number;
  aggregation_type?: string;
  aggregation_value?: number;
  aggregation_field?: unknown;
}

Then('the response body should contain time bucket entries', async function (this: CustomWorld) {
  const body = (await this.response?.json()) as { data?: TimeBucketEntry[] };
  assert.ok(Array.isArray(body?.data) && body.data.length > 0, 'expected "data" to be a non-empty array');
  for (const entry of body.data) {
    assert.equal(entry.group_key, 'time_bucket');
    assert.equal(typeof entry.group_value, 'number');
    assert.equal(entry.aggregation_type, 'average');
    assert.equal(typeof entry.aggregation_value, 'number');
  }
});
