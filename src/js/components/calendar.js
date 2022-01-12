'use strict';
import { getPrettyHourMinute, getDateDiff, isEventLive, addMillisecondsPropertyToEvents } from '../utils/utils';

(function() {
  const template = `
  <div class="calendar-wrapper userstatus-auth container-fluid">
      <section class="calendar shadow userstatus-auth">
        <h1 class="align-items-center d-flex fs-3">
          <small class="fs-4">📆</small>
          My day:
        </h1>
        <ul class="calendar-list p-0 d-flex flex-wrap">
        </ul>
      </section>
    </div>`
  const templateCalendarEvent = `
  <template class="calendar-event">
    <li class="list-unstyled calendar-event-item w-100">
      <div class="live-wrapper"><span class="bullet-live">•</span>LIVE</div>
      <div class="calendar-attendee-status d-inline-block">
        <span class="accepted">👍</span>
        <span class="declined">👎</span>
        <span class="needsAction">❓</span>
      </div>
      <p class="fs-3 d-inline text-danger event-start-time">8h</p>
      <p class="fs-6 ms-1 d-inline text-danger">(<span class="event-duration"></span>)</p>
      <p class="fs-6"><span class="event-summary"></span><a class="btn btn-info ms-2 mt-0 mb-0 event-hangout d-none" target="_blank" href="">💬</a></p>
    </li>
  </template>`
  class Calendar extends HTMLElement {
    constructor() {
      super();
    }

    connectedCallback() {
      this.userEmail = '';
      this.innerHTML = template + templateCalendarEvent;
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
