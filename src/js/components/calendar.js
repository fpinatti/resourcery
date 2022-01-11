'use strict';


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
  class Calendar extends HTMLElement {
    constructor() {
      super();
    }

    connectedCallback() {
      this.innerHTML = template;
    }
  }

  customElements.define('calendar-area', Calendar);
})();