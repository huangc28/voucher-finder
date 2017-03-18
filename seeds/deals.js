const fs = require('fs')
const { resolve } = require('path')

// read crawled data.
const deals = JSON.parse(fs.readFileSync(resolve(__dirname, '../crawledData/goodlife-food-deal.json'), 'utf-8'))

/**
 * @param {Array} deals
 * @returns {Array} deals
 */
const normalizedFoodDeals = deals => {
  return deals.map(deal => {
    return Object.assign({}, deal, {
      name: deal.name.trim(),
      description: deal.description.trim(),
      link: deal.link.trim(),
      price_before_discount: parseInt(deal.price_before_discount),
      price_after_discount: parseInt(deal.price_after_discount),
      address: deal.address.trim(),
      number_of_buyers: parseInt(deal.number_of_buyers),
    })
  })
}

exports.seed = function(knex, Promise) {
  // Deletes ALL existing entries
  return knex('deals').del()
    .then(function () {
      // Inserts seed entries
      const normalizedData = normalizedFoodDeals(deals)
      console.log('BRYAN: normalizedData', normalizedData)

      return knex('deals').insert(normalizedData);
    });
};
