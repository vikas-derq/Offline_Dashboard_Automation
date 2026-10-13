import { CUSTOMER_LOGIN_ENDPOINT } from '../constants';
import { ENV_CONFIG } from './env';
import { CustomWorld } from './world';

export async function loginRaw(world: CustomWorld, body: unknown, headers: Record<string, string>): Promise<void> {
  const response = await world.api.post(ENV_CONFIG.altApiUrl, CUSTOMER_LOGIN_ENDPOINT, body, headers);
  const text = await response.text();
  const json = text ? JSON.parse(text) : null;
  world.response = { status: () => response.status(), json: () => Promise.resolve(json), text: () => Promise.resolve(text) };
  world.customerApiKey = (json as { data?: { api_key?: string } })?.data?.api_key;
}

export async function loginWithPayload(world: CustomWorld, body: unknown): Promise<void> {
  await loginRaw(world, body, { Accept: '*/*', 'X-FEClient-Key': ENV_CONFIG.feClientKey });
}

export async function loginCustomer(world: CustomWorld, email: string, password: string): Promise<void> {
  await loginWithPayload(world, { email, password });
}

export async function loginConfiguredCustomer(world: CustomWorld): Promise<void> {
  await loginCustomer(world, ENV_CONFIG.customerEmail, ENV_CONFIG.customerPassword);
}
