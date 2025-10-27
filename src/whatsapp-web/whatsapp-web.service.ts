// src/whatsapp-web/whatsapp-web.service.ts
import { Injectable, Logger, OnModuleInit, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client, RemoteAuth, LocalAuth } from 'whatsapp-web.js';
import { MongoStore } from 'wwebjs-mongo';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import * as mongoose from 'mongoose';
import * as qrcode from 'qrcode-terminal';
import { log } from 'console';
import { WhatsAppSession, WhatsAppSessionDocument } from 'src/schemas/whatsapp-session.schema';

interface SessionConfig {
  sessionId: string;
  useRemoteAuth?: boolean;
  puppeteerOptions?: any;
}

@Injectable()
export class WhatsappWebService implements OnModuleInit {
  private readonly logger = new Logger(WhatsappWebService.name);
  private readonly collectionName = 'whatsappsessions';
  private sessions: Map<string, { client: Client; isReady: boolean; lastRestore?: Date }> = new Map();
  private mongooseInstance: any;
  private store: any;
  private isInitializing = false;

  constructor(
    @InjectConnection('conn2') private readonly connection: Connection,
    @InjectModel(WhatsAppSession.name, 'conn2') private whatsAppSessionModel: mongoose.Model<WhatsAppSessionDocument>,
    private readonly configService: ConfigService,
  ) {
    this.mongooseInstance = {
      connection: this.connection,
      mongo: mongoose.mongo,
    };

    this.store = new MongoStore({ 
      mongoose: this.mongooseInstance,
      collectionName: this.collectionName,
    });
  }

  async onModuleInit() {
    this.logger.log('🚀 Initializing WhatsApp Web Service...');
    await this.initializeStoredSessions();
  }

  /**
   * Initialize all stored sessions from MongoDB
   */
  private async initializeStoredSessions() {
    if (this.isInitializing) {
      this.logger.warn('Session initialization already in progress');
      return;
    }

    this.isInitializing = true;
    
    try {
      // Wait for MongoDB connection to be ready
      await this.connection.readyState;
      
      const documents = await this.whatsAppSessionModel.find({});
      
      this.logger.log(`📱 Found ${documents.length} stored sessions in MongoDB`);
      
      if (documents.length === 0) {
        this.logger.log('No stored sessions to restore');
        return;
      }

      // Extract unique session IDs from the documents
      const sessionIds = [...new Set(documents.map(doc => doc.id))];
      
      for (const sessionId of sessionIds) {
        // Check if session is already active
        if (this.sessions.has(sessionId)) {
          this.logger.log(`Session ${sessionId} is already active, skipping...`);
          continue;
        }

        try {
          this.logger.log(`🔄 Attempting to restore session: ${sessionId}`);
          await this.createSession(sessionId);
          this.logger.log(`✅ Session ${sessionId} restored successfully`);
        } catch (error) {
          this.logger.error(`❌ Failed to restore session ${sessionId}:`, error.message);
        }
      }
      
      this.logger.log(`📊 Total active sessions: ${this.sessions.size}`);
    } catch (error) {
      this.logger.error('Error initializing stored sessions:', error);
    } finally {
      this.isInitializing = false;
    }
  }

  /**
   * Store session metadata in MongoDB
   */
  private async storeSessionMetadata(sessionId: string, metadata: { status: string; lastSeen: Date }) {
    try {
      await this.whatsAppSessionModel.updateOne(
        { id: sessionId },
        { 
          $set: {
            id: sessionId,
            ...metadata,
          }
        },
        { upsert: true }
      );
    } catch (error) {
      this.logger.error(`Error storing session metadata for ${sessionId}:`, error);
    }
  }
  
  /**
   * Create a new WhatsApp session
   */
  async createSession(sessionId: string) {
    try {
      // Check if session already exists
      if (this.sessions.has(sessionId)) {
        this.logger.warn(`Session ${sessionId} already exists`);
        return { success: false, sessionId, message: 'Session already exists' };
      }

      this.logger.log(`🔨 Creating session: ${sessionId}`);
    
      // Store session metadata
      await this.storeSessionMetadata(sessionId, { 
        status: 'initializing', 
        lastSeen: new Date() 
      });

      // Puppeteer options
      const defaultPuppeteerOptions = {
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu'
        ],
      };

      const client = new Client({
        authStrategy: new RemoteAuth({
          store: this.store,
          clientId: sessionId,
          backupSyncIntervalMs: 1000 * 60 * 5, // 5 minutes
        }),
        puppeteer: {
          ...defaultPuppeteerOptions,
        },
        webVersionCache: {
          type: 'remote',
          remotePath: 'https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2412.54.html',
        },
      });

      // Event handlers
      client.on('qr', async (qr) => {
        this.logger.log(`📱 QR received for session ${sessionId}`);
        qrcode.generate(qr, { small: true, width: 100, height: 100 });
        
        await this.storeSessionMetadata(sessionId, { 
          status: 'qr_generated', 
          lastSeen: new Date() 
        });
        
        this.emitQrEvent(sessionId, qr);
      });

      client.on('ready', async () => {
        this.logger.log(`✅ Session ${sessionId} is ready!`);
        const session = this.sessions.get(sessionId);
        if (session) {
          session.isReady = true;
        }
        await this.storeSessionMetadata(sessionId, { 
          status: 'ready', 
          lastSeen: new Date() 
        });
        
        this.emitReadyEvent(sessionId);
      });

      client.on('authenticated', async () => {
        this.logger.log(`🔐 Session ${sessionId} authenticated`);
        await this.storeSessionMetadata(sessionId, { 
          status: 'authenticated', 
          lastSeen: new Date() 
        });
      })
      client.on('auth_failure', async (error) => {
        this.logger.error(`❌ Session ${sessionId} authentication failed:`, error);
        await this.storeSessionMetadata(sessionId, { 
          status: 'auth_failure', 
          lastSeen: new Date() 
        });
        this.emitAuthFailureEvent(sessionId, error);
      });
      
      client.on('message_create', (message) => {
        this.logger.log(`📤 Message received in session ${sessionId}: ${message.body || 'media message'}`);
      });

      client.on('disconnected', async (reason) => {
        this.logger.warn(`⚠️ Session ${sessionId} disconnected: ${reason}`);
        const session = this.sessions.get(sessionId);
        if (session) {
          session.isReady = false;
        }
        
        await this.storeSessionMetadata(sessionId, { 
          status: 'disconnected', 
          lastSeen: new Date() 
        });
        
        // Auto-reconnect after 5 seconds
        setTimeout(async () => {
          this.logger.log(`🔄 Attempting to reconnect session ${sessionId}`);
          this.sessions.delete(sessionId);
          await this.createSession(sessionId);
        }, 5000);
      });

      client.on('remote_session_saved', async () => {
        this.logger.log(`💾 Session ${sessionId} data saved to MongoDB`);
      });

      client.on('loading_screen', (percent, message) => {
        this.logger.log(`📱 Session ${sessionId} loading: ${percent}% - ${message}`);
      });

      // Initialize client
      await client.initialize();

      this.sessions.set(sessionId, { 
        client, 
        isReady: false,
        lastRestore: new Date()
      });

      return { success: true, sessionId, message: 'Session created successfully' };
    } catch (error) {
      this.logger.error(`❌ Error creating session ${sessionId}:`, error);
      
      // Remove from sessions if it was added
      this.sessions.delete(sessionId);
      
      // Update metadata
      await this.storeSessionMetadata(sessionId, { 
        status: 'error', 
        lastSeen: new Date() 
      });
      
      throw new Error(`Failed to create session: ${error.message}`);
    }
  }

  /**
   * Destroy a session
   */
  async destroySession(sessionId: string) {
    try {
      const session = this.sessions.get(sessionId);
      if (session) {
        await session.client.destroy();
        this.sessions.delete(sessionId);
        
        // Remove from MongoDB using the model
        await this.whatsAppSessionModel.deleteMany({ id: sessionId });
        
        this.logger.log(`🧹 Session ${sessionId} destroyed and removed from MongoDB`);
        return { success: true, message: 'Session destroyed successfully' };
      }
      return { success: false, message: 'Session not found' };
    } catch (error) {
      this.logger.error(`Error destroying session ${sessionId}:`, error);
      throw new Error(`Failed to destroy session: ${error.message}`);
    }
  }

  /**
   * Send message
   */
  async sendMessage(sessionId: string, phone: string, message: string) {
    try {
      const session = this.sessions.get(sessionId);
      if (!session) {
        throw new Error(`Session ${sessionId} not found`);
      }

      if (!session.isReady) {
        throw new Error(`Session ${sessionId} is not ready yet`);
      }

      // Format phone number (remove any non-digit characters and ensure proper format)
      const formattedPhone = phone.replace(/\D/g, '');
      const chatId = `${formattedPhone}@c.us`;

      const result = await session.client.sendMessage(chatId, message);
      
      this.logger.log(`📤 Message sent to ${phone} via session ${sessionId}`);
      return { 
        success: true, 
        messageId: result.id._serialized,
        timestamp: result.timestamp,
        // from: result.from._serialized,
        // to: result.to._serialized
      };
    } catch (error) {
      this.logger.error(`Error sending message via session ${sessionId}:`, error);
      throw new Error(`Failed to send message: ${error.message}`);
    }
  }

  /**
   * Get session status
   */
  getSessionStatus(sessionId: string) {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return { exists: false, ready: false };
    }
    return { 
      exists: true, 
      ready: session.isReady,
      state: session.client.info // Additional client info if available
    };
  }

  /**
   * List all active sessions
   */
  getSessions() {
    const sessions = [];
    for (const [sessionId, session] of this.sessions.entries()) {
      sessions.push({
        sessionId,
        isReady: session.isReady,
        lastRestore: session.lastRestore,
      });
    }
    return sessions;
  }

  /**
   * List all stored sessions in MongoDB
   */
  async getStoredSessions() {
    try {
      const sessions = await this.whatsAppSessionModel.find({}).exec();
      return sessions.map(session => ({
        sessionId: session.id,
        status: session.status,
        lastSeen: session.lastSeen,
        updatedAt: session.updatedAt,
        createdAt: session.createdAt,
      }));
    } catch (error) {
      this.logger.error('Error fetching stored sessions:', error);
      return [];
    }
  }

  /**
   * Get client instance (for advanced operations)
   */
  getClient(sessionId: string): Client | null {
    const session = this.sessions.get(sessionId);
    return session ? session.client : null;
  }

  // Event emitter methods (you can implement with EventEmitter2 or @nestjs/event-emitter)
  private emitQrEvent(sessionId: string, qr: string) {
    // Implement your event emission logic here
    // this.eventEmitter.emit('whatsapp.qr', { sessionId, qr });
  }

  private emitReadyEvent(sessionId: string) {
    // this.eventEmitter.emit('whatsapp.ready', { sessionId });
  }

  private emitAuthFailureEvent(sessionId: string, error: any) {
    // this.eventEmitter.emit('whatsapp.auth_failure', { sessionId, error });
  }
}