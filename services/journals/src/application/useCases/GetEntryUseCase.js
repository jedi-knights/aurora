const { EntryDTO } = require('../dto/EntryDTO')
const { ForbiddenError } = require('../../shared/errors/ForbiddenError')

class GetEntryUseCase {
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

        // Get entry
        const entry = await this.entryRepository.findById(entryId)

        // Verify entry belongs to journal
        if (entry.journalId !== journalId) {
            throw new ForbiddenError('Entry does not belong to this journal')
        }

        return EntryDTO.fromEntity(entry)
    }
}

module.exports = { GetEntryUseCase }

