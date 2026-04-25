const { ZodError } = require('zod')
const { errorResponse } = require('../utils/response')

function validateBody(schema) {
  return (req, res, next) => {
    try {
      req.body = schema.parse(req.body)
      next()
    } catch (error) {
      if (error instanceof ZodError) {
        const message = error.issues.map((issue) => issue.message).join(', ')
        return errorResponse(res, message, 400, 'VALIDATION_ERROR')
      }
      return errorResponse(res, 'Invalid request body', 400, 'VALIDATION_ERROR')
    }
  }
}

module.exports = {
  validateBody,
}
