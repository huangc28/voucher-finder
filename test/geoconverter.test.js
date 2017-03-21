const https = require('https')

const googleApiKey = 'AIzaSyBTuRut1s6WmhjQnORIbZwvER2yq65CD2o'
const sampleAddress = encodeURIComponent('台北市大安區仁愛路四段2號')

const GOOGLE_MAP_BASE_API = 'https://maps.googleapis.com/maps/api/geocode/json'

const { knex, bookshelf } = require('../geo_fetcher.js')

/**
 * Setup "Deals" Model for the bookshelf.
 *
 */
// beforeAll(() => {
//   return new Promise((resolve, reject) => {
//     const Deals = bookshelf.Model.extend({
//       tableName: "deals"
//     })

//     resolve(Deals)
//   })
// })

/**
 * Not passing any parameters to the apis.
 *
 * response: {
 *  error_message: 'Invalid request. Missing the \'address\', \'bounds\', \'components\', \'latlng\' or \'place_id\' parameter.',
 *  results: [],
 *  status: 'INVALID_REQUEST'
 * }
 */
describe('Requesting google api, save lon, lat into database', () => {
  test('Request Google Maps Geocoding api with api key failed', done => {
  // request google map api.
  https.get(GOOGLE_MAP_BASE_API, res => {
      const statusCode = res.statusCode
      res.setEncoding('utf8')
      let rawData = ''

      res.on('data', chunk => {
        return rawData += chunk
      })

      res.on('end', () => {
        try {

          let parsedData = JSON.parse(rawData)

          // expect statusCode to be bad request
          expect(statusCode).toEqual(400)
        } catch (e) {
          console.log('error', e.message)
        }
      })

      done()
  })
})

test('Request google api success', done => {
  https.get(`${GOOGLE_MAP_BASE_API}?address=${sampleAddress}&key=${googleApiKey}`, res => {
    const statusCode = res.statusCode
    res.setEncoding('utf8')
    let rawData = ''

    res.on('data', chunk => rawData += chunk)

    res.on('end', () => {
      const parsedData = JSON.parse(rawData)
      expect(parsedData.status).toEqual('OK')
      expect(!!parsedData.result).toBe(true)
    })

    done()
  })
})

  test('Raw query table using bookshelf.js', () => {
    bookshelf.knex.raw('SELECT name, address FROM deals WHERE id=1;').then(result => {
      const { name, address } = result.rows[0]

      expect(name).toEqual('17Life')
      expect(address).toEqual('台北市大安區仁愛路四段2...(多家)')
    })
  })

  test('Request google api and save it to database as a Geography point success', () => {
    const Deals = bookshelf.Model.extend({
      tableName: "deals"
    })

    // fetch the first deal
    Deals.where('id', TEST_DEAL_ID).fetch().then(
      deal => {
        const { address } = deal.attributes
        const encodedAddress = encodeURIComponent(address)

        https.get(`${GOOGLE_MAP_BASE_API}?address=${encodedAddress}&key=${googleApiKey}`, res => {
        const statusCode = res.statusCode
        res.setEncoding('utf8')
        let rawData = ''

        res.on('data', chunk => rawData += chunk)

        res.on('end', () => {
          console.log('rawData', rawData)
          const parsedData = JSON.parse(rawData)
          console.log('parsedData', parsedData)
          const {
            geometry: {
              location: { lat, lng },
            },
          } = parsedData.results[0]

          // update point field
          console.log('lat, lng', lat, lng)
          bookshelf
            .knex
            .raw(`UPDATE deals SET point=ST_GeogFromText('POINT(${lng} ${lat})') WHERE id=${TEST_DEAL_ID}`)
        })
      })
    })
  })
})
