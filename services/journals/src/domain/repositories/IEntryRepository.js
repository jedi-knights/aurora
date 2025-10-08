/**
 * Entry Repository Interface (Port)
 */
class IEntryRepository {
    async save(entry) {
        throw new Error('save method must be implemented')
    }

    async findById(id) {
        throw new Error('findById method must be implemented')
    }

    async findByJournalId(journalId, options = {}) {
        throw new Error('findByJournalId method must be implemented')
    }

    async update(entry) {
        throw new Error('update method must be implemented')
    }

    async delete(id) {
        throw new Error('delete method must be implemented')
    }

    async deleteByJournalId(journalId) {
        throw new Error('deleteByJournalId method must be implemented')
    }

    async countByJournalId(journalId) {
        throw new Error('countByJournalId method must be implemented')
    }
}

module.exports = { IEntryRepository }

