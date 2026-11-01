
import ApiError from "../utils/ApiError.js";

const validateRequest = (schema) => {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      return next(
        new ApiError(
          400,
          "Request validation failed",
          result.error.issues.map((issue) => ({
            field: issue.path.join("."),
            message: issue.message
          }))
        )
      );
    }

    req.validatedBody = result.data;
    next();
  };
};

export default validateRequest;
