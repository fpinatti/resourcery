'use strict';
import { getLocation, upperCaseNameFirstLetters } from '../utils/utils';

(function() {
  const template = `
  <section class="greetings shadow">
  <div class="container-fluid">
    <div class="row">
      <p class="fs-2 col-7">
        <span class="greet"></span>
        <span
          class="userName"
        />
      </p>
      <div class="col-5 d-flex justify-content-end align-items-start">
        <div class="auth-preloader spinner-border" role="status">
          <span class="sr-only">Loading...</span>
        </div>
        <button id="unauthButton" class="btn btn-danger userstatus-auth">Sign out <i class="fab fa-google-plus-g"></i></button>
        <button id="oauthButton" class="btn btn-danger userstatus-unauth">Sign in with <i class="fab fa-google-plus-g"></i></button>
        <button class="btn btn-link btn-options">⚙️</button>
      </div>
    </div>
    <div class="weather-wrapper d-none">
      Weather in <span class="city-name"></span> is <span class="city-temp"></span>º,
      <span class="city-sky"></span>
      <img
        class="ms-2 icon-weather"
      />
    </div>
  </div>
</section>`
  class Greetings extends HTMLElement {
    constructor() {
      super();
    }

    connectedCallback() {
      this.innerHTML = template;
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
