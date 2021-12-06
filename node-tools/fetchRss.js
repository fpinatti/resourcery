const fetch = require('node-fetch')
const parseString = require('xml2js').parseString
const fs = require('fs')
const {
  log
} = require('./utils/logger')
const args = process.argv.slice(2)
const data = []
const resourceList = {
  fe: [{
      provider_title: 'Smashing Magazine',
      feedUrl: 'https://www.smashingmagazine.com/categories/javascript/index.xml',
      provider_url: 'https://www.smashingmagazine.com'
    },
    {
      provider_title: 'Codrops',
      feedUrl: 'https://tympanus.net/codrops/feed/',
      provider_url: 'https://tympanus.net/codrops'
    },
    {
      provider_title: 'CSS Tricks',
      feedUrl: 'https://css-tricks.com/feed/',
      provider_url: 'https://css-tricks.com'
    },
    {
      provider_title: 'Dev.to',
      feedUrl: 'https://dev.to/feed',
      provider_url: 'https://dev.to'
    },
    {
      provider_title: 'Sitepoint',
      feedUrl: 'https://www.sitepoint.com/feed',
      provider_url: 'https://www.sitepoint.com'
    },
    {
      provider_title: 'Frontend Focus',
      feedUrl: 'https://cprss.s3.amazonaws.com/frontendfoc.us.xml',
      provider_url: 'https://frontendfoc.us/'
    },
    {
      provider_title: 'CSS Weekly',
      feedUrl: 'http://feeds.feedburner.com/CSS-Weekly?format=xml',
      provider_url: 'https://css-weekly.com/'
    },
  ]
}

const fetchResources = async (url, info) => {
  log('Fetching...')
  try {
    const rssFetch = url
    const options = {
      method: 'GET'
    }

    const response = await fetch(rssFetch, options)
    const responseText = await response.text()

    parseString(responseText, function (err, convertedJson) {
      if (err) {
        console.log(err);
      }
      appendLoadedData(convertedJson, info)
    });
  } catch (err) {
    log('Error fetching the resource', err)
  }
}

const appendLoadedData = async (jsonData, info) => {
  for (const element of jsonData.rss.channel[0].item) {
    element.providerTitle = info.provider_title
    element.providerURL = info.provider_url
    data.push(element)
  }
}

const saveJson = (role) => {
  log('Saving feed...')
  const shuffleData = shuffledArr(data)
  const jsonString = JSON.stringify(shuffleData, null, 4);
  fs.writeFileSync(`./public/feed-${role}.json`, jsonString)
}

const shuffledArr = (array) => {
  return array.map(a => ({
    sort: Math.random(),
    value: a
  })).sort((a, b) => a.sort - b.sort).map(a => a.value)
}

const initApp = async (role) => {
  const feedPromises = resourceList[role].map(async feed => {
    return await fetchResources(feed.feedUrl, feed)
  })

  // eslint-disable-next-line no-undef
  await Promise.all(feedPromises)
  saveJson(role)
}


initApp(args[0])
