const { TaskDTO } = require('../dto/TaskDTO')
const { ForbiddenError } = require('../../shared/errors/ForbiddenError')

class GetTaskUseCase {
  constructor(taskRepository) {
    this.taskRepository = taskRepository
  }

  async execute(taskId, userId) {
    const task = await this.taskRepository.findById(taskId)

    // Verify ownership
    if (task.userId !== userId) {
      throw new ForbiddenError('You do not have access to this task')
    }

    return TaskDTO.fromEntity(task)
  }
}

module.exports = { GetTaskUseCase }

