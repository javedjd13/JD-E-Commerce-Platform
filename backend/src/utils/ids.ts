import AppError = require("./AppError");

export function readPositiveInt(
  value: unknown,
  label = "Resource",
  code = "INVALID_ID",
) {
  const id = Number(value);

  if (!Number.isInteger(id) || id < 1) {
    throw new AppError(`${label} id must be a positive integer`, 400, code);
  }

  return id;
}
