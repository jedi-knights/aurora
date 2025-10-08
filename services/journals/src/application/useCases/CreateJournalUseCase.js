const { Journal } = require('../../domain/entities/Journal')
const { JournalDTO } = require('../dto/JournalDTO')

class CreateJournalUseCase {
    constructor(journalRepository) {
        this.journalRepository = journalRepository
    }

    async execute({ userId, name, description, color, icon }) {
        // Create domain entity
        const journal = Journal.create({ userId, name, description, color, icon })

        // Persist
        const savedJournal = await this.journalRepository.save(journal)

        // Return DTO
        return JournalDTO.fromEntity(savedJournal)
    }
}

module.exports = { CreateJournalUseCase }

