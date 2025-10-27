import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { WhatsappWebService } from './whatsapp-web.service';
import { CreateWhatsappWebDto } from './dto/create-whatsapp-web.dto';
import { UpdateWhatsappWebDto } from './dto/update-whatsapp-web.dto';

@Controller('whatsapp-web')
export class WhatsappWebController {
  constructor(private readonly whatsappWebService: WhatsappWebService) {}

  @Post('session/:id')
  async createSession(@Param('id') id: string) {
    return this.whatsappWebService.createSession(id);
  }

  @Get('sessions')
  getSessions() {
    return this.whatsappWebService.getSessions();
  }

  @Get('sessions/stored')
  async getStoredSessions() {
    return this.whatsappWebService.getStoredSessions();
  }

  @Post('send/:id')
  async sendMessage(
    @Param('id') id: string,
    @Body() body: { phone: string; message: string },
  ) {
    return this.whatsappWebService.sendMessage(id, body.phone, body.message);
  }

  @Delete('session/:id')
  async destroySession(@Param('id') id: string) {
    return this.whatsappWebService.destroySession(id);
  }

  @Get('session/:id/status')
  getSessionStatus(@Param('id') id: string) {
    return this.whatsappWebService.getSessionStatus(id);
  }
}
