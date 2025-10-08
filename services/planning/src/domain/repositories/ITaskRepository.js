/**
 * Task Repository Interface (Port)
 */
class ITaskRepository {
  async save(task) {
    throw new Error('save method must be implemented')
  }

  async findById(id) {
    throw new Error('findById method must be implemented')
  }

  async findByUserId(userId, options = {}) {
    throw new Error('findByUserId method must be implemented')
  }

  async findByDateRange(userId, startDate, endDate) {
    throw new Error('findByDateRange method must be implemented')
  }

  async update(task) {
    throw new Error('update method must be implemented')
  }

  async delete(id) {
    throw new Error('delete method must be implemented')
  }

  async countByUserId(userId, filters = {}) {
    throw new Error('countByUserId method must be implemented')
  }
}

module.exports = { ITaskRepository }

