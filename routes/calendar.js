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

  const successMessage = req.session?.successMessage ? [req.session.successMessage] : [];
  const errorMessage = req.session?.errorMessage || [];
  if (req.session?.successMessage) {
    delete req.session.successMessage;
  }
  if (req.session?.errorMessage) {
    delete req.session.errorMessage;
  }

  try {
    const events = await knex('events')
      .where('user_id', userId)
      .andWhere('event_date', '>=', monthStart)
      .andWhere('event_date', '<=', monthEnd)
      .orderBy('event_date', 'asc');

    const today = new Date().toISOString().slice(0, 10);
    const alerts = events.filter(function (event) {
      if (!event.notify_popup || !event.notify_popup_interval) {
        return false;
      }
      const diffInDays = Math.round((new Date(event.event_date) - new Date(today)) / 86400000);
      return (
        (event.notify_popup_interval === 'same_day' && diffInDays === 0) ||
        (event.notify_popup_interval === 'one_day_before' && diffInDays === 1) ||
        (event.notify_popup_interval === 'two_days_before' && diffInDays === 2)
      );
    }).map(function (event) {
      return {
        title: event.title,
        event_date: event.event_date,
        interval: event.notify_popup_interval,
      };
    });

    res.render('calendar', {
      title: 'Calendar',
      isAuth: true,
      selectedDate: validDate.toISOString().slice(0, 10),
      events: events,
      alerts: alerts,
      successMessage: successMessage,
      errorMessage: errorMessage,
    });
  } catch (err) {
    console.error(err);
    res.render('calendar', {
      title: 'Calendar',
      isAuth: true,
      selectedDate: validDate.toISOString().slice(0, 10),
      events: [],
      alerts: [],
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
  const selectedDate = req.body.date || eventDate || new Date().toISOString().slice(0, 10);
  const redirectUrl = '/calendar?date=' + encodeURIComponent(selectedDate);

  const notifyPopup = req.body.notify_popup === '1';
  const notifyEmail = req.body.notify_email === '1';
  const notifySms = req.body.notify_sms === '1';
  const notifyPopupInterval = notifyPopup ? req.body.notify_popup_interval : 'none';
  const notifyEmailInterval = notifyEmail ? req.body.notify_email_interval : 'none';
  const notifySmsInterval = notifySms ? req.body.notify_sms_interval : 'none';

  if (!title || !eventDate) {
    req.session.errorMessage = ['予定名と日時を入力してください'];
    return res.redirect(redirectUrl);
  }

  return knex('events')
    .insert({
      user_id: userId,
      title: title,
      description: description,
      event_date: eventDate,
      notify_popup: notifyPopup,
      notify_popup_interval: notifyPopupInterval,
      notify_email: notifyEmail,
      notify_email_interval: notifyEmailInterval,
      notify_sms: notifySms,
      notify_sms_interval: notifySmsInterval,
    })
    .then(function () {
      req.session.successMessage = '予定を追加しました';
      res.redirect(redirectUrl);
    })
    .catch(function (err) {
      console.error(err);
      req.session.errorMessage = [err.sqlMessage || '予定の追加に失敗しました'];
      res.redirect(redirectUrl);
    });
});

router.post('/delete', function (req, res, next) {
  if (!req.isAuthenticated()) {
    return res.redirect('/signin');
  }

  const userId = req.user.id;
  const eventId = req.body.id;
  const selectedDate = req.body.date || new Date().toISOString().slice(0, 10);
  const redirectUrl = '/calendar?date=' + encodeURIComponent(selectedDate);

  knex('events')
    .where({ id: eventId, user_id: userId })
    .del()
    .then(function () {
      req.session.successMessage = '予定を削除しました';
      res.redirect(redirectUrl);
    })
    .catch(function (err) {
      console.error(err);
      req.session.errorMessage = [err.sqlMessage || '予定の削除に失敗しました'];
      res.redirect(redirectUrl);
    });
});

module.exports = router;
