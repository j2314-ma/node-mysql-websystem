const bcrypt = require('bcrypt');

function sanitizeUsername(value) {
  if (typeof value !== 'string') {
    return '';
  }
  return value.trim();
}

async function hashPassword(password) {
  const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS || 12);
  return bcrypt.hash(password, saltRounds);
}

module.exports = {
  sanitizeUsername,
  hashPassword,
};
