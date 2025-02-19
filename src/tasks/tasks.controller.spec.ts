import { Test, TestingModule } from '@nestjs/testing';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { GetTasksFilterDto } from './dto/get-tasks-filter.dto';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskStatusDto } from './dto/update-task-status.dto';
import { TaskStatus } from './task-status.enum';

const mockTasksService = () => ({
  getTasks: jest.fn(),
  getTaskById: jest.fn(),
  createTask: jest.fn(),
  deleteTask: jest.fn(),
  updateTaskStatus: jest.fn(),
});

const mockUser = {
  id: '1',
  username: 'Test user',
  password: 'Test password',
  tasks: [],
};

describe('TasksController', () => {
  let tasksController: TasksController;
  let tasksService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TasksController],
      providers: [{ provide: TasksService, useFactory: mockTasksService }],
    }).compile();

    tasksController = module.get<TasksController>(TasksController);
    tasksService = module.get<TasksService>(TasksService);
  });

  describe('getTasks', () => {
    it('gets all tasks from the service', async () => {
      tasksService.getTasks.mockResolvedValue('someValue');
      const filterDto: GetTasksFilterDto = {
        status: TaskStatus.IN_PROGRESS,
        search: 'Some search query',
      };
      expect(tasksService.getTasks).not.toHaveBeenCalled();
      const result = await tasksController.getTasks(filterDto, mockUser);
      expect(tasksService.getTasks).toHaveBeenCalledWith(filterDto, mockUser);
      expect(result).toEqual('someValue');
    });
  });

  describe('getTaskById', () => {
    it('gets a task by ID from the service', async () => {
      const mockTask = { title: 'Test task', description: 'Test desc' };
      tasksService.getTaskById.mockResolvedValue(mockTask);
      const result = await tasksController.getTaskById('1', mockUser);
      expect(tasksService.getTaskById).toHaveBeenCalledWith('1', mockUser);
      expect(result).toEqual(mockTask);
    });
  });

  describe('createTask', () => {
    it('creates a task from the service', async () => {
      const mockTask = { title: 'Test task', description: 'Test desc' };
      const createTaskDto: CreateTaskDto = {
        title: 'Test task',
        description: 'Test desc',
      };
      tasksService.createTask.mockResolvedValue(mockTask);
      const result = await tasksController.createTask(createTaskDto, mockUser);
      expect(tasksService.createTask).toHaveBeenCalledWith(
        createTaskDto,
        mockUser,
      );
      expect(result).toEqual(mockTask);
    });
  });

  describe('deleteTask', () => {
    it('deletes a task from the service', async () => {
      tasksService.deleteTask.mockResolvedValue(null);
      await tasksController.deleteTask('1', mockUser);
      expect(tasksService.deleteTask).toHaveBeenCalledWith('1', mockUser);
    });
  });

  describe('updateTaskStatus', () => {
    it('updates a task status from the service', async () => {
      const mockTask = { status: TaskStatus.DONE };
      const updateTaskStatusDto: UpdateTaskStatusDto = {
        status: TaskStatus.DONE,
      };
      tasksService.updateTaskStatus.mockResolvedValue(mockTask);
      const result = await tasksController.updateTaskStatus(
        '1',
        updateTaskStatusDto,
        mockUser,
      );
      expect(tasksService.updateTaskStatus).toHaveBeenCalledWith(
        '1',
        TaskStatus.DONE,
        mockUser,
      );
      expect(result).toEqual(mockTask);
    });
  });
});
