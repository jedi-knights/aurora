const { DomainError } = require('./DomainError')

class ForbiddenError extends DomainError {
  constructor(message = 'Access forbidden') {
    super(message)
    this.statusCode = 403
  }
}

module.exports = { ForbiddenError }

