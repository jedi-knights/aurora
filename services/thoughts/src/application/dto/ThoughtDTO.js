class ThoughtDTO {
    constructor({ id, userId, text, timestamp, tags, createdAt, updatedAt }) {
        this.id = id
        this.userId = userId
        this.text = text
        this.timestamp = timestamp
        this.tags = tags
        this.createdAt = createdAt
        this.updatedAt = updatedAt
    }

    static fromEntity(thought) {
        return new ThoughtDTO({
            id: thought.id,
            userId: thought.userId,
            text: thought.text,
            timestamp: thought.timestamp.toISOString(),
            tags: thought.tags,
            createdAt: thought.createdAt.toISOString(),
            updatedAt: thought.updatedAt.toISOString()
        })
    }
}

module.exports = { ThoughtDTO }

