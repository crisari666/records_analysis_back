import { PartialType } from '@nestjs/mapped-types';
import { CreateCallerDeviceDto } from './create-caller-device.dto';

export class UpdateCallerDeviceDto extends PartialType(CreateCallerDeviceDto) {}
