const express = require('express')
const { body } = require('express-validator')
const { validateRequest } = require('../middlewares/validateRequest')

function createAuthRoutes(authController) {
    const router = express.Router()

    // Register
    router.post(
        '/register',
        [
            body('email').isEmail().normalizeEmail(),
            body('password').isLength({ min: 8, max: 100 }),
            body('name').trim().isLength({ min: 2, max: 100 }),
            validateRequest
        ],
        authController.register
    )

    // Login
    router.post(
        '/login',
        [
            body('email').isEmail().normalizeEmail(),
            body('password').notEmpty(),
            validateRequest
        ],
        authController.login
    )

    // Verify token (for other services)
    router.get('/verify', authController.verify)

    return router
}

module.exports = { createAuthRoutes }

