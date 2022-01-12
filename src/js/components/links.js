'use strict';
import '../../css/components/useful-links.css';
import html from '../../templates/links.html';

(function() {

  class Links extends HTMLElement {
    constructor() {
      super();
    }

    connectedCallback() {
      this.innerHTML = html;
    }
  }

  customElements.define('links-area', Links);
})();
