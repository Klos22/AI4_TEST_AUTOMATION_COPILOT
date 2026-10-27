# POST /authors — Negative Scenarios & Business Validations

# Endpoint Information

- Method: `POST`
- Endpoint: `/authors`
- operationId: `createAuthor` (OpenAPI)
- Description (user-provided API documentation): creates an author; `400 Bad Request` is returned "w przypadku błędu walidacji lub próby utworzenia autora z brakującymi/nieprawidłowymi danymi".
- Request: `application/json`; headers `Content-Type: application/json`, `Accept: */*`; body `firstName` (string, required), `lastName` (string, required)
- Documented validation (both fields): "Pole nie może być puste. Min 3, max 128 znaków."
- Documented `400` body (missing data): `{ "timestamp": "2024-05-28T12:33:26.962+00:00", "status": 400, "error": "Bad Request", "message": ["lastName incorrect input data", "firstName incorrect input data"] }`

# Preconditions

- API reachable at the base URL configured in the environment.
- No authentication documented — no unauthorized/forbidden scenarios can be defined.
- Each request carries a unique Faker marker (`getRandomAuthorPayload()`) in its valid field, so "no author created" can be verified with `GET /authors?firstName=<marker>` or `GET /authors?lastName=<marker>` (OpenAPI query params).
- Cleanup: if a negative request unexpectedly returns `201`, delete the created author with `DELETE /authors/{id}` → `204` (`id` from the `201` body).

# Test Data

| Name | Value |
|------|-------|
| Valid base payload | `getRandomAuthorPayload()` |
| 2 characters | `getRandomLowerCaseString(2)` |
| 129 characters | `getRandomLowerCaseString(129)` |
| Empty string | `""` |
| Missing `firstName` | `{ "lastName": "<faker>" }` |
| Missing `lastName` | `{ "firstName": "<faker>" }` |
| Empty object | `{}` |
| `firstName` as number | `{ "firstName": 123, "lastName": "<faker>" }` |
| `firstName` as null | `{ "firstName": null, "lastName": "<faker>" }` |
| `firstName` as object | `{ "firstName": { "value": "<faker>" }, "lastName": "<faker>" }` |

# Test Cases

> **Expected Status Code for all cases below: `400 Bad Request`.** The `message` content is asserted only where it is documented or observed (TC-001..003); for the other cases the message is not documented and is not asserted.

## TC-AUTHORS-POST-NEGATIVE-001

### Scenario
Missing `firstName`.

### Purpose
`firstName` is required.

### Request
#### Headers
- `Content-Type: application/json`
- `Accept: */*`
#### Path Params
- none
#### Query Params
- none
#### Request Body
- `{ "lastName": "<marker>" }`

### Expected Status Code
`400`

### Expected Response
`{ "timestamp": "<date-time>", "status": 400, "error": "Bad Request", "message": ["firstName incorrect input data"] }` (the `message` value is an observation — see Notes)

### Assertions
- `response.status() === 400`
- `body.status === 400`, `body.error === 'Bad Request'`
- `body.message` equals `["firstName incorrect input data"]` (observation)
- `GET /authors?lastName=<marker>` returns no matching author

---

## TC-AUTHORS-POST-NEGATIVE-002

### Scenario
Missing `lastName`.

### Purpose
`lastName` is required.

### Request
#### Headers
- `Content-Type: application/json`
- `Accept: */*`
#### Path Params
- none
#### Query Params
- none
#### Request Body
- `{ "firstName": "<marker>" }`

### Expected Status Code
`400`

### Expected Response
`{ "timestamp": "<date-time>", "status": 400, "error": "Bad Request", "message": ["lastName incorrect input data"] }` (the `message` value is an observation — see Notes)

### Assertions
- `response.status() === 400`
- `body.status === 400`, `body.error === 'Bad Request'`
- `body.message` equals `["lastName incorrect input data"]` (observation)
- `GET /authors?firstName=<marker>` returns no matching author

---

## TC-AUTHORS-POST-NEGATIVE-003

### Scenario
Empty JSON object (both required fields missing).

### Purpose
Documented `400` example for missing data.

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
`{ "timestamp": "<date-time>", "status": 400, "error": "Bad Request", "message": ["firstName incorrect input data", "lastName incorrect input data"] }`

### Assertions
- `response.status() === 400`
- `body.status === 400`, `body.error === 'Bad Request'`
- `body.message` has exactly 2 entries and contains both `"firstName incorrect input data"` and `"lastName incorrect input data"` (order-independent, see Notes)

---

## TC-AUTHORS-POST-NEGATIVE-004

### Scenario
`firstName` shorter than minimum (2 characters).

### Purpose
Boundary violation: documented minimum is 3 characters.

### Request
#### Headers
- `Content-Type: application/json`
- `Accept: */*`
#### Path Params
- none
#### Query Params
- none
#### Request Body
- `{ "firstName": "<2 letters>", "lastName": "<marker>" }`

### Expected Status Code
`400`

### Expected Response
Bad Request (message not documented — see Notes).

### Assertions
- `response.status() === 400`
- `GET /authors?lastName=<marker>` returns no matching author

---

## TC-AUTHORS-POST-NEGATIVE-005

### Scenario
`firstName` longer than maximum (129 characters).

### Purpose
Boundary violation: documented maximum is 128 characters.

### Request
#### Headers
- `Content-Type: application/json`
- `Accept: */*`
#### Path Params
- none
#### Query Params
- none
#### Request Body
- `{ "firstName": "<129 letters>", "lastName": "<marker>" }`

### Expected Status Code
`400`

### Expected Response
Bad Request (message not documented — see Notes).

### Assertions
- `response.status() === 400`
- `GET /authors?lastName=<marker>` returns no matching author

---

## TC-AUTHORS-POST-NEGATIVE-006

### Scenario
`lastName` shorter than minimum (2 characters).

### Purpose
Boundary violation: documented minimum is 3 characters.

### Request
#### Headers
- `Content-Type: application/json`
- `Accept: */*`
#### Path Params
- none
#### Query Params
- none
#### Request Body
- `{ "firstName": "<marker>", "lastName": "<2 letters>" }`

### Expected Status Code
`400`

### Expected Response
Bad Request (message not documented — see Notes).

### Assertions
- `response.status() === 400`
- `GET /authors?firstName=<marker>` returns no matching author

---

## TC-AUTHORS-POST-NEGATIVE-007

### Scenario
`lastName` longer than maximum (129 characters).

### Purpose
Boundary violation: documented maximum is 128 characters.

### Request
#### Headers
- `Content-Type: application/json`
- `Accept: */*`
#### Path Params
- none
#### Query Params
- none
#### Request Body
- `{ "firstName": "<marker>", "lastName": "<129 letters>" }`

### Expected Status Code
`400`

### Expected Response
Bad Request (message not documented — see Notes).

### Assertions
- `response.status() === 400`
- `GET /authors?firstName=<marker>` returns no matching author

---

## TC-AUTHORS-POST-NEGATIVE-008

### Scenario
`firstName` is an empty string.

### Purpose
Documented validation: "Pole nie może być puste."

### Request
#### Headers
- `Content-Type: application/json`
- `Accept: */*`
#### Path Params
- none
#### Query Params
- none
#### Request Body
- `{ "firstName": "", "lastName": "<marker>" }`

### Expected Status Code
`400`

### Expected Response
Bad Request (message not documented — see Notes).

### Assertions
- `response.status() === 400`
- `GET /authors?lastName=<marker>` returns no matching author

---

## TC-AUTHORS-POST-NEGATIVE-009

### Scenario
`lastName` is an empty string.

### Purpose
Documented validation: "Pole nie może być puste."

### Request
#### Headers
- `Content-Type: application/json`
- `Accept: */*`
#### Path Params
- none
#### Query Params
- none
#### Request Body
- `{ "firstName": "<marker>", "lastName": "" }`

### Expected Status Code
`400`

### Expected Response
Bad Request (message not documented — see Notes).

### Assertions
- `response.status() === 400`
- `GET /authors?firstName=<marker>` returns no matching author

---

## TC-AUTHORS-POST-NEGATIVE-010

### Scenario
`firstName` has wrong type (number).

### Purpose
Documented `400` for invalid data ("nieprawidłowymi danymi").

### Request
#### Headers
- `Content-Type: application/json`
- `Accept: */*`
#### Path Params
- none
#### Query Params
- none
#### Request Body
- `{ "firstName": 123, "lastName": "<marker>" }`

### Expected Status Code
`400`

### Expected Response
Bad Request (message not documented — see Notes).

### Assertions
- `response.status() === 400`
- `GET /authors?lastName=<marker>` returns no matching author

---

## TC-AUTHORS-POST-NEGATIVE-011

### Scenario
`firstName` is `null`.

### Purpose
Documented `400` for invalid data ("nieprawidłowymi danymi").

### Request
#### Headers
- `Content-Type: application/json`
- `Accept: */*`
#### Path Params
- none
#### Query Params
- none
#### Request Body
- `{ "firstName": null, "lastName": "<marker>" }`

### Expected Status Code
`400`

### Expected Response
Bad Request (message not documented — see Notes).

### Assertions
- `response.status() === 400`
- `GET /authors?lastName=<marker>` returns no matching author

---

## TC-AUTHORS-POST-NEGATIVE-012

### Scenario
`firstName` has wrong type (object).

### Purpose
Documented `400` for invalid data ("nieprawidłowymi danymi").

### Request
#### Headers
- `Content-Type: application/json`
- `Accept: */*`
#### Path Params
- none
#### Query Params
- none
#### Request Body
- `{ "firstName": { "value": "<faker>" }, "lastName": "<marker>" }`

### Expected Status Code
`400`

### Expected Response
Bad Request (message not documented — see Notes).

### Assertions
- `response.status() === 400`
- `GET /authors?lastName=<marker>` returns no matching author

---

# Notes

- Source of truth: user-provided API documentation (screenshots) takes precedence over OpenAPI. OpenAPI documents no error responses and does not mark the fields as required.
- Documented: `400` for validation errors and missing/invalid data; `firstName`/`lastName` cannot be empty, min 3, max 128 characters; `400` body structure `timestamp`, `status`, `error`, `message[]` (example for missing data).
- Observations from the live API (not documentation):
  - `POST {}` → `400`, `message: ["firstName incorrect input data", "lastName incorrect input data"]`. The documented example lists `lastName` first, so TC-003 compares `message` order-independently.
  - `POST` with only `firstName` or only `lastName` → `400`, `message: ["<missingField> incorrect input data"]` (same format as the documented example); asserted in TC-001/002 as an observation.
  - Digits in `firstName`/`lastName` → `400`. Allowed characters are not documented; all tests use letters only.
- The `message` text for TC-004..012 (length violations, empty strings, wrong types, `null`) is not documented, so only the status `400` and "no author created" are asserted.
- Not covered (status code not documented): malformed JSON, missing request body, unsupported `Content-Type`, JSON array as body, extra/unknown properties, whitespace-only strings, boolean values.
- Not documented, therefore no scenarios: authentication (`401`/`403`), duplicate author (`409`), business rules, state transitions.
- Verification "no author created" via `GET /authors?firstName=` / `?lastName=` relies on a unique Faker marker; exact vs. partial match semantics of the filter are not documented.
