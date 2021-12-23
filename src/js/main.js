/* global chrome */
document.addEventListener('DOMContentLoaded', () => {
  let fullData
  let userEmail
  const modalBody = document.querySelector('.modal-body')
  let city = ''
  const userRole = { id: '', name: '' }

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
      clonedItem.querySelector('.posts__list-item').setAttribute('data-idx', item.providerIdx)
      clonedItem.querySelector('.post__description').innerHTML = `${String(item.description).substring(0, 130)}...`
      clonedItem.querySelector('.post__link').setAttribute('href', item.link)
      clonedItem.querySelector('.btn-modal').setAttribute('data-idx', idx)
      listWrapper.append(clonedItem)
    })
  }

  const fetchResources = (userRole) => {
    if (!userRole) userRole = 'fe'
    const rssFetch = new Request(`https://resourcery.vercel.app/feed-${userRole}.json`)
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

    chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
      if (request.action === 'chrome-message') {
        onGetChromeMessage(request.message, request.data)
      }
    })

    document.querySelector('.btn-options').addEventListener('click', (evt) => {
      chrome.runtime.openOptionsPage()
    })
  }

  const onGetChromeMessage = (message, objData) => {
    switch (message) {
      case 'user_token':
        onUserToken(objData)
        break
      case 'user_profile':

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
        break
      }
    }
  }

  const onUserToken = (token) => {
    isUserAuth()
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
  }

  const buildCalendarEvents = (objData) => {
    const calendarList = document.querySelector('.calendar-list')
    const calendarEvent = document.querySelector('.calendar-event')
    const eventList = filterEventList(objData)
    const sortEvents = sortEventsByStartDate(eventList)

    sortEvents.forEach((event) => {
      const clonedEvent = calendarEvent.content.cloneNode(true)
      if (event.eventLive) {
        clonedEvent.querySelector('.calendar-event-item').classList.add('event-live')
      }
      clonedEvent.querySelector('.event-summary').innerText = event.summary
      if (event.hangoutLink) {
        clonedEvent.querySelector('.event-hangout').setAttribute('href', event.hangoutLink)
        clonedEvent.querySelector('.event-hangout').classList.remove('d-none')
      }
      clonedEvent.querySelector('.event-start-time').innerText = event.eventStartPretty
      clonedEvent.querySelector('.event-duration').innerText = event.eventDuration
      if (event.attendees) {
        const attendeeStatus = getAttendeeResponseStatus(event.attendees)
        clonedEvent.querySelector('.calendar-event-item').classList.add(attendeeStatus)
      }
      calendarList.append(clonedEvent)
    })
  }

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

  const isEventLive = (eventStart, eventEnd) => {
    const startDate = new Date(eventStart)
    const endDate = new Date(eventEnd)
    const currentDate = new Date()
    const isLive = currentDate >= startDate &&
      currentDate <= endDate
    return isLive
  }

  const getAttendeeResponseStatus = (attendees) => {
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
        event.eventLive = isEventLive(eventStart, eventEnd)
        filteredData.push(event)
      }
    })

    filteredData.sort((a, b) => {
      return new Date(b.originalStartTime?.dateTime || b.start?.dateTime) - new Date(a.originalStartTime?.dateTime || a.start?.dateTime)
    })

    return filteredData
  }

  const sortEventsByStartDate = (events) => {
    const formattedEvents = addMillisecondsPropertyToEvents(events)

    const result = formattedEvents.sort((a, b) => {
      if (a.startDateInMilliseconds < b.startDateInMilliseconds) return -1
      if (a.startDateInMilliseconds > b.startDateInMilliseconds) return 1

      return 0
    })

    return result
  }

  const addMillisecondsPropertyToEvents = (events) => {
    events.forEach(event => {
      // "2021-12-06T12:00:00-03:00"
      const hour = event.start.dateTime.split('T')[1].split('-')[0]
      // "12:00:00"
      const ms = Number(hour.split(':')[0]) * 60 * 60 * 1000 + Number(hour.split(':')[1]) * 60 * 1000

      event.startDateInMilliseconds = ms
    })

    return events
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

  const isUserAuth = () => {
    try {
      chrome.identity.getAuthToken({
        interactive: false
      }, (token) => {
        const isAuth = token || false
        resetUIAuthStatus()
        const statusClass = (isAuth) ? '.userstatus-auth' : '.userstatus-unauth'
        const statusElements = document.querySelectorAll(statusClass)
        statusElements.forEach((element) => {
          element.classList.add('d-block')
        })
        if (isAuth) {
          document.querySelector('body').classList.add('is-auth')
          getAuthInfo()
        }
      })
    } catch (err) {
      console.log(err)
    }
  }

  const resetUIAuthStatus = () => {
    document.querySelector('.calendar-list').textContent = ''
    document.querySelector('body').classList.remove('is-auth')
    document.querySelector('body').classList.remove('doing-auth')
    const authElements = document.querySelectorAll('.userstatus-auth')
    const unauthElements = document.querySelectorAll('.userstatus-unauth')
    authElements.forEach((element) => {
      element.classList.remove('d-block')
      element.classList.remove('d-none')
    })
    unauthElements.forEach((element) => {
      element.classList.remove('d-block')
      element.classList.remove('d-none')
    })
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

  const getPrefs = () => {
    chrome.storage.sync.get({
      role: ''
    }, (data) => {
      const arr = data.role.split('||')
      userRole.id = arr[0]
      userRole.name = arr[1]
      fetchResources(userRole.id)
      const roleTitle = document.querySelector('.role-title')
      roleTitle.innerText = `(${userRole.name})`
    })
  }

  getPrefs()
  getLocation()
    .then(() => {
      fetchWeather()
      setGreetings()
    })
  isUserAuth()
  initModal()
  addListeners()
  checkUserProfile()
})
