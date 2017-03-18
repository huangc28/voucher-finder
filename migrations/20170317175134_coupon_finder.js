
exports.up = function(knex, Promise) {
  return knex.schema.createTableIfNotExists('deals', table => {
    table.increments('id').primary()
    table.string('category').nullable()
    table.string('name').nullable()
    table.text('description').nullable()
    table.string('link', 1020).nullable()
    table.integer('price_before_discount').nullable()
    table.integer('price_after_discount').nullable()
    table.string('address').nullable()
    table.integer('number_of_buyers').nullable()
    table.timestamp('created_at').defaultTo(knex.fn.now())
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTableIfExists('deals')
};
