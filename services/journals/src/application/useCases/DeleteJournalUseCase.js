const { ForbiddenError } = require('../../shared/errors/ForbiddenError')

class DeleteJournalUseCase {
    constructor(journalRepository) {
        this.journalRepository = journalRepository
    }

    async execute(journalId, userId) {
        // Verify ownership
        const journal = await this.journalRepository.findById(journalId)

        if (journal.userId !== userId) {
            throw new ForbiddenError('You do not have access to this journal')
        }

        // Delete journal (and all entries - handled in repository)
        await this.journalRepository.delete(journalId)

        return true
    }
}

module.exports = { DeleteJournalUseCase }

