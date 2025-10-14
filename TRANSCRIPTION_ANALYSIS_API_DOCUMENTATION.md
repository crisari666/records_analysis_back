# Transcription Analysis Controller API Documentation

## Base URL: `/transcriptions`

---

## 1. **POST** `/transcriptions/analyze/:id`
**Method**: `POST`  
**Description**: Analyze a specific transcription by record ID using AI

### Path Parameters:
- `id`: Record ID (MongoDB ObjectId)

### Payload: None

### Success Response (200):
```json
{
  "success": true,
  "data": {
    "successSell": true,
    "amountToPay": 1500000,
    "reasonFail": null
  },
  "message": "Transcription analysis completed successfully"
}
```

### Error Response (400):
```json
{
  "success": false,
  "message": "Record with ID 507f1f77bcf86cd799439011 not found"
}
```

### Error Response (400):
```json
{
  "success": false,
  "message": "Record with ID 507f1f77bcf86cd799439011 has no transcription"
}
```

---

## 2. **POST** `/transcriptions/analyze-latest?limit=10`
**Method**: `POST`  
**Description**: Analyze the latest transcriptions that haven't been analyzed yet

### Query Parameters:
- `limit` (optional): Number of records to analyze (default: 10)

### Payload: None

### Success Response (200):
```json
{
  "success": true,
  "data": [
    {
      "successSell": true,
      "amountToPay": 2000000,
      "reasonFail": null
    },
    {
      "successSell": false,
      "amountToPay": null,
      "reasonFail": "El cliente no mostró interés en comprar."
    }
  ],
  "message": "Analysis completed for 2 transcriptions",
  "count": 2
}
```

### Success Response (200) - No records to analyze:
```json
{
  "success": true,
  "data": [],
  "message": "Analysis completed for 0 transcriptions",
  "count": 0
}
```

### Error Response (400):
```json
{
  "success": false,
  "message": "Error analyzing latest transcriptions"
}
```

---

## 3. **GET** `/transcriptions/pending?limit=10`
**Method**: `GET`  
**Description**: Get records that have transcriptions but haven't been analyzed yet

### Query Parameters:
- `limit` (optional): Number of records to return (default: 10)

### Payload: None

### Success Response (200):
```json
{
  "success": true,
  "data": [
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
  ],
  "message": "Found 1 records pending analysis",
  "count": 1
}
```

### Error Response (400):
```json
{
  "success": false,
  "message": "Error fetching pending analysis records"
}
```

---

## 4. **GET** `/transcriptions/stats`
**Method**: `GET`  
**Description**: Get analysis statistics and metrics

### Payload: None

### Success Response (200):
```json
{
  "success": true,
  "data": {
    "totalRecords": 150,
    "analyzedRecords": 120,
    "pendingAnalysis": 30,
    "successfulSales": 45,
    "failedSales": 75
  },
  "message": "Analysis statistics retrieved successfully"
}
```

### Error Response (400):
```json
{
  "success": false,
  "message": "Error fetching analysis statistics"
}
```

---

## 5. **GET** `/transcriptions/records?limit=10`
**Method**: `GET`  
**Description**: Get all records that have transcriptions (analyzed and unanalyzed)

### Query Parameters:
- `limit` (optional): Number of records to return (default: 10)

### Payload: None

### Success Response (200):
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "user": "user123",
      "file": "/path/to/audio.wav",
      "callerId": "1234567890",
      "type": "incoming",
      "transcription": "Hello, this is a test call",
      "successSell": true,
      "amountToPay": 1500000,
      "reasonFail": null,
      "timestamp": null,
      "targetName": null,
      "targetNumber": null,
      "createdAt": "2023-12-01T10:00:00.000Z",
      "updatedAt": "2023-12-01T10:00:00.000Z"
    }
  ],
  "message": "Found 1 records with transcriptions",
  "count": 1
}
```

### Error Response (400):
```json
{
  "success": false,
  "message": "Error fetching records with transcriptions"
}
```

---

## 6. **GET** `/transcriptions/records/:id`
**Method**: `GET`  
**Description**: Get a specific record by ID

### Path Parameters:
- `id`: Record ID (MongoDB ObjectId)

### Payload: None

### Success Response (200):
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "user": "user123",
    "file": "/path/to/audio.wav",
    "callerId": "1234567890",
    "type": "incoming",
    "transcription": "Hello, this is a test call",
    "successSell": true,
    "amountToPay": 1500000,
    "reasonFail": null,
    "timestamp": null,
    "targetName": null,
    "targetNumber": null,
    "createdAt": "2023-12-01T10:00:00.000Z",
    "updatedAt": "2023-12-01T10:00:00.000Z"
  },
  "message": "Record retrieved successfully"
}
```

### Error Response (404):
```json
{
  "success": false,
  "message": "Record not found"
}
```

### Error Response (400):
```json
{
  "success": false,
  "message": "Error fetching record"
}
```

---

## 7. **GET** `/transcriptions/health`
**Method**: `GET`  
**Description**: Health check endpoint for the transcription analysis service

### Payload: None

### Success Response (200):
```json
{
  "success": true,
  "message": "Transcription analysis service is running",
  "timestamp": "2023-12-01T10:00:00.000Z"
}
```

---

## Data Models

### AnalysisResult Interface:
```typescript
{
  successSell: boolean;           // Whether the sale was successful
  amountToPay: number | null;     // Amount to be paid (null if no sale)
  reasonFail: string | null;      // Reason for failure (null if successful)
}
```

### Analysis Statistics:
```typescript
{
  totalRecords: number;           // Total records with transcriptions
  analyzedRecords: number;        // Records that have been analyzed
  pendingAnalysis: number;        // Records pending analysis
  successfulSales: number;        // Number of successful sales
  failedSales: number;            // Number of failed sales
}
```

### Record Entity (with analysis results):
```typescript
{
  _id: string;                    // MongoDB ObjectId
  user: string;                   // User identifier
  file: string;                   // File path
  callerId: string;               // Caller identifier
  type: string;                   // Call type (incoming/outgoing)
  transcription: string;          // Transcribed text
  successSell: boolean | null;    // Analysis result: sale success
  amountToPay: number | null;     // Analysis result: payment amount
  reasonFail: string | null;      // Analysis result: failure reason
  timestamp: number | null;       // Parsed from filename
  targetName: string | null;      // Target contact name
  targetNumber: string | null;    // Target contact number
  createdAt: Date;                // Auto-generated
  updatedAt: Date;                // Auto-generated
}
```

---

## Common Error Responses

### 400 Bad Request:
```json
{
  "success": false,
  "message": "Error message describing the issue"
}
```

### 404 Not Found:
```json
{
  "success": false,
  "message": "Record not found"
}
```

---

## Usage Examples

### Analyze a specific transcription:
```bash
curl -X POST http://localhost:3000/transcriptions/analyze/507f1f77bcf86cd799439011
```

### Analyze latest unanalyzed transcriptions:
```bash
curl -X POST "http://localhost:3000/transcriptions/analyze-latest?limit=5"
```

### Get pending analysis records:
```bash
curl -X GET "http://localhost:3000/transcriptions/pending?limit=20"
```

### Get analysis statistics:
```bash
curl -X GET http://localhost:3000/transcriptions/stats
```

### Get records with transcriptions:
```bash
curl -X GET "http://localhost:3000/transcriptions/records?limit=15"
```

### Get specific record:
```bash
curl -X GET http://localhost:3000/transcriptions/records/507f1f77bcf86cd799439011
```

### Health check:
```bash
curl -X GET http://localhost:3000/transcriptions/health
```

---

## Analysis Process

### AI-Powered Analysis:
1. **OpenAI Integration**: Uses GPT-4 for intelligent analysis
2. **Configuration**: Reads analysis rules from `src/app/setup.json`
3. **Language**: Analyzes Spanish transcriptions
4. **Fallback**: Basic keyword analysis if OpenAI fails

### Analysis Criteria:
- **Success Indicators**: "sí", "acepto", "perfecto", "comprar", "pagar", etc.
- **Failure Indicators**: "no", "no gracias", "no estoy interesado", etc.
- **Amount Detection**: Extracts monetary values from transcription
- **Context Understanding**: AI analyzes conversation context

### Analysis Results:
- **successSell**: Boolean indicating if sale was successful
- **amountToPay**: Numeric value of payment amount (null if no sale)
- **reasonFail**: String explaining why sale failed (null if successful)

---

## Configuration

The analysis service requires:
- `OPENAI_API_KEY` environment variable
- `src/app/setup.json` configuration file with:
  - Analysis instructions
  - Output format specification
  - Field descriptions
  - Example analyses

---

## Notes

- All analysis results are automatically saved to the database
- The service processes transcriptions in Spanish
- Failed analyses don't stop batch processing
- Health check endpoint for monitoring service status
- Statistics provide insights into analysis coverage and sales performance
- Records are automatically updated with analysis results after processing
