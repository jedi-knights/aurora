const { ValidationError } = require('../../shared/errors/ValidationError')

class Task {
  constructor({ id, userId, title, description, date, dueTime, completed, completedAt, category, priority, createdAt, updatedAt }) {
    this.id = id
    this.userId = userId
    this.title = title
    this.description = description
    this.date = date
    this.dueTime = dueTime
    this.completed = completed
    this.completedAt = completedAt
    this.category = category
    this.priority = priority
    this.createdAt = createdAt
    this.updatedAt = updatedAt
  }

  static create({ userId, title, description, date, dueTime, category = 'todo', priority = 'medium' }) {
    this.validateTitle(title)
    this.validateDate(date)
    this.validateCategory(category)
    this.validatePriority(priority)

    return new Task({
      id: this.generateId(),
      userId,
      title: title.trim(),
      description: description?.trim() || '',
      date: this.parseDate(date),
      dueTime: dueTime || null,
      completed: false,
      completedAt: null,
      category,
      priority,
      createdAt: new Date(),
      updatedAt: new Date()
    })
  }

  update({ title, description, date, dueTime, category, priority }) {
    if (title !== undefined) {
      this.constructor.validateTitle(title)
      this.title = title.trim()
    }

    if (description !== undefined) {
      this.description = description.trim()
    }

    if (date !== undefined) {
      this.constructor.validateDate(date)
      this.date = this.constructor.parseDate(date)
    }

    if (dueTime !== undefined) {
      this.dueTime = dueTime
    }

    if (category !== undefined) {
      this.constructor.validateCategory(category)
      this.category = category
    }

    if (priority !== undefined) {
      this.constructor.validatePriority(priority)
      this.priority = priority
    }

    this.updatedAt = new Date()
  }

  complete() {
    if (this.completed) return
    
    this.completed = true
    this.completedAt = new Date()
    this.updatedAt = new Date()
  }

  uncomplete() {
    if (!this.completed) return
    
    this.completed = false
    this.completedAt = null
    this.updatedAt = new Date()
  }

  // Validation methods - complexity ≤ 3 each
  static validateTitle(title) {
    if (!title || typeof title !== 'string') {
      throw new ValidationError('Title is required')
    }

    if (title.trim().length === 0) {
      throw new ValidationError('Title cannot be empty')
    }

    if (title.length > 255) {
      throw new ValidationError('Title too long (max 255 characters)')
    }
  }

  static validateDate(date) {
    if (!date) {
      throw new ValidationError('Date is required')
    }

    const parsed = new Date(date)
    if (isNaN(parsed.getTime())) {
      throw new ValidationError('Invalid date format')
    }
  }

  static validateCategory(category) {
    const validCategories = ['todo', 'event']
    if (!validCategories.includes(category)) {
      throw new ValidationError('Category must be "todo" or "event"')
    }
  }

  static validatePriority(priority) {
    const validPriorities = ['low', 'medium', 'high', 'urgent']
    if (!validPriorities.includes(priority)) {
      throw new ValidationError('Invalid priority level')
    }
  }

  static parseDate(dateString) {
    const date = new Date(dateString)
    // Return date at midnight UTC
    return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  }

  static generateId() {
    return require('crypto').randomUUID()
  }

  toJSON() {
    return {
      id: this.id,
      userId: this.userId,
      title: this.title,
      description: this.description,
      date: this.date.toISOString().split('T')[0],
      dueTime: this.dueTime,
      completed: this.completed,
      completedAt: this.completedAt,
      category: this.category,
      priority: this.priority,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    }
  }
}

module.exports = { Task }

