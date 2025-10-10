# Transcription Analysis API

This document describes the transcription analysis feature that analyzes sales call transcriptions to determine if the sale was successful and extract the amount to be paid.

## Architecture

The system is now properly separated:
- **Records Controller** (`/records`): Handles only audio transcription functionality
- **Transcription Analysis Controller** (`/transcriptions`): Handles all analysis functionality for records with transcriptions

## Schema Fields

The `RecordsEntity` schema includes the following analysis fields:

- `successSell`: `boolean | null` - Indicates if the sale was successful
- `amountToPay`: `number | null` - Amount in pesos that the client should pay
- `reasonFail`: `string | null` - Reason for failure if the sale was not successful

## Endpoints

### Records Controller (`/records`) - Transcription Only

#### POST `/records/transcribe-file`
Transcribe a specific audio file.

**Body:**
```json
{
  "filePath": "path/to/audio/file.mp3"
}
```

**Response:**
```json
{
  "_id": "record_id",
  "user": "user_id",
  "file": "file_path",
  "callerId": "phone_number",
  "transcription": "transcription_text",
  "type": "call_type",
  "successSell": null,
  "amountToPay": null,
  "reasonFail": null
}
```

#### GET `/records/transcribe-latest`
Transcribe the latest N audio files.

**Query Parameters:**
- `limit` (optional): Number of files to transcribe (default: 10)

#### GET `/records/latest`
Get the latest record.

#### GET `/records`
Get all records.

#### GET `/records/:id`
Get a specific record by ID.

#### PATCH `/records/:id`
Update a specific record.

#### DELETE `/records/:id`
Delete a specific record.

### Transcription Analysis Controller (`/transcriptions`) - Analysis Only

#### POST `/transcriptions/analyze/:id`
Analyze a specific transcription by record ID.

**Parameters:**
- `id` (path): Record ID to analyze

**Response:**
```json
{
  "success": true,
  "data": {
    "successSell": true,
    "amountToPay": 70000000,
    "reasonFail": null
  },
  "message": "Transcription analysis completed successfully"
}
```

#### POST `/transcriptions/analyze-latest`
Analyze the first N records without analysis results.

**Query Parameters:**
- `limit` (optional): Number of records to analyze (default: 10)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "successSell": true,
      "amountToPay": 70000000,
      "reasonFail": null
    }
  ],
  "message": "Analysis completed for 1 transcriptions",
  "count": 1
}
```

#### GET `/transcriptions/records`
Get records with transcriptions.

**Query Parameters:**
- `limit` (optional): Number of records to return (default: 10)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "record_id",
      "user": "user_id",
      "file": "file_path",
      "callerId": "phone_number",
      "transcription": "transcription_text",
      "type": "call_type",
      "successSell": true,
      "amountToPay": 70000000,
      "reasonFail": null
    }
  ],
  "message": "Found 1 records with transcriptions",
  "count": 1
}
```

#### GET `/transcriptions/records/:id`
Get a specific record by ID.

**Parameters:**
- `id` (path): Record ID

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "record_id",
    "user": "user_id",
    "file": "file_path",
    "callerId": "phone_number",
    "transcription": "transcription_text",
    "type": "call_type",
    "successSell": true,
    "amountToPay": 70000000,
    "reasonFail": null
  },
  "message": "Record retrieved successfully"
}
```

#### GET `/transcriptions/pending`
Get records that need analysis.

**Query Parameters:**
- `limit` (optional): Number of records to return (default: 10)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "record_id",
      "user": "user_id",
      "file": "file_path",
      "callerId": "phone_number",
      "transcription": "transcription_text",
      "type": "call_type",
      "successSell": null,
      "amountToPay": null,
      "reasonFail": null
    }
  ],
  "message": "Found 1 records pending analysis",
  "count": 1
}
```

#### GET `/transcriptions/stats`
Get analysis statistics.

**Response:**
```json
{
  "success": true,
  "data": {
    "totalRecords": 100,
    "analyzedRecords": 85,
    "pendingAnalysis": 15,
    "successfulSales": 60,
    "failedSales": 25
  },
  "message": "Analysis statistics retrieved successfully"
}
```

#### GET `/transcriptions/health`
Health check endpoint.

**Response:**
```json
{
  "success": true,
  "message": "Transcription analysis service is running",
  "timestamp": "2024-01-01T00:00:00.000Z"
}

## Analysis Logic

The analysis service uses the configuration from `src/app/setup.json` to determine:

1. **Success Indicators**: Looks for positive words like "sí", "acepto", "perfecto", "comprar", "pagar", etc.
2. **Failure Indicators**: Looks for negative words like "no", "no gracias", "no estoy interesado", etc.
3. **Amount Extraction**: Uses regex patterns to find amounts mentioned in pesos or millions.
4. **Decision Logic**: 
   - If negative indicators present and no positive indicators → Sale failed
   - If positive indicators present and amount found → Sale successful
   - If positive indicators present but no amount → Sale failed (no specific amount)
   - Otherwise → Sale failed (no clear indicators)

## Usage Examples

### Step 1: Transcribe Audio Files
```bash
# Transcribe a specific file
curl -X POST http://localhost:3000/records/transcribe-file \
  -H "Content-Type: application/json" \
  -d '{"filePath": "path/to/file.mp3"}'

# Transcribe latest 10 files
curl -X GET http://localhost:3000/records/transcribe-latest?limit=10
```

### Step 2: Analyze Transcriptions
```bash
# Analyze a specific record
curl -X POST http://localhost:3000/transcriptions/analyze/record_id

# Analyze first 10 records without analysis
curl -X POST http://localhost:3000/transcriptions/analyze-latest?limit=10
```

### Step 3: View Results
```bash
# Get records with transcriptions
curl -X GET http://localhost:3000/transcriptions/records?limit=10

# Get specific record
curl -X GET http://localhost:3000/transcriptions/records/record_id

# Get records pending analysis
curl -X GET http://localhost:3000/transcriptions/pending?limit=5

# Get analysis statistics
curl -X GET http://localhost:3000/transcriptions/stats
```

### Workflow
1. **Transcribe**: Use `/records` endpoints to transcribe audio files
2. **Analyze**: Use `/transcriptions` endpoints to analyze the transcriptions
3. **View**: Use `/transcriptions` endpoints to view results and statistics
