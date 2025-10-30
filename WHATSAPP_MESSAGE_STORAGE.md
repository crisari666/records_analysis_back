# WhatsApp Message Storage Feature

## Overview
This feature stores WhatsApp messages in MongoDB to track message history, including deleted and edited messages. When messages are created, edited, or deleted, they are automatically saved to the database for future reference and recovery.

## Features

### 1. Message Storage
- All incoming and outgoing messages are automatically saved to the database
- Messages include metadata like sender, recipient, timestamp, media information, etc.

### 2. Deleted Message Tracking
- Messages deleted by user (`message_revoke_me`) are marked as deleted
- Messages deleted for everyone (`message_revoke_everyone`) are saved with their original content before deletion
- Deleted messages retain their original content for recovery

### 3. Message Edit History
- When a message is edited, the previous version is saved in the `edition` array
- Current message body always contains the latest version
- Full edit history is preserved for review

### 4. Chat ID Indexing
- All messages are indexed by `chatId` for efficient filtering
- Allows quick retrieval of all messages in a specific chat

## Schema Fields

### WhatsAppMessage Schema

| Field | Type | Description |
|-------|------|-------------|
| `messageId` | string | Unique WhatsApp message ID (indexed) |
| `sessionId` | string | Session the message belongs to (indexed) |
| `chatId` | string | Chat ID for filtering messages (indexed) |
| `body` | string | Message body (last version for edited messages) |
| `type` | string | Message type (chat, audio, image, video, etc.) |
| `from` | string | Sender contact ID (indexed) |
| `to` | string | Recipient contact ID (indexed) |
| `author` | string | Author contact ID (for group messages) |
| `fromMe` | boolean | Whether message was sent by current user |
| `isForwarded` | boolean | Whether message was forwarded |
| `isDeleted` | boolean | Whether message has been deleted (indexed) |
| `deletedAt` | Date | Timestamp when message was deleted |
| `deletedBy` | string | Who deleted the message ('me' or 'everyone') |
| `edition` | string[] | Array of previous message versions |
| `timestamp` | number | Message creation timestamp (indexed) |
| `hasMedia` | boolean | Whether message contains media |
| `mediaType` | string | Media type if applicable |

## API Endpoints

### Get Stored Messages
```bash
GET /whatsapp-web/session/:id/stored-messages
```

Query Parameters:
- `chatId` - Filter by specific chat
- `includeDeleted` - Include deleted messages (default: false)
- `limit` - Number of messages to return (default: 50)
- `skip` - Number of messages to skip for pagination

Example:
```bash
GET /whatsapp-web/session/my-session/stored-messages?chatId=1234567890@c.us&limit=100&includeDeleted=false
```

### Get Deleted Messages
```bash
GET /whatsapp-web/session/:id/messages/deleted
```

Query Parameters:
- `chatId` - Filter by specific chat
- `limit` - Number of messages to return (default: 50)

Example:
```bash
GET /whatsapp-web/session/my-session/messages/deleted?chatId=1234567890@c.us&limit=50
```

### Get Message by ID
```bash
GET /whatsapp-web/session/:id/messages/:messageId
```

Returns full message details including edit history and raw data.

Example:
```bash
GET /whatsapp-web/session/my-session/messages/true_5511999999999@c.us_AAAAAAAAAAAA
```

### Get Message Edit History
```bash
GET /whatsapp-web/session/:id/messages/:messageId/edits
```

Returns the message's edit history showing all previous versions.

Example:
```bash
GET /whatsapp-web/session/my-session/messages/true_5511999999999@c.us_AAAAAAAAAAAA/edits
```

## Database Indexes

The following indexes are automatically created for optimal query performance:

1. **messageId** - Unique message identifier
2. **sessionId** - Session identifier  
3. **chatId** - Chat identifier
4. **timestamp** - Message timestamp
5. **isDeleted** - Deletion status
6. **sessionId + chatId** - Compound index for chat queries
7. **sessionId + timestamp** - Compound index for time-based queries
8. **chatId + timestamp** - Compound index for chat timeline queries
9. **sessionId + isDeleted** - Compound index for deletion queries

## Usage Examples

### Get all messages for a chat
```javascript
const messages = await whatsappWebService.getStoredMessages(
  'my-session-id',
  '5511999999999@c.us',
  {
    limit: 100,
    includeDeleted: false
  }
);
```

### Get all deleted messages
```javascript
const deletedMessages = await whatsappWebService.getDeletedMessages(
  'my-session-id',
  '5511999999999@c.us',
  50
);
```

### Get message with edit history
```javascript
const message = await whatsappWebService.getStoredMessageById(
  'my-session-id',
  'message-id'
);

console.log('Current body:', message.body);
console.log('Previous versions:', message.editionHistory);
console.log('Edit count:', message.edition.length);
```

## Event Handling

The service automatically handles the following WhatsApp events:

1. **message_create** - Saves new messages to the database
2. **message_edit** - Updates message body and saves previous version to `edition` array
3. **message_revoke_me** - Marks message as deleted by current user
4. **message_revoke_everyone** - Marks message as deleted for everyone and saves the revoked message before deletion

## Implementation Details

### Message Save Logic
- Uses `upsert` to update existing messages or create new ones
- Preserves original creation timestamp
- Updates `updatedAt` timestamp on modifications

### Deletion Tracking
- When a message is deleted, only the `isDeleted` flag and `deletedAt` timestamp are updated
- Original message content is preserved for recovery
- `deletedBy` field tracks who deleted the message

### Edit History
- Each edit adds the previous version to the `edition` array
- Current `body` field always contains the latest version
- Allows tracking of all changes made to a message

## Benefits

1. **Message Recovery** - Deleted messages can be recovered from database
2. **Audit Trail** - Complete history of all message changes
3. **Analytics** - Track message patterns, edits, and deletions
4. **Compliance** - Maintain records for regulatory requirements
5. **Debugging** - Easier troubleshooting with full message history

