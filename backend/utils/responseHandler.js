const successResponse = (res, data = {}, message = 'Success', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

const errorResponse = (res, message = 'An unexpected error occurred', statusCode = 500, code = 'INTERNAL_SERVER_ERROR', errors = null) => {
  const payload = {
    success: false,
    message,
    code,
  };
  if (errors) {
    payload.errors = errors;
  }
  return res.status(statusCode).json(payload);
};

const paginatedResponse = (
  res,
  data = [],
  pagination = { page: 1, limit: 20, total: 0, pages: 1 },
  message = 'Success',
  statusCode = 200
) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    pagination: {
      page: pagination.page,
      limit: pagination.limit,
      total: pagination.total,
      pages: pagination.pages || Math.ceil(pagination.total / pagination.limit) || 1,
    },
  });
};

module.exports = { successResponse, errorResponse, paginatedResponse };
