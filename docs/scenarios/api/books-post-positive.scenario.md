# POST /books — Positive Scenarios

# Endpoint Information

- Method: `POST`
- Endpoint: `/books`
- operationId: `createBook` (OpenAPI)
- Description (user-provided API documentation): creates a book; on success the service returns the ID and data of the created book.
- Request: `application/json`; headers `Content-Type: application/json`, `Accept: */*`
- Body (all required): `title` (string, non-empty, unique), `authors` (list of existing author IDs, non-empty), `year` (integer, >= 1900), `price` (min 1, max 1000), `available` (integer, min 1, max 10000)
- Documented response: `201 Created`, body with `id`, `title`, `year`, `price`, `coverId` (`null`), `available`, `authors` (objects `id`, `firstName`, `lastName`)

# Preconditions

- API reachable at the base URL configured in the environment.
- No authentication documented — none required.
- Authors created in setup via `POST /authors` (`getRandomAuthorPayload()`); IDs stored as `authorId`, `authorId2`.
- Book payloads built with Faker; `title` is unique per test (random suffix).
- Cleanup (after each test, in this order): `DELETE /books/{id}` → `204` for every created book, then `DELETE /authors/{id}` → `204`.

# Test Data

| Name | Value |
|------|-------|
| Full valid payload | `{ "title": "<faker unique>", "authors": [<authorId>], "year": <faker 1900..current>, "price": <faker 1..1000, 2 decimals>, "available": <faker 1..10000> }` |
| Two authors | `authors: [<authorId>, <authorId2>]` |
| Min year | `year: 1900` |
| Min price | `price: 1` |
| Max price | `price: 1000` |
| Decimal price | `price: 49.99` |
| Min available | `available: 1` |
| Max available | `available: 10000` |

# Test Cases

## TC-BOOKS-POST-POSITIVE-001

### Scenario
Create a book with all required fields and one author.

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
- Full valid payload

### Expected Status Code
`201`

### Expected Response
`{ "id": <int>, "title": "<sent>", "year": <sent>, "price": <sent>, "coverId": null, "available": <sent>, "authors": [{ "id": <authorId>, "firstName": "<author>", "lastName": "<author>" }] }`

### Assertions
- `response.status() === 201`
- `body.id` is an integer
- `body.title`, `body.year`, `body.price`, `body.available` equal the sent values
- `body.coverId === null`
- `body.authors` has length 1 with `id === authorId` and the author's `firstName`/`lastName`

---

## TC-BOOKS-POST-POSITIVE-002

### Scenario
Created book is persisted and retrievable.

### Purpose
Data persistence validation.

### Request
#### Headers
- `Content-Type: application/json`
- `Accept: */*`
#### Path Params
- none
#### Query Params
- none
#### Request Body
- Full valid payload

### Expected Status Code
`201`

### Expected Response
As in TC-BOOKS-POST-POSITIVE-001.

### Assertions
- `response.status() === 201`
- `GET /books/{id}` → `200`; `title`, `year`, `price`, `available` equal the sent values; `authors[].id` contains `authorId`
- `GET /books?title=<title>` → `200` and contains an item with `id === body.id`

---

## TC-BOOKS-POST-POSITIVE-003

### Scenario
Create a book with multiple authors.

### Purpose
`authors` is a list; several existing IDs are accepted.

### Request
#### Headers
- `Content-Type: application/json`
- `Accept: */*`
#### Path Params
- none
#### Query Params
- none
#### Request Body
- Full valid payload with `authors: [authorId, authorId2]`

### Expected Status Code
`201`

### Expected Response
`authors` contains both author objects.

### Assertions
- `response.status() === 201`
- `body.authors.length === 2`
- `body.authors[].id` set equals `{ authorId, authorId2 }` (order not asserted)
- `GET /books/{id}` → `200` with the same two authors

---

## TC-BOOKS-POST-POSITIVE-004

### Scenario
Minimum allowed `year` (1900).

### Purpose
Boundary value: documented rule "year cannot be earlier than 1900".

### Request
#### Headers
- `Content-Type: application/json`
- `Accept: */*`
#### Path Params
- none
#### Query Params
- none
#### Request Body
- Full valid payload with `year: 1900`

### Expected Status Code
`201`

### Expected Response
Created book with `year === 1900`.

### Assertions
- `response.status() === 201`
- `body.year === 1900`

---

## TC-BOOKS-POST-POSITIVE-005

### Scenario
Minimum allowed `price` (1).

### Purpose
Boundary value: documented minimum 1.

### Request
#### Headers
- `Content-Type: application/json`
- `Accept: */*`
#### Path Params
- none
#### Query Params
- none
#### Request Body
- Full valid payload with `price: 1`

### Expected Status Code
`201`

### Expected Response
Created book with `price === 1`.

### Assertions
- `response.status() === 201`
- `body.price === 1`

---

## TC-BOOKS-POST-POSITIVE-006

### Scenario
Maximum allowed `price` (1000).

### Purpose
Boundary value: documented maximum 1000.

### Request
#### Headers
- `Content-Type: application/json`
- `Accept: */*`
#### Path Params
- none
#### Query Params
- none
#### Request Body
- Full valid payload with `price: 1000`

### Expected Status Code
`201`

### Expected Response
Created book with `price === 1000`.

### Assertions
- `response.status() === 201`
- `body.price === 1000`

---

## TC-BOOKS-POST-POSITIVE-007

### Scenario
Decimal `price` (49.99).

### Purpose
Documented example uses a decimal price (OpenAPI `price` is `number`).

### Request
#### Headers
- `Content-Type: application/json`
- `Accept: */*`
#### Path Params
- none
#### Query Params
- none
#### Request Body
- Full valid payload with `price: 49.99`

### Expected Status Code
`201`

### Expected Response
Created book with `price === 49.99`.

### Assertions
- `response.status() === 201`
- `body.price === 49.99`
- `GET /books/{id}` → `200` with `price === 49.99`

---

## TC-BOOKS-POST-POSITIVE-008

### Scenario
Minimum allowed `available` (1).

### Purpose
Boundary value: documented minimum 1.

### Request
#### Headers
- `Content-Type: application/json`
- `Accept: */*`
#### Path Params
- none
#### Query Params
- none
#### Request Body
- Full valid payload with `available: 1`

### Expected Status Code
`201`

### Expected Response
Created book with `available === 1`.

### Assertions
- `response.status() === 201`
- `body.available === 1`

---

## TC-BOOKS-POST-POSITIVE-009

### Scenario
Maximum allowed `available` (10000).

### Purpose
Boundary value: documented maximum 10000.

### Request
#### Headers
- `Content-Type: application/json`
- `Accept: */*`
#### Path Params
- none
#### Query Params
- none
#### Request Body
- Full valid payload with `available: 10000`

### Expected Status Code
`201`

### Expected Response
Created book with `available === 10000`.

### Assertions
- `response.status() === 201`
- `body.available === 10000`

---

## TC-BOOKS-POST-POSITIVE-010

### Scenario
Two books with different titles share the same author.

### Purpose
Uniqueness applies to `title` only; an author can be assigned to many books.

### Request
#### Headers
- `Content-Type: application/json`
- `Accept: */*`
#### Path Params
- none
#### Query Params
- none
#### Request Body
- Two valid payloads, different unique `title`, same `authors: [authorId]`

### Expected Status Code
`201` (both requests)

### Expected Response
Two distinct books.

### Assertions
- Both responses `201`
- `body1.id !== body2.id`
- `GET /books?author=<author lastName>` → `200` contains both IDs (`author` query param per OpenAPI `GET /books`)

---

# Notes

- Price min conflict: user documentation says min `1`; OpenAPI `CreateBookPayload.price.minimum` is `0.01`. Positive cases use `1` (valid under both). Values between `0.01` and `1` are not tested.
- `year` upper bound is not documented — not tested.
- `title` min/max length is not documented — not tested.
- Behaviour for duplicate IDs in `authors` is not documented (OpenAPI only declares `uniqueItems: true`) — not tested.
- `price` is described as `Integer` in the user documentation table but the example and OpenAPI use a decimal `number`; decimal price is treated as valid.
- Title uniqueness case sensitivity is not documented.
