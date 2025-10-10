import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CallerDevicesService } from './caller-devices.service';
import { CreateCallerDeviceDto } from '../dto/create-caller-device.dto';
import { UpdateCallerDeviceDto } from '../dto/update-caller-device.dto';

@Controller('caller-devices')
export class CallerDevicesController {
  constructor(private readonly callerDevicesService: CallerDevicesService) {}

  @Post()
  createCallerDevice(@Body() createCallerDeviceDto: CreateCallerDeviceDto) {
    return this.callerDevicesService.createCallerDevice(createCallerDeviceDto);
  }

  @Get()
  findAllCallerDevices() {
    return this.callerDevicesService.findAllCallerDevices();
  }

  @Get(':id')
  findCallerDeviceById(@Param('id') id: string) {
    return this.callerDevicesService.findCallerDeviceById(id);
  }

  @Get('imei/:imei')
  findCallerDeviceByImei(@Param('imei') imei: string) {
    return this.callerDevicesService.findCallerDeviceByImei(imei);
  }

  @Patch(':id')
  updateCallerDevice(@Param('id') id: string, @Body() updateCallerDeviceDto: UpdateCallerDeviceDto) {
    return this.callerDevicesService.updateCallerDevice(id, updateCallerDeviceDto);
  }

  @Delete(':id')
  removeCallerDevice(@Param('id') id: string) {
    return this.callerDevicesService.removeCallerDevice(id);
  }
}
