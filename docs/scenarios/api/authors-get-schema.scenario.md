# GET /authors — Schema Validation

# Endpoint Information

- Method: `GET`
- Endpoint: `/authors`
- operationId: `getAll_1`
- Tag: `authors-controller`
- Description: Returns list of authors; optionally filtered by `firstName` and/or `lastName`. (No summary/description in OpenAPI.)
- Documented responses: `200 OK` only
- Response media type (documented): `*/*`
- Response schema: `array` of `#/components/schemas/Author`

# Preconditions

- API reachable at the server URL from OpenAPI (`servers[0].url`).
- No authentication documented — none required.
- At least 1 author exists in the system (create via `POST /authors` if the list is empty).

# Test Data

| Name | Value |
|------|-------|
| Existing author (for filter-based schema checks) | `firstName` / `lastName` of an author created in precondition (unique values) |

`Author` schema (all properties optional — no `required` array in spec):

| Field | Type | Format |
|-------|------|--------|
| `id` | integer | int64 |
| `firstName` | string | — |
| `lastName` | string | — |

# Test Cases

## TC-AUTHORS-GET-SCHEMA-001

### Scenario
Status code and content type for request without parameters.

### Purpose
Verify the documented `200 OK` response and that the body is JSON.

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
`200`

### Expected Response
JSON array of `Author` objects.

### Assertions
- `response.status() === 200`
- `Content-Type` header contains `application/json`
- Body parses as valid JSON
- Body is an array (`Array.isArray(body) === true`)

---

## TC-AUTHORS-GET-SCHEMA-002

### Scenario
Array item structure matches `Author` schema.

### Purpose
Contract validation of every element returned in the list.

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
`200`

### Expected Response
Array where each item is an `Author` object.

### Assertions
- Body is non-empty (precondition)
- Each item is an object (not null, not array)
- If present, `id` is an integer (`Number.isInteger`) and within int64 range
- If present, `firstName` is a string
- If present, `lastName` is a string
- Validate whole body with schema: `z.array(AuthorSchema)` where `AuthorSchema = { id: int, firstName: string, lastName: string }` (fields optional per spec)
- Each `id` is unique within the array

---

## TC-AUTHORS-GET-SCHEMA-003

### Scenario
No unexpected properties in `Author` items.

### Purpose
Detect contract drift — `Author` schema does not define `additionalProperties`.

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
`200`

### Expected Response
Each item contains only `id`, `firstName`, `lastName`.

### Assertions
- For each item: `Object.keys(item)` is a subset of `["id", "firstName", "lastName"]`
- Item does not expose properties outside the schema (e.g. nested `books`)

---

## TC-AUTHORS-GET-SCHEMA-004

### Scenario
Schema of filtered response is identical to unfiltered response.

### Purpose
Ensure filters do not change the response contract.

### Request
#### Headers
- `Accept: application/json`
#### Path Params
- none
#### Query Params
- `firstName={existing author firstName}`
- `lastName={existing author lastName}`
#### Request Body
- none

### Expected Status Code
`200`

### Expected Response
Array of `Author` objects (at least the precondition author).

### Assertions
- `response.status() === 200`
- Body validates against `z.array(AuthorSchema)`
- `Content-Type` header contains `application/json`

---

## TC-AUTHORS-GET-SCHEMA-005

### Scenario
Empty result still conforms to array schema.

### Purpose
Verify that "no match" is represented as a valid array, not `null`/object.

### Request
#### Headers
- `Accept: application/json`
#### Path Params
- none
#### Query Params
- `lastName={value guaranteed not to match any author}`
#### Request Body
- none

### Expected Status Code
`200`

### Expected Response
Empty array `[]`.

### Assertions
- `response.status() === 200`
- Body is an array with length `0`
- `Content-Type` header contains `application/json`

# Notes

- OpenAPI declares response content type as `*/*` (not `application/json`); the exact `Content-Type` header is not documented — `application/json` is the expected practical value and must be confirmed on first run.
- `Author` schema has no `required` fields and no `nullable` flags; nullability of `id`, `firstName`, `lastName` is undocumented.
- No response headers (pagination, caching, rate limit) are documented.
- No pagination is documented for this endpoint.
- No error responses (4xx/5xx) are documented.
- No enums, regex patterns, or length constraints are documented for `firstName` / `lastName`.
