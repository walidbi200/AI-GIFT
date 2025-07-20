// __tests__/validation.test.js

const { validateEmail } = require('../src/utils/validation');

describe('validateEmail', () => {
  it('returns true for a valid email address', () => {
    expect(validateEmail('user@example.com')).toBe(true);
  });

  it('returns false for an email without an @ symbol', () => {
    expect(validateEmail('userexample.com')).toBe(false);
  });

  it('returns false for an email without a top-level domain', () => {
    expect(validateEmail('user@example')).toBe(false);
  });

  it('returns false for an empty string', () => {
    expect(validateEmail('')).toBe(false);
  });

  it('returns false for null input', () => {
    expect(validateEmail(null)).toBe(false);
  });

  it('returns false for undefined input', () => {
    expect(validateEmail(undefined)).toBe(false);
  });
}); 