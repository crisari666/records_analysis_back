import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CallerDevice, CallerDeviceDocument } from '../schemas/caller-device.schema';
import { CreateCallerDeviceDto } from '../dto/create-caller-device.dto';
import { UpdateCallerDeviceDto } from '../dto/update-caller-device.dto';
import { UpdateCallerDeviceProjectDto } from '../dto/update-caller-device-project.dto';

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

  async updateCallerDeviceProject(id: string, updateCallerDeviceProjectDto: UpdateCallerDeviceProjectDto): Promise<CallerDevice> {
    const { project } = updateCallerDeviceProjectDto;
    
    // First, verify the caller device exists
    const callerDevice = await this.callerDeviceModel.findOne({ 
      _id: id, 
      $or: [{ deleted: false }, { deleted: { $exists: false } }] 
    }).exec();
    
    if (!callerDevice) {
      throw new NotFoundException('Caller device not found');
    }

    // If assigning to a project, remove this device from any other project's devices array
    if (project) {
      // Find all projects that have this device in their devices array
      const projectsWithThisDevice = await this.callerDeviceModel.aggregate([
        {
          $lookup: {
            from: 'projects',
            localField: 'project',
            foreignField: '_id',
            as: 'projectData'
          }
        },
        {
          $match: {
            _id: { $ne: id },
            project: { $exists: true, $ne: null },
            'projectData.deleted': { $ne: true }
          }
        },
        {
          $project: { project: 1 }
        }
      ]);

      // Remove this device from all other projects' devices arrays
      if (projectsWithThisDevice.length > 0) {
        const projectIds = projectsWithThisDevice.map(p => p.project);
        await this.callerDeviceModel.updateMany(
          { 
            project: { $in: projectIds },
            $or: [{ deleted: false }, { deleted: { $exists: false } }]
          },
          { $unset: { project: 1 } }
        ).exec();
      }
    }

    // Update the caller device's project assignment
    const updatedCallerDevice = await this.callerDeviceModel.findOneAndUpdate(
      { 
        _id: id, 
        $or: [{ deleted: false }, { deleted: { $exists: false } }] 
      },
      { project: project || null },
      { new: true }
    ).exec();

    return updatedCallerDevice;
  }
}
