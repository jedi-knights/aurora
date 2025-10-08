const { EntryDTO } = require('../dto/EntryDTO')
const { ForbiddenError } = require('../../shared/errors/ForbiddenError')

class GetEntriesUseCase {
    constructor(journalRepository, entryRepository) {
        this.journalRepository = journalRepository
        this.entryRepository = entryRepository
    }

    async execute(userId, journalId, options = {}) {
        // Verify journal ownership
        const journal = await this.journalRepository.findById(journalId)

        if (journal.userId !== userId) {
            throw new ForbiddenError('You do not have access to this journal')
        }

        // Get entries
        const entries = await this.entryRepository.findByJournalId(journalId, options)

        return entries.map(entry => EntryDTO.fromEntity(entry))
    }
}

module.exports = { GetEntriesUseCase }

