const { EntryDTO } = require('../dto/EntryDTO')
const { ForbiddenError } = require('../../shared/errors/ForbiddenError')

class UpdateEntryUseCase {
    constructor(journalRepository, entryRepository) {
        this.journalRepository = journalRepository
        this.entryRepository = entryRepository
    }

    async execute({ id, journalId, userId, content, metadata }) {
        // Verify journal ownership
        const journal = await this.journalRepository.findById(journalId)

        if (journal.userId !== userId) {
            throw new ForbiddenError('You do not have access to this journal')
        }

        // Get existing entry
        const entry = await this.entryRepository.findById(id)

        // Verify entry belongs to journal
        if (entry.journalId !== journalId) {
            throw new ForbiddenError('Entry does not belong to this journal')
        }

        // Update domain entity
        entry.update({ content, metadata })

        // Persist
        const updatedEntry = await this.entryRepository.update(entry)

        return EntryDTO.fromEntity(updatedEntry)
    }
}

module.exports = { UpdateEntryUseCase }

