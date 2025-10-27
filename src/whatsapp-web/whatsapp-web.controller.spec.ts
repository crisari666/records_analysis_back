import { Test, TestingModule } from '@nestjs/testing';
import { WhatsappWebController } from './whatsapp-web.controller';
import { WhatsappWebService } from './whatsapp-web.service';

describe('WhatsappWebController', () => {
  let controller: WhatsappWebController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WhatsappWebController],
      providers: [WhatsappWebService],
    }).compile();

    controller = module.get<WhatsappWebController>(WhatsappWebController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
