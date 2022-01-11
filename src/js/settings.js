import Bootstrap from 'bootstrap/dist/js/bootstrap.bundle.js';

/* global chrome */
document.addEventListener('DOMContentLoaded', () => {
  const role = document.querySelector('.role-picker')
  const toastMsg = document.querySelector('#liveToast')
  const toast = new Bootstrap.Toast(toastMsg)

  const updateRole = (evt) => {
    const selectValue = evt.target.value
    if (selectValue) {
      savePrefs({ role: selectValue })
    }
  }

  const savePrefs = (setting) => {
    chrome.storage.sync.set(setting, function () {
      toast.show()
    })
  }

  const getPrefs = () => {
    chrome.storage.sync.get({
      role: ''
    }, function (items) {
      role.value = items.role
    })
  }

  const addListeners = () => {
    role.addEventListener('change', updateRole)
  }

  addListeners()
  getPrefs()
})
