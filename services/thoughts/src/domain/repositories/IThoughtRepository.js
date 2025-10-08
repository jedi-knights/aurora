/**
 * Thought Repository Interface (Port)
 * Defines the contract for thought persistence
 */
class IThoughtRepository {
    async save(thought) {
        throw new Error('save method must be implemented')
    }

    async findById(id) {
        throw new Error('findById method must be implemented')
    }

    async findByUserId(userId, options = {}) {
        throw new Error('findByUserId method must be implemented')
    }

    async findByTag(userId, tag, options = {}) {
        throw new Error('findByTag method must be implemented')
    }

    async search(userId, query) {
        throw new Error('search method must be implemented')
    }

    async update(thought) {
        throw new Error('update method must be implemented')
    }

    async delete(id) {
        throw new Error('delete method must be implemented')
    }

    async getUserTags(userId) {
        throw new Error('getUserTags method must be implemented')
    }
}

module.exports = { IThoughtRepository }

