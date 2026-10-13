import { ENV_CONFIG } from '../../support/env';
import { CustomWorld } from '../../support/world';
import { parseDataTableToRequestBody } from './requestBodyUtils';

export async function sendPostWithBearerToken(world: CustomWorld, endpoint: string, body: Record<string, string>): Promise<void> {
  const response = await world.api.post(ENV_CONFIG.baseApiUrl, endpoint, parseDataTableToRequestBody(body), {
    'Content-Type': 'application/json',
    ...(ENV_CONFIG.apiKey ? { 'x-api-key': ENV_CONFIG.apiKey } : {})
  });
  const text = await response.text();
  const json = text ? JSON.parse(text) : null;
  world.response = { status: () => response.status(), json: () => Promise.resolve(json), text: () => Promise.resolve(text) };
}
