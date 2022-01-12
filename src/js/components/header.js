'use strict';
import html from '../../templates/header.html';

(function() {
  class Header extends HTMLElement {
    constructor() {
      super();
    }

    connectedCallback() {
      this.innerHTML = html;
    }
  }

  customElements.define('custom-header', Header);
})();
