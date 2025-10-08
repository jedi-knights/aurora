const { BaseController } = require('./BaseController')

class TaskController extends BaseController {
  constructor({
    createTaskUseCase,
    getTaskUseCase,
    getTasksUseCase,
    updateTaskUseCase,
    deleteTaskUseCase,
    completeTaskUseCase,
    getCalendarUseCase
  }) {
    super()
    this.createTaskUseCase = createTaskUseCase
    this.getTaskUseCase = getTaskUseCase
    this.getTasksUseCase = getTasksUseCase
    this.updateTaskUseCase = updateTaskUseCase
    this.deleteTaskUseCase = deleteTaskUseCase
    this.completeTaskUseCase = completeTaskUseCase
    this.getCalendarUseCase = getCalendarUseCase
  }

  create = this.asyncHandler(async (req, res) => {
    const task = await this.createTaskUseCase.execute({
      userId: req.user.id,
      title: req.body.title,
      description: req.body.description,
      date: req.body.date,
      dueTime: req.body.dueTime,
      category: req.body.category,
      priority: req.body.priority
    })

    return this.handleSuccess(res, task, 201)
  })

  getAll = this.asyncHandler(async (req, res) => {
    const options = {
      limit: parseInt(req.query.limit) || 50,
      offset: parseInt(req.query.offset) || 0,
      completed: req.query.completed === 'true' ? true : req.query.completed === 'false' ? false : null,
      category: req.query.category
    }

    const tasks = await this.getTasksUseCase.execute(req.user.id, options)

    return this.handleSuccess(res, tasks)
  })

  getOne = this.asyncHandler(async (req, res) => {
    const task = await this.getTaskUseCase.execute(req.params.id, req.user.id)

    return this.handleSuccess(res, task)
  })

  update = this.asyncHandler(async (req, res) => {
    const task = await this.updateTaskUseCase.execute({
      id: req.params.id,
      userId: req.user.id,
      title: req.body.title,
      description: req.body.description,
      date: req.body.date,
      dueTime: req.body.dueTime,
      category: req.body.category,
      priority: req.body.priority
    })

    return this.handleSuccess(res, task)
  })

  delete = this.asyncHandler(async (req, res) => {
    await this.deleteTaskUseCase.execute(req.params.id, req.user.id)

    return this.handleSuccess(res, { message: 'Task deleted successfully' })
  })

  complete = this.asyncHandler(async (req, res) => {
    const task = await this.completeTaskUseCase.execute(req.params.id, req.user.id)

    return this.handleSuccess(res, task)
  })

  getCalendar = this.asyncHandler(async (req, res) => {
    const tasks = await this.getCalendarUseCase.execute(
      req.user.id,
      req.query.start,
      req.query.end
    )

    return this.handleSuccess(res, tasks)
  })
}

module.exports = { TaskController }

