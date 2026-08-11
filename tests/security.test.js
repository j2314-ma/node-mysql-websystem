const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');
const express = require('express');
const cookieSession = require('cookie-session');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const bcrypt = require('bcrypt');
const ejs = require('ejs');
const { sanitizeUsername, hashPassword } = require('../lib/security');
const signinRouter = require('../routes/signin');
const knexfile = require('../knexfile');

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

test('knex uses utf8mb4 for MySQL connections', () => {
  const config = knexfile.development;

  assert.equal(config.connection.charset, 'utf8mb4');
  assert.equal(config.connection.collation, 'utf8mb4_unicode_ci');
});

test('calendar template escapes script tags in alert JSON', async () => {
  const templatePath = path.join(__dirname, '..', 'views', 'calendar.ejs');
  const output = await ejs.renderFile(templatePath, {
    title: 'Calendar',
    isAuth: true,
    selectedDate: '2026-08-11',
    events: [],
    alerts: [{ title: '</script><script>alert(1)</script>', event_date: '2026-08-11', interval: 'same_day' }],
    successMessage: [],
    errorMessage: [],
  }, { filename: templatePath });

  assert.match(output, /\\u003c\/script\\u003e/);
  assert.doesNotMatch(output, /<script>alert\(1\)<\/script>/);
});

test('signin posts with invalid credentials without crashing', async () => {
  const app = express();
  app.set('views', path.join(__dirname, '..', 'views'));
  app.set('view engine', 'ejs');
  app.use(express.urlencoded({ extended: false }));
  app.use(cookieSession({ name: 'session', keys: ['test-secret'] }));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(new LocalStrategy(function (username, password, done) {
    done(null, false, { message: 'Invalid User' });
  }));

  app.use('/signin', signinRouter);

  const server = app.listen(0);
  const { port } = server.address();

  try {
    const response = await fetch(`http://127.0.0.1:${port}/signin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: 'username=test&password=wrong',
    });

    const text = await response.text();
    assert.equal(response.status, 200);
    assert.match(text, /Invalid User/);
  } finally {
    server.close();
  }
});
