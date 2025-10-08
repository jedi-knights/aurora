const { Task } = require('../../domain/entities/Task')
const { TaskDTO } = require('../dto/TaskDTO')

class CreateTaskUseCase {
  constructor(taskRepository) {
    this.taskRepository = taskRepository
  }

  async execute({ userId, title, description, date, dueTime, category, priority }) {
    // Create domain entity
    const task = Task.create({ 
      userId, 
      title, 
      description, 
      date, 
      dueTime, 
      category, 
      priority 
    })

    // Persist
    const savedTask = await this.taskRepository.save(task)

    // Return DTO
    return TaskDTO.fromEntity(savedTask)
  }
}

module.exports = { CreateTaskUseCase }

