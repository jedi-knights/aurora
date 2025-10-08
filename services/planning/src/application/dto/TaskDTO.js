class TaskDTO {
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

  static fromEntity(task) {
    return new TaskDTO({
      id: task.id,
      userId: task.userId,
      title: task.title,
      description: task.description,
      date: task.date.toISOString().split('T')[0],
      dueTime: task.dueTime,
      completed: task.completed,
      completedAt: task.completedAt?.toISOString(),
      category: task.category,
      priority: task.priority,
      createdAt: task.createdAt.toISOString(),
      updatedAt: task.updatedAt.toISOString()
    })
  }
}

module.exports = { TaskDTO }

