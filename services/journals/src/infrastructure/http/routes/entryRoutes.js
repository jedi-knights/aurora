const express = require('express')
const { body, query, param } = require('express-validator')
const { validateRequest } = require('../middlewares/validateRequest')

function createEntryRoutes(entryController, authMiddleware) {
    const router = express.Router({ mergeParams: true })

    // All routes require authentication
    router.use(authMiddleware)

    // Create entry
    router.post(
        '/',
        [
            body('content').trim().isLength({ min: 1, max: 50000 }),
            body('metadata').optional().isObject(),
            body('metadata.mood').optional().isString(),
            body('metadata.weather').optional().isString(),
            body('metadata.location').optional().isString(),
            validateRequest
        ],
        entryController.create
    )

    // Get all entries for journal
    router.get(
        '/',
        [
            query('limit').optional().isInt({ min: 1, max: 100 }),
            query('offset').optional().isInt({ min: 0 }),
            query('sortBy').optional().isIn(['timestamp', 'createdAt']),
            query('order').optional().isIn(['asc', 'desc']),
            validateRequest
        ],
        entryController.getAll
    )

    // Get one entry
    router.get(
        '/:entryId',
        [
            param('entryId').isUUID(),
            validateRequest
        ],
        entryController.getOne
    )

    // Update entry
    router.put(
        '/:entryId',
        [
            param('entryId').isUUID(),
            body('content').optional().trim().isLength({ min: 1, max: 50000 }),
            body('metadata').optional().isObject(),
            validateRequest
        ],
        entryController.update
    )

    // Delete entry
    router.delete(
        '/:entryId',
        [
            param('entryId').isUUID(),
            validateRequest
        ],
        entryController.delete
    )

    return router
}

module.exports = { createEntryRoutes }

