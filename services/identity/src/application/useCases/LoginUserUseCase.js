const { UserDTO } = require('../dto/UserDTO')
const { AuthenticationError } = require('../../shared/errors/AuthenticationError')
const { TokenService } = require('../../shared/utils/TokenService')

class LoginUserUseCase {
    constructor(userRepository) {
        this.userRepository = userRepository
    }

    async execute({ email, password }) {
        // Find user
        const user = await this.userRepository.findByEmail(email)
        if (!user) {
            throw new AuthenticationError('Invalid email or password')
        }

        // Verify password
        const isValid = await user.verifyPassword(password)
        if (!isValid) {
            throw new AuthenticationError('Invalid email or password')
        }

        // Generate tokens
        const accessToken = TokenService.generateAccessToken(user)
        const refreshToken = TokenService.generateRefreshToken(user)

        return {
            user: UserDTO.fromEntity(user),
            accessToken,
            refreshToken
        }
    }
}

module.exports = { LoginUserUseCase }

