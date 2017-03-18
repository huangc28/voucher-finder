## Coupon Finder

## Problem

This project focus on resolving the issue of finding (coupons / best deals) that is close to the hostile. A lot of times, tourist miss the oppurtunity of finding the best deal around the place he / she lives. For example deals like:

- Restaruant
- Transportation
- Zoo
- Coffee Shop
- Hotel
- Vendor (cloth, souvenir...)

## Solution

Try to find all the good deals around where he /she lives. This specific tourist does not have to collect this by him / her selves. He can just openup the app to see the all the best deal arround him.

## Approach

1. Try to crawl vendors information from various category of. Pick sources to crawl.
2. Save the crawled data to the database.
3. Display the distance between the geolocation of the user and dealspot googlemap

## Sources

This [source](http://buy.goodlife.tw) is the main place where I'm going to crawl my data for this phase. Following is the pattern of the api that I'm planning in using.

```
http://buy.goodlife.tw/regions/%E5%8F%B0%E5%8C%97/topics/fetch/?page=2&category=%E7%BE%8E%E9%A3%9F
```

## Progress

### Upgrade to node v7.7.3

### Crawl the origin and parse the data we want.

What are the information we want?

1. name
2. description
3. link
4. price_before_discount
5. price_after_discount
6. address
7. number_of_buyers
8. geolocation ---> to be decided
9. category

Currently using `jsdom`, but would migrate to `phantomjs`

### Host PostgreSQL on local and on linux

### Backend Tech candidates

1. **GoLang** ---> self learning purpose
2. **PHP**
3. **nodejs** ---> fast deployment.

### knex.js Migration

Create a table that stores all deals data, Let's name the table to `deals`.

** deals **

```
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
```

Start seeding all deals data into the table.

### Host node server and start building up APIs.

Use `expressjs` to fast host up a server.

### Retrieve geolocation from google map

Now we have the address of different deal, we are now able to retrieve spatial location from google map api. What I need is to convert human readable address to geo-coordinate. For example: **1600 Amphitheatre Parkway, Mountain View, CA"** converted to **latitude: 37.423021, longtitude: -122.083739**. Since I'm using `javascript`, I'll need to look up [Google Maps Javascript API](https://developers.google.com/maps/documentation/javascript/geocoding?hl=zh-tw)

[google map geolocation api](https://developers.google.com/maps/documentation/geocoding/intro?hl=zh-tw)


## Postgresql

### connect database

`\connect database_name`

### list all database

`\list`

### list all tables in the current database

`\dt`

## Reference

1. [neo4j](https://neo4j.com/product)
2. [postGIS](http://postgis.net)
3. [knexjs](http://knexjs.org/)

## Problems Encounterred

### Postgres SQL error

```
psql: could not connect to server: No such file or directory
	Is the server running locally and accepting
	connections on Unix domain socket "/tmp/.s.PGSQL.5432"?
```

1. Uninstall everything regarding postgresql, postgis.
2. Try install postgresql via [postgresap](http://postgresapp.com/).
3. Problem solved, postgresql is now hosted successfully at local socket:5432.
4. Enable following 2 extensions for future usage [(reference)](http://postgis.net/install/):
  - `CREATE EXTENSION postgis;`
  - `CREATE EXTENSION postgis_topology;`
