const { ValidationError } = require('../../shared/errors/ValidationError')
const bcrypt = require('bcrypt')

class User {
    constructor({ id, email, passwordHash, name, createdAt, updatedAt }) {
        this.id = id
        this.email = email
        this.passwordHash = passwordHash
        this.name = name
        this.createdAt = createdAt
        this.updatedAt = updatedAt
    }

    static async create({ email, password, name }) {
        this.validateEmail(email)
        this.validatePassword(password)
        this.validateName(name)

        const passwordHash = await this.hashPassword(password)

        return new User({
            id: this.generateId(),
            email: email.toLowerCase().trim(),
            passwordHash,
            name: name.trim(),
            createdAt: new Date(),
            updatedAt: new Date()
        })
    }

    async verifyPassword(password) {
        return await bcrypt.compare(password, this.passwordHash)
    }

    async changePassword(newPassword) {
        this.constructor.validatePassword(newPassword)
        this.passwordHash = await this.constructor.hashPassword(newPassword)
        this.updatedAt = new Date()
    }

    updateProfile({ name }) {
        if (name) {
            this.constructor.validateName(name)
            this.name = name.trim()
            this.updatedAt = new Date()
        }
    }

    // Validation methods - each with complexity ≤ 3
    static validateEmail(email) {
        if (!email || typeof email !== 'string') {
            throw new ValidationError('Email is required')
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(email)) {
            throw new ValidationError('Invalid email format')
        }
    }

    static validatePassword(password) {
        if (!password || typeof password !== 'string') {
            throw new ValidationError('Password is required')
        }

        if (password.length < 8) {
            throw new ValidationError('Password must be at least 8 characters')
        }

        if (password.length > 100) {
            throw new ValidationError('Password too long')
        }
    }

    static validateName(name) {
        if (!name || typeof name !== 'string') {
            throw new ValidationError('Name is required')
        }

        if (name.trim().length < 2) {
            throw new ValidationError('Name must be at least 2 characters')
        }

        if (name.length > 100) {
            throw new ValidationError('Name too long')
        }
    }

    // Utility methods
    static async hashPassword(password) {
        return await bcrypt.hash(password, 12)
    }

    static generateId() {
        return require('crypto').randomUUID()
    }

    // For serialization (exclude password)
    toJSON() {
        return {
            id: this.id,
            email: this.email,
            name: this.name,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        }
    }
}

module.exports = { User }

