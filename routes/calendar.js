const express = require('express');
const router = express.Router();
const knex = require('../db/knex');

router.get('/', async function (req, res, next) {
  if (!req.isAuthenticated()) {
    return res.redirect('/signin');
  }

  const userId = req.user.id;
  const selectedDate = req.query.date || new Date().toISOString().slice(0, 10);
  const dateObject = new Date(selectedDate);
  const validDate = Number.isNaN(dateObject.getTime()) ? new Date() : dateObject;

  const year = validDate.getFullYear();
  const month = validDate.getMonth();
  const monthStart = new Date(year, month, 1).toISOString().slice(0, 10);
  const monthEnd = new Date(year, month + 1, 0).toISOString().slice(0, 10);

  try {
    const events = await knex('events')
      .where('user_id', userId)
      .andWhere('event_date', '>=', monthStart)
      .andWhere('event_date', '<=', monthEnd)
      .orderBy('event_date', 'asc');

    res.render('calendar', {
      title: 'Calendar',
      isAuth: true,
      selectedDate: validDate.toISOString().slice(0, 10),
      events: events,
      successMessage: req.session?.successMessage ? [req.session.successMessage] : [],
      errorMessage: [],
    });
    if (req.session?.successMessage) {
      delete req.session.successMessage;
    }
  } catch (err) {
    console.error(err);
    res.render('calendar', {
      title: 'Calendar',
      isAuth: true,
      selectedDate: validDate.toISOString().slice(0, 10),
      events: [],
      errorMessage: [err.sqlMessage || '予定の読み込みに失敗しました'],
      successMessage: [],
    });
  }
});

router.post('/add', function (req, res, next) {
  if (!req.isAuthenticated()) {
    return res.redirect('/signin');
  }

  const userId = req.user.id;
  const title = req.body.title?.trim();
  const description = req.body.description?.trim() || null;
  const eventDate = req.body.event_date;

  if (!title || !eventDate) {
    req.session.successMessage = null;
    return res.render('calendar', {
      title: 'Calendar',
      isAuth: true,
      selectedDate: eventDate || new Date().toISOString().slice(0, 10),
      events: [],
      errorMessage: ['予定名と日時を入力してください'],
      successMessage: [],
    });
  }

  knex('events')
    .insert({ user_id: userId, title: title, description: description, event_date: eventDate })
    .then(function () {
      req.session.successMessage = '予定を追加しました';
      res.redirect('/calendar');
    })
    .catch(function (err) {
      console.error(err);
      res.render('calendar', {
        title: 'Calendar',
        isAuth: true,
        selectedDate: eventDate,
        events: [],
        errorMessage: [err.sqlMessage || '予定の追加に失敗しました'],
        successMessage: [],
      });
    });
});

router.post('/delete', function (req, res, next) {
  if (!req.isAuthenticated()) {
    return res.redirect('/signin');
  }

  const userId = req.user.id;
  const eventId = req.body.id;

  knex('events')
    .where({ id: eventId, user_id: userId })
    .del()
    .then(function () {
      req.session.successMessage = '予定を削除しました';
      res.redirect('/calendar');
    })
    .catch(function (err) {
      console.error(err);
      res.render('calendar', {
        title: 'Calendar',
        isAuth: true,
        selectedDate: new Date().toISOString().slice(0, 10),
        events: [],
        errorMessage: [err.sqlMessage || '予定の削除に失敗しました'],
        successMessage: [],
      });
    });
});

module.exports = router;
