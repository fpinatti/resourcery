const fetch = require('node-fetch')
const fs = require('fs')
const dotenv = require('dotenv')
const {
  log
} = require('./utils/logger')

const API_KEY = process.env.WEATHER_APIKEY
const CITY = 'campinas'

const fetchWeather = async () => {
  log('Fetching weather...')
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
}

const saveJson = (data) => {
  log('Saving weather data...')
  fs.writeFileSync(`./public/weather-${CITY}.json`, JSON.stringify(data))
}

const initApp = async () => {
  await fetchWeather()
}

initApp()
