'use strict';
import { getLocation, upperCaseNameFirstLetters } from '../utils/utils';
import '../../css/components/greetings.css';
import html from '../../templates/greetings.html';

(function() {
  class Greetings extends HTMLElement {
    constructor() {
      super();
    }

    connectedCallback() {
      this.innerHTML = html;
      this.setGreetings();
      this.addListeners();
      getLocation()
        .then((city) => {
          this.fetchWeather(city);
        });
    }

    addListeners() {
      document.querySelector('#oauthButton').addEventListener('click', function () {
        document.querySelector('body').classList.add('doing-auth')
        chrome.runtime.sendMessage({
          message: 'get_auth_token'
        })
      })

      document.querySelector('#unauthButton').addEventListener('click', function () {
        document.querySelector('body').classList.add('doing-auth')
        chrome.identity.clearAllCachedAuthTokens(() => {
          isUserAuth()
        })
      })

      document.querySelector('.btn-options').addEventListener('click', (evt) => {
        chrome.runtime.openOptionsPage()
      })

      window.addEventListener('on-get-preferences', (evt) => {
        const arr = evt.detail.split('||')
        const roleTitle = document.querySelector('.role-title')
        roleTitle.innerText = `(${arr[1]})`
      })

      window.addEventListener('on-get-user-info', (evt) => {
        const nameField = document.querySelector('.userName')
        nameField.innerText = upperCaseNameFirstLetters(evt.detail.names[0].displayName)
      });
    }

    setGreetings() {
      const myDate = new Date()
      const hourOfDay = myDate.getHours()
      const greet = document.querySelector('.greet')
      let greetString = 'Hello'
      if (hourOfDay > 5 && hourOfDay <= 12) {
        greetString = 'Good morning'
      }
      if (hourOfDay > 12 && hourOfDay <= 18) {
        greetString = 'Good afternoon'
      }
      if (hourOfDay > 18 && hourOfDay <= 23) {
        greetString = 'Good night'
      }
      if (hourOfDay >= 0 && hourOfDay < 5) {
        greetString = 'It\'s late'
      }

      greet.innerText = greetString
    }

    fetchWeather(city) {
      const endpointWeather = new Request(`https://resourcery.vercel.app/weather-${city}.json`)
      const options = {
        method: 'GET'
      }
      fetch(endpointWeather, options)
        .then(response => response.json())
        .then(data => {
          const cityName = document.querySelector('.city-name')
          const cityTemp = document.querySelector('.city-temp')
          const citySky = document.querySelector('.city-sky')
          const weatherIcon = document.querySelector('.icon-weather')
          const weatherWrapper = document.querySelector('.weather-wrapper')
          cityName.innerText = city
          cityTemp.innerText = Math.round(data.main.feels_like)
          citySky.innerText = data.weather[0].description
          weatherIcon.setAttribute('src', `http://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`)
          weatherWrapper.classList.remove('d-none')
        })
        .catch(console.error)
    }
  }

  customElements.define('greetings-area', Greetings);
})();
