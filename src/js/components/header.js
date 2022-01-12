'use strict';

(function() {
  const template = `
  <header>
		<img
			src="img/logo.svg"
			class="top-logo"
		/>
	</header>`
  class Header extends HTMLElement {
    constructor() {
      super();
    }

    connectedCallback() {
      this.innerHTML = template;
    }
  }

  customElements.define('custom-header', Header);
})();
