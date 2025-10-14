# Records Controller API Documentation

## Base URL: `/records`

---

## 1. **POST** `/records`
**Method**: `POST`  
**Description**: Create a new record

### Payload:
```json
{
  "user": "string",
  "file": "string", 
  "callerId": "string",
  "type": "string",
  "transcription": "string" // optional
}
```

### Success Response (201):
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "user": "user123",
  "file": "/path/to/audio.wav",
  "callerId": "1234567890",
  "type": "incoming",
  "transcription": "Hello, this is a test call",
  "successSell": null,
  "amountToPay": null,
  "reasonFail": null,
  "timestamp": null,
  "targetName": null,
  "targetNumber": null,
  "createdAt": "2023-12-01T10:00:00.000Z",
  "updatedAt": "2023-12-01T10:00:00.000Z"
}
```

### Error Response (400):
```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request"
}
```

---

## 2. **GET** `/records`
**Method**: `GET`  
**Description**: Get all records sorted by creation date (newest first)

### Payload: None

### Success Response (200):
```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "user": "user123",
    "file": "/path/to/audio.wav",
    "callerId": "1234567890",
    "type": "incoming",
    "transcription": "Hello, this is a test call",
    "successSell": null,
    "amountToPay": null,
    "reasonFail": null,
    "timestamp": null,
    "targetName": null,
    "targetNumber": null,
    "createdAt": "2023-12-01T10:00:00.000Z",
    "updatedAt": "2023-12-01T10:00:00.000Z"
  }
]
```

### Error Response (500):
```json
{
  "statusCode": 500,
  "message": "Internal server error"
}
```

---

## 3. **GET** `/records/latest`
**Method**: `GET`  
**Description**: Get the most recent record

### Payload: None

### Success Response (200):
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "user": "user123",
  "file": "/path/to/audio.wav",
  "callerId": "1234567890",
  "type": "incoming",
  "transcription": "Hello, this is a test call",
  "successSell": null,
  "amountToPay": null,
  "reasonFail": null,
  "timestamp": null,
  "targetName": null,
  "targetNumber": null,
  "createdAt": "2023-12-01T10:00:00.000Z",
  "updatedAt": "2023-12-01T10:00:00.000Z"
}
```

### Success Response (200) - No records:
```json
null
```

---

## 4. **GET** `/records/transcribe-latest?limit=10`
**Method**: `GET`  
**Description**: Process and transcribe the latest audio files

### Query Parameters:
- `limit` (optional): Number of files to process (default: 10)

### Payload: None

### Success Response (200):
```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "user": "user123",
    "file": "/path/to/audio.wav",
    "callerId": "1234567890",
    "type": "incoming",
    "transcription": "Transcribed audio content here",
    "successSell": null,
    "amountToPay": null,
    "reasonFail": null,
    "timestamp": null,
    "targetName": null,
    "targetNumber": null,
    "createdAt": "2023-12-01T10:00:00.000Z",
    "updatedAt": "2023-12-01T10:00:00.000Z"
  }
]
```

### Error Response (500):
```json
{
  "statusCode": 500,
  "message": "Error processing recordings"
}
```

---

## 5. **POST** `/records/transcribe-file`
**Method**: `POST`  
**Description**: Transcribe a specific audio file

### Payload:
```json
{
  "filePath": "/path/to/specific/audio.wav"
}
```

### Success Response (200):
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "user": "user123",
  "file": "/path/to/specific/audio.wav",
  "callerId": "1234567890",
  "type": "incoming",
  "transcription": "Transcribed content of the specific file",
  "successSell": null,
  "amountToPay": null,
  "reasonFail": null,
  "timestamp": null,
  "targetName": null,
  "targetNumber": null,
  "createdAt": "2023-12-01T10:00:00.000Z",
  "updatedAt": "2023-12-01T10:00:00.000Z"
}
```

### Error Response (400):
```json
{
  "statusCode": 400,
  "message": "File path is required"
}
```

### Error Response (500):
```json
{
  "statusCode": 500,
  "message": "Error transcribing file"
}
```

---

## 6. **POST** `/records/map-latest-files?limit=50`
**Method**: `POST`  
**Description**: Map latest files and parse their filename structure (moves files to mapped directory)

### Query Parameters:
- `limit` (optional): Number of files to process (default: 50)

### Payload: None

### Success Response (200):
```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "user": "unknown",
    "file": "/mapped/path/to/audio.wav",
    "callerId": "1234567890",
    "type": "incoming",
    "transcription": "",
    "successSell": null,
    "amountToPay": null,
    "reasonFail": null,
    "timestamp": 1701432000000,
    "targetName": "John Doe",
    "targetNumber": "9876543210",
    "createdAt": "2023-12-01T10:00:00.000Z",
    "updatedAt": "2023-12-01T10:00:00.000Z"
  }
]
```

### Error Response (500):
```json
{
  "statusCode": 500,
  "message": "Error mapping files"
}
```

---

## 7. **GET** `/records/:id`
**Method**: `GET`  
**Description**: Get a specific record by ID

### Path Parameters:
- `id`: Record ID

### Payload: None

### Success Response (200):
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "user": "user123",
  "file": "/path/to/audio.wav",
  "callerId": "1234567890",
  "type": "incoming",
  "transcription": "Hello, this is a test call",
  "successSell": null,
  "amountToPay": null,
  "reasonFail": null,
  "timestamp": null,
  "targetName": null,
  "targetNumber": null,
  "createdAt": "2023-12-01T10:00:00.000Z",
  "updatedAt": "2023-12-01T10:00:00.000Z"
}
```

### Error Response (404):
```json
{
  "statusCode": 404,
  "message": "Record not found"
}
```

---

## 8. **PATCH** `/records/:id`
**Method**: `PATCH`  
**Description**: Update a specific record

### Path Parameters:
- `id`: Record ID

### Payload (all fields optional):
```json
{
  "user": "string",
  "file": "string",
  "callerId": "string",
  "type": "string",
  "transcription": "string"
}
```

### Success Response (200):
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "user": "updated_user",
  "file": "/path/to/audio.wav",
  "callerId": "1234567890",
  "type": "outgoing",
  "transcription": "Updated transcription content",
  "successSell": null,
  "amountToPay": null,
  "reasonFail": null,
  "timestamp": null,
  "targetName": null,
  "targetNumber": null,
  "createdAt": "2023-12-01T10:00:00.000Z",
  "updatedAt": "2023-12-01T11:00:00.000Z"
}
```

### Error Response (404):
```json
{
  "statusCode": 404,
  "message": "Record not found"
}
```

---

## 9. **DELETE** `/records/:id`
**Method**: `DELETE`  
**Description**: Delete a specific record

### Path Parameters:
- `id`: Record ID

### Payload: None

### Success Response (200):
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "user": "user123",
  "file": "/path/to/audio.wav",
  "callerId": "1234567890",
  "type": "incoming",
  "transcription": "Hello, this is a test call",
  "successSell": null,
  "amountToPay": null,
  "reasonFail": null,
  "timestamp": null,
  "targetName": null,
  "targetNumber": null,
  "createdAt": "2023-12-01T10:00:00.000Z",
  "updatedAt": "2023-12-01T10:00:00.000Z"
}
```

### Error Response (404):
```json
{
  "statusCode": 404,
  "message": "Record not found"
}
```

---

## Common Error Responses

### 400 Bad Request:
```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request"
}
```

### 404 Not Found:
```json
{
  "statusCode": 404,
  "message": "Record not found"
}
```

### 500 Internal Server Error:
```json
{
  "statusCode": 500,
  "message": "Internal server error"
}
```

---

## Data Model

### Record Entity:
```typescript
{
  _id: string;                    // MongoDB ObjectId
  user: string;                   // Required - User identifier
  file: string;                   // Required - File path
  callerId: string;               // Required - Caller identifier
  type: string;                   // Required - Call type (incoming/outgoing)
  transcription: string;          // Required - Transcribed text
  successSell: boolean | null;    // Optional - Sales success flag
  amountToPay: number | null;     // Optional - Payment amount
  reasonFail: string | null;      // Optional - Failure reason
  timestamp: number | null;       // Optional - Parsed from filename
  targetName: string | null;      // Optional - Target contact name
  targetNumber: string | null;    // Optional - Target contact number
  createdAt: Date;                // Auto-generated
  updatedAt: Date;                // Auto-generated
}
```

---

## Usage Examples

### Create a new record:
```bash
curl -X POST http://localhost:3000/records \
  -H "Content-Type: application/json" \
  -d '{
    "user": "user123",
    "file": "/uploads/audio.wav",
    "callerId": "1234567890",
    "type": "incoming",
    "transcription": "Hello, this is a test call"
  }'
```

### Get all records:
```bash
curl -X GET http://localhost:3000/records
```

### Transcribe latest files:
```bash
curl -X GET "http://localhost:3000/records/transcribe-latest?limit=5"
```

### Transcribe specific file:
```bash
curl -X POST http://localhost:3000/records/transcribe-file \
  -H "Content-Type: application/json" \
  -d '{"filePath": "/uploads/specific-audio.wav"}'
```

### Map latest files:
```bash
curl -X POST "http://localhost:3000/records/map-latest-files?limit=20"
```

### Update a record:
```bash
curl -X PATCH http://localhost:3000/records/507f1f77bcf86cd799439011 \
  -H "Content-Type: application/json" \
  -d '{
    "transcription": "Updated transcription content",
    "type": "outgoing"
  }'
```

### Delete a record:
```bash
curl -X DELETE http://localhost:3000/records/507f1f77bcf86cd799439011
```

---

## Notes

- All timestamps are in ISO 8601 format
- The `transcribe-latest` endpoint processes audio files and creates/updates records with transcriptions
- The `map-latest-files` endpoint parses filename structure and moves files to a mapped directory
- File paths should be absolute paths to audio files
- The `limit` parameter controls how many files to process in batch operations
- All endpoints return JSON responses
- Error responses follow NestJS standard format
