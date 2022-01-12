'use strict';
import { getPrettyHourMinute, getDateDiff, isEventLive, addMillisecondsPropertyToEvents } from '../utils/utils';
import '../../css/components/calendar.css';
import html from '../../templates/calendar.html';

(function() {
  class Calendar extends HTMLElement {
    constructor() {
      super();
    }

    connectedCallback() {
      this.userEmail = '';
      this.innerHTML = html;
      this.addListeners()
    }

    addListeners() {
      // window.addEventListener('check-user-auth', (evt) => {
      //   console.log('USER AUTH?', evt.detail);
      // });
      window.addEventListener('on-get-user-info', (evt) => {
        this.userEmail = evt.detail.emailAddresses[0].value
      });
      window.addEventListener('on-get-calendar-events', (evt) => {
        this.buildCalendarEvents(evt.detail)
      })

    }

    buildCalendarEvents(objData) {
      const calendarList = document.querySelector('.calendar-list')
      const calendarEvent = document.querySelector('.calendar-event')
      const eventList = this.filterEventList(objData)
      const sortEvents = this.sortEventsByStartDate(eventList)

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
          const attendeeStatus = this.getAttendeeResponseStatus(event.attendees)
          clonedEvent.querySelector('.calendar-event-item').classList.add(attendeeStatus)
        }
        calendarList.append(clonedEvent)
      })
    }

    getAttendeeResponseStatus(attendees) {
      let attendeeStatus
      attendees.forEach((attendee) => {
        if (attendee.email === this.userEmail) {
          attendeeStatus = attendee.responseStatus
        }
      })
      return attendeeStatus
    }

    filterEventList(objData) {
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

    sortEventsByStartDate(events) {
      const formattedEvents = addMillisecondsPropertyToEvents(events)

      const result = formattedEvents.sort((a, b) => {
        if (a.startDateInMilliseconds < b.startDateInMilliseconds) return -1
        if (a.startDateInMilliseconds > b.startDateInMilliseconds) return 1

        return 0
      })

      return result
    }

  }

  customElements.define('calendar-area', Calendar);
})();
