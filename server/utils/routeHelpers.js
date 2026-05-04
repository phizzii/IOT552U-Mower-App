function asyncHandler(handler) {
  return async (req, res, next) => {
    try {
      await handler(req, res, next);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  };
}

function all(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) {
        return reject(err);
      }

      return resolve(rows);
    });
  });
}

function getOne(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) {
        return reject(err);
      }

      return resolve(row);
    });
  });
}

function run(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function onRun(err) {
      if (err) {
        return reject(err);
      }

      return resolve({
        lastID: this.lastID,
        changes: this.changes,
      });
    });
  });
}

function hasValue(value) {
  if (value === undefined || value === null) {
    return false;
  }

  if (typeof value === 'string') {
    return value.trim() !== '';
  }

  return true;
}

function normalizeText(value) {
  if (!hasValue(value)) {
    return null;
  }

  return String(value).trim();
}

function parseText(value, fieldName, errors, options = {}) {
  const { required = false } = options;
  const normalizedValue = normalizeText(value);

  if (normalizedValue === null) {
    if (required) {
      errors.push(`${fieldName} is required`);
    }

    return null;
  }

  return normalizedValue;
}

function validateRequired(body, fields) {
  return fields
    .filter((field) => !hasValue(body[field]))
    .map((field) => `${field} is required`);
}

function parseInteger(value, fieldName, errors, options = {}) {
  const { required = false, min = Number.MIN_SAFE_INTEGER } = options;

  if (!hasValue(value)) {
    if (required) {
      errors.push(`${fieldName} is required`);
    }

    return null;
  }

  const parsedValue = Number(value);

  if (!Number.isInteger(parsedValue)) {
    errors.push(`${fieldName} must be an integer`);
    return null;
  }

  if (parsedValue < min) {
    errors.push(`${fieldName} must be at least ${min}`);
    return null;
  }

  return parsedValue;
}

function parseNumber(value, fieldName, errors, options = {}) {
  const { required = false, min = -Infinity } = options;

  if (!hasValue(value)) {
    if (required) {
      errors.push(`${fieldName} is required`);
    }

    return null;
  }

  const parsedValue = Number(value);

  if (!Number.isFinite(parsedValue)) {
    errors.push(`${fieldName} must be a valid number`);
    return null;
  }

  if (parsedValue < min) {
    errors.push(`${fieldName} must be at least ${min}`);
    return null;
  }

  return parsedValue;
}

function parseDate(value, fieldName, errors, options = {}) {
  const { required = false } = options;
  const isoDatePattern = /^\d{4}-\d{2}-\d{2}$/;

  if (!hasValue(value)) {
    if (required) {
      errors.push(`${fieldName} is required`);
    }

    return null;
  }

  const normalizedValue = String(value).trim();

  if (!isoDatePattern.test(normalizedValue)) {
    errors.push(`${fieldName} must use YYYY-MM-DD format`);
    return null;
  }

  return normalizedValue;
}

function validateIdParam(value, fieldName = 'id') {
  const errors = [];
  const id = parseInteger(value, fieldName, errors, { required: true, min: 1 });

  return { errors, id };
}

function sendValidationErrors(res, errors) {
  if (errors.length === 0) {
    return false;
  }

  return res.status(400).json({ errors });
}

module.exports = {
  all,
  asyncHandler,
  getOne,
  normalizeText,
  parseText,
  parseDate,
  parseInteger,
  parseNumber,
  run,
  sendValidationErrors,
  validateIdParam,
  validateRequired,
};
