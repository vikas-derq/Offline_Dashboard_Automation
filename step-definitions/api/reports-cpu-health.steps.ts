import { DataTable, Then, When } from '@cucumber/cucumber';
import assert from 'node:assert/strict';
import { CPU_HEALTH_SUMMARY_ENDPOINT } from '../../constants';
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
  'timestamp[start]': '2026-08-20T01:01:00',
  'timestamp[end]': '2026-08-22T01:01:00',
  timezone: 'America/New_York'
};

async function cpuHealthSummary(world: CustomWorld, params: Record<string, string>, headers: Record<string, string>): Promise<void> {
  const response = await world.api.get(ENV_CONFIG.altApiUrl, `${CPU_HEALTH_SUMMARY_ENDPOINT}?${buildQuery(params)}`, headers);
  const text = await response.text();
  const json = text ? JSON.parse(text) : null;
  world.response = { status: () => response.status(), json: () => Promise.resolve(json), text: () => Promise.resolve(text) };
}

When('I request the cpu health summary with the following query parameters:', async function (this: CustomWorld, dataTable: DataTable) {
  await cpuHealthSummary(this, dataTable.rowsHash(), authHeaders(this));
});

When('I request the cpu health summary without the X-Customer-API-Key header', async function (this: CustomWorld) {
  await cpuHealthSummary(this, VALID_QUERY_PARAMS, { Accept: 'application/json', 'X-FEClient-Key': ENV_CONFIG.feClientKey });
});

When('I request the cpu health summary without the X-FEClient-Key header', async function (this: CustomWorld) {
  await cpuHealthSummary(this, VALID_QUERY_PARAMS, { Accept: 'application/json', ...(this.customerApiKey ? { 'X-Customer-API-Key': this.customerApiKey } : {}) });
});

interface CpuHealthEntry {
  time_bucket?: string;
  memory_used?: number;
  memory_total?: number;
  memory_available?: number;
  cpu_load?: number;
  cpu_temperature?: number;
}

interface CpuHealthBody {
  data?: CpuHealthEntry[];
  meta?: {
    filtered_count?: number;
    total_groups?: number;
    grouping?: { group_by?: string; aggregation?: string; bucket_size?: string };
  };
}

Then('the response body should contain cpu health entries', async function (this: CustomWorld) {
  const body = (await this.response?.json()) as CpuHealthBody;
  assert.ok(Array.isArray(body?.data) && body.data.length > 0, 'expected "data" to be a non-empty array');
  assert.equal(body?.meta?.grouping?.group_by, 'time_bucket');
  assert.equal(body?.meta?.grouping?.aggregation, 'avg');
  assert.equal(body?.meta?.grouping?.bucket_size, '5min');
  for (const entry of body.data) {
    assert.equal(typeof entry.time_bucket, 'string');
    assert.equal(typeof entry.memory_used, 'number');
    assert.equal(typeof entry.memory_total, 'number');
    assert.equal(typeof entry.memory_available, 'number');
    assert.equal(typeof entry.cpu_load, 'number');
    assert.equal(typeof entry.cpu_temperature, 'number');
  }
});

Then('the response body should have no cpu health entries', async function (this: CustomWorld) {
  const body = (await this.response?.json()) as CpuHealthBody;
  assert.ok(Array.isArray(body?.data) && body.data.length === 0, 'expected "data" to be an empty array');
  assert.equal(body?.meta?.total_groups, 0);
});
