const test = require('node:test');
const assert = require('node:assert/strict');
const bcrypt = require('bcrypt');
const { sanitizeUsername, hashPassword } = require('../lib/security');

test('sanitizeUsername trims whitespace', () => {
  assert.equal(sanitizeUsername('  alice  '), 'alice');
  assert.equal(sanitizeUsername(''), '');
});

test('hashPassword creates a bcrypt hash that matches the original password', async () => {
  const password = 'StrongPassword123!';
  const hash = await hashPassword(password);

  assert.notEqual(hash, password);
  assert.equal(await bcrypt.compare(password, hash), true);
});
