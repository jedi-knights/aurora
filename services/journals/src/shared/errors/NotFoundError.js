const { DomainError } = require('./DomainError')

class NotFoundError extends DomainError {
    constructor(entity, id) {
        super(`${entity} with id ${id} not found`)
        this.statusCode = 404
    }
}

module.exports = { NotFoundError }

