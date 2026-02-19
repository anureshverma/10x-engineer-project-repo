# PromptLab API Reference

**Base URL:** `http://localhost:8000`
**Version:** `0.1.0`

---

## Table of Contents

- [Health Check](#health-check)
- [Prompts](#prompts)
  - [List Prompts](#list-prompts)
  - [Get Prompt](#get-prompt)
  - [Create Prompt](#create-prompt)
  - [Update Prompt](#update-prompt)
  - [Patch Prompt](#patch-prompt)
  - [Delete Prompt](#delete-prompt)
- [Collections](#collections)
  - [List Collections](#list-collections)
  - [Get Collection](#get-collection)
  - [Create Collection](#create-collection)
  - [Delete Collection](#delete-collection)
- [Data Models](#data-models)
- [Error Handling](#error-handling)

---

## Health Check

### `GET /health`

Check the health of the API service.

**Parameters:** None

**Request Body:** None

**curl Example:**

```bash
curl -X GET http://localhost:8000/health
```

**Response:** `200 OK`

```json
{
  "status": "healthy",
  "version": "0.1.0"
}
```

---

## Prompts

### List Prompts

### `GET /prompts`

List all prompts with optional filtering by collection and text search. Results are sorted by date, newest first.

**Query Parameters:**

| Parameter       | Type   | Required | Description                                   |
|-----------------|--------|----------|-----------------------------------------------|
| `collection_id` | string | No       | Filter prompts belonging to this collection ID |
| `search`        | string | No       | Search in prompt titles and descriptions       |

**Request Body:** None

**curl Examples:**

```bash
# List all prompts
curl -X GET http://localhost:8000/prompts

# Filter by collection
curl -X GET "http://localhost:8000/prompts?collection_id=abc-123"

# Search prompts
curl -X GET "http://localhost:8000/prompts?search=summarize"

# Combine filters
curl -X GET "http://localhost:8000/prompts?collection_id=abc-123&search=summarize"
```

**Response:** `200 OK`

```json
{
  "prompts": [
    {
      "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "title": "Summarize Article",
      "content": "Summarize the following article in 3 bullet points: {article}",
      "description": "Generates a concise summary of any article",
      "collection_id": "abc-123",
      "created_at": "2026-02-19T10:30:00",
      "updated_at": "2026-02-19T10:30:00"
    }
  ],
  "total": 1
}
```

**Error Codes:** None (returns an empty list when no prompts match).

---

### Get Prompt

### `GET /prompts/{prompt_id}`

Retrieve a single prompt by its ID.

**Path Parameters:**

| Parameter   | Type   | Required | Description                      |
|-------------|--------|----------|----------------------------------|
| `prompt_id` | string | Yes      | The unique ID of the prompt      |

**Request Body:** None

**curl Example:**

```bash
curl -X GET http://localhost:8000/prompts/a1b2c3d4-e5f6-7890-abcd-ef1234567890
```

**Response:** `200 OK`

```json
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "title": "Summarize Article",
  "content": "Summarize the following article in 3 bullet points: {article}",
  "description": "Generates a concise summary of any article",
  "collection_id": "abc-123",
  "created_at": "2026-02-19T10:30:00",
  "updated_at": "2026-02-19T10:30:00"
}
```

**Error Codes:**

| Status Code | Detail             | Description                              |
|-------------|--------------------|------------------------------------------|
| `404`       | `Prompt not found` | No prompt exists with the given ID       |

---

### Create Prompt

### `POST /prompts`

Create a new prompt. An `id`, `created_at`, and `updated_at` are generated automatically.

**Parameters:** None

**Request Body:** (`application/json`)

| Field           | Type           | Required | Constraints              | Description                                    |
|-----------------|----------------|----------|--------------------------|------------------------------------------------|
| `title`         | string         | Yes      | 1–200 characters         | The title of the prompt                        |
| `content`       | string         | Yes      | Min 1 character          | The main content/template of the prompt        |
| `description`   | string or null | No       | Max 500 characters       | An optional description of the prompt          |
| `collection_id` | string or null | No       |                          | ID of the collection this prompt belongs to    |

**curl Example:**

```bash
curl -X POST http://localhost:8000/prompts \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Summarize Article",
    "content": "Summarize the following article in 3 bullet points: {article}",
    "description": "Generates a concise summary of any article",
    "collection_id": "abc-123"
  }'
```

**Response:** `201 Created`

```json
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "title": "Summarize Article",
  "content": "Summarize the following article in 3 bullet points: {article}",
  "description": "Generates a concise summary of any article",
  "collection_id": "abc-123",
  "created_at": "2026-02-19T10:30:00",
  "updated_at": "2026-02-19T10:30:00"
}
```

**Error Codes:**

| Status Code | Detail                 | Description                                          |
|-------------|------------------------|------------------------------------------------------|
| `400`       | `Collection not found` | The provided `collection_id` does not exist          |
| `422`       | Validation error       | Request body fails schema validation (see [Error Handling](#error-handling)) |

---

### Update Prompt

### `PUT /prompts/{prompt_id}`

Fully replace a prompt. All fields in the request body are required. The `updated_at` timestamp is set to the current time; `created_at` and `id` are preserved.

**Path Parameters:**

| Parameter   | Type   | Required | Description                 |
|-------------|--------|----------|-----------------------------|
| `prompt_id` | string | Yes      | The unique ID of the prompt |

**Request Body:** (`application/json`)

| Field           | Type           | Required | Constraints              | Description                                    |
|-----------------|----------------|----------|--------------------------|------------------------------------------------|
| `title`         | string         | Yes      | 1–200 characters         | The title of the prompt                        |
| `content`       | string         | Yes      | Min 1 character          | The main content/template of the prompt        |
| `description`   | string or null | No       | Max 500 characters       | An optional description of the prompt          |
| `collection_id` | string or null | No       |                          | ID of the collection this prompt belongs to    |

**curl Example:**

```bash
curl -X PUT http://localhost:8000/prompts/a1b2c3d4-e5f6-7890-abcd-ef1234567890 \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Summarize Article v2",
    "content": "Summarize the following article in 5 bullet points: {article}",
    "description": "Updated prompt for article summarization",
    "collection_id": "abc-123"
  }'
```

**Response:** `200 OK`

```json
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "title": "Summarize Article v2",
  "content": "Summarize the following article in 5 bullet points: {article}",
  "description": "Updated prompt for article summarization",
  "collection_id": "abc-123",
  "created_at": "2026-02-19T10:30:00",
  "updated_at": "2026-02-19T11:00:00"
}
```

**Error Codes:**

| Status Code | Detail                 | Description                                          |
|-------------|------------------------|------------------------------------------------------|
| `404`       | `Prompt not found`     | No prompt exists with the given ID                   |
| `400`       | `Collection not found` | The provided `collection_id` does not exist          |
| `422`       | Validation error       | Request body fails schema validation (see [Error Handling](#error-handling)) |

---

### Patch Prompt

### `PATCH /prompts/{prompt_id}`

Partially update a prompt. Only the provided fields are updated; omitted fields remain unchanged. The `updated_at` timestamp is always refreshed.

**Path Parameters:**

| Parameter   | Type   | Required | Description                 |
|-------------|--------|----------|-----------------------------|
| `prompt_id` | string | Yes      | The unique ID of the prompt |

**Request Body:** (`application/json`) — all fields are optional

| Field           | Type           | Required | Constraints              | Description                                    |
|-----------------|----------------|----------|--------------------------|------------------------------------------------|
| `title`         | string or null | No       | 1–200 characters         | New title for the prompt                       |
| `content`       | string or null | No       | Min 1 character          | New content/template for the prompt            |
| `description`   | string or null | No       | Max 500 characters       | New description for the prompt                 |
| `collection_id` | string or null | No       |                          | New collection ID for the prompt               |

**curl Example:**

```bash
curl -X PATCH http://localhost:8000/prompts/a1b2c3d4-e5f6-7890-abcd-ef1234567890 \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Summarize Article v3"
  }'
```

**Response:** `200 OK`

```json
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "title": "Summarize Article v3",
  "content": "Summarize the following article in 5 bullet points: {article}",
  "description": "Updated prompt for article summarization",
  "collection_id": "abc-123",
  "created_at": "2026-02-19T10:30:00",
  "updated_at": "2026-02-19T11:15:00"
}
```

**Error Codes:**

| Status Code | Detail                 | Description                                          |
|-------------|------------------------|------------------------------------------------------|
| `404`       | `Prompt not found`     | No prompt exists with the given ID                   |
| `400`       | `Collection not found` | The provided `collection_id` does not exist          |
| `422`       | Validation error       | Request body fails schema validation (see [Error Handling](#error-handling)) |

---

### Delete Prompt

### `DELETE /prompts/{prompt_id}`

Delete a prompt by its ID.

**Path Parameters:**

| Parameter   | Type   | Required | Description                 |
|-------------|--------|----------|-----------------------------|
| `prompt_id` | string | Yes      | The unique ID of the prompt |

**Request Body:** None

**curl Example:**

```bash
curl -X DELETE http://localhost:8000/prompts/a1b2c3d4-e5f6-7890-abcd-ef1234567890
```

**Response:** `204 No Content` — empty response body on success.

**Error Codes:**

| Status Code | Detail             | Description                              |
|-------------|--------------------|------------------------------------------|
| `404`       | `Prompt not found` | No prompt exists with the given ID       |

---

## Collections

### List Collections

### `GET /collections`

List all collections.

**Parameters:** None

**Request Body:** None

**curl Example:**

```bash
curl -X GET http://localhost:8000/collections
```

**Response:** `200 OK`

```json
{
  "collections": [
    {
      "id": "abc-123",
      "name": "Writing Assistants",
      "description": "Prompts for writing and editing tasks",
      "created_at": "2026-02-18T09:00:00"
    }
  ],
  "total": 1
}
```

**Error Codes:** None (returns an empty list when no collections exist).

---

### Get Collection

### `GET /collections/{collection_id}`

Retrieve a single collection by its ID.

**Path Parameters:**

| Parameter       | Type   | Required | Description                        |
|-----------------|--------|----------|------------------------------------|
| `collection_id` | string | Yes      | The unique ID of the collection    |

**Request Body:** None

**curl Example:**

```bash
curl -X GET http://localhost:8000/collections/abc-123
```

**Response:** `200 OK`

```json
{
  "id": "abc-123",
  "name": "Writing Assistants",
  "description": "Prompts for writing and editing tasks",
  "created_at": "2026-02-18T09:00:00"
}
```

**Error Codes:**

| Status Code | Detail                 | Description                                  |
|-------------|------------------------|----------------------------------------------|
| `404`       | `Collection not found` | No collection exists with the given ID       |

---

### Create Collection

### `POST /collections`

Create a new collection. An `id` and `created_at` are generated automatically.

**Parameters:** None

**Request Body:** (`application/json`)

| Field         | Type           | Required | Constraints              | Description                               |
|---------------|----------------|----------|--------------------------|-------------------------------------------|
| `name`        | string         | Yes      | 1–100 characters         | The name of the collection                |
| `description` | string or null | No       | Max 500 characters       | An optional description of the collection |

**curl Example:**

```bash
curl -X POST http://localhost:8000/collections \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Writing Assistants",
    "description": "Prompts for writing and editing tasks"
  }'
```

**Response:** `201 Created`

```json
{
  "id": "abc-123",
  "name": "Writing Assistants",
  "description": "Prompts for writing and editing tasks",
  "created_at": "2026-02-18T09:00:00"
}
```

**Error Codes:**

| Status Code | Detail           | Description                                          |
|-------------|------------------|------------------------------------------------------|
| `422`       | Validation error | Request body fails schema validation (see [Error Handling](#error-handling)) |

---

### Delete Collection

### `DELETE /collections/{collection_id}`

Delete a collection and **all prompts** that belong to it.

**Path Parameters:**

| Parameter       | Type   | Required | Description                        |
|-----------------|--------|----------|------------------------------------|
| `collection_id` | string | Yes      | The unique ID of the collection    |

**Request Body:** None

**curl Example:**

```bash
curl -X DELETE http://localhost:8000/collections/abc-123
```

**Response:** `204 No Content` — empty response body on success.

**Error Codes:**

| Status Code | Detail                 | Description                                  |
|-------------|------------------------|----------------------------------------------|
| `404`       | `Collection not found` | No collection exists with the given ID       |

---

## Data Models

### Prompt

| Field           | Type     | Description                                        |
|-----------------|----------|----------------------------------------------------|
| `id`            | string   | UUID, auto-generated                               |
| `title`         | string   | 1–200 characters                                   |
| `content`       | string   | Min 1 character                                    |
| `description`   | string?  | Max 500 characters, nullable                       |
| `collection_id` | string?  | References a Collection ID, nullable               |
| `created_at`    | datetime | ISO 8601, auto-set on creation                     |
| `updated_at`    | datetime | ISO 8601, auto-set on creation, refreshed on update|

### Collection

| Field         | Type     | Description                          |
|---------------|----------|--------------------------------------|
| `id`          | string   | UUID, auto-generated                 |
| `name`        | string   | 1–100 characters                     |
| `description` | string?  | Max 500 characters, nullable         |
| `created_at`  | datetime | ISO 8601, auto-set on creation       |

---

## Error Handling

All errors are returned as JSON with the following structure:

```json
{
  "detail": "Human-readable error message"
}
```

### Common Error Codes

| Status Code | Meaning                | When It Occurs                                                     |
|-------------|------------------------|--------------------------------------------------------------------|
| `400`       | Bad Request            | Referenced resource does not exist (e.g., invalid `collection_id`) |
| `404`       | Not Found              | The requested prompt or collection does not exist                  |
| `422`       | Unprocessable Entity   | Request body fails Pydantic validation                             |

### Validation Error Format (422)

FastAPI returns a detailed validation error body when the request does not match the expected schema:

```json
{
  "detail": [
    {
      "loc": ["body", "title"],
      "msg": "String should have at least 1 character",
      "type": "string_too_short"
    }
  ]
}
```

| Field  | Type          | Description                                                  |
|--------|---------------|--------------------------------------------------------------|
| `loc`  | array         | Path to the field that failed validation (e.g., `["body", "title"]`) |
| `msg`  | string        | Human-readable description of the validation failure         |
| `type` | string        | Machine-readable error type identifier                       |
