# POST /books — Negative Scenarios & Business Validations

# Endpoint Information

- Method: `POST`
- Endpoint: `/books`
- operationId: `createBook` (OpenAPI)
- Description (user-provided API documentation): creates a book; `400 Bad Request` is returned on validation failure or missing/invalid data; `409 Conflict` when a book with the given title already exists.
- Request: `application/json`; headers `Content-Type: application/json`, `Accept: */*`; body `title`, `authors`, `year`, `price`, `available` (all required)
- Documented validation:

| Field | Rule |
|-------|------|
| `title` | Not empty. Must be unique. |
| `authors` | List not empty; every ID must exist in the system. |
| `year` | Not empty. Not earlier than 1900. |
| `price` | Not empty. Min 1, max 1000. |
| `available` | Not empty. Min 1, max 10000. |

- Documented `400` (empty data): `{ "timestamp": "...", "status": 400, "error": "Bad Request", "message": ["price incorrect input data", "year incorrect input data", "available incorrect input data", "title incorrect input data", "authors incorrect input data"] }`
- Documented `400` (non-existent author): `{ "timestamp": "...", "status": 400, "errors": ["Can not find author with given id: 10000"] }`
- Documented `409`: `{ "timestamp": "...", "status": 409, "error": "Conflict", "message": ["operation could not be performed"] }`

# Preconditions

- API reachable at the base URL configured in the environment.
- No authentication documented — no unauthorized/forbidden scenarios can be defined.
- Author created in setup via `POST /authors` (`getRandomAuthorPayload()`), `id` stored as `authorId`.
- Every request uses a unique Faker `title` marker so "no book created" can be verified with `GET /books?title=<marker>` (OpenAPI query param `title`).
- Cleanup: if a negative request unexpectedly returns `201`, delete the book with `DELETE /books/{id}` → `204`; finally `DELETE /authors/{id}` → `204`.

# Test Data

| Name | Value |
|------|-------|
| Valid base payload | `{ "title": "<marker>", "authors": [<authorId>], "year": 2022, "price": 49.99, "available": 100 }` (title and author via Faker/setup) |
| Non-existent author id | `999999999` |
| `year` below min | `1899` |
| `price` below min | `0` |
| `price` above max | `1000.01` |
| `available` below min | `0` |
| `available` above max | `10001` |

# Test Cases

> Every case sends the valid base payload modified as described. After each `400`/`409` case, `GET /books?title=<marker>` returns no book created by the failed request (except TC-016, where exactly one book exists).

## TC-BOOKS-POST-NEGATIVE-001

### Scenario
Empty JSON object (all required fields missing).

### Purpose
Documented `400` example 1.

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
- `body.status === 400`, `body.error === 'Bad Request'`
- `body.message` has length 5 and contains `"title incorrect input data"`, `"authors incorrect input data"`, `"year incorrect input data"`, `"price incorrect input data"`, `"available incorrect input data"` (order not asserted)

---

## TC-BOOKS-POST-NEGATIVE-002

### Scenario
Missing `title`.

### Purpose
`title` is required.

### Request
#### Headers
- `Content-Type: application/json`
- `Accept: */*`
#### Path Params
- none
#### Query Params
- none
#### Request Body
- Base payload without `title`

### Expected Status Code
`400`

### Expected Response
`message` contains `"title incorrect input data"` (message format is an observation from the documented example).

### Assertions
- `response.status() === 400`
- `body.status === 400`, `body.error === 'Bad Request'`
- `body.message` contains `"title incorrect input data"` (observation)
- No book created for the author payload

---

## TC-BOOKS-POST-NEGATIVE-003

### Scenario
Missing `authors`.

### Purpose
`authors` is required.

### Request
#### Headers
- `Content-Type: application/json`
- `Accept: */*`
#### Path Params
- none
#### Query Params
- none
#### Request Body
- Base payload without `authors`

### Expected Status Code
`400`

### Expected Response
`message` contains `"authors incorrect input data"`.

### Assertions
- `response.status() === 400`
- `body.status === 400`, `body.error === 'Bad Request'`
- `body.message` contains `"authors incorrect input data"` (observation)
- `GET /books?title=<marker>` returns no book

---

## TC-BOOKS-POST-NEGATIVE-004

### Scenario
Missing `year`.

### Purpose
`year` is required.

### Request
#### Headers
- `Content-Type: application/json`
- `Accept: */*`
#### Path Params
- none
#### Query Params
- none
#### Request Body
- Base payload without `year`

### Expected Status Code
`400`

### Expected Response
`message` contains `"year incorrect input data"`.

### Assertions
- `response.status() === 400`
- `body.status === 400`, `body.error === 'Bad Request'`
- `body.message` contains `"year incorrect input data"` (observation)
- `GET /books?title=<marker>` returns no book

---

## TC-BOOKS-POST-NEGATIVE-005

### Scenario
Missing `price`.

### Purpose
`price` is required.

### Request
#### Headers
- `Content-Type: application/json`
- `Accept: */*`
#### Path Params
- none
#### Query Params
- none
#### Request Body
- Base payload without `price`

### Expected Status Code
`400`

### Expected Response
`message` contains `"price incorrect input data"`.

### Assertions
- `response.status() === 400`
- `body.status === 400`, `body.error === 'Bad Request'`
- `body.message` contains `"price incorrect input data"` (observation)
- `GET /books?title=<marker>` returns no book

---

## TC-BOOKS-POST-NEGATIVE-006

### Scenario
Missing `available`.

### Purpose
`available` is required.

### Request
#### Headers
- `Content-Type: application/json`
- `Accept: */*`
#### Path Params
- none
#### Query Params
- none
#### Request Body
- Base payload without `available`

### Expected Status Code
`400`

### Expected Response
`message` contains `"available incorrect input data"`.

### Assertions
- `response.status() === 400`
- `body.status === 400`, `body.error === 'Bad Request'`
- `body.message` contains `"available incorrect input data"` (observation)
- `GET /books?title=<marker>` returns no book

---

## TC-BOOKS-POST-NEGATIVE-007

### Scenario
Empty `title` (`""`).

### Purpose
Documented rule: `title` cannot be empty.

### Request
#### Headers
- `Content-Type: application/json`
- `Accept: */*`
#### Path Params
- none
#### Query Params
- none
#### Request Body
- Base payload with `title: ""`

### Expected Status Code
`400`

### Expected Response
`message` contains `"title incorrect input data"`.

### Assertions
- `response.status() === 400`
- `body.status === 400`, `body.error === 'Bad Request'`
- `body.message` contains `"title incorrect input data"` (observation)

---

## TC-BOOKS-POST-NEGATIVE-008

### Scenario
Empty `authors` list.

### Purpose
Documented rule: the list must contain at least one author ID.

### Request
#### Headers
- `Content-Type: application/json`
- `Accept: */*`
#### Path Params
- none
#### Query Params
- none
#### Request Body
- Base payload with `authors: []`

### Expected Status Code
`400`

### Expected Response
`message` contains `"authors incorrect input data"`.

### Assertions
- `response.status() === 400`
- `body.status === 400`, `body.error === 'Bad Request'`
- `body.message` contains `"authors incorrect input data"` (observation)
- `GET /books?title=<marker>` returns no book

---

## TC-BOOKS-POST-NEGATIVE-009

### Scenario
`authors` contains a non-existent author ID.

### Purpose
Documented `400` example 2.

### Request
#### Headers
- `Content-Type: application/json`
- `Accept: */*`
#### Path Params
- none
#### Query Params
- none
#### Request Body
- Base payload with `authors: [999999999]`

### Expected Status Code
`400`

### Expected Response
`{ "timestamp": "<date-time>", "status": 400, "errors": ["Can not find author with given id: 999999999"] }`

### Assertions
- `response.status() === 400`
- `body.status === 400`
- `body.errors` contains `"Can not find author with given id: 999999999"`
- `GET /books?title=<marker>` returns no book

---

## TC-BOOKS-POST-NEGATIVE-010

### Scenario
`authors` contains one existing and one non-existent ID.

### Purpose
Documented rule: every ID in the list must exist.

### Request
#### Headers
- `Content-Type: application/json`
- `Accept: */*`
#### Path Params
- none
#### Query Params
- none
#### Request Body
- Base payload with `authors: [authorId, 999999999]`

### Expected Status Code
`400`

### Expected Response
`errors` contains the non-existent ID message (format per documented example 2).

### Assertions
- `response.status() === 400`
- `body.errors` contains `"Can not find author with given id: 999999999"`
- `GET /books?title=<marker>` returns no book (book is not created partially)

---

## TC-BOOKS-POST-NEGATIVE-011

### Scenario
`year` below minimum (`1899`).

### Purpose
Boundary violation: year cannot be earlier than 1900.

### Request
#### Headers
- `Content-Type: application/json`
- `Accept: */*`
#### Path Params
- none
#### Query Params
- none
#### Request Body
- Base payload with `year: 1899`

### Expected Status Code
`400`

### Expected Response
`message` contains `"year incorrect input data"`.

### Assertions
- `response.status() === 400`
- `body.status === 400`, `body.error === 'Bad Request'`
- `body.message` contains `"year incorrect input data"` (observation)
- `GET /books?title=<marker>` returns no book

---

## TC-BOOKS-POST-NEGATIVE-012

### Scenario
`price` below minimum (`0`).

### Purpose
Boundary violation: min price.

### Request
#### Headers
- `Content-Type: application/json`
- `Accept: */*`
#### Path Params
- none
#### Query Params
- none
#### Request Body
- Base payload with `price: 0`

### Expected Status Code
`400`

### Expected Response
`message` contains `"price incorrect input data"`.

### Assertions
- `response.status() === 400`
- `body.status === 400`, `body.error === 'Bad Request'`
- `body.message` contains `"price incorrect input data"` (observation)
- `GET /books?title=<marker>` returns no book

---

## TC-BOOKS-POST-NEGATIVE-013

### Scenario
`price` above maximum (`1000.01`).

### Purpose
Boundary violation: max price 1000.

### Request
#### Headers
- `Content-Type: application/json`
- `Accept: */*`
#### Path Params
- none
#### Query Params
- none
#### Request Body
- Base payload with `price: 1000.01`

### Expected Status Code
`400`

### Expected Response
`message` contains `"price incorrect input data"`.

### Assertions
- `response.status() === 400`
- `body.status === 400`, `body.error === 'Bad Request'`
- `body.message` contains `"price incorrect input data"` (observation)
- `GET /books?title=<marker>` returns no book

---

## TC-BOOKS-POST-NEGATIVE-014

### Scenario
`available` below minimum (`0`).

### Purpose
Boundary violation: min available 1.

### Request
#### Headers
- `Content-Type: application/json`
- `Accept: */*`
#### Path Params
- none
#### Query Params
- none
#### Request Body
- Base payload with `available: 0`

### Expected Status Code
`400`

### Expected Response
`message` contains `"available incorrect input data"`.

### Assertions
- `response.status() === 400`
- `body.status === 400`, `body.error === 'Bad Request'`
- `body.message` contains `"available incorrect input data"` (observation)
- `GET /books?title=<marker>` returns no book

---

## TC-BOOKS-POST-NEGATIVE-015

### Scenario
`available` above maximum (`10001`).

### Purpose
Boundary violation: max available 10000.

### Request
#### Headers
- `Content-Type: application/json`
- `Accept: */*`
#### Path Params
- none
#### Query Params
- none
#### Request Body
- Base payload with `available: 10001`

### Expected Status Code
`400`

### Expected Response
`message` contains `"available incorrect input data"`.

### Assertions
- `response.status() === 400`
- `body.status === 400`, `body.error === 'Bad Request'`
- `body.message` contains `"available incorrect input data"` (observation)
- `GET /books?title=<marker>` returns no book

---

## TC-BOOKS-POST-NEGATIVE-016

### Scenario
Book with an already existing title.

### Purpose
Documented rule: `title` must be unique → `409 Conflict`.

### Request
#### Headers
- `Content-Type: application/json`
- `Accept: */*`
#### Path Params
- none
#### Query Params
- none
#### Request Body
- Base payload, sent twice with the same `title` (first request creates the book; second is the tested request)

### Expected Status Code
`409`

### Expected Response
`{ "timestamp": "<date-time>", "status": 409, "error": "Conflict", "message": ["operation could not be performed"] }`

### Assertions
- First response `201`; second response `409`
- `body.status === 409`, `body.error === 'Conflict'`
- `body.message` equals `["operation could not be performed"]`
- `GET /books?title=<marker>` returns exactly one book (the first one)

---

## TC-BOOKS-POST-NEGATIVE-017

### Scenario
`year` as a non-numeric string.

### Purpose
Invalid field type.

### Request
#### Headers
- `Content-Type: application/json`
- `Accept: */*`
#### Path Params
- none
#### Query Params
- none
#### Request Body
- Base payload with `year: "abc"`

### Expected Status Code
`400`

### Expected Response
Error body with `status: 400` (message content not documented).

### Assertions
- `response.status() === 400`
- `body.status === 400`
- `GET /books?title=<marker>` returns no book

---

## TC-BOOKS-POST-NEGATIVE-018

### Scenario
`price` as a non-numeric string.

### Purpose
Invalid field type.

### Request
#### Headers
- `Content-Type: application/json`
- `Accept: */*`
#### Path Params
- none
#### Query Params
- none
#### Request Body
- Base payload with `price: "abc"`

### Expected Status Code
`400`

### Expected Response
Error body with `status: 400` (message content not documented).

### Assertions
- `response.status() === 400`
- `body.status === 400`
- `GET /books?title=<marker>` returns no book

---

## TC-BOOKS-POST-NEGATIVE-019

### Scenario
`authors` as a scalar instead of a list.

### Purpose
Invalid field type: `authors` must be a list of IDs.

### Request
#### Headers
- `Content-Type: application/json`
- `Accept: */*`
#### Path Params
- none
#### Query Params
- none
#### Request Body
- Base payload with `authors: <authorId>` (number, not array)

### Expected Status Code
`400`

### Expected Response
Error body with `status: 400` (message content not documented).

### Assertions
- `response.status() === 400`
- `body.status === 400`
- `GET /books?title=<marker>` returns no book

---

# Notes

- Messages of the form `"<field> incorrect input data"` come from the documented empty-data example (all five fields at once); their presence for single-field violations is an observation, not documented — verify on first run and keep status assertions as the primary check.
- Price min conflict: user documentation says min `1`; OpenAPI `CreateBookPayload.price.minimum` is `0.01`. Value `0` is invalid under both; values between `0.01` and `1` are not tested.
- Required `title`: absent from OpenAPI `required`; required per user documentation.
- Non-existent author `400` body uses key `errors`, other `400` bodies use `error`/`message`.
- Not covered because the behaviour is not documented: malformed JSON, missing/incorrect `Content-Type`, `year` upper bound, `title` length limits, whitespace-only `title`, case-insensitive title uniqueness, duplicate IDs in `authors`, `null` values, authentication (`401`/`403`), `404`.
- ID `999999999` is assumed not to exist; the documented example uses `10000`.
