## Groups Feature

Adds group management linked to a project. A group has a required `name`, a required `projectId`, and an optional list of `users`.

### Data Model
- `name: string` — required, trimmed
- `projectId: string` — required, trimmed
- `users: string[]` — optional, defaults to empty array
- `deleted: boolean` — soft delete flag, defaults to `false`
- Timestamps: `createdAt`, `updatedAt`

Schema: `src/schemas/group.schema.ts`

### Validation DTOs
- `CreateGroupDto` (`src/dto/create-group.dto.ts`): `name`, `projectId`, optional `users[]`
- `UpdateGroupDto` (`src/dto/update-group.dto.ts`): partial of create
- `UpdateGroupUsersDto` (`src/dto/update-group-users.dto.ts`): `users[]` only

### Module Structure
- Module: `src/groups/groups.module.ts`
- Controller: `src/groups/groups.controller.ts`
- Service: `src/groups/groups.service.ts`
- Registration: `GroupsModule` imported in `src/app.module.ts`
- Security: All routes protected by `JwtMiddleware`

### Endpoints
See `GROUPS_API_ENDPOINTS.md` for full request/response examples.

- POST `/groups` — create group
- GET `/groups` — list (optional `projectId` filter)
- GET `/groups/:id` — get by id
- PATCH `/groups/:id` — partial update
- PATCH `/groups/:id/users` — replace `users[]`
- DELETE `/groups/:id` — soft delete

### Request/Response Samples

#### POST /groups
Request
```json
{
  "name": "Support Team",
  "projectId": "64f8b2c1e1f0a3a1b2c3d4e5",
  "users": ["6501a2b3c4d5e6f708091011", "6501a2b3c4d5e6f708091012"]
}
```
201 Response
```json
{
  "_id": "6501f77bcf86cd7994390111",
  "name": "Support Team",
  "projectId": "64f8b2c1e1f0a3a1b2c3d4e5",
  "users": ["6501a2b3c4d5e6f708091011", "6501a2b3c4d5e6f708091012"],
  "deleted": false,
  "createdAt": "2025-10-30T12:00:00.000Z",
  "updatedAt": "2025-10-30T12:00:00.000Z"
}
```

#### GET /groups?projectId=64f8b2c1e1f0a3a1b2c3d4e5
200 Response
```json
[
  {
    "_id": "6501f77bcf86cd7994390111",
    "name": "Support Team",
    "projectId": "64f8b2c1e1f0a3a1b2c3d4e5",
    "users": ["6501a2b3c4d5e6f708091011", "6501a2b3c4d5e6f708091012"],
    "deleted": false,
    "createdAt": "2025-10-30T12:00:00.000Z",
    "updatedAt": "2025-10-30T12:00:00.000Z"
  }
]
```

#### GET /groups/:id
200 Response
```json
{
  "_id": "6501f77bcf86cd7994390111",
  "name": "Support Team",
  "projectId": "64f8b2c1e1f0a3a1b2c3d4e5",
  "users": ["6501a2b3c4d5e6f708091011", "6501a2b3c4d5e6f708091012"],
  "deleted": false,
  "createdAt": "2025-10-30T12:00:00.000Z",
  "updatedAt": "2025-10-30T12:00:00.000Z"
}
```

#### PATCH /groups/:id
Request (partial)
```json
{
  "name": "Tier 1 Support"
}
```
200 Response
```json
{
  "_id": "6501f77bcf86cd7994390111",
  "name": "Tier 1 Support",
  "projectId": "64f8b2c1e1f0a3a1b2c3d4e5",
  "users": ["6501a2b3c4d5e6f708091011", "6501a2b3c4d5e6f708091012"],
  "deleted": false,
  "createdAt": "2025-10-30T12:00:00.000Z",
  "updatedAt": "2025-10-30T12:05:00.000Z"
}
```

#### PATCH /groups/:id/users
Request
```json
{
  "users": ["6501a2b3c4d5e6f708091011", "6501a2b3c4d5e6f708091013"]
}
```
200 Response
```json
{
  "_id": "6501f77bcf86cd7994390111",
  "name": "Tier 1 Support",
  "projectId": "64f8b2c1e1f0a3a1b2c3d4e5",
  "users": ["6501a2b3c4d5e6f708091011", "6501a2b3c4d5e6f708091013"],
  "deleted": false,
  "createdAt": "2025-10-30T12:00:00.000Z",
  "updatedAt": "2025-10-30T12:06:00.000Z"
}
```

#### DELETE /groups/:id
204 Response
```json
{}
```

### Behavior Notes
- Soft delete: `deleted` set to `true`. Queries exclude deleted by default.
- Optional index suggestion: `{ projectId: 1, name: 1 }` if uniqueness per project is desired.

### Example cURL
Create:
```bash
curl -X POST https://<host>/groups \
  -H "Authorization: Bearer <JWT>" -H "Content-Type: application/json" \
  -d '{"name":"Support Team","projectId":"<project_id>","users":["<user_id>"]}'
```

Update users:
```bash
curl -X PATCH https://<host>/groups/<group_id>/users \
  -H "Authorization: Bearer <JWT>" -H "Content-Type: application/json" \
  -d '{"users":["<user_id_1>","<user_id_2>"]}'
```


