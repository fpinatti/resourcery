'use strict';


(function() {
  const template = `
  <section class="posts shadow">
            <h2>Resources <span class="role-title"></span></h2>
            <ul class="posts__list">

            </ul>
          </section>`
  class Resources extends HTMLElement {
    constructor() {
      super();
    }

    connectedCallback() {
      this.innerHTML = template;
    }
  }

  customElements.define('resources-area', Resources);
})();