const { User } = require('../../domain/entities/User')
const { UserDTO } = require('../dto/UserDTO')
const { ConflictError } = require('../../shared/errors/ConflictError')

class RegisterUserUseCase {
    constructor(userRepository) {
        this.userRepository = userRepository
    }

    async execute({ email, password, name }) {
        // Check if email already exists
        const exists = await this.userRepository.existsByEmail(email)
        if (exists) {
            throw new ConflictError('Email already registered')
        }

        // Create user entity
        const user = await User.create({ email, password, name })

        // Persist
        const savedUser = await this.userRepository.save(user)

        // Return DTO (without password)
        return UserDTO.fromEntity(savedUser)
    }
}

module.exports = { RegisterUserUseCase }

