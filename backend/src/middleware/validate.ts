const AppError = require('../utils/AppError');

module.exports = (schema, source = 'body') => (req, res, next) => {
  const { value, error } = schema.validate(req[source], {
    abortEarly: false,
    stripUnknown: true
  });

  if (error) {
    const details = error.details.map((item) => ({
      message: item.message,
      path: item.path
    }));
    return next(new AppError('Validation failed', 400, 'VALIDATION_ERROR', details));
  }

  req[source] = value;
  return next();
};

export {};
