const fetch = require('node-fetch')
const parseString = require('xml2js').parseString
const fs = require('fs')
const {
  log
} = require('./utils/logger')

let data = []

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

const saveJson = () => {
  log('Saving feed...')
  const shuffleData = shuffledArr(data)
  const jsonString = JSON.stringify(shuffleData, null, 4);
  fs.writeFileSync('./public/feed.json', jsonString)
}

const shuffledArr = (array) => {
  return array.map(a => ({
    sort: Math.random(),
    value: a
  })).sort((a, b) => a.sort - b.sort).map(a => a.value)
}

const initApp = async () => {
  await fetchResources(
    'https://www.smashingmagazine.com/categories/javascript/index.xml', {
      provider_title: 'Smashing Magazine',
      provider_url: 'https://www.smashingmagazine.com'
    }
  )
  await fetchResources(
    'https://tympanus.net/codrops/feed/', {
      provider_title: 'Codrops',
      provider_url: 'https://tympanus.net/codrops'
    }
  )
  await fetchResources(
    'https://css-tricks.com/feed/', {
      provider_title: 'CSS Tricks',
      provider_url: 'https://css-tricks.com'
    }
  )
  await fetchResources(
    'https://dev.to/feed', {
      provider_title: 'Dev.to',
      provider_url: 'https://dev.to'
    }
  )
  await fetchResources(
    'https://www.sitepoint.com/feed', {
      provider_title: 'Sitepoint',
      provider_url: 'https://www.sitepoint.com'
    }
  )
  await fetchResources(
    'https://cprss.s3.amazonaws.com/frontendfoc.us.xml', {
      provider_title: 'Frontend Focus',
      provider_url: 'https://frontendfoc.us/'
    }
  )
  await fetchResources(
    'http://feeds.feedburner.com/CSS-Weekly?format=xml', {
      provider_title: 'CSS Weekly',
      provider_url: 'https://css-weekly.com/'
    }
  )
  await saveJson()
}

initApp()
