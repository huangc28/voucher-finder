const https = require('https')
const dbConfig  = require('./knexfile.js').development

// Initialize ORM for "deals".
const knex = require('knex')(dbConfig)
const bookshelf =  require('bookshelf')(knex)

module.exports = { knex, bookshelf }

const GOOGLE_MAP_BASE_API = 'https://maps.googleapis.com/maps/api/geocode/json'
const GOOGLE_API_KEY = 'AIzaSyBTuRut1s6WmhjQnORIbZwvER2yq65CD2o'

const Deals = bookshelf.Model.extend({
  tableName: "deals"
})

/**
 * @param {string} address
 * @returns Promise
 */
const requestGeodetic = address => {
  return new Promise((resolve, reject) => {
    const encodedAddress = encodeURIComponent(address)

    https.get(`${GOOGLE_MAP_BASE_API}?address=${encodedAddress}&key=${GOOGLE_API_KEY}`, res => {
      const statusCode = res.statusCode
      res.setEncoding('utf8')

      let rawData = ''

      res.on('data', chunk => {
        rawData += chunk
      })

      res.on('end', () => {
        const parsedData = JSON.parse(rawData)
        resolve(parsedData)
      })
    })
  })
}

const updatePointToDB = (id, lng, lat) => {
  return new Promise((resolve, reject) => {
    bookshelf
      .knex
      .raw(`UPDATE deals SET point=ST_GeogFromText('POINT(${lng} ${lat})') WHERE id=${id}`)
      .then(result => {
        resolve(resolve)
      })
  })
}

function * convertGeoFlow (id, address) {
  try {
    const response = yield requestGeodetic(address)

    if (response.error_message) {
      throw new Error(response.error_message)
    }

    const {
      geometry: {
        location: {lat, lng}
      },
    } = response.result[0]

    const result = yield updatePointToDB(id, lng, lat)

    return result
  } catch (error) {
    console.log('convertGeoFlow error', error)
  }
}

Deals.fetchAll().then(deals => {
  deals.toJSON().forEach(deal => {
    const { id, address } = deal
    const gen = convertGeoFlow(id, address)
    gen.next().value.then(googleApiResponse => {
      gen.next(googleApiResponse).value.then(updateDBresult => {
        console.log('done with', updateDBresult)
      })
    })
  })
})
