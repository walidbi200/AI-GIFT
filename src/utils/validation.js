// src/utils/validation.js

/**
 * Validates whether a string is a valid email address.
 * @param {string} email - The email address to validate.
 * @returns {boolean} True if valid, false otherwise.
 */
function validateEmail(email) {
  if (typeof email !== 'string') return false;
  // Simple regex for demonstration; not RFC-complete
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

module.exports = { validateEmail }; 