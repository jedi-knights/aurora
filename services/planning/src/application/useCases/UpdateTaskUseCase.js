const { TaskDTO } = require('../dto/TaskDTO')
const { ForbiddenError } = require('../../shared/errors/ForbiddenError')

class UpdateTaskUseCase {
  constructor(taskRepository) {
    this.taskRepository = taskRepository
  }

  async execute({ id, userId, title, description, date, dueTime, category, priority }) {
    // Get existing task
    const task = await this.taskRepository.findById(id)

    // Verify ownership
    if (task.userId !== userId) {
      throw new ForbiddenError('You do not have access to this task')
    }

    // Update domain entity
    task.update({ title, description, date, dueTime, category, priority })

    // Persist
    const updatedTask = await this.taskRepository.update(task)

    return TaskDTO.fromEntity(updatedTask)
  }
}

module.exports = { UpdateTaskUseCase }

