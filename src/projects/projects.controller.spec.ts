import { Test, TestingModule } from '@nestjs/testing';
import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';
import { getModelToken } from '@nestjs/mongoose';
import { Project } from '../schemas/project.schema';

describe('ProjectsController', () => {
  let controller: ProjectsController;
  let service: ProjectsService;

  const mockProject = {
    _id: '507f1f77bcf86cd799439011',
    title: 'Test Project',
    config: { setting: 'value' },
    devices: ['device1', 'device2'],
    deleted: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockProjectsService = {
    createProject: jest.fn().mockResolvedValue(mockProject),
    findAllProjects: jest.fn().mockResolvedValue([mockProject]),
    findProjectById: jest.fn().mockResolvedValue(mockProject),
    updateProject: jest.fn().mockResolvedValue(mockProject),
    updateProjectDevices: jest.fn().mockResolvedValue(mockProject),
    deleteProject: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProjectsController],
      providers: [
        {
          provide: ProjectsService,
          useValue: mockProjectsService,
        },
        {
          provide: getModelToken(Project.name),
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<ProjectsController>(ProjectsController);
    service = module.get<ProjectsService>(ProjectsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create a project', async () => {
    const createProjectDto = {
      title: 'Test Project',
      config: { setting: 'value' },
      devices: ['device1', 'device2'],
    };

    const result = await controller.createProject(createProjectDto);
    expect(result).toEqual(mockProject);
    expect(service.createProject).toHaveBeenCalledWith(createProjectDto);
  });

  it('should find all projects', async () => {
    const result = await controller.findAllProjects();
    expect(result).toEqual([mockProject]);
    expect(service.findAllProjects).toHaveBeenCalled();
  });

  it('should find project by id', async () => {
    const result = await controller.findProjectById('507f1f77bcf86cd799439011');
    expect(result).toEqual(mockProject);
    expect(service.findProjectById).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
  });

  it('should update project', async () => {
    const updateProjectDto = { title: 'Updated Project' };
    const result = await controller.updateProject('507f1f77bcf86cd799439011', updateProjectDto);
    expect(result).toEqual(mockProject);
    expect(service.updateProject).toHaveBeenCalledWith('507f1f77bcf86cd799439011', updateProjectDto);
  });

  it('should update project devices', async () => {
    const updateProjectDevicesDto = { devices: ['device3', 'device4'] };
    const result = await controller.updateProjectDevices('507f1f77bcf86cd799439011', updateProjectDevicesDto);
    expect(result).toEqual(mockProject);
    expect(service.updateProjectDevices).toHaveBeenCalledWith('507f1f77bcf86cd799439011', updateProjectDevicesDto);
  });

  it('should delete project', async () => {
    const result = await controller.deleteProject('507f1f77bcf86cd799439011');
    expect(result).toBeUndefined();
    expect(service.deleteProject).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
  });
});
