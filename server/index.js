const fetch = require('isomorphic-fetch')
const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const dbConfig = require('../knexfile.js').development
const knex = require('knex')(dbConfig)
const bookshelf =  require('bookshelf')(knex)

const GOOGLE_MAP_BASE_API = 'https://maps.googleapis.com/maps/api/geocode/json'
const GOOGLE_API_KEY = 'AIzaSyBTuRut1s6WmhjQnORIbZwvER2yq65CD2o'

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

const KILOMETER = 1000

/**
 * Retrieve lnt and lat from google api.
 *
 * @param {string} address
 * @returns {Promise}
 */
const fetchAddressToCoordinate = (address) => {
  return new Promise((resolve, reject) => {
    fetch(`${GOOGLE_MAP_BASE_API}?address=${address}&key=${GOOGLE_API_KEY}`)
      .then(response => response.json())
      .then(
        responseJson => {
          resolve(responseJson)
        }
      )
  })
}

/**
 * @param {string} lng
 * @param {string} lat
 * @param {number} radius
 * @param {number} limit
 * @param {number} offset
 */
const selectMatchedCoordinates = (lng, lat, radius = 3 * KILOMETER, limit, offset) => {
  return new Promise((resolve, reject) => {
    bookshelf
      .knex
      .raw(`
        SELECT
          id,
          category,
          name,
          description,
          link,
          price_before_discount,
          price_after_discount,
          number_of_buyers,
          lng,
          lat,
          created_at
        FROM deals WHERE ST_Distance_Sphere(point::geometry, ST_MakePoint(${lng},${lat})) <= ${radius}
        ORDER BY point <-> st_setsrid(ST_MakePoint(${lng},${lat}), 4326)
        LIMIT ${limit}
        OFFSET ${offset}
        `
      )
      .then(result => {
        resolve(result)
      })
  })
}

/**
 * @param {string} address
 * @param {number} limit
 * @param {number} offset
 * @return {Promise}
 */
function * fetchAllMatchedCoordinatesFlow(address, limit = 10, offset = 0) {
  try {
    const response = yield fetchAddressToCoordinate(address)

    if (response.error_message) {
      throw new Error(response.error_message)
    }

    const {
      geometry: {
        location: {lat, lng}
      },
    } = response.results[0]

    yield selectMatchedCoordinates(lng, lat, 3 * KILOMETER, limit, offset)
  }
  catch (error) {
    console.log('fetchAllMatchedMatchedFlow error', error)

    yield { error_message: error.message }
  }
}

/**
 * @param {array} coordinates
 * @param {object}
 */
const normalizeMatchedData = coordinates => coordinates.map(coordinate => Object.assign({}, coordinate))

/**
 * Take in address, convert that into lnt and lat.
 * Retrieve every points within the radius.
 *
 * method: GET
 * Request url: /find-deals?address=台北市明水路 601 號 5 樓&limit=20&offset=24
 *
 * Remark: address needs to be encodeURIComponent
 *
 */
app.get('/find-deals', (req, res, next) => {
  const {
    query: {
      address,
      limit,
      offset,
    } = {}
  } = req

  if (!address) {
    res.send({ error_message: 'please specify an address to find', status: 400 })
  }

  const encodedAddress = encodeURIComponent(address)

  const gen = fetchAllMatchedCoordinatesFlow(encodedAddress, limit, offset)

  gen.next().value.then(googleApiResult => {
    gen.next(googleApiResult).value.then(matchedCoordinates => {
      const normalizedData = normalizeMatchedData(matchedCoordinates.rows)
      res.send({ status: 200, data: normalizedData })
    })
  })
  .catch(next)
})

router.use((error, req, res) => {
  res.json(error)
})

app.listen(3007, () => {
  console.log('Geo fetcher hosted!')
})
