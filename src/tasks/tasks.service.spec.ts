import { Test } from '@nestjs/testing';
import { TasksService } from './tasks.service';
import { TasksRepository } from './tasks.repository';
import { TaskStatus } from './task-status.enum';
const mockRepository = () => ({
  getTasks: jest.fn(),
  findOne: jest.fn(),
  createTask: jest.fn(),
  delete: jest.fn(),
  save: jest.fn(async () => true),
});

const mockUser = {
  id: '12',
  username: 'Test user',
  password: 'Test password',
  tasks: [],
};
describe('Tasks Service', () => {
  let tasksService: TasksService;
  let tasksRepository;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        TasksService,
        {
          provide: TasksRepository,
          useFactory: mockRepository,
        },
      ],
    }).compile();

    tasksService = module.get<TasksService>(TasksService);
    tasksRepository = module.get<TasksRepository>(TasksRepository);
  });
  describe('getTasks', () => {
    it('gets all tasks from the repository', async () => {
      expect(tasksRepository.getTasks).not.toHaveBeenCalled();
      tasksRepository.getTasks.mockResolvedValue('someValue');
      const result = await tasksRepository.getTasks(null, mockUser);
      expect(tasksRepository.getTasks).toHaveBeenCalled();
      expect(result).toEqual('someValue');

      const filters = {
        status: TaskStatus.IN_PROGRESS,
        search: 'Some search query',
      };
      const res = await tasksService.getTasks(filters, mockUser);
      expect(tasksRepository.getTasks).toHaveBeenCalled();
      expect(res).toEqual('someValue');
    });
    it('get tasks by id from the repository', async () => {
      const mockTask = {
        title: 'Test task',
        description: 'Test desc',
      };
      tasksRepository.findOne.mockResolvedValue(mockTask);
      const result = await tasksService.getTaskById('1', mockUser);
      expect(result).toEqual(mockTask);
      expect(tasksRepository.findOne).toHaveBeenCalledWith({
        where: {
          id: '1',
          user: mockUser,
        },
      });
    });
    it('throws an error as task is not found', () => {
      tasksRepository.findOne.mockResolvedValue(null);
      expect(tasksService.getTaskById('1', mockUser)).rejects.toThrow();
    });
    it('create a task', async () => {
      const mockTask = {
        title: 'Test task',
        description: 'Test desc',
      };
      tasksRepository.createTask.mockResolvedValue(mockTask);
      const result = await tasksService.createTask(mockTask, mockUser);
      expect(result).toEqual(mockTask);
      expect(tasksRepository.createTask).toHaveBeenCalledWith(
        mockTask,
        mockUser,
      );
    });
    it('delete a task', async () => {
      tasksRepository.delete.mockResolvedValue({ affected: 1 });
      await tasksService.deleteTask('1', mockUser);
      expect(tasksRepository.delete).toHaveBeenCalledWith({
        id: '1',
        user: mockUser,
      });
    });
    it('throws an error as task could not be found', () => {
      tasksRepository.delete.mockResolvedValue({ affected: 0 });
      expect(tasksService.deleteTask('1', mockUser)).rejects.toThrow();
    });
    it('update task status', async () => {
      const save = jest.fn().mockResolvedValue(true);
      tasksService.getTaskById = jest.fn().mockResolvedValue({
        status: TaskStatus.OPEN,
        save,
      });
      expect(tasksService.getTaskById).not.toHaveBeenCalled();
      expect(save).not.toHaveBeenCalled();
      const result = await tasksService.updateTaskStatus(
        '1',
        TaskStatus.DONE,
        mockUser,
      );
      expect(tasksService.getTaskById).toHaveBeenCalled();
      await save();
      expect(save).toHaveBeenCalled();
      expect(result.status).toEqual(TaskStatus.DONE);
    });
  });
});
