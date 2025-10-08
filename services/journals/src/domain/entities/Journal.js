const { ValidationError } = require('../../shared/errors/ValidationError')

class Journal {
    constructor({ id, userId, name, description, color, icon, settings, createdAt, updatedAt }) {
        this.id = id
        this.userId = userId
        this.name = name
        this.description = description
        this.color = color
        this.icon = icon
        this.settings = settings || {}
        this.createdAt = createdAt
        this.updatedAt = updatedAt
    }

    static create({ userId, name, description, color, icon }) {
        this.validateName(name)

        return new Journal({
            id: this.generateId(),
            userId,
            name: name.trim(),
            description: description?.trim() || '',
            color: color || '#667eea',
            icon: icon || '📔',
            settings: {
                isArchived: false,
                isPrivate: true
            },
            createdAt: new Date(),
            updatedAt: new Date()
        })
    }

    update({ name, description, color, icon }) {
        if (name !== undefined) {
            this.constructor.validateName(name)
            this.name = name.trim()
        }

        if (description !== undefined) {
            this.description = description.trim()
        }

        if (color !== undefined) {
            this.color = color
        }

        if (icon !== undefined) {
            this.icon = icon
        }

        this.updatedAt = new Date()
    }

    archive() {
        this.settings.isArchived = true
        this.updatedAt = new Date()
    }

    unarchive() {
        this.settings.isArchived = false
        this.updatedAt = new Date()
    }

    static validateName(name) {
        if (!name || typeof name !== 'string') {
            throw new ValidationError('Journal name is required')
        }

        if (name.trim().length === 0) {
            throw new ValidationError('Journal name cannot be empty')
        }

        if (name.length > 255) {
            throw new ValidationError('Journal name too long (max 255 characters)')
        }
    }

    static generateId() {
        return require('crypto').randomUUID()
    }

    toJSON() {
        return {
            id: this.id,
            userId: this.userId,
            name: this.name,
            description: this.description,
            color: this.color,
            icon: this.icon,
            settings: this.settings,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        }
    }
}

module.exports = { Journal }

