const { ForbiddenError } = require('../../shared/errors/ForbiddenError')

class DeleteEntryUseCase {
    constructor(journalRepository, entryRepository) {
        this.journalRepository = journalRepository
        this.entryRepository = entryRepository
    }

    async execute(entryId, journalId, userId) {
        // Verify journal ownership
        const journal = await this.journalRepository.findById(journalId)

        if (journal.userId !== userId) {
            throw new ForbiddenError('You do not have access to this journal')
        }

        // Get entry to verify it belongs to this journal
        const entry = await this.entryRepository.findById(entryId)

        if (entry.journalId !== journalId) {
            throw new ForbiddenError('Entry does not belong to this journal')
        }

        // Delete entry
        await this.entryRepository.delete(entryId)

        return true
    }
}

module.exports = { DeleteEntryUseCase }

