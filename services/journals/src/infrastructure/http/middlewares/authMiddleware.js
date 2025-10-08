const axios = require('axios')
const config = require('../../../config')
const { AuthenticationError } = require('../../../shared/errors/AuthenticationError')
const { logger } = require('../../../shared/logger/logger')

async function authMiddleware(req, res, next) {
    try {
        // Extract token from Authorization header
        const authHeader = req.headers.authorization

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new AuthenticationError('No token provided')
        }

        const token = authHeader.substring(7)

        // Verify token with Identity service
        const response = await axios.get(`${config.identityServiceUrl}/auth/verify`, {
            headers: { Authorization: `Bearer ${token}` }
        })

        // Add user to request
        req.user = response.data.user

        next()
    } catch (error) {
        if (error.response?.status === 401) {
            return next(new AuthenticationError('Invalid or expired token'))
        }

        logger.error('Auth middleware error:', error)
        next(new AuthenticationError('Authentication failed'))
    }
}

module.exports = { authMiddleware }

