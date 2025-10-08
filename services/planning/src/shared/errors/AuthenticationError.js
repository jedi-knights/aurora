const { DomainError } = require('./DomainError')

class AuthenticationError extends DomainError {
  constructor(message = 'Authentication failed') {
    super(message)
    this.statusCode = 401
  }
}

module.exports = { AuthenticationError }

