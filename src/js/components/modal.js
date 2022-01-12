'use strict';
import { fullPostsData } from '../utils/utils';

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
      this.setup();
    }

    setup() {
      const myModal = document.getElementById('contentModal')
      myModal.addEventListener('show.bs.modal', function (evt) {
        const element = fullPostsData[evt.relatedTarget.getAttribute('data-idx')]
        modalBody.innerHTML = element['content:encoded']
      })
    }
  }

  customElements.define('custom-modal', Modal);
})();
