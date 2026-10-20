import { test as base } from '@playwright/test';
import { APIRequest } from '@api/requests/api.request';

type ApiFixtures = {
  apiRequest: APIRequest;
};

export const test = base.extend<ApiFixtures>({
  apiRequest: async ({ request }, use) => {
    await use(new APIRequest(request));
  },
});