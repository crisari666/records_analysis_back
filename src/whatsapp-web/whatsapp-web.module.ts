import { Module } from '@nestjs/common';
import { WhatsappWebService } from './whatsapp-web.service';
import { WhatsappWebController } from './whatsapp-web.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { WhatsAppSession, WhatsAppSessionSchema } from '../schemas/whatsapp-session.schema';
import { WhatsAppMessage, WhatsAppMessageSchema } from '../schemas/whatsapp-message.schema';
import { WhatsAppChat, WhatsAppChatSchema } from '../schemas/whatsapp-chat.schema';
import { WhatsappStorageService } from './whatsapp-storage.service';

@Module({
  imports: [
    MongooseModule.forFeature(
      [
        { name: WhatsAppSession.name, schema: WhatsAppSessionSchema },
        { name: WhatsAppMessage.name, schema: WhatsAppMessageSchema },
        { name: WhatsAppChat.name, schema: WhatsAppChatSchema },
      ],
      'conn2'
    ),
  ],
  controllers: [WhatsappWebController],
  providers: [WhatsappWebService, WhatsappStorageService],
  exports: [WhatsappWebService, WhatsappStorageService],
})
export class WhatsappWebModule {}
