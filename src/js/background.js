/* global chrome */

const API_KEY = 'AIzaSyCACn68SfWwozQbzOXYPqCskkN-XKlgNug'

const getAuthToken = () => {
  chrome.identity.getAuthToken({ interactive: true }, function (token) {
    console.log(`Token: ${token}`)
  })
}

const getUserProfile = () => {
  chrome.identity.getProfileUserInfo(
    { accountStatus: 'ANY' },
    function (userInfo) {
      console.log(userInfo)
    }
  )
}

const getUserInformation = () => {
  chrome.identity.getAuthToken({ interactive: true }, function (token) {
    const fetchUrl = `https://people.googleapis.com/v1/people/me?personFields=names,emailAddresses&key=${API_KEY}`
    const fetchOptions = {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }

    fetch(fetchUrl, fetchOptions)
      .then((res) => res.json())
      .then((res) => console.log(res))
  })
}

const getUserContacts = () => {
  chrome.identity.getAuthToken({ interactive: true }, function (token) {
    const fetchUrl = `https://people.googleapis.com/v1/contactGroups/all?maxMembers=20&key=${API_KEY}`
    const fetchOptions = {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }

    fetch(fetchUrl, fetchOptions)
      .then((res) => res.json())
      .then((res) => {
        if (res.memberCount) {
          const members = res.memberResourceNames
          let fetchPersonFieldsUrl = `https://people.googleapis.com/v1/people:batchGet?personFields=names&key=${API_KEY}`

          members.forEach((member) => {
            fetchPersonFieldsUrl += `&resourceNames=${encodeURIComponent(
              member
            )}`
          })

          fetch(fetchPersonFieldsUrl, fetchOptions)
            .then((res) => res.json())
            .then((res) => console.log(res))
        }
      })
  })
}

const getCalendarList = () => {
  chrome.identity.getAuthToken({ interactive: true }, function (token) {
    const fetchUrl = `https://www.googleapis.com/calendar/v3/users/me/calendarList?&key=${API_KEY}`
    const fetchOptions = {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json'
      }
    }

    fetch(fetchUrl, fetchOptions)
      .then((response) => response.json())
      .then(function (data) {
        console.log(data)
      })
  })
}

const getCalendarEvents = () => {
  chrome.identity.getAuthToken({ interactive: true }, function (token) {
    const startDayDate = new Date()
    const endDayDate = new Date()

    startDayDate.setUTCHours(0, 0, 0, 0)
    endDayDate.setUTCHours(23, 59, 59, 999)

    const dateToISOStart = getISODate('start')
    const dateToISOEnd = getISODate('end')

    const fetchUrl = `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${dateToISOStart}&timeMax=${dateToISOEnd}&key=${API_KEY}`
    const fetchOptions = {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json'
      }
    }

    fetch(fetchUrl, fetchOptions)
      .then((response) => response.json())
      .then(function (data) {
        console.log(data)
      })
  })
}

const getISODate = (type) => {
  const today = new Date()

  if (type === 'start') {
    today.setUTCHours(0, 0, 0, 0)
  } else {
    today.setUTCHours(23, 59, 59, 999)
  }

  const dateToISO = today.toISOString()
  return dateToISO
}

const defaultCallback = () => {
  console.log('Command not found!')
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // TODO: Improve If logic
  if (request.message === 'get_auth_token') getAuthToken()
  if (request.message === 'get_profile') getUserProfile()
  if (request.message === 'get_user_information') getUserInformation()
  if (request.message === 'get_contacts') getUserContacts()
  if (request.message === 'get_calendar_list') getCalendarList()
  if (request.message === 'get_calendar_by_id') getCalendarEvents()

  defaultCallback()
})
