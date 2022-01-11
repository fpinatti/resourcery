'use strict';


(function() {
  const template = `
    <div
      class="modal"
      id="contentModal"
      tabindex="-1"
    >
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <button
              type="button"
              class="btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
            ></button>
          </div>
          <div class="modal-body">

          </div>
        </div>
      </div>
    </div>`
  class Modal extends HTMLElement {
    constructor() {
      super();
    }

    connectedCallback() {
      this.innerHTML = template;
    }
  }

  customElements.define('custom-modal', Modal);
})();
