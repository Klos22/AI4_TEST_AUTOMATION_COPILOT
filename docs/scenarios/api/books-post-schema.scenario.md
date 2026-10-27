# POST /books — Schema Validation

# Endpoint Information

- Method: `POST`
- Endpoint: `/books`
- operationId: `createBook` (OpenAPI)
- Description (user-provided API documentation): creates a book; on success the service returns the ID and data of the created book.
- Request media type: `application/json`; headers `Content-Type: application/json`, `Accept: */*`
- Request schema (`CreateBookPayload`): `title` (string, required per user docs), `authors` (array of int64 IDs, unique items, required, non-empty), `year` (int32, required), `price` (number, required), `available` (int32, required)
- Documented responses:
  - `201 Created` — body `{ "id": 31, "title": "Testowanie REST API dla początkujących", "year": 2022, "price": 49.99, "coverId": null, "available": 100, "authors": [{ "id": 49, "firstName": "Bartosz", "lastName": "Kita" }] }`
  - `400 Bad Request` (empty data) — `{ "timestamp": "2024-05-31T10:29:27.207+00:00", "status": 400, "error": "Bad Request", "message": ["price incorrect input data", "year incorrect input data", "available incorrect input data", "title incorrect input data", "authors incorrect input data"] }`
  - `400 Bad Request` (non-existent author) — `{ "timestamp": "2023-01-04T11:10:11.632+00:00", "status": 400, "errors": ["Can not find author with given id: 10000"] }`
  - `409 Conflict` (existing title) — `{ "timestamp": "2024-05-31T10:30:10.423+00:00", "status": 409, "error": "Conflict", "message": ["operation could not be performed"] }`

# Preconditions

- API reachable at the base URL configured in the environment.
- No authentication documented — none required.
- At least one author exists: created in setup via `POST /authors` (`getRandomAuthorPayload()`), `id` stored as `authorId`.
- Book payload built with Faker (unique `title` per test) and `authors: [authorId]`.
- Cleanup (after each test, in this order): `DELETE /books/{id}` → `204`, then `DELETE /authors/{id}` → `204`.

# Test Data

| Name | Value |
|------|-------|
| Valid payload | `{ "title": "<faker unique>", "authors": [<authorId>], "year": <faker int 1900..current>, "price": <faker 1..1000, 2 decimals>, "available": <faker int 1..10000> }` |
| Empty object (400 schema) | `{}` |
| Non-existent author id | `999999999` (see Notes) |
| Duplicate title (409 schema) | valid payload sent twice with the same `title` |

Response schema `201` (`BookResponseSchema`):

| Field | Type |
|-------|------|
| `id` | integer (int64) |
| `title` | string |
| `year` | integer (int32) |
| `price` | number |
| `coverId` | `null` for a new book (OpenAPI `Book.coverId`: integer int64 — see Notes) |
| `available` | integer (int32) |
| `authors` | array of `{ id: integer, firstName: string, lastName: string }` |

Response schema `400` (validation): `timestamp` (ISO 8601 date-time with offset), `status` (= 400), `error` (= `"Bad Request"`), `message` (array of strings).
Response schema `400` (non-existent author): `timestamp`, `status` (= 400), `errors` (array of strings) — no `error`/`message` keys in the documented example.
Response schema `409`: `timestamp`, `status` (= 409), `error` (= `"Conflict"`), `message` (array of strings).

# Test Cases

## TC-BOOKS-POST-SCHEMA-001

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
- Valid payload

### Expected Status Code
`201`

### Expected Response
JSON object describing the created book.

### Assertions
- `response.status() === 201` (not `200`, not `204`)
- Cleanup: `DELETE /books/{id}` → `204`

---

## TC-BOOKS-POST-SCHEMA-002

### Scenario
`201` response body matches the book schema.

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
`{ "id": <int>, "title": "<sent>", "year": <sent>, "price": <sent>, "coverId": null, "available": <sent>, "authors": [{ "id": <authorId>, "firstName": "<string>", "lastName": "<string>" }] }`

### Assertions
- Body validated with a strict zod schema: `id` int, `title` string, `year` int, `price` number, `coverId` nullable, `available` int, `authors` array of strict `{ id: int, firstName: string, lastName: string }`
- All fields present; only `coverId` is nullable
- No properties other than `id`, `title`, `year`, `price`, `coverId`, `available`, `authors`

---

## TC-BOOKS-POST-SCHEMA-003

### Scenario
Field types and echoed values.

### Purpose
Verify types (`id` int64, `year`/`available` int32, `price` number) and that sent values are returned unchanged.

### Request
#### Headers
- `Content-Type: application/json`
- `Accept: */*`
#### Path Params
- none
#### Query Params
- none
#### Request Body
- Valid payload with `price` having 2 decimals (e.g. `49.99`)

### Expected Status Code
`201`

### Expected Response
Echo of the sent values.

### Assertions
- `Number.isInteger(body.id)` and `body.id > 0`
- `body.title === payload.title`
- `body.year === payload.year` and is an integer
- `body.price === payload.price` and is a number (not a string)
- `body.available === payload.available` and is an integer

---

## TC-BOOKS-POST-SCHEMA-004

### Scenario
`authors` array structure and nested author objects.

### Purpose
Request IDs are returned as full author objects.

### Request
#### Headers
- `Content-Type: application/json`
- `Accept: */*`
#### Path Params
- none
#### Query Params
- none
#### Request Body
- Valid payload with two distinct author IDs (`authorId1`, `authorId2`)

### Expected Status Code
`201`

### Expected Response
`authors` contains two objects.

### Assertions
- `Array.isArray(body.authors)` and `body.authors.length === 2`
- Each element has `id` (integer), `firstName` (string), `lastName` (string); no other keys
- Set of `body.authors[].id` equals `{ authorId1, authorId2 }` (order not asserted — `uniqueItems` set semantics)
- `firstName`/`lastName` of each element equal the values of the author created in setup

---

## TC-BOOKS-POST-SCHEMA-005

### Scenario
`coverId` for a newly created book.

### Purpose
Documented `201` example shows `"coverId": null`.

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
`coverId` is `null`.

### Assertions
- `body` has own property `coverId`
- `body.coverId === null`

---

## TC-BOOKS-POST-SCHEMA-006

### Scenario
Response headers.

### Purpose
Verify content type of the `201` response.

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
JSON body.

### Assertions
- `Content-Type` header contains `application/json` (OpenAPI declares `*/*`; JSON is the observed/documented format — see Notes)
- Body parses as valid JSON

---

## TC-BOOKS-POST-SCHEMA-007

### Scenario
`400` validation error schema (empty data).

### Purpose
Contract validation of the documented `400` body.

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
`{ "timestamp": "<date-time>", "status": 400, "error": "Bad Request", "message": [<5 strings>] }`

### Assertions
- `response.status() === 400`
- Body validated with strict zod schema: `timestamp` string (ISO 8601 with offset, parseable by `Date`), `status` literal `400`, `error` literal `"Bad Request"`, `message` array of strings
- `message` has length 5 and contains `"title incorrect input data"`, `"authors incorrect input data"`, `"year incorrect input data"`, `"price incorrect input data"`, `"available incorrect input data"` (order not asserted)

---

## TC-BOOKS-POST-SCHEMA-008

### Scenario
`400` error schema for a non-existent author.

### Purpose
Documented body uses key `errors` instead of `message`.

### Request
#### Headers
- `Content-Type: application/json`
- `Accept: */*`
#### Path Params
- none
#### Query Params
- none
#### Request Body
- Valid payload with `authors: [999999999]`

### Expected Status Code
`400`

### Expected Response
`{ "timestamp": "<date-time>", "status": 400, "errors": ["Can not find author with given id: 999999999"] }`

### Assertions
- `response.status() === 400`
- `body.status === 400`; `timestamp` is a parseable ISO 8601 date-time
- `body.errors` is an array of strings and contains `"Can not find author with given id: 999999999"`

---

## TC-BOOKS-POST-SCHEMA-009

### Scenario
`409` conflict error schema (existing title).

### Purpose
Contract validation of the documented `409` body.

### Request
#### Headers
- `Content-Type: application/json`
- `Accept: */*`
#### Path Params
- none
#### Query Params
- none
#### Request Body
- Valid payload re-sent with the `title` of an already created book

### Expected Status Code
`409`

### Expected Response
`{ "timestamp": "<date-time>", "status": 409, "error": "Conflict", "message": ["operation could not be performed"] }`

### Assertions
- First request → `201`; second request → `409`
- Body validated with strict zod schema: `timestamp` string (ISO 8601), `status` literal `409`, `error` literal `"Conflict"`, `message` array of strings
- `body.message` equals `["operation could not be performed"]`

---

# Notes

- OpenAPI `CreateBookPayload.required` lists only `authors`, `available`, `price`, `year`; `title` is **not** required in OpenAPI but is required and unique per user documentation. User documentation is treated as authoritative for `title`.
- OpenAPI `201` response is an untyped `object`; the schema above comes from the user-provided example. `Book.coverId` is `integer/int64` in OpenAPI but `null` in the example; type for a book with a cover is not covered here.
- OpenAPI declares response media type `*/*`; the `application/json` content type is an assumption based on the JSON examples.
- Non-existent author `400` example uses key `errors` (not `error`/`message`) — inconsistent with the other `400` example; asserted as documented.
- Whether extra properties are absent in `201` is based on the documented example only (OpenAPI declares no `additionalProperties`).
- ID `999999999` is assumed not to exist; the documented example uses `10000`, which may exist in a shared environment.
