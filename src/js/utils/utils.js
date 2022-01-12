let fullPostsData = []
const getLocation = async () => {
  const location = new Request('https://geolocation-db.com/json/59e89620-db25-11eb-ad48-73c00c9b92a3')
  const options = {
    method: 'GET'
  }
  return fetch(location, options)
    .then(response => response.json())
    .then(data => {
      return data.city.toLowerCase()
    })
    .catch(console.error)
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


export {
  getLocation,
  getPrettyHourMinute,
  getDateDiff,
  isEventLive,
  upperCaseNameFirstLetters,
  addMillisecondsPropertyToEvents,
  fullPostsData,
}

