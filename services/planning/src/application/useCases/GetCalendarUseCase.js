const { TaskDTO } = require('../dto/TaskDTO')
const { ValidationError } = require('../../shared/errors/ValidationError')

class GetCalendarUseCase {
  constructor(taskRepository) {
    this.taskRepository = taskRepository
  }

  async execute(userId, startDate, endDate) {
    // Validate dates
    if (!startDate || !endDate) {
      throw new ValidationError('Start and end dates are required')
    }

    const start = new Date(startDate)
    const end = new Date(endDate)

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw new ValidationError('Invalid date format')
    }

    if (end < start) {
      throw new ValidationError('End date must be after start date')
    }

    // Get tasks in date range
    const tasks = await this.taskRepository.findByDateRange(userId, start, end)

    return tasks.map(task => TaskDTO.fromEntity(task))
  }
}

module.exports = { GetCalendarUseCase }

