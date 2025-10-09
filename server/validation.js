import validator from 'validator';

// Validate email format using validator package
export const validateEmail = (email) => {
  return validator.isEmail(email);
};

// Validate username: 3-20 characters, letters, numbers, underscore only
export const validateUsername = (username) => {
  return /^[a-zA-Z0-9_]{3,20}$/.test(username);
};

// Sanitize input to escape HTML special chars
export const sanitizeInput = (input) => {
  return validator.escape(input);
};

/**
 * Middleware factory to check required fields exist in req.body
 * @param {string[]} requiredFields
 */
export const validateFields = (requiredFields) => {
  return (req, res, next) => {
    for (const field of requiredFields) {
      if (!req.body[field]) {
        return res.status(400).json({ error: `Missing required field: ${field}` });
      }
    }
    next();
  };
};

export const validatePoolId = (poolId) => {
  // Accept both string and number, just check if it's a valid positive integer
  const id = typeof poolId === 'string' ? parseInt(poolId, 10) : poolId;
  return Number.isInteger(id) && id > 0;
};

export const validateGameId = (gameId) => {
  // Same fix for gameId
  const id = typeof gameId === 'string' ? parseInt(gameId, 10) : gameId;
  return Number.isInteger(id) && id > 0;
};

/**
 * Validate picks input for a pool
 * @param {Array} picks - Array of picks objects
 * @param {number} gameCount - Number of games expected in the pool
 * @returns {Object} - { valid: boolean, error?: string }
 */
export const validatePicks = (picks, gameCount) => {
  if (!Array.isArray(picks)) {
    return { valid: false, error: "Picks must be an array" };
  }

  if (picks.length !== gameCount) {
    return { valid: false, error: "Number of picks does not match number of games" };
  }

  for (const pick of picks) {
    if (
      !pick.hasOwnProperty("gameId") ||
      !pick.hasOwnProperty("selectedTeam") ||
      typeof pick.selectedTeam !== "string" ||
      (pick.confidencePoints !== undefined && typeof pick.confidencePoints !== "number")
    ) {
      return { valid: false, error: "Invalid pick format" };
    }
  }

  return { valid: true };
};

export const validateUserId = (userId) => {
  // Same fix for userId
  const id = typeof userId === 'string' ? parseInt(userId, 10) : userId;
  return Number.isInteger(id) && id > 0;
};

/**
 * Validate pagination query parameters `page` and `limit`
 * @param {string|number} page
 * @param {string|number} limit
 * @returns {Object} - { valid: boolean, page?: number, limit?: number }
 */
export const validatePagination = (page, limit) => {
  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);

  if (Number.isNaN(pageNum) || pageNum < 1) {
    return { valid: false };
  }
  if (Number.isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
    return { valid: false };
  }

  return { valid: true, page: pageNum, limit: limitNum };
};