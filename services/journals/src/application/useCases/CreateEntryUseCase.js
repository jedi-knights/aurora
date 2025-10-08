const { Entry } = require('../../domain/entities/Entry')
const { EntryDTO } = require('../dto/EntryDTO')
const { ForbiddenError } = require('../../shared/errors/ForbiddenError')

class CreateEntryUseCase {
    constructor(journalRepository, entryRepository) {
        this.journalRepository = journalRepository
        this.entryRepository = entryRepository
    }

    async execute({ userId, journalId, content, metadata }) {
        // Verify journal ownership
        const journal = await this.journalRepository.findById(journalId)

        if (journal.userId !== userId) {
            throw new ForbiddenError('You do not have access to this journal')
        }

        // Create entry
        const entry = Entry.create({ journalId, content, metadata })

        // Persist
        const savedEntry = await this.entryRepository.save(entry)

        return EntryDTO.fromEntity(savedEntry)
    }
}

module.exports = { CreateEntryUseCase }

