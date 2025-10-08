const express = require('express')
const { body, query, param } = require('express-validator')
const { validateRequest } = require('../middlewares/validateRequest')

function createTaskRoutes(taskController, authMiddleware) {
  const router = express.Router()

  // All routes require authentication
  router.use(authMiddleware)

  // Create task
  router.post(
    '/',
    [
      body('title').trim().isLength({ min: 1, max: 255 }),
      body('description').optional().trim().isLength({ max: 5000 }),
      body('date').isISO8601().toDate(),
      body('dueTime').optional().matches(/^([01]\d|2[0-3]):([0-5]\d)$/),
      body('category').optional().isIn(['todo', 'event']),
      body('priority').optional().isIn(['low', 'medium', 'high', 'urgent']),
      validateRequest
    ],
    taskController.create
  )

  // Get all tasks
  router.get(
    '/',
    [
      query('limit').optional().isInt({ min: 1, max: 100 }),
      query('offset').optional().isInt({ min: 0 }),
      query('completed').optional().isBoolean(),
      query('category').optional().isIn(['todo', 'event']),
      validateRequest
    ],
    taskController.getAll
  )

  // Get calendar view
  router.get(
    '/calendar',
    [
      query('start').isISO8601().toDate(),
      query('end').isISO8601().toDate(),
      validateRequest
    ],
    taskController.getCalendar
  )

  // Get one task
  router.get(
    '/:id',
    [
      param('id').isUUID(),
      validateRequest
    ],
    taskController.getOne
  )

  // Update task
  router.put(
    '/:id',
    [
      param('id').isUUID(),
      body('title').optional().trim().isLength({ min: 1, max: 255 }),
      body('description').optional().trim().isLength({ max: 5000 }),
      body('date').optional().isISO8601().toDate(),
      body('dueTime').optional().matches(/^([01]\d|2[0-3]):([0-5]\d)$/),
      body('category').optional().isIn(['todo', 'event']),
      body('priority').optional().isIn(['low', 'medium', 'high', 'urgent']),
      validateRequest
    ],
    taskController.update
  )

  // Complete task
  router.patch(
    '/:id/complete',
    [
      param('id').isUUID(),
      validateRequest
    ],
    taskController.complete
  )

  // Delete task
  router.delete(
    '/:id',
    [
      param('id').isUUID(),
      validateRequest
    ],
    taskController.delete
  )

  return router
}

module.exports = { createTaskRoutes }

