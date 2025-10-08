const jwt = require('jsonwebtoken')
const config = require('../../config')

class TokenService {
    static generateAccessToken(user) {
        return jwt.sign(
            {
                id: user.id,
                email: user.email
            },
            config.jwtSecret,
            { expiresIn: config.jwtExpiry }
        )
    }

    static generateRefreshToken(user) {
        return jwt.sign(
            {
                id: user.id
            },
            config.jwtSecret,
            { expiresIn: config.refreshTokenExpiry }
        )
    }

    static verifyToken(token) {
        try {
            return jwt.verify(token, config.jwtSecret)
        } catch (error) {
            throw new Error('Invalid token')
        }
    }
}

module.exports = { TokenService }

