const { JournalDTO } = require('../dto/JournalDTO')

class GetJournalsUseCase {
    constructor(journalRepository) {
        this.journalRepository = journalRepository
    }

    async execute(userId, options = {}) {
        const journals = await this.journalRepository.findByUserId(userId, options)

        // Get entry counts for each journal
        const journalsWithCounts = await Promise.all(
            journals.map(async (journal) => {
                const entryCount = await this.journalRepository.getEntryCount(journal.id)
                const dto = JournalDTO.fromEntity(journal)
                dto.entryCount = entryCount
                return dto
            })
        )

        return journalsWithCounts
    }
}

module.exports = { GetJournalsUseCase }

