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
3. Display the distance between the Geolocation of the user and dealspot googlemap

## What the server should do

1. Take in the location of the hostile.
2. Convert that into Geolocation through google map api.
3. Retrieve all locations that is within the specified radius.

## Data Sources

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


### Google Maps Geocoding API

I have to register an API key inorder to request Google Map api. I'll go ahead and do that first.

I only have 2500 requests quota daily, I can raise up the quota, but it costs... [money](https://developers.google.com/maps/documentation/geocoding/usage-limits)

Here is the sample response for requesting API successfully:

```
{
   "results" : [
      {
         "address_components" : [
            {
               "long_name" : "2",
               "short_name" : "2",
               "types" : [ "street_number" ]
            },
            {
               "long_name" : "仁愛路四段",
               "short_name" : "仁愛路四段",
               "types" : [ "route" ]
            },
            {
               "long_name" : "大安區",
               "short_name" : "大安區",
               "types" : [ "administrative_area_level_3", "political" ]
            },
            {
               "long_name" : "台北市",
               "short_name" : "台北市",
               "types" : [ "administrative_area_level_1", "political" ]
            },
            {
               "long_name" : "台灣",
               "short_name" : "TW",
               "types" : [ "country", "political" ]
            },
            {
               "long_name" : "106",
               "short_name" : "106",
               "types" : [ "postal_code" ]
            }
         ],
         "formatted_address" : "106台灣台北市大安區仁愛路四段2號",
         "geometry" : {
            "location" : {
               "lat" : 25.0376729,
               "lng" : 121.5439808
            },
            "location_type" : "ROOFTOP",
            "viewport" : {
               "northeast" : {
                  "lat" : 25.0390218802915,
                  "lng" : 121.5453297802915
               },
               "southwest" : {
                  "lat" : 25.0363239197085,
                  "lng" : 121.5426318197085
               }
            }
         },
         "place_id" : "ChIJW-9XQNGrQjQR95O1PlyPIFI",
         "types" : [ "street_address" ]
      }
   ],
   "status" : "OK"
}
```

## Request google map API to fetch geography (lng/lat) of all addresses

I need some kind of cron job to help me to convert all addresses to geography location through google map API.
Wait for 7 seconds in between each request. 7 sec * 600 = 4200 sec.

## I was wrong!?

I was thinking about using `setTimeout` on every iteration of the loop, I can simply use **generator** pattern to `yield` execution on each iteration to makesure each step has been executed before proceed to the next iteration.

**Manage google APIs**

[google api console](https://console.developers.google.com/)

## Postgresql

### connect database

`\connect database_name`

### List all database

`\list`

### list all tables in the current database

`\dt`

### Connect with username

`psql --username=huangc28`

## Reference

1. [neo4j](https://neo4j.com/product)
2. [postGIS](http://postgis.net)
3. [knexjs](http://knexjs.org/)
4. [node process stdin](http://stackoverflow.com/questions/4976466/difference-between-process-stdout-write-and-console-log-in-node-js)
5. [postgres & postgis tutorial for beginner](http://gis.stackexchange.com/questions/3251/getting-started-with-postgis)

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
5. [find nearest point from the specified location](https://boundlessgeo.com/2011/09/indexed-nearest-neighbour-search-in-postgis/)
