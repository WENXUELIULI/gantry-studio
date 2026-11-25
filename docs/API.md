# GANTRY API

Base URL: `http://127.0.0.1:8080/api/v1`

All request and response bodies are JSON. Protected routes require:

```http
Authorization: Bearer <accessToken>
```

## Auth

### Register

```http
POST /auth/register
Content-Type: application/json

{
  "email": "buyer@example.com",
  "password": "GantryDemo123!",
  "displayName": "韩工"
}
```

Returns `201` with an `AuthResponse`:

```json
{
  "tokenType": "Bearer",
  "accessToken": "eyJ...",
  "refreshToken": "28c...",
  "expiresIn": 900,
  "user": {
    "id": "f6f0...",
    "email": "buyer@example.com",
    "displayName": "韩工",
    "plan": "FREE",
    "createdAt": "2026-11-25T11:00:00Z"
  }
}
```

### Login

```http
POST /auth/login
```

Same body shape as register (email + password), returns `AuthResponse`.

### Refresh

```http
POST /auth/refresh
Content-Type: application/json

{ "refreshToken": "28c..." }
```

Refresh tokens rotate: the old token is revoked and a new pair is returned.
Reusing an old token returns `401 UNAUTHORIZED`.

### Logout

```http
POST /auth/logout
Content-Type: application/json

{ "refreshToken": "28c..." }
```

Returns `204`.

### Current user

```http
GET /auth/me
Authorization: Bearer <accessToken>
```

Returns `UserView`.

## Projects

A project owns one or more pages. Creating a project automatically creates a
`home` page at `/`.

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/projects` | List the current user's projects |
| `POST` | `/projects` | Create a project + home page |
| `GET` | `/projects/{id}` | Project detail with page summaries |
| `PATCH` | `/projects/{id}` | Rename / update status |
| `DELETE` | `/projects/{id}` | Delete project and pages |
| `GET` | `/projects/{id}/pages` | List pages |
| `POST` | `/projects/{id}/pages` | Add a page |
| `PUT` | `/projects/{id}/pages/{pageId}` | Save a page document |
| `DELETE` | `/projects/{id}/pages/{pageId}` | Delete a page |

Create project:

```json
{
  "name": "桁架精工官网",
  "slug": "truss-precision",
  "document": { "sections": [] }
}
```

Add page:

```json
{
  "title": "产品系列",
  "path": "/products",
  "document": { "sections": [] }
}
```

Save page:

```json
{
  "title": "产品系列",
  "path": "/products",
  "expectedVersion": 3,
  "document": { "sections": [] }
}
```

`expectedVersion` is optimistic locking. A stale value returns
`409 VERSION_CONFLICT` and the current page version in the payload.

Limits: `20` pages per project, `2 MB` per page document, `5 MB` per export.

## Exports

### Create artifact

```http
POST /projects/{id}/exports
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "format": "HTML",
  "fileName": "truss-precision.html",
  "content": "<!doctype html>..."
}
```

`format` is `HTML` or `JSON`.

- `HTML` is allowed for all plans.
- `JSON` (the project source file) requires `PRO`; otherwise `402 PRO_REQUIRED`.

Returns `201` with `{ id, format, fileName, bytes, createdAt, downloadPath }`.

### Download artifact

```http
GET /exports/{artifactId}
Authorization: Bearer <accessToken>
```

Only the owner can download the artifact. Returns the stored content with a
sanitized `Content-Disposition` filename.

## Errors

```json
{
  "code": "VERSION_CONFLICT",
  "message": "页面已在另一台设备更新，请刷新后重试",
  "fields": null,
  "timestamp": "2026-11-25T11:00:00Z"
}
```

| HTTP | Code | Meaning |
| --- | --- | --- |
| 400 | `VALIDATION_FAILED` | Request validation failed |
| 401 | `UNAUTHORIZED` | Missing / expired / invalid token |
| 402 | `PRO_REQUIRED` | JSON source export needs Pro |
| 403 | `FORBIDDEN` | Resource belongs to another user |
| 404 | `NOT_FOUND` | Project / page / artifact not found |
| 409 | `VERSION_CONFLICT` | Optimistic-lock mismatch |
| 422 | `LIMIT_EXCEEDED` | Page/document limit exceeded |
