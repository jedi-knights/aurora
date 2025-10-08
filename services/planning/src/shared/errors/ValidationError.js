const { DomainError } = require('./DomainError')

class ValidationError extends DomainError {
  constructor(message) {
    super(message)
    this.statusCode = 400
  }
}

module.exports = { ValidationError }

