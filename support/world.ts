import { IWorldOptions, setWorldConstructor, World } from '@cucumber/cucumber';
import { ApiClient } from '../api/utils/apiClient';

export interface StoredResponse {
  status: () => number;
  json: () => Promise<unknown>;
  text: () => Promise<string>;
}

export class CustomWorld extends World {
  api!: ApiClient;
  response?: StoredResponse;
  screenshotPath = '';
  contentType?: string;
  bearerToken?: string;
  customerApiKey?: string;
  storedResponses: Record<string, unknown> = {};

  constructor(options: IWorldOptions) { super(options); }
}

setWorldConstructor(CustomWorld);
