const { logger } = require('../../../shared/logger/logger')

function errorHandler(err, req, res, next) {
    // Log error
    logger.error({
        message: err.message,
        stack: err.stack,
        path: req.path,
        method: req.method,
        body: req.body
    })

    // Default error
    let statusCode = err.statusCode || 500
    let message = err.message || 'Internal server error'

    // Handle specific error types
    if (err.name === 'ValidationError') {
        statusCode = 400
    } else if (err.name === 'AuthenticationError') {
        statusCode = 401
    } else if (err.name === 'NotFoundError') {
        statusCode = 404
    } else if (err.name === 'ConflictError') {
        statusCode = 409
    }

    // Send response
    res.status(statusCode).json({
        success: false,
        error: message
    })
}

module.exports = { errorHandler }

