const { JournalDTO } = require('../dto/JournalDTO')
const { ForbiddenError } = require('../../shared/errors/ForbiddenError')

class UpdateJournalUseCase {
    constructor(journalRepository) {
        this.journalRepository = journalRepository
    }

    async execute({ id, userId, name, description, color, icon }) {
        // Get existing journal
        const journal = await this.journalRepository.findById(id)

        // Verify ownership
        if (journal.userId !== userId) {
            throw new ForbiddenError('You do not have access to this journal')
        }

        // Update domain entity
        journal.update({ name, description, color, icon })

        // Persist
        const updatedJournal = await this.journalRepository.update(journal)

        return JournalDTO.fromEntity(updatedJournal)
    }
}

module.exports = { UpdateJournalUseCase }

