const { DomainError } = require('./DomainError')

class ConflictError extends DomainError {
    constructor(message) {
        super(message)
        this.statusCode = 409
    }
}

module.exports = { ConflictError }

