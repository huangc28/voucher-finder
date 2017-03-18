const dbConfig = {
  client: 'pg',
  connection: {
    host     : '127.0.0.1',
    user     : 'apple',
    password : '',
    database : 'couponFinder',
    charset  : 'utf8'
  },
  migrations: {
    tableName: 'food'
  }
}

const knex = require('knex')(dbConfig)
const bookshelf = require('bookshelf')(knex)

const migrationUp = (knex, Promise) => (
  knex.schema.createTable('food', table => {
    table.increments('id').primary()
  })
)

exports.up = migrationUp




