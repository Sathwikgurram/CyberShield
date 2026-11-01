
import ApiError from "./ApiError.js";

export const parsePagination = (query) => {
  const parseNumber = (value, field, defaultValue, maxValue) => {
    if (value === undefined) return defaultValue;

    // Query parameters must be single strings.
    if (typeof value !== "string" || value.trim() === "") {
      throw new ApiError(400, `Invalid ${field} parameter`);
    }

    const number = Number(value);

    if (
      !Number.isInteger(number) ||
      number < 1 ||
      number > maxValue
    ) {
      throw new ApiError(
        400,
        `${field} must be an integer between 1 and ${maxValue}`
      );
    }

    return number;
  };

  return {
    pageNumber: parseNumber(query.page, "page", 1, 1000000),
    pageSize: parseNumber(query.limit, "limit", 10, 100)
  };
};

export const parseEnumFilter = (value, field, allowedValues) => {
  if (value === undefined) return undefined;

  if (
    typeof value !== "string" ||
    !allowedValues.includes(value)
  ) {
    throw new ApiError(
      400,
      `Invalid ${field}. Allowed values: ${allowedValues.join(", ")}`
    );
  }

  return value;
};

export const parseSearch = (value) => {
  if (value === undefined) return undefined;

  if (typeof value !== "string") {
    throw new ApiError(400, "Search must be a string");
  }

  const search = value.trim();

  if (search.length === 0) return undefined;

  if (search.length > 100) {
    throw new ApiError(400, "Search cannot exceed 100 characters");
  }

  return search;
};

// Escape regex special characters so search input is treated literally.
export const escapeRegex = (value) => {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};
