# GET /authors — Positive Scenarios

# Endpoint Information

- Method: `GET`
- Endpoint: `/authors`
- operationId: `getAll_1`
- Description: Returns list of authors; optionally filtered by query params `firstName` and `lastName` (both optional strings).
- Documented responses: `200 OK` — array of `Author`

# Preconditions

- API reachable at the server URL from OpenAPI.
- No authentication documented — none required.
- Author(s) created via `POST /authors` (documented `201 Created`; request body `CreateAuthorPayload` with optional `firstName`, `lastName`). The `201` response body is documented only as `object` — the created `id` must be resolved via `GET /authors` with filters.
- Each test that needs data creates its own authors with unique `firstName`/`lastName` values (tests must be independent).

# Test Data

| Name | Description |
|------|-------------|
| `authorA` | `firstName = A_first`, `lastName = A_last` (unique per test run) |
| `authorB` | `firstName = A_first` (same as authorA), `lastName = B_last` (unique per test run) |
| `authorC` | `firstName = C_first`, `lastName = A_last` (same lastName as authorA) |
| `nonMatching` | value guaranteed not to exist in any author name |

Valid auth variants: none (no security scheme documented).

# Test Cases

## TC-AUTHORS-GET-POS-001

### Scenario
Get all authors without filters.

### Purpose
Verify the happy path — list is returned and contains a freshly created author.

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
Array of `Author` objects including `authorA`.

### Assertions
- `response.status() === 200`
- Body is an array
- Body contains an item with `firstName === authorA.firstName` and `lastName === authorA.lastName`
- That item has an integer `id`

---

## TC-AUTHORS-GET-POS-002

### Scenario
Filter by `firstName` only.

### Purpose
Verify `firstName` filter returns only authors matching that first name.

### Request
#### Headers
- `Accept: application/json`
#### Path Params
- none
#### Query Params
- `firstName={authorA.firstName}`
#### Request Body
- none

### Expected Status Code
`200`

### Expected Response
Array containing `authorA` and `authorB`; not `authorC`.

### Assertions
- `response.status() === 200`
- Result contains `authorA` and `authorB` (matched by `lastName`)
- Result does not contain `authorC`
- Every returned item has `firstName === authorA.firstName`

---

## TC-AUTHORS-GET-POS-003

### Scenario
Filter by `lastName` only.

### Purpose
Verify `lastName` filter returns only authors matching that last name.

### Request
#### Headers
- `Accept: application/json`
#### Path Params
- none
#### Query Params
- `lastName={authorA.lastName}`
#### Request Body
- none

### Expected Status Code
`200`

### Expected Response
Array containing `authorA` and `authorC`; not `authorB`.

### Assertions
- `response.status() === 200`
- Result contains `authorA` and `authorC` (matched by `firstName`)
- Result does not contain `authorB`
- Every returned item has `lastName === authorA.lastName`

---

## TC-AUTHORS-GET-POS-004

### Scenario
Filter by both `firstName` and `lastName`.

### Purpose
Verify combined filters narrow the result to the exact author.

### Request
#### Headers
- `Accept: application/json`
#### Path Params
- none
#### Query Params
- `firstName={authorA.firstName}`
- `lastName={authorA.lastName}`
#### Request Body
- none

### Expected Status Code
`200`

### Expected Response
Array with exactly the author matching both values.

### Assertions
- `response.status() === 200`
- Result length is `1`
- `result[0].firstName === authorA.firstName`
- `result[0].lastName === authorA.lastName`

---

## TC-AUTHORS-GET-POS-005

### Scenario
Filter with no matching author.

### Purpose
Verify an empty list (not an error) is returned when nothing matches.

### Request
#### Headers
- `Accept: application/json`
#### Path Params
- none
#### Query Params
- `firstName={nonMatching}`
#### Request Body
- none

### Expected Status Code
`200`

### Expected Response
Empty array `[]`.

### Assertions
- `response.status() === 200`
- Body is an array of length `0`

---

## TC-AUTHORS-GET-POS-006

### Scenario
Data persistence — author created via `POST /authors` is visible in `GET /authors`.

### Purpose
Verify data consistency between create and list operations.

### Request
#### Headers
- `Accept: application/json`
#### Path Params
- none
#### Query Params
- `firstName={newAuthor.firstName}`
- `lastName={newAuthor.lastName}`
#### Request Body
- none

### Expected Status Code
`200`

### Expected Response
Array with the newly created author.

### Assertions
- Precondition step: `POST /authors` with `{ firstName, lastName }` returns `201`
- `GET /authors` returns `200`
- Result length is `1`
- Returned `firstName` / `lastName` equal values sent in `POST`

---

## TC-AUTHORS-GET-POS-007

### Scenario
Returned author `id` is consistent with `GET /authors/{id}`.

### Purpose
Verify list item data matches the single-resource representation.

### Request
#### Headers
- `Accept: application/json`
#### Path Params
- none
#### Query Params
- `firstName={authorA.firstName}`
- `lastName={authorA.lastName}`
#### Request Body
- none

### Expected Status Code
`200`

### Expected Response
Array with `authorA`; follow-up `GET /authors/{id}` returns `200` with the same data.

### Assertions
- `GET /authors` → `200`, take `id` of the single result
- `GET /authors/{id}` → `200`
- `firstName`, `lastName`, `id` equal between both responses

---

## TC-AUTHORS-GET-POS-008

### Scenario
Idempotency — repeated identical requests return the same result.

### Purpose
Verify `GET` has no side effects.

### Request
#### Headers
- `Accept: application/json`
#### Path Params
- none
#### Query Params
- `firstName={authorA.firstName}`
- `lastName={authorA.lastName}`
#### Request Body
- none

### Expected Status Code
`200` (both calls)

### Expected Response
Identical bodies.

### Assertions
- Both responses have status `200`
- Both bodies are deeply equal

# Notes

- Filter matching semantics (exact vs. partial, case-sensitive vs. insensitive) are NOT documented. Scenarios use exact full values and unique names so the assertions hold regardless of semantics (`TC-002`/`TC-003` assert via `contains`/`every`, `TC-004` via exact length on unique pair — if the API uses partial matching, the unique pair must not be a substring of other names).
- Sorting and pagination are not documented for this endpoint — not covered.
- `POST /authors` `201` response body is documented only as `object` — the created `id` is not guaranteed in the response; the author must be located via `GET /authors` filters.
- Cleanup of created authors can use documented `DELETE /authors/{id}` (`204`).
