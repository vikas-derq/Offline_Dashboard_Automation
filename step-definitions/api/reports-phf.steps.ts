import { DataTable, Then, When } from '@cucumber/cucumber';
import assert from 'node:assert/strict';
import { PHF_COUNTS_ENDPOINT } from '../../constants';
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
  'timestamp[end]': '2026-08-22T23:59:59',
  timezone: 'America/New_York'
};

async function phfCounts(world: CustomWorld, params: Record<string, string>, headers: Record<string, string>): Promise<void> {
  const response = await world.api.get(ENV_CONFIG.altApiUrl, `${PHF_COUNTS_ENDPOINT}?${buildQuery(params)}`, headers);
  const text = await response.text();
  const json = text ? JSON.parse(text) : null;
  world.response = { status: () => response.status(), json: () => Promise.resolve(json), text: () => Promise.resolve(text) };
}

When('I request phf counts with the following query parameters:', async function (this: CustomWorld, dataTable: DataTable) {
  await phfCounts(this, dataTable.rowsHash(), authHeaders(this));
});

When('I request phf counts without the X-Customer-API-Key header', async function (this: CustomWorld) {
  await phfCounts(this, VALID_QUERY_PARAMS, { Accept: 'application/json', 'X-FEClient-Key': ENV_CONFIG.feClientKey });
});

When('I request phf counts without the X-FEClient-Key header', async function (this: CustomWorld) {
  await phfCounts(this, VALID_QUERY_PARAMS, { Accept: 'application/json', ...(this.customerApiKey ? { 'X-Customer-API-Key': this.customerApiKey } : {}) });
});

interface PhfEntry {
  group_key?: string;
  group_value?: { time_index?: number; approach?: string; movement_type?: string };
  aggregation_type?: string;
  aggregation_value?: number;
  aggregation_field?: unknown;
  aggregation_distribution?: Record<string, number>;
  aggregation_distribution_by?: string;
  health?: { outage_status?: string; uptime_percentage?: number };
}

interface PhfBody {
  data?: PhfEntry[];
  meta?: {
    total_groups?: number;
    grouping?: { time_interval?: number; timezone?: string };
    peak_hour_buckets?: { period?: string; label?: string; hour_range?: string }[];
  };
}

Then('the response body should contain approach movement entries', async function (this: CustomWorld) {
  const body = (await this.response?.json()) as PhfBody;
  assert.ok(Array.isArray(body?.data) && body.data.length > 0, 'expected "data" to be a non-empty array');
  assert.equal(body?.meta?.grouping?.time_interval, 15);
  assert.ok(Array.isArray(body?.meta?.peak_hour_buckets) && body.meta.peak_hour_buckets.length === 3, 'expected 3 peak hour buckets');
  for (const entry of body.data) {
    assert.equal(entry.group_key, 'approach_movement');
    assert.equal(typeof entry.group_value?.time_index, 'number');
    assert.equal(typeof entry.group_value?.approach, 'string');
    assert.equal(typeof entry.group_value?.movement_type, 'string');
    assert.equal(entry.aggregation_type, 'total');
    assert.equal(typeof entry.aggregation_value, 'number');
    assert.equal(entry.aggregation_distribution_by, 'class');
    assert.equal(typeof entry.aggregation_distribution, 'object');
    assert.equal(typeof entry.health?.outage_status, 'string');
    assert.equal(typeof entry.health?.uptime_percentage, 'number');
  }
});
