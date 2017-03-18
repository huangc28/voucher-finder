/**
 * - name
 * - link
 * - description
 * - price before discount
 * - price after discount
 * - address
 * - buyers
 */
const jsdom = require('jsdom')
const { writeFile } = require('fs')
const { resolve } = require('path')

let CURRENT_PAGE = 1
const LAST_PAGE = 23
const collectedItems = []

const parseResponse = (err, window) => {
  if (err) {
    console.log('ERROR:', err)
  }

  if (window.document.body.innerHTML !== '') {
      // <li class="item_list">
    const items = window.document.getElementsByClassName('item_list')

    Array.from(items).forEach(item => {
      let data = {}

      data.category = 'food'

      // name: <h3><a href="/companies/GOMAJI%E5%A4%A0%E9%BA%BB%E5%90%89">GOMAJI夠麻吉</a></h3>
      const nameSrc = item.querySelector('h3 a')
      data.name = (nameSrc && nameSrc.textContent) || ''

      // description: <a href="/topics/806993-MB-white-coffee-%E5%B9%B3%E5%81%87%E6%97%A5%E7%9A%86%E5%8F%AF%E6%8A%B5%E7%94%A8500%E5%85%83%E6%B6%88%E8%B2%BB" target="_blank"> <img alt=
      const descriptionSrc = item.querySelector('a img')
      data.description = (descriptionSrc && descriptionSrc.getAttribute('alt')) || ''

      const linkSrc = item.querySelector('div.share .pk')
      data.link = (linkSrc && linkSrc.getAttribute('href')) || ''

      // buyers: <div class="buyers"><em>4711</em>人已購買</div>
      const buyersSrc = item.querySelector('div.buyers em')
      data.number_of_buyers = (buyersSrc && buyersSrc.textContent) || 0

      // priceAfterDiscount, priceBeforeDiscount: <div class="price "><em>388</em>元 <span> ( 原價<b>500</b>元, <em>7.8</em>折 ) </span> </div>
      const priceBeforeDiscountSrc = item.querySelector('div.price em')
      data.price_before_discount = (priceBeforeDiscountSrc && priceBeforeDiscountSrc.textContent) || 0

      const priceAfterDiscountSrc = item.querySelector('div.price span b')
      data.price_after_discount = (priceAfterDiscountSrc && priceAfterDiscountSrc.textContent) || 0

      // address data-full="台北市士林區中正路120-2號"> <a href='javascript:void(0)' class="colorbox_address_map">
      // @TODO trim out spaces of the address
      const addressSrc = item.querySelector('address a')
      data.address = (addressSrc && addressSrc.textContent) || ''

      collectedItems.push(data)


    })
    console.log(`done fetching ${CURRENT_PAGE}`)
    CURRENT_PAGE++
  }
}

// const config = {
//   url: `http://buy.goodlife.tw/regions/%E5%8F%B0%E5%8C%97/topics/fetch/?page=${1}&category=%E7%BE%8E%E9%A3%9F`,
//   done: parseResponse
// }
// jsdom.env(config)

const interval = setInterval(() => {
  const config = {
    url: `http://buy.goodlife.tw/regions/%E5%8F%B0%E5%8C%97/topics/fetch/?page=${CURRENT_PAGE}&category=%E7%BE%8E%E9%A3%9F`,
    done: parseResponse
  }
  jsdom.env(config)

  if (CURRENT_PAGE === LAST_PAGE + 1) {
    console.log('finish fetching', collectedItems)
    clearInterval(interval)

   const itemsStr = JSON.stringify(collectedItems)
   writeFile(resolve(__dirname, 'crawledData', 'goodlife-food-deal.json'), itemsStr, err => {
      if (err) throw err;
      console.log('It\'s saved!');
   })
  }
}, 7000)




