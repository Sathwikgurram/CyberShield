
export const notFound = (req, res, next) => {
  const error = new Error(`Route not found: ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

export const errorHandler = (err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  let statusCode = err.statusCode || 500;
  let message = err.message || "Something went wrong";
  let errors = err.errors || null;

  // MongoDB duplicate key error.
  if (err.code === 11000) {
    statusCode = 409;
    message = "A record with this value already exists";

    errors = Object.keys(err.keyValue || {}).map((field) => ({
      field,
      message: `${field} already exists`
    }));
  }

  // Mongoose document validation error.
  else if (err.name === "ValidationError") {
    statusCode = 400;
    message = "Database validation failed";

    errors = Object.values(err.errors).map((error) => ({
      field: error.path,
      message: error.message
    }));
  }

  // Mongoose invalid ObjectId or casting error.
  else if (err.name === "CastError") {
    statusCode = 400;
    message = "Invalid value provided";

    errors = [{
      field: err.path,
      message: err.message
    }];
  }

  // Hide internal server errors in production.
  if (statusCode >= 500 && process.env.NODE_ENV === "production") {
    message = "Internal server error";
    errors = null;
  }

  const response = {
    success: false,
    message
  };

  if (errors) {
    response.errors = errors;
  }

  res.status(statusCode).json(response);

  // Log unexpected server errors, not routine client errors.
  if (statusCode >= 500) {
    console.error("Server Error:", err);
  } else if (process.env.NODE_ENV !== "production") {
    console.warn(`${statusCode} - ${message}`);
  }
};
