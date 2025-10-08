const { ValidationError } = require('../../shared/errors/ValidationError')

class Entry {
    constructor({ id, journalId, content, timestamp, metadata, createdAt, updatedAt }) {
        this.id = id
        this.journalId = journalId
        this.content = content
        this.timestamp = timestamp
        this.metadata = metadata || {}
        this.createdAt = createdAt
        this.updatedAt = updatedAt
    }

    static create({ journalId, content, metadata = {} }) {
        this.validateContent(content)

        return new Entry({
            id: this.generateId(),
            journalId,
            content: content.trim(),
            timestamp: new Date(),
            metadata: {
                mood: metadata.mood || null,
                weather: metadata.weather || null,
                location: metadata.location || null,
                wordCount: this.calculateWordCount(content)
            },
            createdAt: new Date(),
            updatedAt: new Date()
        })
    }

    update({ content, metadata }) {
        if (content !== undefined) {
            this.constructor.validateContent(content)
            this.content = content.trim()
            this.metadata.wordCount = this.constructor.calculateWordCount(content)
        }

        if (metadata !== undefined) {
            if (metadata.mood !== undefined) this.metadata.mood = metadata.mood
            if (metadata.weather !== undefined) this.metadata.weather = metadata.weather
            if (metadata.location !== undefined) this.metadata.location = metadata.location
        }

        this.updatedAt = new Date()
    }

    static validateContent(content) {
        if (!content || typeof content !== 'string') {
            throw new ValidationError('Entry content is required')
        }

        if (content.trim().length === 0) {
            throw new ValidationError('Entry content cannot be empty')
        }

        if (content.length > 50000) {
            throw new ValidationError('Entry content too long (max 50000 characters)')
        }
    }

    static calculateWordCount(text) {
        return text.trim().split(/\s+/).length
    }

    static generateId() {
        return require('crypto').randomUUID()
    }

    toJSON() {
        return {
            id: this.id,
            journalId: this.journalId,
            content: this.content,
            timestamp: this.timestamp,
            metadata: this.metadata,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        }
    }
}

module.exports = { Entry }

