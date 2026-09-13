const { errorResponse } = require('../utils/responseHandler');

const validate = (schema) => (req, res, next) => {
  try {
    const validated = schema.parse({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    if (validated.body) req.body = validated.body;
    if (validated.query) req.query = validated.query;
    if (validated.params) req.params = validated.params;
    next();
  } catch (error) {
    const errorDetails = error.errors?.map((err) => ({
      field: err.path.join('.'),
      message: err.message,
    })) || [{ message: error.message }];
    return errorResponse(res, 'Validation failed for request data', 422, 'VALIDATION_ERROR', errorDetails);
  }
};

module.exports = { validate };
