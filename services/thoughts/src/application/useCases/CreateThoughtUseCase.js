const { Thought } = require('../../domain/entities/Thought')
const { ThoughtDTO } = require('../dto/ThoughtDTO')

class CreateThoughtUseCase {
    constructor(thoughtRepository) {
        this.thoughtRepository = thoughtRepository
    }

    async execute({ userId, text, tags }) {
        // Create domain entity
        const thought = Thought.create({ userId, text, tags })

        // Persist
        const savedThought = await this.thoughtRepository.save(thought)

        // Return DTO
        return ThoughtDTO.fromEntity(savedThought)
    }
}

module.exports = { CreateThoughtUseCase }

