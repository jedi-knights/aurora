const express = require('express')
const { body, query, param } = require('express-validator')
const { validateRequest } = require('../middlewares/validateRequest')

function createJournalRoutes(journalController, authMiddleware) {
    const router = express.Router()

    // All routes require authentication
    router.use(authMiddleware)

    // Create journal
    router.post(
        '/',
        [
            body('name').trim().isLength({ min: 1, max: 255 }),
            body('description').optional().trim().isLength({ max: 1000 }),
            body('color').optional().matches(/^#[0-9A-Fa-f]{6}$/),
            body('icon').optional().isString(),
            validateRequest
        ],
        journalController.create
    )

    // Get all journals
    router.get(
        '/',
        [
            query('includeArchived').optional().isBoolean(),
            query('limit').optional().isInt({ min: 1, max: 100 }),
            query('offset').optional().isInt({ min: 0 }),
            validateRequest
        ],
        journalController.getAll
    )

    // Get one journal
    router.get(
        '/:id',
        [
            param('id').isUUID(),
            validateRequest
        ],
        journalController.getOne
    )

    // Update journal
    router.put(
        '/:id',
        [
            param('id').isUUID(),
            body('name').optional().trim().isLength({ min: 1, max: 255 }),
            body('description').optional().trim().isLength({ max: 1000 }),
            body('color').optional().matches(/^#[0-9A-Fa-f]{6}$/),
            body('icon').optional().isString(),
            validateRequest
        ],
        journalController.update
    )

    // Delete journal
    router.delete(
        '/:id',
        [
            param('id').isUUID(),
            validateRequest
        ],
        journalController.delete
    )

    return router
}

module.exports = { createJournalRoutes }

