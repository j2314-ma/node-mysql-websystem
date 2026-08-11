const environment = "development";
const config = require("../knexfile.js")[environment];
const knex = require("knex")(config);

knex.schema.hasTable('tasks').then(function (exists) {
  if (!exists) {
    return knex.schema.createTable('tasks', function (table) {
      table.increments('id');
      table.integer('user_id').unsigned().notNullable();
      table.string('content', 255).notNullable();
    }).raw("ALTER TABLE tasks CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
  }
}).catch(function (err) {
  console.error('Error ensuring tasks table exists:', err);
});

knex.schema.hasTable('events').then(function (exists) {
  if (!exists) {
    return knex.schema.createTable('events', function (table) {
      table.increments('id');
      table.integer('user_id').unsigned().notNullable();
      table.string('title', 255).notNullable();
      table.text('description').nullable();
      table.date('event_date').notNullable();
      table.boolean('notify_popup').notNullable().defaultTo(false);
      table.string('notify_popup_interval', 20).notNullable().defaultTo('none');
      table.boolean('notify_email').notNullable().defaultTo(false);
      table.string('notify_email_interval', 20).notNullable().defaultTo('none');
      table.boolean('notify_sms').notNullable().defaultTo(false);
      table.string('notify_sms_interval', 20).notNullable().defaultTo('none');
      table.timestamp('created_at').defaultTo(knex.fn.now());
    }).raw("ALTER TABLE events CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
  }
  return Promise.all([
    knex.schema.hasColumn('events', 'notify_popup').then(function (exists) {
      if (!exists) {
        return knex.schema.table('events', function (table) {
          table.boolean('notify_popup').notNullable().defaultTo(false);
        });
      }
    }),
    knex.schema.hasColumn('events', 'notify_popup_interval').then(function (exists) {
      if (!exists) {
        return knex.schema.table('events', function (table) {
          table.string('notify_popup_interval', 20).notNullable().defaultTo('none');
        });
      }
    }),
    knex.schema.hasColumn('events', 'notify_email').then(function (exists) {
      if (!exists) {
        return knex.schema.table('events', function (table) {
          table.boolean('notify_email').notNullable().defaultTo(false);
        });
      }
    }),
    knex.schema.hasColumn('events', 'notify_email_interval').then(function (exists) {
      if (!exists) {
        return knex.schema.table('events', function (table) {
          table.string('notify_email_interval', 20).notNullable().defaultTo('none');
        });
      }
    }),
    knex.schema.hasColumn('events', 'notify_sms').then(function (exists) {
      if (!exists) {
        return knex.schema.table('events', function (table) {
          table.boolean('notify_sms').notNullable().defaultTo(false);
        });
      }
    }),
    knex.schema.hasColumn('events', 'notify_sms_interval').then(function (exists) {
      if (!exists) {
        return knex.schema.table('events', function (table) {
          table.string('notify_sms_interval', 20).notNullable().defaultTo('none');
        });
      }
    }),
  ]);
}).then(function () {
  return knex.raw("ALTER TABLE events CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
}).catch(function (err) {
  console.error('Error ensuring events table exists:', err);
});

module.exports = knex;