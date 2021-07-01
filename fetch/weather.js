const fetch = require('node-fetch')
const util = require('util')
const fs = require('fs')
const city = 'campinas'
const dotenv = require('dotenv')
const apiKey = dotenv.config().parsed.WEATHER_APIKEY
const timeToUpdate = 30 //in minutes

const fetchWeather = async () => {
	console.log('fetching weather...')
	let jsonAge = await checkJsonAge()
	if (jsonAge > 60 * timeToUpdate || !jsonAge) {
		try {
			const endpoint = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`
			const options = {
				method: 'GET'
			}

			const response = await fetch(endpoint, options)
			const responseText = await response.json()
			saveJson(responseText)

		} catch (err) {
			console.log(err)
		}
	} else {
		console.log('Weather data is updated, no need to fetch again')
	}
}

const checkJsonAge = async () => {
	try {
		const stats = fs.statSync(`./weather-${city}.json`)
		const seconds = (new Date().getTime() - new Date(stats.mtime).getTime()) / 1000
		return seconds
	} catch (err) {
		console.log(err)
	}
}

const saveJson = (data) => {
	console.log('saving weather data...')
	fs.writeFileSync(`./weather-${city}.json`, JSON.stringify(data))
}

const initApp = async () => {
	await fetchWeather()
}

initApp()
