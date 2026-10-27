# GET /authors — Negative Scenarios & Business Validations

# Endpoint Information

- Method: `GET`
- Endpoint: `/authors`
- operationId: `getAll_1`
- Description: Returns list of authors; optional query params `firstName`, `lastName` (strings).
- Documented responses: `200 OK` only — **no 4xx/5xx responses are documented**.

# Preconditions

- API reachable at the server URL from OpenAPI.
- No authentication documented — none required (so 401/403 scenarios are not applicable).
- Endpoint has no path params, so 404 for missing resource is not applicable.
- At least 1 author exists (created via `POST /authors`).

# Test Data

| Name | Value |
|------|-------|
| `emptyValue` | `""` (empty string) |
| `whitespaceValue` | `"   "` |
| `specialChars` | `"'; DROP TABLE authors;--"` |
| `longValue` | string of 1000 characters |
| `unknownParam` | `unknown=abc` |
| `duplicatedParam` | `firstName={A}&firstName={B}` |

Because the OpenAPI documents no error responses, the expected status for each case below is **not defined by the spec**. Automation must treat the expectation as a robustness baseline: no `5xx`, a well-formed response, and no data leakage. Where the exact behavior must be confirmed, the case is marked `TO VERIFY`.

# Test Cases

## TC-AUTHORS-GET-NEG-001

### Scenario
Empty string filter values.

### Purpose
Verify the API does not fail on empty filter values.

### Request
#### Headers
- `Accept: application/json`
#### Path Params
- none
#### Query Params
- `firstName={emptyValue}`
- `lastName={emptyValue}`
#### Request Body
- none

### Expected Status Code
`200` (TO VERIFY — behavior undocumented)

### Expected Response
JSON array of `Author` objects.

### Assertions
- Status is not `5xx`
- If `200`: body is an array validating against `z.array(AuthorSchema)`
- Document observed behavior (all authors vs. empty list) as the baseline

---

## TC-AUTHORS-GET-NEG-002

### Scenario
Whitespace-only filter value.

### Purpose
Verify handling of whitespace input.

### Request
#### Headers
- `Accept: application/json`
#### Path Params
- none
#### Query Params
- `firstName={whitespaceValue}`
#### Request Body
- none

### Expected Status Code
`200` (TO VERIFY — behavior undocumented)

### Expected Response
JSON array (likely empty).

### Assertions
- Status is not `5xx`
- If `200`: body is an array validating against `z.array(AuthorSchema)`

---

## TC-AUTHORS-GET-NEG-003

### Scenario
Special characters / injection-like payload in filter.

### Purpose
Verify the filter value is safely handled (no server error, no leaked data).

### Request
#### Headers
- `Accept: application/json`
#### Path Params
- none
#### Query Params
- `lastName={specialChars}` (URL-encoded)
#### Request Body
- none

### Expected Status Code
`200` with empty array (TO VERIFY — behavior undocumented)

### Expected Response
Empty array `[]`.

### Assertions
- Status is not `5xx`
- If `200`: body is an empty array
- Authors list is unchanged afterwards (`GET /authors` returns the same set as before)

---

## TC-AUTHORS-GET-NEG-004

### Scenario
Very long filter value.

### Purpose
Verify handling of oversized input.

### Request
#### Headers
- `Accept: application/json`
#### Path Params
- none
#### Query Params
- `firstName={longValue}`
#### Request Body
- none

### Expected Status Code
`200` with empty array (TO VERIFY — behavior undocumented)

### Expected Response
Empty array `[]`.

### Assertions
- Status is not `5xx`
- If `200`: body is an empty array

---

## TC-AUTHORS-GET-NEG-005

### Scenario
Unknown query parameter.

### Purpose
Verify undocumented parameters do not break the endpoint.

### Request
#### Headers
- `Accept: application/json`
#### Path Params
- none
#### Query Params
- `unknown=abc`
#### Request Body
- none

### Expected Status Code
`200` (TO VERIFY — behavior undocumented)

### Expected Response
JSON array of `Author` objects (parameter ignored).

### Assertions
- Status is not `5xx`
- If `200`: result equals the response of `GET /authors` without params

---

## TC-AUTHORS-GET-NEG-006

### Scenario
Duplicated filter parameter.

### Purpose
Verify handling of repeated `firstName` query param.

### Request
#### Headers
- `Accept: application/json`
#### Path Params
- none
#### Query Params
- `firstName={A}`
- `firstName={B}`
#### Request Body
- none

### Expected Status Code
`200` (TO VERIFY — behavior undocumented)

### Expected Response
JSON array.

### Assertions
- Status is not `5xx`
- If `200`: body is an array validating against `z.array(AuthorSchema)`

---

## TC-AUTHORS-GET-NEG-007

### Scenario
Unsupported `Accept` header.

### Purpose
Verify behavior when client requests a media type the API does not produce.

### Request
#### Headers
- `Accept: application/xml`
#### Path Params
- none
#### Query Params
- none
#### Request Body
- none

### Expected Status Code
`406` or `200` (TO VERIFY — spec declares `*/*` only)

### Expected Response
Either a `406` error or the standard JSON array.

### Assertions
- Status is not `5xx`
- If `200`: body validates against `z.array(AuthorSchema)`

---

## TC-AUTHORS-GET-NEG-008

### Scenario
Unsupported HTTP method on the collection (`DELETE /authors`).

### Purpose
Verify methods not documented for `/authors` are rejected and do not modify data.

### Request
#### Headers
- `Accept: application/json`
#### Path Params
- none
#### Query Params
- none
#### Request Body
- none

### Expected Status Code
`405` (TO VERIFY — only `GET` and `POST` are documented for `/authors`)

### Expected Response
Error response; body format undocumented.

### Assertions
- Status is not `2xx` and not `5xx`
- Subsequent `GET /authors` returns the same authors as before (no data deleted)

# Notes

- OpenAPI documents **only** `200` for `GET /authors`; no `400`, `401`, `403`, `404`, `409`, `422` or error body schemas exist, so no documented validation scenarios can be derived. Expected statuses above are baselines to confirm and then lock in as regression expectations.
- No security scheme is defined → unauthorized/forbidden scenarios are intentionally omitted.
- No path params → invalid path param scenarios omitted. No pagination or sorting params → invalid pagination scenarios omitted.
- Constraints on `firstName` / `lastName` (min/max length, pattern) are not documented, so boundary-violation cases beyond NEG-004 were not added.
- Malformed JSON is not applicable (no request body).
