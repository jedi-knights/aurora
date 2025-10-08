const { ITaskRepository } = require('../../../../domain/repositories/ITaskRepository')
const { Task } = require('../../../../domain/entities/Task')
const { NotFoundError } = require('../../../../shared/errors/NotFoundError')

class PostgresTaskRepository extends ITaskRepository {
  constructor(pool) {
    super()
    this.pool = pool
  }

  async save(task) {
    const query = `
      INSERT INTO tasks (id, user_id, title, description, date, due_time, 
                        completed, completed_at, category, priority, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *
    `
    const values = [
      task.id,
      task.userId,
      task.title,
      task.description,
      task.date,
      task.dueTime,
      task.completed,
      task.completedAt,
      task.category,
      task.priority,
      task.createdAt,
      task.updatedAt
    ]

    const result = await this.pool.query(query, values)
    return this.toDomain(result.rows[0])
  }

  async findById(id) {
    const query = 'SELECT * FROM tasks WHERE id = $1'
    const result = await this.pool.query(query, [id])

    if (result.rows.length === 0) {
      throw new NotFoundError('Task', id)
    }

    return this.toDomain(result.rows[0])
  }

  async findByUserId(userId, options = {}) {
    const {
      limit = 50,
      offset = 0,
      completed = null,
      category = null
    } = options

    let query = 'SELECT * FROM tasks WHERE user_id = $1'
    const values = [userId]
    let paramIndex = 2

    if (completed !== null) {
      query += ` AND completed = $${paramIndex}`
      values.push(completed)
      paramIndex++
    }

    if (category) {
      query += ` AND category = $${paramIndex}`
      values.push(category)
      paramIndex++
    }

    query += ' ORDER BY date DESC, created_at DESC'
    query += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`
    values.push(limit, offset)

    const result = await this.pool.query(query, values)
    return result.rows.map(row => this.toDomain(row))
  }

  async findByDateRange(userId, startDate, endDate) {
    const query = `
      SELECT * FROM tasks 
      WHERE user_id = $1 AND date >= $2 AND date <= $3
      ORDER BY date ASC, due_time ASC NULLS LAST
    `
    const result = await this.pool.query(query, [userId, startDate, endDate])
    return result.rows.map(row => this.toDomain(row))
  }

  async update(task) {
    const query = `
      UPDATE tasks 
      SET title = $1, description = $2, date = $3, due_time = $4,
          completed = $5, completed_at = $6, category = $7, priority = $8,
          updated_at = $9
      WHERE id = $10
      RETURNING *
    `
    const values = [
      task.title,
      task.description,
      task.date,
      task.dueTime,
      task.completed,
      task.completedAt,
      task.category,
      task.priority,
      task.updatedAt,
      task.id
    ]

    const result = await this.pool.query(query, values)

    if (result.rows.length === 0) {
      throw new NotFoundError('Task', task.id)
    }

    return this.toDomain(result.rows[0])
  }

  async delete(id) {
    const query = 'DELETE FROM tasks WHERE id = $1'
    const result = await this.pool.query(query, [id])

    if (result.rowCount === 0) {
      throw new NotFoundError('Task', id)
    }

    return true
  }

  async countByUserId(userId, filters = {}) {
    let query = 'SELECT COUNT(*) FROM tasks WHERE user_id = $1'
    const values = [userId]
    let paramIndex = 2

    if (filters.completed !== undefined) {
      query += ` AND completed = $${paramIndex}`
      values.push(filters.completed)
      paramIndex++
    }

    if (filters.category) {
      query += ` AND category = $${paramIndex}`
      values.push(filters.category)
    }

    const result = await this.pool.query(query, values)
    return parseInt(result.rows[0].count)
  }

  toDomain(row) {
    return new Task({
      id: row.id,
      userId: row.user_id,
      title: row.title,
      description: row.description,
      date: row.date,
      dueTime: row.due_time,
      completed: row.completed,
      completedAt: row.completed_at,
      category: row.category,
      priority: row.priority,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    })
  }
}

module.exports = { PostgresTaskRepository }

