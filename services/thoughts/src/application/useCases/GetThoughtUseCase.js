const { ThoughtDTO } = require('../dto/ThoughtDTO')
const { ForbiddenError } = require('../../shared/errors/ForbiddenError')

class GetThoughtUseCase {
    constructor(thoughtRepository) {
        this.thoughtRepository = thoughtRepository
    }

    async execute(thoughtId, userId) {
        const thought = await this.thoughtRepository.findById(thoughtId)

        // Verify ownership
        if (thought.userId !== userId) {
            throw new ForbiddenError('You do not have access to this thought')
        }

        return ThoughtDTO.fromEntity(thought)
    }
}

module.exports = { GetThoughtUseCase }

