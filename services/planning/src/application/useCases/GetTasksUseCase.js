const { TaskDTO } = require('../dto/TaskDTO')

class GetTasksUseCase {
  constructor(taskRepository) {
    this.taskRepository = taskRepository
  }

  async execute(userId, options = {}) {
    const tasks = await this.taskRepository.findByUserId(userId, options)
    return tasks.map(task => TaskDTO.fromEntity(task))
  }
}

module.exports = { GetTasksUseCase }

