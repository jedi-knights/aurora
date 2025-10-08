const { JournalDTO } = require('../dto/JournalDTO')
const { ForbiddenError } = require('../../shared/errors/ForbiddenError')

class GetJournalUseCase {
    constructor(journalRepository) {
        this.journalRepository = journalRepository
    }

    async execute(journalId, userId) {
        const journal = await this.journalRepository.findById(journalId)

        // Verify ownership
        if (journal.userId !== userId) {
            throw new ForbiddenError('You do not have access to this journal')
        }

        const entryCount = await this.journalRepository.getEntryCount(journalId)
        const dto = JournalDTO.fromEntity(journal)
        dto.entryCount = entryCount

        return dto
    }
}

module.exports = { GetJournalUseCase }

