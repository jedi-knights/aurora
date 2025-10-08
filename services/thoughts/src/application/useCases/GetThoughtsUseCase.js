const { ThoughtDTO } = require('../dto/ThoughtDTO')

class GetThoughtsUseCase {
    constructor(thoughtRepository) {
        this.thoughtRepository = thoughtRepository
    }

    async execute(userId, options = {}) {
        const {
            limit = 50,
            offset = 0,
            tag = null,
            sortBy = 'timestamp',
            order = 'desc'
        } = options

        let thoughts

        if (tag) {
            thoughts = await this.thoughtRepository.findByTag(userId, tag, options)
        } else {
            thoughts = await this.thoughtRepository.findByUserId(userId, options)
        }

        return thoughts.map(thought => ThoughtDTO.fromEntity(thought))
    }
}

module.exports = { GetThoughtsUseCase }

