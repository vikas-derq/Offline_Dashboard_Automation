import { Then } from '@cucumber/cucumber';
import assert from 'node:assert/strict';
import { CustomWorld } from '../../support/world';

Then('the response status should be {int}', function (this: CustomWorld, expectedStatus: number) {
  assert.equal(this.response?.status(), expectedStatus);
});

Then('the response body should be a non-empty array', async function (this: CustomWorld) {
  const body = await this.response?.json();
  assert.ok(Array.isArray(body) && body.length > 0);
});

Then('the response body\'s meta.grouping.timezone should be {string}', async function (this: CustomWorld, timezone: string) {
  const body = (await this.response?.json()) as { meta?: { grouping?: { timezone?: string } } };
  assert.equal(body?.meta?.grouping?.timezone, timezone);
});

Then('every entry should have a zero aggregation value', async function (this: CustomWorld) {
  const body = (await this.response?.json()) as { data?: { aggregation_value?: number }[] };
  assert.ok(Array.isArray(body?.data) && body.data.length > 0, 'expected "data" to be a non-empty array');
  for (const entry of body.data) {
    assert.equal(entry.aggregation_value, 0);
  }
});
