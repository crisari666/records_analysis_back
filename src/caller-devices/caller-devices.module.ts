import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CallerDevicesService } from './caller-devices.service';
import { CallerDevicesController } from './caller-devices.controller';
import { CallerDevice, CallerDeviceSchema } from '../schemas/caller-device.schema';
import { Project, ProjectSchema } from '../schemas/project.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CallerDevice.name, schema: CallerDeviceSchema },
      { name: Project.name, schema: ProjectSchema },
    ])
  ],
  controllers: [CallerDevicesController],
  providers: [CallerDevicesService],
  exports: [CallerDevicesService],
})
export class CallerDevicesModule { }
