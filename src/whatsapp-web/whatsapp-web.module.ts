import { Module } from '@nestjs/common';
import { WhatsappWebService } from './whatsapp-web.service';
import { WhatsappWebController } from './whatsapp-web.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { WhatsAppSession, WhatsAppSessionSchema } from '../schemas/whatsapp-session.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: WhatsAppSession.name, schema: WhatsAppSessionSchema }], 'conn2')],
  controllers: [WhatsappWebController],
  providers: [WhatsappWebService],
  exports: [WhatsappWebService],
})
export class WhatsappWebModule {}
