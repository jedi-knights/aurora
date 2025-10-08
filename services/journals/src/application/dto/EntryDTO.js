class EntryDTO {
    constructor({ id, journalId, content, timestamp, metadata, createdAt, updatedAt }) {
        this.id = id
        this.journalId = journalId
        this.content = content
        this.timestamp = timestamp
        this.metadata = metadata
        this.createdAt = createdAt
        this.updatedAt = updatedAt
    }

    static fromEntity(entry) {
        return new EntryDTO({
            id: entry.id,
            journalId: entry.journalId,
            content: entry.content,
            timestamp: entry.timestamp.toISOString(),
            metadata: entry.metadata,
            createdAt: entry.createdAt.toISOString(),
            updatedAt: entry.updatedAt.toISOString()
        })
    }
}

module.exports = { EntryDTO }

