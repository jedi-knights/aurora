const { ForbiddenError } = require('../../shared/errors/ForbiddenError')

class DeleteThoughtUseCase {
    constructor(thoughtRepository) {
        this.thoughtRepository = thoughtRepository
    }

    async execute(thoughtId, userId) {
        // Get existing thought
        const thought = await this.thoughtRepository.findById(thoughtId)

        // Verify ownership
        if (thought.userId !== userId) {
            throw new ForbiddenError('You do not have access to this thought')
        }

        // Delete
        await this.thoughtRepository.delete(thoughtId)

        return true
    }
}

module.exports = { DeleteThoughtUseCase }

