const express = require('express')
const { body, query, param } = require('express-validator')
const { validateRequest } = require('../middlewares/validateRequest')

function createThoughtRoutes(thoughtController, authMiddleware) {
    const router = express.Router()

    // All routes require authentication
    router.use(authMiddleware)

    // Create thought
    router.post(
        '/',
        [
            body('text').trim().isLength({ min: 1, max: 10000 }),
            body('tags').optional().isArray(),
            body('tags.*').optional().isString().isLength({ max: 50 }),
            validateRequest
        ],
        thoughtController.create
    )

    // Get all thoughts
    router.get(
        '/',
        [
            query('limit').optional().isInt({ min: 1, max: 100 }),
            query('offset').optional().isInt({ min: 0 }),
            query('tag').optional().isString(),
            query('sortBy').optional().isIn(['timestamp', 'createdAt']),
            query('order').optional().isIn(['asc', 'desc']),
            validateRequest
        ],
        thoughtController.getAll
    )

    // Search thoughts
    router.get(
        '/search',
        [
            query('q').notEmpty().trim(),
            validateRequest
        ],
        thoughtController.search
    )

    // Get one thought
    router.get(
        '/:id',
        [
            param('id').isUUID(),
            validateRequest
        ],
        thoughtController.getOne
    )

    // Update thought
    router.put(
        '/:id',
        [
            param('id').isUUID(),
            body('text').optional().trim().isLength({ min: 1, max: 10000 }),
            body('tags').optional().isArray(),
            body('tags.*').optional().isString().isLength({ max: 50 }),
            validateRequest
        ],
        thoughtController.update
    )

    // Delete thought
    router.delete(
        '/:id',
        [
            param('id').isUUID(),
            validateRequest
        ],
        thoughtController.delete
    )

    return router
}

module.exports = { createThoughtRoutes }

