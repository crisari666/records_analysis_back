import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CallerDevicesService } from './caller-devices.service';
import { CallerDevicesController } from './caller-devices.controller';
import { CallerDevice, CallerDeviceSchema } from '../schemas/caller-device.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: CallerDevice.name, schema: CallerDeviceSchema }])
  ],
  controllers: [CallerDevicesController],
  providers: [CallerDevicesService],
  exports: [CallerDevicesService],
})
export class CallerDevicesModule {}
