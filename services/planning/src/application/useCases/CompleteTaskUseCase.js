const { TaskDTO } = require('../dto/TaskDTO')
const { ForbiddenError } = require('../../shared/errors/ForbiddenError')

class CompleteTaskUseCase {
  constructor(taskRepository) {
    this.taskRepository = taskRepository
  }

  async execute(taskId, userId) {
    // Get existing task
    const task = await this.taskRepository.findById(taskId)

    // Verify ownership
    if (task.userId !== userId) {
      throw new ForbiddenError('You do not have access to this task')
    }

    // Complete task
    task.complete()

    // Persist
    const updatedTask = await this.taskRepository.update(task)

    return TaskDTO.fromEntity(updatedTask)
  }
}

module.exports = { CompleteTaskUseCase }

