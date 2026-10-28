import { APIRequestContext, APIResponse } from '@playwright/test';
import { API_BASE_URL } from '@api/consts/api.endpoints.const';

export type APIPayload = Record<string, unknown> | unknown[];
export type RequestHeaders = Record<string, string>;
export type QueryParams = Record<string, string | number | boolean>;

// e2e project baseURL points to the UI, so API calls need an explicit host
const url = (endpoint: string): string => `${API_BASE_URL}${endpoint}`;

export class APIRequest {
  constructor(private readonly api: APIRequestContext) {}

  async get(endpoint: string, params?: QueryParams, headers: RequestHeaders = {}): Promise<APIResponse> {
    return this.api.get(url(endpoint), { params, headers });
  }

  async post(endpoint: string, payload?: APIPayload, headers: RequestHeaders = {}): Promise<APIResponse> {
    return this.api.post(url(endpoint), { data: payload, headers });
  }

  async put(endpoint: string, payload?: APIPayload, headers: RequestHeaders = {}): Promise<APIResponse> {
    return this.api.put(url(endpoint), { data: payload, headers });
  }

  async patch(endpoint: string, payload?: APIPayload | FormData, headers: RequestHeaders = {}): Promise<APIResponse> {
    const isFormData = payload instanceof FormData;

    return this.api.patch(url(endpoint), {
      ...(isFormData ? { multipart: payload } : { data: payload }),
      headers,
    });
  }

  async delete(endpoint: string, headers: RequestHeaders = {}): Promise<APIResponse> {
    return this.api.delete(url(endpoint), { headers });
  }

  async head(endpoint: string, headers: RequestHeaders = {}): Promise<APIResponse> {
    return this.api.head(url(endpoint), { headers });
  }

  async options(endpoint: string, headers: RequestHeaders = {}): Promise<APIResponse> {
    return this.api.fetch(url(endpoint), { method: 'OPTIONS', headers });
  }
}