'use strict';
(function() {
  class Preferences extends HTMLElement {
    constructor() {
      super();
    }

    connectedCallback() {
      this.getPreferences();
    }

    getPreferences() {
      chrome.storage.sync.get({
        role: ''
      }, (data) => {
        window.dispatchEvent(
          new CustomEvent('on-get-preferences',
          { detail: data.role }
        ));
      });
    }
  }

  customElements.define('user-preferences', Preferences);
})();
