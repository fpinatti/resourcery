const fetch = require('node-fetch')
const fs = require('fs')
const dotenv = require('dotenv')
const { log } = require('../utils/logger')

const API_KEY = process.env.WEATHER_APIKEY
const CITY = 'campinas'
const TIME_TO_UPDATE = 30 //in minutes

const fetchWeather = async () => {
	log('Fetching weather...')
	// let jsonAge = await checkJsonAge()
	// log(jsonAge, timeToUpdate, 60 * timeToUpdate);
	// if (jsonAge > 60 * timeToUpdate || !jsonAge) {
	try {
		const endpoint = `https://api.openweathermap.org/data/2.5/weather?q=${CITY}&units=metric&appid=${API_KEY}`
		const options = {
			method: 'GET'
		}

		const response = await fetch(endpoint, options)
		const responseText = await response.json()
		saveJson(responseText)

	} catch (err) {
		log('Error fetching the weather', err)
	}
	// } else {
	// 	log('Weather data is updated, no need to fetch again')
	// }
}

// const checkJsonAge = async () => {
// 	try {
// 		const stats = fs.statSync(`./public/weather-${city}.json`)
// 		const seconds = (new Date().getTime() - new Date(stats.mtime).getTime()) / 1000
// 		return seconds
// 	} catch (err) {
// 		log('Error checking json age', err)
// 	}
// }

const saveJson = (data) => {
	log('Saving weather data...')
	fs.writeFileSync(`./public/weather-${CITY}.json`, JSON.stringify(data))
}

const initApp = async () => {
	await fetchWeather()
}

initApp()
