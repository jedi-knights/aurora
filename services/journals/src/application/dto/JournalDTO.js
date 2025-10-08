class JournalDTO {
    constructor({ id, userId, name, description, color, icon, settings, entryCount, createdAt, updatedAt }) {
        this.id = id
        this.userId = userId
        this.name = name
        this.description = description
        this.color = color
        this.icon = icon
        this.settings = settings
        this.entryCount = entryCount || 0
        this.createdAt = createdAt
        this.updatedAt = updatedAt
    }

    static fromEntity(journal) {
        return new JournalDTO({
            id: journal.id,
            userId: journal.userId,
            name: journal.name,
            description: journal.description,
            color: journal.color,
            icon: journal.icon,
            settings: journal.settings,
            createdAt: journal.createdAt.toISOString(),
            updatedAt: journal.updatedAt.toISOString()
        })
    }
}

module.exports = { JournalDTO }

