import { DataTable, Then, When } from '@cucumber/cucumber';
import assert from 'node:assert/strict';
import { DAYWISE_COUNTS_ENDPOINT } from '../../constants';
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
  'class_type[]': 'pedestrian',
  sid: 'site-247',
  'timestamp[start]': '2026-08-20T01:01:00',
  'timestamp[end]': '2026-08-22T01:01:00',
  timezone: 'America/New_York'
};

async function daywiseCounts(world: CustomWorld, params: Record<string, string>, headers: Record<string, string>): Promise<void> {
  const response = await world.api.get(ENV_CONFIG.altApiUrl, `${DAYWISE_COUNTS_ENDPOINT}?${buildQuery(params)}`, headers);
  const text = await response.text();
  const json = text ? JSON.parse(text) : null;
  world.response = { status: () => response.status(), json: () => Promise.resolve(json), text: () => Promise.resolve(text) };
}

When('I request daywise counts with the following query parameters:', async function (this: CustomWorld, dataTable: DataTable) {
  await daywiseCounts(this, dataTable.rowsHash(), authHeaders(this));
});

When('I request daywise counts without the X-Customer-API-Key header', async function (this: CustomWorld) {
  await daywiseCounts(this, VALID_QUERY_PARAMS, { Accept: 'application/json', 'X-FEClient-Key': ENV_CONFIG.feClientKey });
});

When('I request daywise counts without the X-FEClient-Key header', async function (this: CustomWorld) {
  await daywiseCounts(this, VALID_QUERY_PARAMS, { Accept: 'application/json', ...(this.customerApiKey ? { 'X-Customer-API-Key': this.customerApiKey } : {}) });
});

interface DayEntry {
  group_key?: string;
  group_value?: string;
  aggregation_type?: string;
  aggregation_value?: number;
  aggregation_field?: unknown;
}

Then('the response body should contain day entries', async function (this: CustomWorld) {
  const body = (await this.response?.json()) as { data?: DayEntry[] };
  assert.ok(Array.isArray(body?.data) && body.data.length > 0, 'expected "data" to be a non-empty array');
  for (const entry of body.data) {
    assert.equal(entry.group_key, 'day');
    assert.equal(typeof entry.group_value, 'string');
    assert.equal(entry.aggregation_type, 'count');
    assert.equal(typeof entry.aggregation_value, 'number');
  }
});

Then('the response body should have no day entries', async function (this: CustomWorld) {
  const body = (await this.response?.json()) as { data?: DayEntry[]; meta?: { total_groups?: number } };
  assert.ok(Array.isArray(body?.data) && body.data.length === 0, 'expected "data" to be an empty array');
  assert.equal(body?.meta?.total_groups, 0);
});
