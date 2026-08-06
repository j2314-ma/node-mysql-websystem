const environment = "development";
const config = require("../knexfile.js")[environment];
const knex = require("knex")(config);

knex.schema.hasTable('tasks').then(function (exists) {
  if (!exists) {
    return knex.schema.createTable('tasks', function (table) {
      table.increments('id');
      table.integer('user_id').unsigned().notNullable();
      table.string('content', 255).notNullable();
    });
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
      table.timestamp('created_at').defaultTo(knex.fn.now());
    });
  }
}).catch(function (err) {
  console.error('Error ensuring events table exists:', err);
});

module.exports = knex;