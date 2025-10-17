# Cron Job Setup for Records Mapping

## Overview
This document describes the automated cron job setup for the `mapLatestFiles()` method that runs every 5 minutes.

## What it does
The cron job automatically:
1. Scans the records directory for new audio files
2. Parses their filename structure to extract metadata
3. Creates database records with the parsed information
4. Moves successfully processed files to the mapped directory
5. Logs the process for monitoring

## Implementation Details

### Files Created/Modified
- `src/records/records-cron.service.ts` - New cron service with scheduled job
- `src/records/records.module.ts` - Updated to include the cron service
- `src/app.module.ts` - Updated to include ScheduleModule
- `src/records/records.controller.ts` - Added manual trigger endpoint

### Dependencies Added
- `@nestjs/schedule` - NestJS scheduling package
- `cron` - Cron expression parsing
- `luxon` - Date/time utilities

### Cron Schedule
- **Frequency**: Every 5 minutes
- **Expression**: `CronExpression.EVERY_5_MINUTES`
- **Method**: `handleMapLatestFiles()`

## API Endpoints

### Automatic (Cron)
- Runs automatically every 5 minutes
- Processes up to 50 files per run (configurable in code)

### Manual Trigger
- **Endpoint**: `POST /records/trigger-cron`
- **Query Parameters**: 
  - `limit` (optional): Number of files to process (default: 50)
- **Example**: `POST /records/trigger-cron?limit=25`

## Monitoring
The cron job includes comprehensive logging:
- Start/completion messages
- Number of files processed
- Error handling and logging
- File movement status

## Configuration
The cron job uses the same configuration as the manual `mapLatestFiles` endpoint:
- `RECORDS_PATH` - Source directory for audio files
- `RECORDS_PATH_MAPPED` - Destination directory for processed files

## Testing
To test the cron job manually:
1. Use the trigger endpoint: `POST /records/trigger-cron`
2. Check the application logs for execution details
3. Verify files are moved to the mapped directory
4. Check database for new records

## Notes
- The cron job will only process files that haven't been processed before (based on timestamp)
- Files with invalid filename structure are skipped with warnings
- The job is resilient to errors and will continue processing other files if one fails
- The original `mapLatestFiles` endpoint remains available for manual use
