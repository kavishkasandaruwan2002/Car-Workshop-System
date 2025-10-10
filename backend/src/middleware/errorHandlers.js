import { StatusCodes, getReasonPhrase } from 'http-status-codes';

export function notFoundHandler(req, res, next) {
  res.status(StatusCodes.NOT_FOUND).json({
    success: false,
    message: 'Route not found'
  });
}

export function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  const status = err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
  const message = err.message || getReasonPhrase(status);
  const details = process.env.NODE_ENV === 'development' ? err.stack : undefined;
  res.status(status).json({ success: false, message, details });
}


