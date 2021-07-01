const xml2js = require('xml2js')
const fetch = require('node-fetch')
const util = require('util')
const parseString = require('xml2js').parseString
let data = []
const fs = require('fs')

const fetchResources = async (url, provider) => {
	console.log('fetching...')
	try {
		const rssFetch = url
		const options = {
			method: 'GET'
		}

		const response = await fetch(rssFetch, options)
		const responseText = await response.text()

		parseString(responseText, function(err, convertedJson) {
			appendLoadedData(convertedJson, provider)
		});
	} catch (err) {
		console.log(err)
	}
}

const appendLoadedData = async (jsonData, provider) => {
	for (let element of jsonData.rss.channel[0].item) {
		element.provider = provider
		data.push(element)
	}
}

const saveJson = () => {
	console.log('saving feed...')
	let shuffleData = shuffledArr(data)
	const jsonString = JSON.stringify(shuffleData, null, 4);
	fs.writeFileSync('./public/feed.json', jsonString)
}

const shuffledArr = (array) => {
	return array.map(a => ({ sort: Math.random(), value: a })).sort((a, b) => a.sort - b.sort).map(a => a.value)
}

const initApp = async () => {
	await fetchResources('https://www.smashingmagazine.com/categories/javascript/index.xml', 'Smashing Magazine')
	await fetchResources('https://tympanus.net/codrops/feed/', 'Codrops')
	await fetchResources('https://css-tricks.com/feed/', 'CSS Tricks')
	await fetchResources('https://dev.to/feed', 'Dev.to')
	await fetchResources('https://www.sitepoint.com/feed', 'Sitepoint')
	await fetchResources('https://cprss.s3.amazonaws.com/frontendfoc.us.xml', 'Frontend Focus')
	await fetchResources('http://feeds.feedburner.com/CSS-Weekly?format=xml', 'CSS Weekly')
	await saveJson()
}

initApp()
