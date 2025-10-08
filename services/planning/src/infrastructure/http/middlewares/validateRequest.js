const { validationResult } = require('express-validator')
const { ValidationError } = require('../../../shared/errors/ValidationError')

function validateRequest(req, res, next) {
  const errors = validationResult(req)
  
  if (!errors.isEmpty()) {
    const message = errors.array().map(err => err.msg).join(', ')
    throw new ValidationError(message)
  }
  
  next()
}

module.exports = { validateRequest }

