import { DataTable, Then, When } from '@cucumber/cucumber';
import assert from 'node:assert/strict';
import { CLASSWISE_COUNTS_ENDPOINT } from '../../constants';
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
  group_by: 'day',
  class_type: 'vehicle',
  sid: 'site-481',
  'timestamp[start]': '2026-06-01T01:01:00',
  'timestamp[end]': '2026-06-10T01:01:00'
};

async function classwiseCounts(world: CustomWorld, params: Record<string, string>, headers: Record<string, string>): Promise<void> {
  const response = await world.api.get(ENV_CONFIG.altApiUrl, `${CLASSWISE_COUNTS_ENDPOINT}?${buildQuery(params)}`, headers);
  const text = await response.text();
  const json = text ? JSON.parse(text) : null;
  world.response = { status: () => response.status(), json: () => Promise.resolve(json), text: () => Promise.resolve(text) };
}

When('I request classwise counts with the following query parameters:', async function (this: CustomWorld, dataTable: DataTable) {
  await classwiseCounts(this, dataTable.rowsHash(), authHeaders(this));
});

When('I request classwise counts without the X-Customer-API-Key header', async function (this: CustomWorld) {
  await classwiseCounts(this, VALID_QUERY_PARAMS, { Accept: 'application/json', 'X-FEClient-Key': ENV_CONFIG.feClientKey });
});

When('I request classwise counts without the X-FEClient-Key header', async function (this: CustomWorld) {
  await classwiseCounts(this, VALID_QUERY_PARAMS, { Accept: 'application/json', ...(this.customerApiKey ? { 'X-Customer-API-Key': this.customerApiKey } : {}) });
});

// The real backend response nests total_groups/grouping.group_by/time_interval/timezone under meta,
// which differs from the Swagger example's meta.filtered_count/grouping.aggregation fields.
interface ClasswiseCountsBody {
  data?: unknown[];
  meta?: {
    total_groups?: number;
    grouping?: { group_by?: string; time_interval?: number; timezone?: string };
  };
}

Then('the response body should have classwise counts metadata grouped by {string}', async function (this: CustomWorld, groupBy: string) {
  const body = (await this.response?.json()) as ClasswiseCountsBody;
  assert.ok(Array.isArray(body?.data), 'expected "data" to be an array');
  assert.equal(typeof body?.meta?.total_groups, 'number', 'expected "meta.total_groups" to be a number');
  assert.equal(body?.meta?.grouping?.group_by, groupBy);
});
