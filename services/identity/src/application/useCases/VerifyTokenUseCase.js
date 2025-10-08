const { TokenService } = require('../../shared/utils/TokenService')
const { UserDTO } = require('../dto/UserDTO')

class VerifyTokenUseCase {
    constructor(userRepository) {
        this.userRepository = userRepository
    }

    async execute(token) {
        // Verify and decode token
        const decoded = TokenService.verifyToken(token)

        // Get user from database
        const user = await this.userRepository.findById(decoded.id)

        return UserDTO.fromEntity(user)
    }
}

module.exports = { VerifyTokenUseCase }

