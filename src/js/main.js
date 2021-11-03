/* global chrome */
document.addEventListener('DOMContentLoaded', () => {
  let fullData
  let userEmail
  const modalBody = document.querySelector('.modal-body')
  let city = ''

  const buildPostsList = (postsList) => {
    const listWrapper = document.querySelector('.posts__list')
    const rowTemplate = document.querySelector('.post-template')
    fullData = postsList

    postsList.forEach((item, idx) => {
      if (!item['content:encoded']) {
        item['content:encoded'] = item.description
      }
      const clonedItem = rowTemplate.content.cloneNode(true)
      clonedItem.querySelector('.post__title').innerText = item.title
      clonedItem.querySelector('.post__provider').innerText = item.providerTitle
      clonedItem.querySelector('.post__provider').setAttribute('href', item.providerURL)
      clonedItem.querySelector('.posts__list-item').setAttribute('data-provider', item.providerTitle)
      clonedItem.querySelector('.post__description').innerHTML = `${String(item.description).substring(0, 130)}...`
      clonedItem.querySelector('.post__link').setAttribute('href', item.link)
      clonedItem.querySelector('.btn-modal').setAttribute('data-idx', idx)
      listWrapper.append(clonedItem)
    })
  }

  const fetchResources = () => {
    const rssFetch = new Request('https://resourcery.vercel.app/feed.json')
    // const headers = new Headers()
    const options = {
      method: 'GET'
    }
    fetch(rssFetch, options)
      .then(response => response.json())
      .then(data => {
        buildPostsList(data)
      })
      .catch(console.error)
  }

  const getLocation = () => {
    const location = new Request('https://geolocation-db.com/json/59e89620-db25-11eb-ad48-73c00c9b92a3')
    // const headers = new Headers()
    const options = {
      method: 'GET'
    }
    return fetch(location, options)
      .then(response => response.json())
      .then(data => {
        city = data.city.toLowerCase()
      })
      .catch(console.error)
  }

  const fetchWeather = () => {
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

  const setGreetings = () => {
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

  const initModal = () => {
    const myModal = document.getElementById('contentModal')
    myModal.addEventListener('show.bs.modal', function (evt) {
      const element = fullData[evt.relatedTarget.getAttribute('data-idx')]
      modalBody.innerHTML = element['content:encoded']
    })
  }

  const addListeners = () => {
    // calendarField.addEventListener('change', onCalendarChange)
    document.querySelector('#oauthButton').addEventListener('click', function () {
      chrome.runtime.sendMessage({
        message: 'get_auth_token'
      })
      chrome.runtime.sendMessage({
        message: 'get_profile'
      })
      chrome.runtime.sendMessage({
        message: 'get_user_information'
      })
      chrome.runtime.sendMessage({
        message: 'get_calendar_list'
      })
      chrome.runtime.sendMessage({
        message: 'get_calendar_by_id'
      })
    })

    document.querySelector('#unauthButton').addEventListener('click', function () {
      console.log('unauth')
      chrome.runtime.sendMessage({
        message: 'sign_out'
      })
    })

    chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
      if (request.action === 'chrome-message') {
        onGetChromeMessage(request.message, request.data)
      }
    })
  }

  const onGetChromeMessage = (message, objData) => {
    switch (message) {
      case 'user_profile':
        onUserProfile(objData)
        break
      case 'user_info': {
        userEmail = objData.emailAddresses[0].value
        const nameField = document.querySelector('.userName')
        nameField.innerText = upperCaseNameFirstLetters(objData.names[0].displayName)
        break
      }
      case 'user_calendar_events': {
        buildCalendarEvents(objData)
        break
      }
      case 'user_calendar_list': {
        console.log('user calendar list', objData)
        break
      }
    }
    // console.log(message, objData)
  }

  const buildCalendarEvents = (objData) => {
    const calendarList = document.querySelector('.calendar-list')
    const calendarEvent = document.querySelector('.calendar-event')
    const eventList = filterEventList(objData)

    eventList.forEach((event) => {
      // console.log('>>>', event)
      const clonedEvent = calendarEvent.content.cloneNode(true)
      clonedEvent.querySelector('.event-summary').innerText = event.summary
      if (event.hangoutLink) {
        clonedEvent.querySelector('.event-hangout').setAttribute('href', event.hangoutLink)
        clonedEvent.querySelector('.event-hangout').classList.remove('d-none')
      }
      clonedEvent.querySelector('.event-start-time').innerText = event.eventStartPretty
      clonedEvent.querySelector('.event-duration').innerText = event.eventDuration
      if (event.attendees) {
        const attendeeStatus = getAtendeeResponseStatus(event.attendees)
        clonedEvent.querySelector('.calendar-event-item').classList.add(attendeeStatus)
      }
      calendarList.append(clonedEvent)
    })
  }

  // const getFormattedDate = (strDate) => {
  //   return new Date(strDate)
  // }

  const getPrettyHourMinute = (strDate) => {
    const tmpDate = new Date(strDate)
    let prettyTime = `${tmpDate.getHours()}h`
    if (tmpDate.getMinutes()) {
      prettyTime = `${prettyTime}${tmpDate.getMinutes()}m`
    }
    return prettyTime
  }

  const getDateDiff = (eventStart, eventEnd) => {
    const startDate = new Date(eventStart)
    const endDate = new Date(eventEnd)
    const diffDate = (endDate.getTime() - startDate.getTime()) / 60000
    return diffDate
  }

  const getAtendeeResponseStatus = (attendees) => {
    let attendeeStatus
    attendees.forEach((attendee) => {
      if (attendee.email === userEmail) {
        attendeeStatus = attendee.responseStatus
      }
    })
    return attendeeStatus
  }

  const filterEventList = (objData) => {
    const filteredData = []
    objData.items.forEach((event) => {
      const eventStart = event.originalStartTime?.dateTime || event.start?.dateTime
      // FIX this indexof is used to avoid event duplication, but I'm not really confident this is the best way
      if (event.summary && eventStart && event.id.indexOf('_') === -1) {
        event.eventStartPretty = getPrettyHourMinute(eventStart)
        const eventEnd = event.end?.dateTime
        event.eventDuration = `${getDateDiff(eventStart, eventEnd)}min`
        filteredData.push(event)
      }
    })

    filteredData.sort((a, b) => {
      return new Date(b.originalStartTime?.dateTime || b.start?.dateTime) - new Date(a.originalStartTime?.dateTime || a.start?.dateTime)
    })

    return filteredData
  }

  const upperCaseNameFirstLetters = (name) => {
    try {
      const splitStr = name.toLowerCase().split(' ')

      for (let i = 0; i < splitStr.length; i++) {
        if (splitStr[i].length > 1) {
          splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1)
        }
      }

      return splitStr.join(' ')
    } catch (error) {
      console.log(error)
      return name
    }
  }

  const checkUserProfile = () => {
    chrome.runtime.sendMessage({
      message: 'get_profile'
    })
  }

  const onUserProfile = (objData) => {
    const isAuth = objData.id
    const statusClass = (isAuth) ? '.userstatus-auth' : '.userstatus-unauth'
    const statusElements = document.querySelectorAll(statusClass)
    statusElements.forEach((element) => {
      element.classList.add('d-block')
    })

    if (isAuth) {
      getAuthInfo()
    }
  }

  const getAuthInfo = () => {
    chrome.runtime.sendMessage({
      message: 'get_user_information'
    })
    chrome.runtime.sendMessage({
      message: 'get_calendar_list'
    })
    chrome.runtime.sendMessage({
      message: 'get_calendar_by_id'
    })
  }

  // const getUserPrefs = () => {
  //   return chrome.storage.sync.get({
  //     role: ''
  //   }, function (items) {
  //     return items
  //   })
  // }

  // const getCalendar = () => {

  // return calendar list
  // need scope https://www.googleapis.com/auth/calendar.readonly
  // GET https://www.googleapis.com/calendar/v3/users/me/calendarList

  // get calendar with id
  // GET https://www.googleapis.com/calendar/v3/calendars/calendarId
  // }

  // https://developers.google.com/identity/sign-in/web/sign-in
  // const getBasicProfile = (googleUser) => {
  //   const profile = googleUser.getBasicProfile()
  //   console.log('ID: ' + profile.getId()) // Do not send to your backend! Use an ID token instead.
  //   console.log('Name: ' + profile.getName())
  //   console.log('Image URL: ' + profile.getImageUrl())
  //   console.log('Email: ' + profile.getEmail()) // This is null if the 'email' scope is not present.
  // }

  // const handleCredentialResponse = () => {
  //   console.log('111')
  // }
  // window.onload = function () {
  //   google.accounts.id.initialize({
  //     client_id: '85500286524-e912nst858563iib207gbhhmcg240fol.apps.googleusercontent.com',
  //     callback: handleCredentialResponse
  //   })
  //   // google.accounts.id.prompt();
  // }

  // https://developer.chrome.com/docs/apps/app_identity/
  // const userPrefs = getUserPrefs()
  fetchResources()
  getLocation()
    .then(() => {
      fetchWeather()
      setGreetings()
    })
  initModal()
  addListeners()
  checkUserProfile()

  // getCalendar()
})