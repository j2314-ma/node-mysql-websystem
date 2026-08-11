const express = require('express');
const router = express.Router();
const passport = require("passport");

router.get('/', function (req, res, next) {
  const isAuth = req.isAuthenticated();
  res.render("signin", {
    title: "Sign in",
    isAuth: isAuth,
  });
});

router.post('/', function (req, res, next) {
  passport.authenticate('local', function (err, user, info) {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.render('signin', {
        title: 'Sign in',
        isAuth: req.isAuthenticated(),
        errorMessage: [info && info.message ? info.message : 'Invalid User'],
      });
    }

    req.logIn(user, function (loginErr) {
      if (loginErr) {
        return next(loginErr);
      }
      return res.redirect('/');
    });
  })(req, res, next);
});

module.exports = router;