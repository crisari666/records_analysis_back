# Ollama Integration for Transcription Analysis

This document describes the integration of Ollama with the deepseek-llm model for transcription analysis.

## Overview

The transcription analysis service has been refactored to use Ollama with the `deepseek-llm` model instead of OpenAI. This provides a local, cost-effective solution for analyzing call transcriptions.

## Dependencies

The following packages have been added:
- `ollama`: Official Ollama Node.js client
- `axios`: HTTP client (dependency of ollama)

## Environment Variables

Add the following environment variable to your `.env` file (optional):

```bash
# Ollama host URL (default: http://localhost:11434)
OLLAMA_HOST=http://localhost:11434
```

## Setup

1. **Install Ollama**: Make sure Ollama is installed and running on your system
   - Visit [https://ollama.ai](https://ollama.ai) for installation instructions

2. **Pull the deepseek-llm model**:
   ```bash
   ollama pull deepseek-llm
   ```

3. **Start Ollama service**:
   ```bash
   ollama serve
   ```

## API Endpoints

### Check Ollama Status
```http
GET /transcriptions/ollama/status
```

Returns the availability status of Ollama and the deepseek-llm model.

### Pull Model
```http
POST /transcriptions/ollama/pull-model
```

Downloads the deepseek-llm model if not already available.

## Services

### OllamaService

The `OllamaService` handles all communication with the local Ollama instance:

- `analyzeTranscription(transcription, config)`: Analyzes a transcription using deepseek-llm
- `checkModelAvailability()`: Checks if the deepseek-llm model is available
- `pullModel()`: Downloads the deepseek-llm model

### TranscriptionAnalysisService

The `TranscriptionAnalysisService` has been updated to use `OllamaService` instead of OpenAI:

- All analysis methods now use the local Ollama model
- Fallback to basic analysis if Ollama is unavailable
- Same interface as before, no breaking changes

## Configuration

The service uses the same configuration file (`src/app/setup.json`) for analysis prompts and examples. The Ollama service will use the same system prompts and validation logic as the previous OpenAI implementation.

## Error Handling

- If Ollama is unavailable, the service falls back to basic analysis
- All errors are logged for debugging
- The service continues processing other records even if one fails

## Performance

- Local processing eliminates API rate limits
- No external API costs
- Faster response times for local processing
- Model runs on your hardware resources

## Troubleshooting

1. **Model not found**: Run `ollama pull deepseek-llm`
2. **Connection refused**: Ensure Ollama is running (`ollama serve`)
3. **Analysis errors**: Check the logs for detailed error messages
4. **Memory issues**: Ensure sufficient RAM for the model (deepseek-llm requires ~4GB)

## Migration Notes

- No changes required to existing API calls
- Same response format as before
- All existing functionality preserved
- Environment variables are optional (uses localhost by default)
