const { ThoughtDTO } = require('../dto/ThoughtDTO')
const { ValidationError } = require('../../shared/errors/ValidationError')

class SearchThoughtsUseCase {
    constructor(thoughtRepository) {
        this.thoughtRepository = thoughtRepository
    }

    async execute(userId, query) {
        if (!query || typeof query !== 'string') {
            throw new ValidationError('Search query is required')
        }

        if (query.trim().length === 0) {
            throw new ValidationError('Search query cannot be empty')
        }

        const thoughts = await this.thoughtRepository.search(userId, query)

        return thoughts.map(thought => ThoughtDTO.fromEntity(thought))
    }
}

module.exports = { SearchThoughtsUseCase }

