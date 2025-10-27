# WhatsApp Session Management with MongoDB

This document describes the implementation of multi-session WhatsApp Web management with MongoDB storage and hot reload support.

## Features

- ✅ **Multiple Session Support**: Create and manage multiple WhatsApp sessions simultaneously
- ✅ **MongoDB Storage**: Session data is stored in MongoDB using `wwebjs-mongo` library
- ✅ **Hot Reload**: Sessions are automatically restored when the application restarts
- ✅ **Auto-Reconnect**: Sessions automatically reconnect when disconnected
- ✅ **Session Metadata**: Track session status, last seen, and other metadata in MongoDB

## Architecture

### Database Connection

The service uses a dedicated MongoDB connection (`conn2`) configured in `app.module.ts`:

```typescript
MongooseModule.forRootAsync({
  imports: [ConfigModule],
  connectionName: 'conn2',
  useFactory: (configService: ConfigService) => ({
    uri: configService.get<string>('database.uri_ws'),
  }),
  inject: [ConfigService],
})
```

### Storage Implementation

Sessions are stored in the `whatsapp-sessions` collection in MongoDB with the following structure:

```typescript
{
  sessionId: string,        // Unique session identifier
  status: string,           // Current status (initializing, ready, authenticated, etc.)
  lastSeen: Date,          // Last activity timestamp
  updatedAt: Date          // Last update timestamp
}
```

### Service Features

#### 1. Automatic Session Restoration

On application startup (`onModuleInit`), the service:
- Queries MongoDB for stored sessions
- Attempts to restore each session automatically
- Skips sessions that are already active to prevent duplicates
- Logs the restoration process

#### 2. Session Lifecycle Management

Each session goes through these states:
- `initializing`: Session is being created
- `qr_generated`: QR code is available for scanning
- `authenticated`: Session is authenticated with WhatsApp
- `ready`: Session is ready for use
- `disconnected`: Session disconnected (will auto-reconnect)
- `error`: Session creation failed

#### 3. Auto-Reconnect

When a session disconnects:
- Session is marked as not ready
- Metadata is updated in MongoDB
- After 5 seconds, the session is automatically recreated
- Old session is destroyed before creating a new one

## API Endpoints

### Create a Session

```http
POST /whatsapp-web/session/:id
```

Creates a new WhatsApp session with the specified ID.

**Response:**
```json
{
  "success": true,
  "sessionId": "my-session-1",
  "message": "Session created successfully"
}
```

### Get Active Sessions

```http
GET /whatsapp-web/sessions
```

Returns all currently active sessions.

**Response:**
```json
[
  {
    "sessionId": "my-session-1",
    "isReady": true,
    "lastRestore": "2024-01-01T00:00:00.000Z"
  }
]
```

### Get Stored Sessions

```http
GET /whatsapp-web/sessions/stored
```

Returns all sessions stored in MongoDB.

**Response:**
```json
[
  {
    "sessionId": "my-session-1",
    "status": "ready",
    "lastSeen": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
]
```

### Get Session Status

```http
GET /whatsapp-web/session/:id/status
```

Returns the status of a specific session.

**Response:**
```json
{
  "exists": true,
  "ready": true,
  "state": { ... }
}
```

### Destroy a Session

```http
DELETE /whatsapp-web/session/:id
```

Destroys a session and removes it from MongoDB.

**Response:**
```json
{
  "success": true,
  "message": "Session destroyed successfully"
}
```

### Send Message

```http
POST /whatsapp-web/send/:id
Content-Type: application/json

{
  "phone": "1234567890",
  "message": "Hello World"
}
```

Sends a message via the specified session.

## Environment Variables

Required environment variables for `conn2` connection:

```env
DB_WS_USER=your_username
DB_WS_PASS=your_password
DATABASE_HOST=your_host
DATABASE_PORT=27017
DB_WS_NAME=whatsapp_db
```

## How It Works

### 1. Session Creation

When you create a session:
1. Service checks if session already exists
2. Creates a new WhatsApp Web.js client with `RemoteAuth`
3. Configures MongoDB store for session persistence
4. Sets up event handlers for QR, ready, disconnect, etc.
5. Stores metadata in MongoDB
6. Initializes the client

### 2. Hot Reload

When the application restarts:
1. `onModuleInit` is called
2. Service queries MongoDB for all stored sessions
3. For each session, attempts to restore it
4. Existing sessions are restored without requiring QR scan (if previously authenticated)

### 3. Session Restoration

The `RemoteAuth` strategy:
- Uses MongoDB to store session data
- Automatically restores session authentication from database
- No need to scan QR code again after first authentication
- Synchronizes session data every 5 minutes

## Monitoring

The service logs all important events:
- 🚀 Service initialization
- 📱 Session creation attempts
- 🔄 Session restoration
- ✅ Successful authentications
- ❌ Errors and failures
- ⚠️ Disconnections
- 💾 Session data saves to MongoDB

## Best Practices

1. **Session IDs**: Use meaningful, unique session IDs (e.g., user IDs or device names)
2. **Cleanup**: Destroy sessions when no longer needed to free resources
3. **Monitoring**: Check session status regularly via API endpoints
4. **Error Handling**: Implement retry logic for failed message sends
5. **Multiple Sessions**: Each session is independent; use different IDs for different users/devices

## Troubleshooting

### Session not restoring after restart

1. Check MongoDB connection (`conn2`)
2. Verify session exists in MongoDB: `db.whatsapp-sessions.find()`
3. Check logs for restoration errors
4. Ensure session was properly authenticated before restart

### "Session already exists" error

- The session is already active
- Check active sessions: `GET /whatsapp-web/sessions`
- Destroy the session first if you need to recreate it

### QR Code not appearing

- Check terminal output for QR code
- Verify session is in `qr_generated` status
- Check MongoDB for session metadata

