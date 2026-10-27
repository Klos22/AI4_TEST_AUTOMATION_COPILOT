# POST /authors — Schema Validation

# Endpoint Information

- Method: `POST`
- Endpoint: `/authors`
- operationId: `createAuthor` (OpenAPI)
- Description (user-provided API documentation): creates an author; on success the service returns the ID and data of the created author.
- Request media type: `application/json`; headers `Content-Type: application/json`, `Accept: */*`
- Request schema: `firstName` (string, required), `lastName` (string, required)
- Documented responses:
  - `201 Created` — body `{ "id": 1, "firstName": "Stephen", "lastName": "King" }`
  - `400 Bad Request` — body `{ "timestamp": "2024-05-28T12:33:26.962+00:00", "status": 400, "error": "Bad Request", "message": ["lastName incorrect input data", "firstName incorrect input data"] }`

# Preconditions

- API reachable at the base URL configured in the environment (user documentation: `https://bookstoreapi.up.railway.app`; OpenAPI `servers[0].url` is `http://...`, see Notes).
- No authentication documented — none required.
- Test data generated via `getRandomAuthorPayload()` (`src/api/factories/author.factory.ts`, Faker, letters only).
- Cleanup: every author created by a test is removed with `DELETE /authors/{id}` → `204` (`id` taken from the `201` response body).

# Test Data

| Name | Value |
|------|-------|
| Valid payload | `getRandomAuthorPayload()` → `{ "firstName": "<faker>", "lastName": "<faker>" }` |
| Empty object (400 schema) | `{}` |

Response schema `201` (`AuthorResponseSchema`):

| Field | Type |
|-------|------|
| `id` | integer (int64 per OpenAPI `Author`) |
| `firstName` | string |
| `lastName` | string |

Response schema `400` (`ErrorResponseSchema`):

| Field | Type |
|-------|------|
| `timestamp` | string, ISO 8601 date-time with offset (example `2024-05-28T12:33:26.962+00:00`) |
| `status` | integer, equals `400` |
| `error` | string, equals `"Bad Request"` |
| `message` | array of strings |

# Test Cases

## TC-AUTHORS-POST-SCHEMA-001

### Scenario
Documented status code for a valid request.

### Purpose
Verify successful creation returns `201 Created`.

### Request
#### Headers
- `Content-Type: application/json`
- `Accept: */*`
#### Path Params
- none
#### Query Params
- none
#### Request Body
- Valid payload (`getRandomAuthorPayload()`)

### Expected Status Code
`201`

### Expected Response
JSON object with `id`, `firstName`, `lastName`.

### Assertions
- `response.status() === 201` (not `200`, not `204`)
- Cleanup: `DELETE /authors/{id}` returns `204`

---

## TC-AUTHORS-POST-SCHEMA-002

### Scenario
`201` response body matches the author schema.

### Purpose
Contract validation of the documented `201` body.

### Request
#### Headers
- `Content-Type: application/json`
- `Accept: */*`
#### Path Params
- none
#### Query Params
- none
#### Request Body
- Valid payload

### Expected Status Code
`201`

### Expected Response
`{ "id": <integer>, "firstName": "<sent>", "lastName": "<sent>" }`

### Assertions
- Body validated with `AuthorResponseSchema = z.object({ id: z.number().int(), firstName: z.string(), lastName: z.string() }).strict()`
- `id`, `firstName`, `lastName` are all present (not optional, not nullable)
- `body.firstName === payload.firstName`, `body.lastName === payload.lastName`
- No properties other than `id`, `firstName`, `lastName` (see Notes)

---

## TC-AUTHORS-POST-SCHEMA-003

### Scenario
`id` type and range.

### Purpose
OpenAPI `Author.id` is `integer` / `int64`.

### Request
#### Headers
- `Content-Type: application/json`
- `Accept: */*`
#### Path Params
- none
#### Query Params
- none
#### Request Body
- Valid payload

### Expected Status Code
`201`

### Expected Response
Body with integer `id`.

### Assertions
- `typeof body.id === 'number'` (not string)
- `Number.isInteger(body.id) === true`
- `Number.isSafeInteger(body.id) === true`

---

## TC-AUTHORS-POST-SCHEMA-004

### Scenario
Created resource, read back via `GET /authors/{id}`, conforms to the same schema.

### Purpose
Contract consistency between the POST response and the stored resource (OpenAPI `getById_1` returns `Author`).

### Request
#### Headers
- `Content-Type: application/json`
- `Accept: */*`
#### Path Params
- none for POST; `id` = `body.id` for follow-up `GET /authors/{id}`
#### Query Params
- none
#### Request Body
- Valid payload

### Expected Status Code
`201` (POST), then `200` (`GET /authors/{id}`)

### Expected Response
`Author` object identical to the POST body.

### Assertions
- POST status `201`, `GET` status `200`
- GET body validated with `AuthorResponseSchema`
- GET body deep-equals POST body

---

## TC-AUTHORS-POST-SCHEMA-005

### Scenario
`201` response headers (observation).

### Purpose
Verify headers observed on the live API.

### Request
#### Headers
- `Content-Type: application/json`
- `Accept: */*`
#### Path Params
- none
#### Query Params
- none
#### Request Body
- Valid payload

### Expected Status Code
`201`

### Expected Response
Headers `Content-Type` and `location`.

### Assertions
- `Content-Type` header contains `application/json` (observation)
- `location` header is present and ends with `/authors/{body.id}` (format observed: `http://.../authors/{id}`)

---

## TC-AUTHORS-POST-SCHEMA-006

### Scenario
`400` error response body matches the error schema.

### Purpose
Contract validation of the documented `400 Bad Request` body (missing data).

### Request
#### Headers
- `Content-Type: application/json`
- `Accept: */*`
#### Path Params
- none
#### Query Params
- none
#### Request Body
- `{}`

### Expected Status Code
`400`

### Expected Response
`{ "timestamp": "<date-time>", "status": 400, "error": "Bad Request", "message": ["<string>", "<string>"] }`

### Assertions
- `response.status() === 400`
- Body validated with `ErrorResponseSchema = z.object({ timestamp: z.string(), status: z.literal(400), error: z.literal('Bad Request'), message: z.array(z.string()) })`
- `timestamp` is parseable as a date (`Number.isNaN(Date.parse(body.timestamp)) === false`)
- `message` is a non-empty array

---

# Notes

- Source of truth: user-provided API documentation (screenshots) takes precedence over OpenAPI. OpenAPI does not mark `firstName`/`lastName` as required, documents only `201` (response schema `{ "type": "object" }`, media type `*/*`) and no error responses.
- `additionalProperties` is not defined in OpenAPI for `Author`; the "no extra properties" assertion (`.strict()`) is based on the documented `201` example, which contains exactly `id`, `firstName`, `lastName`.
- Observations from the live API (not documentation): `Content-Type: application/json` and the `location` header (`http://.../authors/{id}`) on `201`.
- The `Content-Type` of the `400` response is not documented and is not asserted.
- The `message` entry order differs between the documented example (`lastName` first) and the live observation (`firstName` first); `message` content is asserted in the negative file, not here.
- Base URL: user documentation uses `https://bookstoreapi.up.railway.app`, OpenAPI `servers[0].url` uses `http://bookstoreapi.up.railway.app`.
