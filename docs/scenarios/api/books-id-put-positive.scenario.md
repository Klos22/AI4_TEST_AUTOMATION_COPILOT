# PUT /books/{id} — Positive Scenarios

# Endpoint Information

- Method: `PUT`
- Endpoint: `/books/{id}`
- operationId: `updateBook` (OpenAPI)
- Description (user-provided API documentation): fully updates an existing book; on success returns the updated book data.
- Path param: `id` (integer, int64, required) — ID of an existing book
- Request: `application/json`; headers `Content-Type: application/json`, `Accept: */*`
- Body (all required): `title` (string, unique), `authors` (non-empty list of existing, unique author IDs), `year` (integer, >= 1900, no upper bound), `price` (number, up to 2 decimal places, min 1, max 1000), `available` (integer, min 1, max 10000)
- Documented response: `200 OK`, body `{ id, title, year, price, coverId (null), available, authors: [{ id, firstName, lastName }] }`
- Request example (user-provided): `{"title":"Edycja Testowanie REST API dla początkujących","authors":[49],"year":2023,"price":149.99,"available":200}`

# Preconditions

- API reachable at the base URL configured in the environment.
- No authentication documented — none required.
- Authors created in setup via `POST /authors` (author factory/Faker); IDs stored as `authorId`, `authorId2`, `authorId3` (as needed per test).
- Book created in setup via `POST /books` (book factory/Faker) → `201`; ID stored as `bookId`; its payload stored as `originalBook`.
- All test data generated with Faker via factories; `title` is unique per test (random suffix).
- Cleanup (after each test, in this order): `DELETE /books/{id}` → `204` for every created book, then `DELETE /authors/{id}` → `204` for every created author.

# Test Data

| Name | Value |
|------|-------|
| Full valid update payload | `{ "title": "<faker unique, different from original>", "authors": [<authorId2>], "year": <faker 1900..current, different from original>, "price": <faker 1..1000, 2 decimals, different from original>, "available": <faker 1..10000, different from original> }` |
| Unchanged-title payload | `title: <originalBook.title>`, other fields changed |
| Multiple authors | `authors: [<authorId>, <authorId2>, <authorId3>]` |
| Min year | `year: 1900` |
| Min price | `price: 1` |
| Max price | `price: 1000` |
| Decimal price | `price: 149.99` |
| Min available | `available: 1` |
| Max available | `available: 10000` |

For single-field-change cases, the payload = `originalBook` with exactly one field replaced (all fields are still sent — all are required).

# Test Cases

## TC-BOOKS-ID-PUT-POSITIVE-001

### Scenario
Update all fields of an existing book (happy path).

### Purpose
Verify full update with valid data.

### Request
#### Headers
- `Content-Type: application/json`
- `Accept: */*`
#### Path Params
- `id`: `<bookId>`
#### Query Params
- none
#### Request Body
- Full valid update payload

### Expected Status Code
`200`

### Expected Response
`{ "id": <bookId>, "title": "<sent>", "year": <sent>, "price": <sent>, "coverId": null, "available": <sent>, "authors": [{ "id": <authorId2>, "firstName": "<author2>", "lastName": "<author2>" }] }`

### Assertions
- Status is `200`.
- `id` equals `<bookId>` (unchanged).
- `title`, `year`, `price`, `available` equal the sent values.
- `coverId` is `null`.
- `authors` has exactly 1 element with `id`, `firstName`, `lastName` matching `<authorId2>`; the original author is no longer present.
- Response body matches the documented structure (no missing documented fields).

## TC-BOOKS-ID-PUT-POSITIVE-002

### Scenario
Update only `title` (other fields identical to the original).

### Purpose
Verify a single-field change is applied and the other fields remain intact.

### Request
#### Headers
- `Content-Type: application/json`
- `Accept: */*`
#### Path Params
- `id`: `<bookId>`
#### Query Params
- none
#### Request Body
- `originalBook` with a new unique `title`

### Expected Status Code
`200`

### Expected Response
Book with new `title`; `year`, `price`, `available`, `authors` equal to `originalBook`.

### Assertions
- Status is `200`.
- `title` equals the new title and differs from `originalBook.title`.
- `year`, `price`, `available` equal original values; `authors` ids equal original ids.
- `id` equals `<bookId>`; `coverId` is `null`.

## TC-BOOKS-ID-PUT-POSITIVE-003

### Scenario
Update only `year`.

### Purpose
Verify a single-field change of `year`.

### Request
#### Headers
- `Content-Type: application/json`
- `Accept: */*`
#### Path Params
- `id`: `<bookId>`
#### Query Params
- none
#### Request Body
- `originalBook` with a new `year` (different from original)

### Expected Status Code
`200`

### Expected Response
Book with new `year`; other fields unchanged.

### Assertions
- Status is `200`.
- `year` equals the sent value and differs from the original.
- `title`, `price`, `available`, `authors` ids equal original values.

## TC-BOOKS-ID-PUT-POSITIVE-004

### Scenario
Update only `price`.

### Purpose
Verify a single-field change of `price`.

### Request
#### Headers
- `Content-Type: application/json`
- `Accept: */*`
#### Path Params
- `id`: `<bookId>`
#### Query Params
- none
#### Request Body
- `originalBook` with a new `price` (different from original)

### Expected Status Code
`200`

### Expected Response
Book with new `price`; other fields unchanged.

### Assertions
- Status is `200`.
- `price` equals the sent value and differs from the original.
- `title`, `year`, `available`, `authors` ids equal original values.

## TC-BOOKS-ID-PUT-POSITIVE-005

### Scenario
Update only `available`.

### Purpose
Verify a single-field change of `available`.

### Request
#### Headers
- `Content-Type: application/json`
- `Accept: */*`
#### Path Params
- `id`: `<bookId>`
#### Query Params
- none
#### Request Body
- `originalBook` with a new `available` (different from original)

### Expected Status Code
`200`

### Expected Response
Book with new `available`; other fields unchanged.

### Assertions
- Status is `200`.
- `available` equals the sent value and differs from the original.
- `title`, `year`, `price`, `authors` ids equal original values.

## TC-BOOKS-ID-PUT-POSITIVE-006

### Scenario
Replace the author with a different existing author.

### Purpose
Verify `authors` can be changed.

### Request
#### Headers
- `Content-Type: application/json`
- `Accept: */*`
#### Path Params
- `id`: `<bookId>`
#### Query Params
- none
#### Request Body
- `originalBook` with `authors: [<authorId2>]`

### Expected Status Code
`200`

### Expected Response
Book with `authors` containing only `<authorId2>`; other fields unchanged.

### Assertions
- Status is `200`.
- `authors` has exactly 1 element; its `id` equals `<authorId2>` with correct `firstName`, `lastName`.
- `<authorId>` is not present in `authors`.
- `title`, `year`, `price`, `available` equal original values.

## TC-BOOKS-ID-PUT-POSITIVE-007

### Scenario
Update a book to have multiple authors.

### Purpose
Verify a list of several unique, existing author IDs is accepted.

### Request
#### Headers
- `Content-Type: application/json`
- `Accept: */*`
#### Path Params
- `id`: `<bookId>`
#### Query Params
- none
#### Request Body
- `originalBook` with `authors: [<authorId>, <authorId2>, <authorId3>]`

### Expected Status Code
`200`

### Expected Response
Book with 3 authors.

### Assertions
- Status is `200`.
- `authors` has exactly 3 elements.
- Set of `authors[].id` equals `{<authorId>, <authorId2>, <authorId3>}` (order not asserted — undocumented).
- Each author has `firstName` and `lastName` matching the created authors.

## TC-BOOKS-ID-PUT-POSITIVE-008

### Scenario
PUT with the book's own unchanged `title` and changed other fields.

### Purpose
Verify the title uniqueness check does not conflict with the updated book itself.

### Request
#### Headers
- `Content-Type: application/json`
- `Accept: */*`
#### Path Params
- `id`: `<bookId>`
#### Query Params
- none
#### Request Body
- Unchanged-title payload

### Expected Status Code
`200`

### Expected Response
Book with unchanged `title` and the other fields updated.

### Assertions
- Status is `200` (not `409`).
- `title` equals `originalBook.title`.
- `year`, `price`, `available` equal the sent values.

## TC-BOOKS-ID-PUT-POSITIVE-009

### Scenario
Boundary: `year` = 1900.

### Purpose
Verify the minimum documented year.

### Request
#### Headers
- `Content-Type: application/json`
- `Accept: */*`
#### Path Params
- `id`: `<bookId>`
#### Query Params
- none
#### Request Body
- Full valid update payload with `year: 1900`

### Expected Status Code
`200`

### Expected Response
Book with `year: 1900`.

### Assertions
- Status is `200`.
- `year` equals `1900`.

## TC-BOOKS-ID-PUT-POSITIVE-010

### Scenario
Boundary: `price` = 1.

### Purpose
Verify the minimum price.

### Request
#### Headers
- `Content-Type: application/json`
- `Accept: */*`
#### Path Params
- `id`: `<bookId>`
#### Query Params
- none
#### Request Body
- Full valid update payload with `price: 1`

### Expected Status Code
`200`

### Expected Response
Book with `price: 1`.

### Assertions
- Status is `200`.
- `price` equals `1`.

## TC-BOOKS-ID-PUT-POSITIVE-011

### Scenario
Boundary: `price` = 1000.

### Purpose
Verify the maximum price.

### Request
#### Headers
- `Content-Type: application/json`
- `Accept: */*`
#### Path Params
- `id`: `<bookId>`
#### Query Params
- none
#### Request Body
- Full valid update payload with `price: 1000`

### Expected Status Code
`200`

### Expected Response
Book with `price: 1000`.

### Assertions
- Status is `200`.
- `price` equals `1000`.

## TC-BOOKS-ID-PUT-POSITIVE-012

### Scenario
`price` with 2 decimal places.

### Purpose
Verify fractional prices are stored without rounding.

### Request
#### Headers
- `Content-Type: application/json`
- `Accept: */*`
#### Path Params
- `id`: `<bookId>`
#### Query Params
- none
#### Request Body
- Full valid update payload with `price: 149.99`

### Expected Status Code
`200`

### Expected Response
Book with `price: 149.99`.

### Assertions
- Status is `200`.
- `price` equals `149.99` exactly.

## TC-BOOKS-ID-PUT-POSITIVE-013

### Scenario
Boundary: `available` = 1.

### Purpose
Verify the minimum availability.

### Request
#### Headers
- `Content-Type: application/json`
- `Accept: */*`
#### Path Params
- `id`: `<bookId>`
#### Query Params
- none
#### Request Body
- Full valid update payload with `available: 1`

### Expected Status Code
`200`

### Expected Response
Book with `available: 1`.

### Assertions
- Status is `200`.
- `available` equals `1`.

## TC-BOOKS-ID-PUT-POSITIVE-014

### Scenario
Boundary: `available` = 10000.

### Purpose
Verify the maximum availability.

### Request
#### Headers
- `Content-Type: application/json`
- `Accept: */*`
#### Path Params
- `id`: `<bookId>`
#### Query Params
- none
#### Request Body
- Full valid update payload with `available: 10000`

### Expected Status Code
`200`

### Expected Response
Book with `available: 10000`.

### Assertions
- Status is `200`.
- `available` equals `10000`.

## TC-BOOKS-ID-PUT-POSITIVE-015

### Scenario
Persistence: `GET /books/{id}` after a successful PUT.

### Purpose
Verify the update is persisted and returned consistently.

### Request
#### Headers
- Step 1 (`PUT /books/{id}`): `Content-Type: application/json`, `Accept: */*`
- Step 2 (`GET /books/{id}`): `Accept: */*`
#### Path Params
- `id`: `<bookId>` (both steps)
#### Query Params
- none
#### Request Body
- Step 1: Full valid update payload
- Step 2: none

### Expected Status Code
Step 1: `200`; Step 2: `200`

### Expected Response
Step 2 body equals the Step 1 body.

### Assertions
- Both statuses are `200`.
- GET `id`, `title`, `year`, `price`, `available`, `coverId` equal the PUT response / sent values.
- GET `authors` (ids, `firstName`, `lastName`) equal the PUT response.
- No value from `originalBook` that was changed remains in the GET response.

## TC-BOOKS-ID-PUT-POSITIVE-016

### Scenario
Repeat the same PUT twice.

### Purpose
Verify idempotency: the second identical request returns `200` and the same state (the title is the book's own, so no conflict).

### Request
#### Headers
- `Content-Type: application/json`
- `Accept: */*`
#### Path Params
- `id`: `<bookId>`
#### Query Params
- none
#### Request Body
- Full valid update payload (sent twice, identical)

### Expected Status Code
`200` for both requests

### Expected Response
Both responses have identical bodies.

### Assertions
- Both statuses are `200`.
- Response bodies are deeply equal.
- Subsequent `GET /books/{id}` returns the same data.

# Notes

- OpenAPI `UpdateBookPayload.price` documents `maximum: 10000` and `minimum: 1`; the user-provided requirement (max 1000) takes precedence and is used here. Behavior for `1000 < price <= 10000` is undocumented by the user and not covered.
- OpenAPI `UpdateBookPayload` marks only `authors`, `available`, `price`, `year` as required (`title` is not in `required`); per the user, `title` is also required. Used as required.
- OpenAPI documents the `200` response body only as a generic `object` (no `Book` schema reference); the response structure comes from user-provided documentation.
- OpenAPI does not document `400`, `404`, `409`; per user, errors (`400` with `message[]` e.g. `"title incorrect input data"`, `409` for duplicate title) are out of scope for this file.
- Order of `authors` in the response is undocumented; assertions compare as a set.
- No upper bound for `year` (per user); no boundary test is defined for it.
- Whether `PUT` with a title equal to another book's title returns `409` is covered by the negative scenarios (not generated here).
