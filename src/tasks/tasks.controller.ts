import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { Task } from './tasks.model';
import { CreateTaskDto } from './dto/create-task.dto';
import { GetTasksFilterDto } from './dto/get-tasks-filter.dto';
import { UpdateTaskStatusDto } from './dto/update-tast-status.dto';

@Controller('tasks')
export class TasksController {
  constructor(private tasksService: TasksService) {}

  @Get()
  getTasks(@Query() filterDto: GetTasksFilterDto): Task[] {
    //If you want to return a specific task, you can use the getTaskById method from the service
    if (Object.keys(filterDto).length) {
      return this.tasksService.getTasksWithFilters(filterDto);
    } else {
      return this.tasksService.getAllTasks();
    }
  }

  @Get('/:id')
  getTaskById(@Param('id') id: string): Task {
    //try to get task by id
    //if task not found, return 404
    const found = this.tasksService.getTaskById(id);
    this.validateFound(found, id);
    //if task found, return task
    return found;
  }

  @Post()
  createTask(@Body() createTaskDto: CreateTaskDto): Task {
    return this.tasksService.createTask(createTaskDto);
  }

  @Delete('/:id')
  deleteTask(@Param('id') id: string): void {
    //try to get task by id
    //if task not found, return 404
    const found = this.tasksService.getTaskById(id);
    this.validateFound(found, id);
    //if task found, delete task
    this.tasksService.deleteTask(found.id);
  }

  @Patch('/:id/status')
  updateTaskStatus(
    @Param('id') id: string,
    @Body('status') updateTaskStatusDto: UpdateTaskStatusDto,
  ): Task {
    const { status } = updateTaskStatusDto;
    //try to get task by id
    //if task not found, return 404
    const found = this.tasksService.getTaskById(id);
    this.validateFound(found, id);
    //if task found, update task status
    return this.tasksService.updateTaskStatus(found.id, status);
  }

  private validateFound(found: Task, id: string) {
    if (!found) {
      throw new NotFoundException(`Task with ID "${id}" not found`);
    }
  }
}
