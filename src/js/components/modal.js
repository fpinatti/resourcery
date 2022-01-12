'use strict';
import { fullPostsData } from '../utils/utils';
import html from '../../templates/modal.html';

(function() {
  class Modal extends HTMLElement {
    constructor() {
      super();
    }

    connectedCallback() {
      this.innerHTML = html;
      this.setup();
    }

    setup() {
      const myModal = document.getElementById('contentModal')
      const modalBody = myModal.querySelector('.modal-body');
      myModal.addEventListener('show.bs.modal', function (evt) {
        const element = fullPostsData[evt.relatedTarget.getAttribute('data-idx')]
        modalBody.innerHTML = element['content:encoded']
      })
    }
  }

  customElements.define('custom-modal', Modal);
})();
