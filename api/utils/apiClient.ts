import { APIRequestContext, request } from '@playwright/test';

export class ApiClient {
  private context?: APIRequestContext;
  private bearerToken?: string;

  async init(bearerToken?: string): Promise<void> {
    this.bearerToken = bearerToken;
    this.context = await request.newContext();
  }

  async dispose(): Promise<void> {
    await this.context?.dispose();
    this.context = undefined;
  }

  async get(baseUrl: string, endpoint: string, headers: Record<string, string> = {}) {
    return this.withRetry(() => this.contextOrThrow().get(this.resolveUrl(baseUrl, endpoint), { headers: this.headers(headers) }));
  }

  async post(baseUrl: string, endpoint: string, data: unknown, headers: Record<string, string> = {}) {
    return this.withRetry(() => this.contextOrThrow().post(this.resolveUrl(baseUrl, endpoint), { data, headers: this.headers(headers) }));
  }

  private contextOrThrow(): APIRequestContext {
    if (!this.context) throw new Error('ApiClient is not initialized');
    return this.context;
  }

  private headers(headers: Record<string, string>): Record<string, string> {
    return { Accept: 'application/json', ...(this.bearerToken ? { Authorization: `Bearer ${this.bearerToken}` } : {}), ...headers };
  }

  private resolveUrl(baseUrl: string, endpoint: string): string {
    return new URL(endpoint.replace(/^\//, ''), `${baseUrl.replace(/\/$/, '')}/`).toString();
  }

  private async withRetry<T>(operation: () => Promise<T>, attempts = 3): Promise<T> {
    let lastError: unknown;
    for (let attempt = 1; attempt <= attempts; attempt += 1) {
      try { return await operation(); } catch (error) {
        lastError = error;
        if (attempt < attempts) await new Promise((resolve) => setTimeout(resolve, 250 * attempt));
      }
    }
    throw lastError;
  }
}
