# Audio Transcription Feature

This feature adds audio transcription capabilities to the records scanner using the OpenAI API.

## Setup

1. **Install Dependencies**: The `openai` package has been installed.

2. **Environment Variables**: Add the following environment variables to your `.env` file:
   ```env
   OPENAI_API_KEY=your_openai_api_key_here
   RECORD_PATH=./uploads/records/webdav/Recordings
   ```

3. **Database**: The records schema already includes a `transcription` field.

## API Endpoints

### GET /records/transcribe-latest?limit=10
Transcribes the latest audio files from the records directory and saves them to the database.

**Query Parameters:**
- `limit` (optional): Number of latest files to process (default: 10)

**Response:** Array of processed records with transcriptions

### POST /records/transcribe-file
Transcribes a specific audio file.

**Request Body:**
```json
{
  "filePath": "/path/to/audio/file.mp3"
}
```

**Response:** The processed record with transcription

### GET /records/latest
Gets the latest record from the database.

**Response:** The most recent record

## File Naming Convention

The system expects audio files to follow this naming pattern:
```
%timestamp%_%userId%_%type%_[%contactName%]_[%contactPhone%]_%date%
```

Example: `1759442496_smart001_outgoing_[Outgoing]_[null]_2025-10-02_17-01-36.mp3`

## Features

- **Automatic File Discovery**: Scans the configured directory for audio files
- **Filename Parsing**: Extracts metadata from filenames (timestamp, user ID, type, contact info, date)
- **OpenAI Transcription**: Uses OpenAI's Whisper API for high-quality transcription
- **Database Integration**: Automatically saves transcriptions to MongoDB
- **Duplicate Handling**: Updates existing records instead of creating duplicates
- **Error Handling**: Continues processing other files if one fails

## Configuration

The transcription service can be configured through environment variables:

- `OPENAI_API_KEY`: Your OpenAI API key
- `RECORD_PATH`: Directory containing audio files
- Language is currently set to Spanish ('es') but can be made configurable

## Usage Example

```bash
# Transcribe the latest 5 audio files
curl "http://localhost:3000/records/transcribe-latest?limit=5"

# Transcribe a specific file
curl -X POST "http://localhost:3000/records/transcribe-file" \
  -H "Content-Type: application/json" \
  -d '{"filePath": "/path/to/audio.mp3"}'
```
