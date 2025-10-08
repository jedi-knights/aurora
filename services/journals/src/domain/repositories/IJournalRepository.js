/**
 * Journal Repository Interface (Port)
 */
class IJournalRepository {
    async save(journal) {
        throw new Error('save method must be implemented')
    }

    async findById(id) {
        throw new Error('findById method must be implemented')
    }

    async findByUserId(userId, options = {}) {
        throw new Error('findByUserId method must be implemented')
    }

    async update(journal) {
        throw new Error('update method must be implemented')
    }

    async delete(id) {
        throw new Error('delete method must be implemented')
    }

    async getEntryCount(journalId) {
        throw new Error('getEntryCount method must be implemented')
    }
}

module.exports = { IJournalRepository }

