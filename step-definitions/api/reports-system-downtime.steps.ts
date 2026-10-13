import { DataTable, Then, When } from '@cucumber/cucumber';
import assert from 'node:assert/strict';
import { SYSTEM_DOWNTIME_ENDPOINT } from '../../constants';
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
  sid: 'site-247',
  'timestamp[start]': '2026-08-22T00:00:00',
  'timestamp[end]': '2026-08-24T23:59:59'
};

async function systemDowntime(world: CustomWorld, params: Record<string, string>, headers: Record<string, string>): Promise<void> {
  const response = await world.api.get(ENV_CONFIG.altApiUrl, `${SYSTEM_DOWNTIME_ENDPOINT}?${buildQuery(params)}`, headers);
  const text = await response.text();
  const json = text ? JSON.parse(text) : null;
  world.response = { status: () => response.status(), json: () => Promise.resolve(json), text: () => Promise.resolve(text) };
}

When('I request system downtime with the following query parameters:', async function (this: CustomWorld, dataTable: DataTable) {
  await systemDowntime(this, dataTable.rowsHash(), authHeaders(this));
});

When('I request system downtime without the X-Customer-API-Key header', async function (this: CustomWorld) {
  await systemDowntime(this, VALID_QUERY_PARAMS, { Accept: 'application/json', 'X-FEClient-Key': ENV_CONFIG.feClientKey });
});

When('I request system downtime without the X-FEClient-Key header', async function (this: CustomWorld) {
  await systemDowntime(this, VALID_QUERY_PARAMS, { Accept: 'application/json', ...(this.customerApiKey ? { 'X-Customer-API-Key': this.customerApiKey } : {}) });
});

interface DowntimeEntry {
  time_bucket?: string;
  uptime?: number;
  status?: string;
}

interface DowntimeBody {
  data?: DowntimeEntry[];
  meta?: {
    total_groups?: number;
    grouping?: { aggregation_interval?: number; timezone?: string };
  };
}

Then('the response body should contain downtime entries', async function (this: CustomWorld) {
  const body = (await this.response?.json()) as DowntimeBody;
  assert.ok(Array.isArray(body?.data) && body.data.length > 0, 'expected "data" to be a non-empty array');
  for (const entry of body.data) {
    assert.equal(typeof entry.time_bucket, 'string');
    assert.equal(typeof entry.uptime, 'number');
    assert.ok(entry.uptime! >= 0 && entry.uptime! <= 100, 'expected "uptime" to be between 0 and 100');
    assert.ok(entry.status === 'ONLINE' || entry.status === 'OFFLINE', 'expected "status" to be ONLINE or OFFLINE');
  }
});

Then('the response body\'s meta.grouping.aggregation_interval should be {int}', async function (this: CustomWorld, interval: number) {
  const body = (await this.response?.json()) as DowntimeBody;
  assert.equal(body?.meta?.grouping?.aggregation_interval, interval);
});
