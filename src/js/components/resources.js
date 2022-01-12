'use strict';
import { fullPostsData } from '../utils/utils';
import '../../css/components/resources.css';
import html from '../../templates/resources.html';

(function() {
  class Resources extends HTMLElement {
    constructor() {
      super();
    }

    connectedCallback() {
      this.innerHTML = html;
      this.addListeners();
    }

    addListeners() {
      window.addEventListener('on-get-preferences', (evt) => {
        const arr = evt.detail.split('||')
        this.fetchResources(arr[0]);
      });
    }

    fetchResources(profile) {
      if (!profile) profile = 'fe'
      const rssFetch = new Request(`https://resourcery.vercel.app/feed-${profile}.json`)
      const options = {
        method: 'GET'
      }
      fetch(rssFetch, options)
        .then(response => response.json())
        .then(data => {
          this.buildPostsList(data)
        })
        .catch(console.error)
    }

    buildPostsList(postsList) {
      const listWrapper = document.querySelector('.posts__list')
      const rowTemplate = document.querySelector('.post-template')
      fullPostsData = postsList

      postsList.forEach((item, idx) => {
        if (!item['content:encoded']) {
          item['content:encoded'] = item.description
        }
        const clonedItem = rowTemplate.content.cloneNode(true)
        clonedItem.querySelector('.post__title').innerText = item.title
        clonedItem.querySelector('.post__provider').innerText = item.providerTitle
        clonedItem.querySelector('.post__provider').setAttribute('href', item.providerURL)
        clonedItem.querySelector('.posts__list-item').setAttribute('data-provider', item.providerTitle)
        clonedItem.querySelector('.posts__list-item').setAttribute('data-idx', item.providerIdx)
        clonedItem.querySelector('.post__description').innerHTML = `${String(item.description).substring(0, 130)}...`
        clonedItem.querySelector('.post__link').setAttribute('href', item.link)
        clonedItem.querySelector('.btn-modal').setAttribute('data-idx', idx)
        listWrapper.append(clonedItem)
      })
    }

  }

  customElements.define('resources-area', Resources);
})();
