import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CallerDevice, CallerDeviceDocument } from '../schemas/caller-device.schema';
import { CreateCallerDeviceDto } from '../dto/create-caller-device.dto';
import { UpdateCallerDeviceDto } from '../dto/update-caller-device.dto';

@Injectable()
export class CallerDevicesService {
  constructor(
    @InjectModel(CallerDevice.name) private callerDeviceModel: Model<CallerDeviceDocument>,
  ) {}

  async createCallerDevice(createCallerDeviceDto: CreateCallerDeviceDto): Promise<CallerDevice> {
    try {
      const callerDevice = new this.callerDeviceModel(createCallerDeviceDto);
      return await callerDevice.save();
    } catch (error) {
      if (error.code === 11000) {
        throw new ConflictException('Caller device with this IMEI already exists');
      }
      throw error;
    }
  }

  async findAllCallerDevices(): Promise<CallerDevice[]> {
    return this.callerDeviceModel.find({ 
      $or: [{ deleted: false }, { deleted: { $exists: false } }] 
    }).exec();
  }

  async findCallerDeviceById(id: string): Promise<CallerDevice> {
    const callerDevice = await this.callerDeviceModel.findOne({ 
      _id: id, 
      $or: [{ deleted: false }, { deleted: { $exists: false } }] 
    }).exec();
    
    if (!callerDevice) {
      throw new NotFoundException('Caller device not found');
    }
    return callerDevice;
  }

  async findCallerDeviceByImei(imei: string): Promise<CallerDevice> {
    const callerDevice = await this.callerDeviceModel.findOne({ 
      imei, 
      $or: [{ deleted: false }, { deleted: { $exists: false } }] 
    }).exec();
    
    if (!callerDevice) {
      throw new NotFoundException('Caller device not found');
    }
    return callerDevice;
  }

  async updateCallerDevice(id: string, updateCallerDeviceDto: UpdateCallerDeviceDto): Promise<CallerDevice> {
    const callerDevice = await this.callerDeviceModel.findOneAndUpdate(
      { 
        _id: id, 
        $or: [{ deleted: false }, { deleted: { $exists: false } }] 
      },
      updateCallerDeviceDto,
      { new: true }
    ).exec();

    if (!callerDevice) {
      throw new NotFoundException('Caller device not found');
    }
    return callerDevice;
  }

  async removeCallerDevice(id: string): Promise<void> {
    const callerDevice = await this.callerDeviceModel.findOneAndUpdate(
      { 
        _id: id, 
        $or: [{ deleted: false }, { deleted: { $exists: false } }] 
      },
      { deleted: true },
      { new: true }
    ).exec();

    if (!callerDevice) {
      throw new NotFoundException('Caller device not found');
    }
  }
}
