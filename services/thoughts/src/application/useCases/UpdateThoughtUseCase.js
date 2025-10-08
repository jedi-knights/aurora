const { ThoughtDTO } = require('../dto/ThoughtDTO')
const { ForbiddenError } = require('../../shared/errors/ForbiddenError')

class UpdateThoughtUseCase {
    constructor(thoughtRepository) {
        this.thoughtRepository = thoughtRepository
    }

    async execute({ id, userId, text, tags }) {
        // Get existing thought
        const thought = await this.thoughtRepository.findById(id)

        // Verify ownership
        if (thought.userId !== userId) {
            throw new ForbiddenError('You do not have access to this thought')
        }

        // Update domain entity
        thought.update({ text, tags })

        // Persist
        const updatedThought = await this.thoughtRepository.update(thought)

        return ThoughtDTO.fromEntity(updatedThought)
    }
}

module.exports = { UpdateThoughtUseCase }

