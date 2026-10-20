/* eslint-disable no-console */
import { test as base, APIRequestContext, APIResponse } from '@playwright/test';
import chalk from 'chalk';

chalk.level = 3;

const isLoggerEnabled = process.env.LOGGER === 'true';
const cyan = chalk.hex('#014dbe');
const red = chalk.hex('#f24e4e');
const white = chalk.hex('#f0f2ff');
const dim = chalk.hex('#ccccda');
const neon = chalk.hex('#22d3a2');
const neonBold = neon.bold;

const methodBadge: Record<string, chalk.Chalk> = {
  get: chalk.bgHex('#22d3a2').hex('#0d0f17').bold,
  post: chalk.bgHex('#6c63ff').hex('#f0f2ff').bold,
  put: chalk.bgHex('#f5c84a').hex('#0d0f17').bold,
  patch: chalk.bgHex('#80d9f0').hex('#0d0f17').bold,
  delete: chalk.bgHex('#f24e4e').hex('#f0f2ff').bold,
  head: chalk.bgHex('#22d3a2').hex('#0d0f17').bold,
  fetch: chalk.bgHex('#8b83ff').hex('#f0f2ff').bold,
};

const httpMethods = ['get', 'post', 'put', 'patch', 'delete', 'head', 'fetch'] as const;

function formatJson(value: unknown): string {
  return JSON.stringify(value, null, 2)
    .split('\n')
    .map((line) => {
      const match = /^(\s*)("(?:[^"\\]|\\.)*")(\s*:)(\s*.*)$/.exec(line);
      return match ? match[1] + cyan(match[2]) + dim(match[3] + match[4]) : dim(line);
    })
    .join('\n     ');
}

function logRequest(method: string, url: string, options?: Record<string, unknown>): void {
  if (!isLoggerEnabled) return;

  const badge = methodBadge[method.toLowerCase()] ?? chalk.bold;
  console.log(`\n${neonBold('REQUEST')} ${dim(new Date().toISOString().slice(11, 23))}`);
  console.log(`  ${badge(` ${method.toUpperCase()} `)}  ${white.bold(url)}`);
  if (options?.headers) console.log(`  ${white.bold('headers')}\n     ${formatJson(options.headers)}`);
  if (options?.data) console.log(`  ${white.bold('payload')}\n     ${formatJson(options.data)}`);
}

async function logResponse(response: APIResponse, elapsedMs: number): Promise<void> {
  if (!isLoggerEnabled) return;

  const status = response.status();
  const statusColor = status >= 400 ? red : neon;
  console.log(`\n${neonBold('RESPONSE')} ${statusColor.bold(String(status))} ${neonBold(`${elapsedMs}ms`)}`);
  console.log(`  ${white.bold('headers')}\n     ${formatJson(response.headers())}`);

  try {
    const headers = response.headers();
    const body = headers['content-type']?.includes('application/json') ? await response.json() : await response.text();
    console.log(`  ${white.bold('body')}\n     ${formatJson(body)}`);
  } catch (error) {
    console.log(`  ${red('Could not parse response body:')} ${dim(String(error))}`);
  }
}

function wrapRequest(context: APIRequestContext): APIRequestContext {
  return new Proxy(context, {
    get(target, property: string) {
      if ((httpMethods as readonly string[]).includes(property)) {
        return async (url: string, options?: Record<string, unknown>) => {
          const startedAt = Date.now();
          const response = await (target as unknown as Record<string, (url: string, options?: unknown) => Promise<APIResponse>>)[property](url, options);
          logRequest(property, response.url(), options);
          await logResponse(response, Date.now() - startedAt);
          return response;
        };
      }

      const value = (target as unknown as Record<string, unknown>)[property];
      return typeof value === 'function' ? (value as (...args: unknown[]) => unknown).bind(target) : value;
    },
  });
}

export const test = base.extend<{ request: APIRequestContext }>({
  request: async ({ request }, use) => {
    await use(wrapRequest(request));
  },
});

export { expect } from '@playwright/test';