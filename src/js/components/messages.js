'use strict';


(function() {
  class Messages extends HTMLElement {
    constructor() {
      super();
    }

    connectedCallback() {
      this.addListeners()
      this.isUserAuth();
    }

    addListeners() {
      chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.action === 'chrome-message') {
          this.onGetChromeMessage(request.message, request.data)
        }
      })
    }

    onGetChromeMessage(message, objData) {
      switch (message) {
        case 'user_token':
          this.onUserToken(objData)
          break
        case 'user_profile':

          break
        case 'user_info': {
          window.dispatchEvent(
            new CustomEvent('on-get-user-info',
            { detail: objData }
          ));
          break
        }
        case 'user_calendar_events': {
          window.dispatchEvent(
            new CustomEvent('on-get-calendar-events',
            { detail: objData }
          ));
          break
        }
        case 'user_calendar_list': {
          break
        }
      }
    }

    onUserToken(token) {
      this.isUserAuth()
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

    isUserAuth() {
      try {
        chrome.identity.getAuthToken({
          interactive: false
        }, (token) => {
          const isAuth = token || false
          this.resetUIAuthStatus()
          const statusClass = (isAuth) ? '.userstatus-auth' : '.userstatus-unauth'
          const statusElements = document.querySelectorAll(statusClass)
          statusElements.forEach((element) => {
            element.classList.add('d-block')
          })
          if (isAuth) {
            document.querySelector('body').classList.add('is-auth')
            this.getAuthInfo()
          }
          window.dispatchEvent(
            new CustomEvent('check-user-auth',
            { detail: token }
          ));
        })
      } catch (err) {
        console.log(err)
      }
    }

    getAuthInfo() {
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

    resetUIAuthStatus() {
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

    checkUserProfile() {
      chrome.runtime.sendMessage({
        message: 'get_profile'
      })
    }

  }

  customElements.define('browser-messages', Messages);
})();
