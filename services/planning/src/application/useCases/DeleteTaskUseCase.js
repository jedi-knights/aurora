const { ForbiddenError } = require('../../shared/errors/ForbiddenError')

class DeleteTaskUseCase {
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

    // Delete
    await this.taskRepository.delete(taskId)

    return true
  }
}

module.exports = { DeleteTaskUseCase }

