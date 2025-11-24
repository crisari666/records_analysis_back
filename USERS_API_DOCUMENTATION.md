# Users API Documentation

This document provides comprehensive documentation for the Users API endpoints, specifically focusing on creating and updating users. This documentation is designed to be shared with other agents or developers working on this codebase.

## Overview

The Users API provides endpoints for managing user accounts in the system. Users can be created, retrieved, updated, and soft-deleted. The API uses JWT authentication for protected endpoints and bcrypt for password hashing.

## Base URL

```
/users
```

## Authentication

- **POST `/users`** (Create User): **No authentication required** - Public endpoint for user registration
- **PATCH `/users/:id`** (Update User): **JWT authentication required** - Protected endpoint

The JWT token should be included in the `Authorization` header:
```
Authorization: Bearer <jwt_token>
```

## Endpoints

### 1. Create User

Creates a new user account in the system.

**Endpoint:** `POST /users`

**Authentication:** Not required

**Request Body:**

```json
{
  "name": "string (required)",
  "lastName": "string (required)",
  "user": "string (required, unique)",
  "email": "string (required, valid email, unique)",
  "password": "string (required, minimum 6 characters)",
  "role": "string (optional, one of: 'root', 'admin', 'user')"
}
```

**Field Descriptions:**

| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| `name` | string | Yes | Not empty | User's first name |
| `lastName` | string | Yes | Not empty | User's last name |
| `user` | string | Yes | Not empty, unique | Username (must be unique) |
| `email` | string | Yes | Valid email format, unique | User's email address (stored in lowercase) |
| `password` | string | Yes | Minimum 6 characters | User's password (will be hashed with bcrypt) |
| `role` | string | No | One of: 'root', 'admin', 'user' | User role (defaults to 'user' if not provided) |

**Example Request:**

```json
{
  "name": "John",
  "lastName": "Doe",
  "user": "johndoe",
  "email": "john.doe@example.com",
  "password": "securePassword123",
  "role": "user"
}
```

**Success Response:**

**Status Code:** `201 Created`

**Response Body:**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "name": "John",
  "lastName": "Doe",
  "user": "johndoe",
  "email": "john.doe@example.com",
  "role": "user",
  "removed": false,
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

**Note:** The password is never returned in the response for security reasons.

**Error Responses:**

**Status Code:** `409 Conflict`
```json
{
  "statusCode": 409,
  "message": "User or email already exists",
  "error": "Conflict"
}
```
This error occurs when:
- The username (`user` field) already exists
- The email address already exists

**Status Code:** `400 Bad Request`
```json
{
  "statusCode": 400,
  "message": ["email must be an email", "password must be longer than or equal to 6 characters"],
  "error": "Bad Request"
}
```
This error occurs when validation fails (invalid email format, password too short, missing required fields, invalid role value).

**Implementation Details:**

- Password is automatically hashed using bcrypt before storage
- Email is automatically converted to lowercase
- The `removed` field defaults to `false`
- The `role` field defaults to `'user'` if not provided
- Timestamps (`createdAt` and `updatedAt`) are automatically managed by Mongoose

---

### 2. Update User

Updates an existing user's information.

**Endpoint:** `PATCH /users/:id`

**Authentication:** Required (JWT token)

**URL Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | MongoDB ObjectId of the user to update |

**Request Body:**

All fields are optional. Only include the fields you want to update.

```json
{
  "name": "string (optional)",
  "lastName": "string (optional)",
  "user": "string (optional, unique)",
  "email": "string (optional, valid email, unique)",
  "password": "string (optional, minimum 6 characters)",
  "role": "string (optional, one of: 'root', 'admin', 'user')"
}
```

**Field Descriptions:**

| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| `name` | string | No | Not empty if provided | User's first name |
| `lastName` | string | No | Not empty if provided | User's last name |
| `user` | string | No | Not empty if provided, unique | Username (must be unique) |
| `email` | string | No | Valid email format if provided, unique | User's email address (stored in lowercase) |
| `password` | string | No | Minimum 6 characters if provided | User's password (will be hashed with bcrypt) |
| `role` | string | No | One of: 'root', 'admin', 'user' | User role |

**Example Request:**

```json
{
  "name": "Jane",
  "email": "jane.doe@example.com",
  "role": "admin"
}
```

**Success Response:**

**Status Code:** `200 OK`

**Response Body:**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "name": "Jane",
  "lastName": "Doe",
  "user": "johndoe",
  "email": "jane.doe@example.com",
  "role": "admin",
  "removed": false,
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T11:45:00.000Z"
}
```

**Note:** The password is never returned in the response for security reasons.

**Error Responses:**

**Status Code:** `404 Not Found`
```json
{
  "statusCode": 404,
  "message": "User not found",
  "error": "Not Found"
}
```
This error occurs when:
- The user ID doesn't exist
- The user has been soft-deleted (`removed: true`)

**Status Code:** `401 Unauthorized`
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```
This error occurs when:
- JWT token is missing
- JWT token is invalid or expired

**Status Code:** `409 Conflict`
```json
{
  "statusCode": 409,
  "message": "User or email already exists",
  "error": "Conflict"
}
```
This error occurs when trying to update to a username or email that already exists.

**Status Code:** `400 Bad Request`
```json
{
  "statusCode": 400,
  "message": ["email must be an email", "password must be longer than or equal to 6 characters"],
  "error": "Bad Request"
}
```
This error occurs when validation fails.

**Implementation Details:**

- Only provided fields are updated (partial update)
- If password is provided, it is automatically hashed using bcrypt before storage
- If email is provided, it is automatically converted to lowercase
- The `updatedAt` timestamp is automatically updated by Mongoose
- Only non-removed users can be updated (`removed: false`)

---

## Data Model

### User Schema

```typescript
{
  name: string;              // Required, trimmed
  lastName: string;           // Required, trimmed
  user: string;               // Required, unique, trimmed
  email: string;              // Required, unique, trimmed, lowercase
  password: string;           // Required, hashed with bcrypt
  role: string;               // Enum: 'root' | 'admin' | 'user', default: 'user'
  removed: boolean;           // Default: false (soft delete flag)
  createdAt: Date;            // Auto-managed by Mongoose
  updatedAt: Date;            // Auto-managed by Mongoose
}
```

## Security Considerations

1. **Password Hashing**: All passwords are hashed using bcrypt before storage. The number of salt rounds is configured via `bcrypt.rounds` in the configuration.

2. **Password in Responses**: Passwords are never included in API responses, even when hashed.

3. **Soft Delete**: Users are not permanently deleted. Instead, the `removed` flag is set to `true`. This allows for data recovery and audit trails.

4. **Unique Constraints**: Both `user` (username) and `email` fields have unique constraints at the database level to prevent duplicates.

5. **Input Validation**: All inputs are validated using class-validator decorators before processing.

## Error Handling

The API uses standard HTTP status codes:

- `200 OK`: Successful update
- `201 Created`: Successful creation
- `400 Bad Request`: Validation error
- `401 Unauthorized`: Authentication required or invalid
- `404 Not Found`: User not found
- `409 Conflict`: Duplicate username or email

## Code References

### Controller
```12:13:src/users/users.controller.ts
  @Post()
  createUser(@Body() createUserDto: CreateUserDto) {
```

```25:28:src/users/users.controller.ts
  @Patch(':id')
  updateUser(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.updateUser(id, updateUserDto);
  }
```

### Service Methods
```17:35:src/users/users.service.ts
  async createUser(createUserDto: CreateUserDto): Promise<User> {
    const { password, ...userData } = createUserDto;
    
    const saltRounds = this.configService.get<number>('bcrypt.rounds');
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    try {
      const user = new this.userModel({
        ...userData,
        password: hashedPassword,
      });
      return await user.save();
    } catch (error) {
      if (error.code === 11000) {
        throw new ConflictException('User or email already exists');
      }
      throw error;
    }
  }
```

```61:79:src/users/users.service.ts
  async updateUser(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const updateData: any = { ...updateUserDto };
    
    if (updateData.password) {
      const saltRounds = this.configService.get<number>('bcrypt.rounds');
      updateData.password = await bcrypt.hash(updateData.password, saltRounds);
    }

    const user = await this.userModel.findOneAndUpdate(
      { _id: id, removed: false },
      updateData,
      { new: true }
    ).select('-password').exec();

    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }
```

### DTOs
```3:28:src/dto/create-user.dto.ts
export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  lastName: string;

  @IsNotEmpty()
  @IsString()
  user: string;

  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  password: string;

  @IsOptional()
  @IsString()
  @IsIn(['root', 'admin', 'user'])
  role?: string;
}
```

## Testing Examples

### cURL Examples

**Create User:**
```bash
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John",
    "lastName": "Doe",
    "user": "johndoe",
    "email": "john.doe@example.com",
    "password": "securePassword123",
    "role": "user"
  }'
```

**Update User:**
```bash
curl -X PATCH http://localhost:3000/users/507f1f77bcf86cd799439011 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your_jwt_token>" \
  -d '{
    "name": "Jane",
    "email": "jane.doe@example.com"
  }'
```

### JavaScript/TypeScript Examples

**Create User:**
```typescript
const response = await fetch('http://localhost:3000/users', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    name: 'John',
    lastName: 'Doe',
    user: 'johndoe',
    email: 'john.doe@example.com',
    password: 'securePassword123',
    role: 'user'
  })
});

const user = await response.json();
```

**Update User:**
```typescript
const response = await fetch('http://localhost:3000/users/507f1f77bcf86cd799439011', {
  method: 'PATCH',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${jwtToken}`
  },
  body: JSON.stringify({
    name: 'Jane',
    email: 'jane.doe@example.com'
  })
});

const updatedUser = await response.json();
```

## Notes for Other Agents

1. **Password Handling**: Never return passwords in responses. The service automatically excludes passwords using `.select('-password')`.

2. **Soft Delete**: When querying users, always check `removed: false` to exclude soft-deleted users.

3. **Unique Constraints**: When creating or updating users, handle `409 Conflict` errors for duplicate usernames or emails gracefully.

4. **Validation**: All DTOs use class-validator decorators. Ensure proper validation error handling in the frontend.

5. **JWT Middleware**: The JWT middleware is applied at the module level for GET, PATCH, and DELETE routes. POST (create) is intentionally public for user registration.

6. **Error Codes**: MongoDB duplicate key errors (code 11000) are caught and converted to `409 Conflict` exceptions.

