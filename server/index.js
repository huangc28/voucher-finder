const express = require('express')
const app = express()

/**
 * Take in address, convert that into lnt and lat.
 * Retrieve every points within the radius.
 */
app.post('/find-deals', (req, res) => {
  res.send('triggered')
})

app.listen(3007, () => {
  console.log('Geo fetcher hosted!')
})
