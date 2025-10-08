const { ValidationError } = require('../../shared/errors/ValidationError')

class Thought {
    constructor({ id, userId, text, timestamp, tags, createdAt, updatedAt }) {
        this.id = id
        this.userId = userId
        this.text = text
        this.timestamp = timestamp
        this.tags = tags || []
        this.createdAt = createdAt
        this.updatedAt = updatedAt
    }

    static create({ userId, text, tags = [] }) {
        this.validateText(text)
        this.validateTags(tags)

        return new Thought({
            id: this.generateId(),
            userId,
            text: text.trim(),
            timestamp: new Date(),
            tags: this.normalizeTags(tags),
            createdAt: new Date(),
            updatedAt: new Date()
        })
    }

    update({ text, tags }) {
        if (text !== undefined) {
            this.constructor.validateText(text)
            this.text = text.trim()
        }

        if (tags !== undefined) {
            this.constructor.validateTags(tags)
            this.tags = this.constructor.normalizeTags(tags)
        }

        this.updatedAt = new Date()
    }

    addTag(tag) {
        if (!tag || typeof tag !== 'string') {
            throw new ValidationError('Tag must be a non-empty string')
        }

        const normalizedTag = tag.toLowerCase().trim()

        if (!this.tags.includes(normalizedTag)) {
            this.tags.push(normalizedTag)
            this.updatedAt = new Date()
        }
    }

    removeTag(tag) {
        const normalizedTag = tag.toLowerCase().trim()
        this.tags = this.tags.filter(t => t !== normalizedTag)
        this.updatedAt = new Date()
    }

    // Validation - complexity ≤ 3 each
    static validateText(text) {
        if (!text || typeof text !== 'string') {
            throw new ValidationError('Text is required')
        }

        if (text.trim().length === 0) {
            throw new ValidationError('Text cannot be empty')
        }

        if (text.length > 10000) {
            throw new ValidationError('Text cannot exceed 10000 characters')
        }
    }

    static validateTags(tags) {
        if (!Array.isArray(tags)) {
            throw new ValidationError('Tags must be an array')
        }

        if (tags.length > 20) {
            throw new ValidationError('Cannot have more than 20 tags')
        }

        tags.forEach(tag => this.validateTag(tag))
    }

    static validateTag(tag) {
        if (typeof tag !== 'string') {
            throw new ValidationError('Each tag must be a string')
        }

        if (tag.length > 50) {
            throw new ValidationError('Tag cannot exceed 50 characters')
        }
    }

    static normalizeTags(tags) {
        return [...new Set(tags.map(tag => tag.toLowerCase().trim()))]
            .filter(tag => tag.length > 0)
    }

    static generateId() {
        return require('crypto').randomUUID()
    }

    toJSON() {
        return {
            id: this.id,
            userId: this.userId,
            text: this.text,
            timestamp: this.timestamp,
            tags: this.tags,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        }
    }
}

module.exports = { Thought }

