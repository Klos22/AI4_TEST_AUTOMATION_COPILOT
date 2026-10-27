# POST /authors — Positive Scenarios

# Endpoint Information

- Method: `POST`
- Endpoint: `/authors`
- operationId: `createAuthor` (OpenAPI)
- Description (user-provided API documentation): creates an author; on success the service returns the ID and data of the created author.
- Request: `application/json`; headers `Content-Type: application/json`, `Accept: */*`; body `firstName` (string, required, min 3, max 128 characters), `lastName` (string, required, min 3, max 128 characters)
- Documented response: `201 Created`, body `{ "id": 1, "firstName": "Stephen", "lastName": "King" }`

# Preconditions

- API reachable at the base URL configured in the environment.
- No authentication documented — none required.
- Payloads built with Faker via `getRandomAuthorPayload()` / `getRandomAuthorOverridePayload()` (`src/api/factories/author.factory.ts`); names contain letters only.
- Cleanup (after each test): `DELETE /authors/{id}` → `204` for every author created (`id` from the `201` response body).

# Test Data

| Name | Value |
|------|-------|
| Full payload | `getRandomAuthorPayload()` |
| Min length (3/3) | `getRandomAuthorOverridePayload({ firstName: getRandomLowerCaseString(3), lastName: getRandomLowerCaseString(3) })` |
| Max length (128/128) | `getRandomAuthorOverridePayload({ firstName: getRandomLowerCaseString(128), lastName: getRandomLowerCaseString(128) })` |

# Test Cases

## TC-AUTHORS-POST-POSITIVE-001

### Scenario
Create author with both `firstName` and `lastName`.

### Purpose
Happy path.

### Request
#### Headers
- `Content-Type: application/json`
- `Accept: */*`
#### Path Params
- none
#### Query Params
- none
#### Request Body
- Full payload

### Expected Status Code
`201`

### Expected Response
`{ "id": <integer>, "firstName": "<sent>", "lastName": "<sent>" }`

### Assertions
- `response.status() === 201`
- `body.id` is an integer
- `body.firstName` and `body.lastName` equal the sent values
- `GET /authors/{id}` → `200`, `firstName` and `lastName` equal the sent values
- Cleanup `DELETE /authors/{id}` → `204`

---

## TC-AUTHORS-POST-POSITIVE-002

### Scenario
Create author with minimum allowed name lengths (3 / 3 characters).

### Purpose
Boundary value: documented minimum length is 3 for `firstName` and `lastName`.

### Request
#### Headers
- `Content-Type: application/json`
- `Accept: */*`
#### Path Params
- none
#### Query Params
- none
#### Request Body
- Min length (3/3) payload (letters only)

### Expected Status Code
`201`

### Expected Response
`{ "id": <integer>, "firstName": "<3 chars>", "lastName": "<3 chars>" }`

### Assertions
- `response.status() === 201`
- `body.firstName` and `body.lastName` equal the sent values (length 3)
- `GET /authors/{id}` → `200`, values equal the sent values
- Cleanup `DELETE /authors/{id}` → `204`

---

## TC-AUTHORS-POST-POSITIVE-003

### Scenario
Create author with maximum allowed name lengths (128 / 128 characters).

### Purpose
Boundary value: documented maximum length is 128 for `firstName` and `lastName`.

### Request
#### Headers
- `Content-Type: application/json`
- `Accept: */*`
#### Path Params
- none
#### Query Params
- none
#### Request Body
- Max length (128/128) payload (letters only)

### Expected Status Code
`201`

### Expected Response
`{ "id": <integer>, "firstName": "<128 chars>", "lastName": "<128 chars>" }`

### Assertions
- `response.status() === 201`
- `body.firstName` and `body.lastName` equal the sent values (length 128)
- `GET /authors/{id}` → `200`, values equal the sent values
- Cleanup `DELETE /authors/{id}` → `204`

---

## TC-AUTHORS-POST-POSITIVE-004

### Scenario
Created author is retrievable through the list endpoint with filters.

### Purpose
Data persistence and integration with the OpenAPI `GET /authors` filters (`firstName`, `lastName`).

### Request
#### Headers
- `Content-Type: application/json`
- `Accept: */*`
#### Path Params
- none
#### Query Params
- none (for POST); follow-up `GET /authors?firstName=<sent>&lastName=<sent>`
#### Request Body
- Full payload with unique Faker values

### Expected Status Code
`201` (POST), `200` (GET)

### Expected Response
POST: created author. GET: array of `Author`.

### Assertions
- POST status `201`
- GET status `200`, body is an array
- Array contains an item with `id` equal to `body.id`, and `firstName` / `lastName` equal to the sent values
- Cleanup `DELETE /authors/{id}` → `204`

---

# Notes

- Source of truth: user-provided API documentation (screenshots) takes precedence over OpenAPI. OpenAPI does not mark `firstName`/`lastName` as required and documents neither length limits nor error responses.
- Scenarios with missing `firstName`, missing `lastName` and `{}` are covered in the negative file (`400`).
- Documented length limits: min 3, max 128 characters for both fields. Boundary tests use letters only; allowed characters are not documented (observation: digits in `firstName`/`lastName` return `400`).
- Uniqueness of authors (duplicate `firstName` + `lastName`) is not documented; no duplicate/idempotency scenario is created. Random 3-letter names may coincide with existing authors; assertions therefore rely on `id`, not on names alone.
- Observation (live API, not documentation): `201` returns `Content-Type: application/json` and header `location: http://.../authors/{id}`; asserted in the schema file.
- Not documented: trimming of whitespace, handling of extra properties.
