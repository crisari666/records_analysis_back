## Groups API Endpoints

This document defines the HTTP contract for the Groups feature. A Group belongs to a project and contains an array of user IDs.

- Entity fields:
  - name: string (required)
  - projectId: string (required)
  - users: string[] (optional)

Unless stated otherwise, all endpoints require JWT auth via the Authorization header.

### Common
- Base path: `/groups`
- Headers:
  - Authorization: `Bearer <JWT>`
  - Content-Type: `application/json`

### Create group
- Method: POST
- Path: `/groups`
- Body:
```json
{
  "name": "Support Team",
  "projectId": "<project_id>",
  "users": ["<user_id_1>", "<user_id_2>"]
}
```
- 201 Response:
```json
{
  "_id": "<group_id>",
  "name": "Support Team",
  "projectId": "<project_id>",
  "users": ["<user_id_1>", "<user_id_2>"],
  "deleted": false,
  "createdAt": "2025-10-30T12:00:00.000Z",
  "updatedAt": "2025-10-30T12:00:00.000Z"
}
```

### List groups
- Method: GET
- Path: `/groups`
- Query params (optional):
  - projectId: string — filter by project
- 200 Response:
```json
[
  {
    "_id": "<group_id>",
    "name": "Support Team",
    "projectId": "<project_id>",
    "users": ["<user_id_1>", "<user_id_2>"],
    "deleted": false,
    "createdAt": "2025-10-30T12:00:00.000Z",
    "updatedAt": "2025-10-30T12:00:00.000Z"
  }
]
```

### Get group by id
- Method: GET
- Path: `/groups/:id`
- 200 Response:
```json
{
  "_id": "<group_id>",
  "name": "Support Team",
  "projectId": "<project_id>",
  "users": ["<user_id_1>", "<user_id_2>"],
  "deleted": false,
  "createdAt": "2025-10-30T12:00:00.000Z",
  "updatedAt": "2025-10-30T12:00:00.000Z"
}
```

### Update group (partial)
- Method: PATCH
- Path: `/groups/:id`
- Body (any subset of):
```json
{
  "name": "New Name",
  "projectId": "<project_id>",
  "users": ["<user_id_1>", "<user_id_3>"]
}
```
- 200 Response: Updated group document

### Update group users only
- Method: PATCH
- Path: `/groups/:id/users`
- Body:
```json
{
  "users": ["<user_id_1>", "<user_id_4>"]
}
```
- 200 Response: Updated group document

### Delete group
- Method: DELETE
- Path: `/groups/:id`
- Behavior: soft delete (sets `deleted: true`)
- 204 Response: empty body

### Error responses
- 400: Validation error (e.g., missing `name` or `projectId`)
- 401: Missing/invalid JWT
- 404: Group not found
- 409: Conflict (e.g., duplicate by unique business rule, if any)

### Notes for implementation
- Protect routes with JWT middleware similar to `projects`.
- Use Mongoose model `Group` with schema fields `name`, `projectId`, `users`, `deleted`.
- Consider index on `{ projectId: 1, name: 1 }` if uniqueness by project+name is desired.


