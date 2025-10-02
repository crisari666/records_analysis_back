# Fitness Quantum Users Microservice - API Endpoints

## Base URL
```
http://localhost:3000
```

## Authentication
All endpoints except `/auth/login` and `POST /users` require JWT authentication via Bearer token in the Authorization header.

## Environment Variables Required
Create a `.env` file with the following variables:
```env
MONGODB_URI=mongodb://localhost:27017/fitness_quantum_users
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=24h
BCRYPT_ROUNDS=12
PORT=3000
NODE_ENV=development
```

---

## 🔐 Authentication Endpoints

### POST /auth/login
**Description:** Authenticate user and receive JWT token  
**Authentication:** Not required  
**Request Body:**
```typescript
{
  identifier: string; // Can be username or email
  password: string;
}
```
**Response:**
```typescript
{
  access_token: string;
  user: {
    id: string;
    name: string;
    lastName: string;
    user: string;
    email: string;
  };
}
```
**Example Request:**
```json
{
  "identifier": "john_doe",
  "password": "password123"
}
```

---

## 👥 User Management Endpoints

### POST /users
**Description:** Create a new user  
**Authentication:** Not required  
**Request Body:**
```typescript
{
  name: string;        // Required, trimmed
  lastName: string;    // Required, trimmed
  user: string;        // Required, unique, trimmed
  email: string;       // Required, unique, valid email, lowercase
  password: string;    // Required, minimum 6 characters
}
```
**Response:** User object (password excluded)
**Example Request:**
```json
{
  "name": "John",
  "lastName": "Doe",
  "user": "john_doe",
  "email": "john.doe@example.com",
  "password": "password123"
}
```

### GET /users
**Description:** Get all active users (removed users are excluded)  
**Authentication:** Required (JWT Bearer token)  
**Path Parameters:** None  
**Query Parameters:** None  
**Response:** Array of user objects (passwords excluded)
```typescript
User[] // Array of user objects without password field
```

### GET /users/:id
**Description:** Get a specific user by ID  
**Authentication:** Required (JWT Bearer token)  
**Path Parameters:**
- `id` (string): MongoDB ObjectId of the user
**Response:** User object (password excluded)
```typescript
User // User object without password field
```

### PATCH /users/:id
**Description:** Update a specific user  
**Authentication:** Required (JWT Bearer token)  
**Path Parameters:**
- `id` (string): MongoDB ObjectId of the user
**Request Body:** Partial user data (all fields optional)
```typescript
{
  name?: string;        // Optional, trimmed
  lastName?: string;    // Optional, trimmed
  user?: string;        // Optional, unique, trimmed
  email?: string;       // Optional, unique, valid email, lowercase
  password?: string;    // Optional, minimum 6 characters
}
```
**Response:** Updated user object (password excluded)
**Example Request:**
```json
{
  "name": "John Updated",
  "email": "john.updated@example.com"
}
```

### DELETE /users/:id
**Description:** Soft delete a user (sets removed = true)  
**Authentication:** Required (JWT Bearer token)  
**Path Parameters:**
- `id` (string): MongoDB ObjectId of the user
**Request Body:** None  
**Response:** No content (204)
**Note:** This is a soft delete - the user is marked as removed but not physically deleted from the database.

---

## 📋 Data Types

### User Schema
```typescript
interface User {
  _id: string;          // MongoDB ObjectId
  name: string;         // User's first name
  lastName: string;     // User's last name
  user: string;         // Unique username
  email: string;        // Unique email address
  password: string;     // Hashed password (excluded in responses)
  removed: boolean;     // Soft delete flag (default: false)
  createdAt: Date;      // Auto-generated timestamp
  updatedAt: Date;      // Auto-generated timestamp
}
```

### Error Responses
```typescript
// 400 Bad Request
{
  "statusCode": 400,
  "message": ["validation error messages"],
  "error": "Bad Request"
}

// 401 Unauthorized
{
  "statusCode": 401,
  "message": "Invalid credentials",
  "error": "Unauthorized"
}

// 404 Not Found
{
  "statusCode": 404,
  "message": "User not found",
  "error": "Not Found"
}

// 409 Conflict
{
  "statusCode": 409,
  "message": "User or email already exists",
  "error": "Conflict"
}
```

---

## 🔧 JWT Token Usage

Include the JWT token in the Authorization header for protected endpoints:
```
Authorization: Bearer <your-jwt-token>
```

The JWT token contains:
```typescript
{
  sub: string;      // User ID
  username: string; // Username
  email: string;    // Email
  iat: number;      // Issued at
  exp: number;      // Expiration time
}
```

---

## 🚀 Getting Started

1. Install dependencies:
   ```bash
   yarn install
   ```

2. Create `.env` file with the required environment variables

3. Start MongoDB service

4. Run the application:
   ```bash
   yarn start:dev
   ```

5. The API will be available at `http://localhost:3000`

---

## 📝 Notes

- All passwords are automatically hashed using bcrypt before storage
- Email addresses are automatically converted to lowercase
- Usernames and emails must be unique
- Soft delete is implemented - removed users are not returned in queries
- All endpoints return JSON responses
- Global validation pipe is configured for request validation
- CORS is not configured by default (add if needed for frontend integration)

