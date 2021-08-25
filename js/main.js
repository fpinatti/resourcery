document.addEventListener('DOMContentLoaded', () => {
	let fullData
	const modalBody = document.querySelector('.modal-body')
	let city = ''

	const buildPostsList = (postsList) => {
		const listWrapper = document.querySelector('.posts__list')
		const rowTemplate = document.querySelector('.post-template')
		fullData = postsList

		postsList.forEach((item, idx) => {
			if (!item['content:encoded']) {
				item['content:encoded'] = item.description
			}
			const clonedItem = rowTemplate.content.cloneNode(true)
			clonedItem.querySelector('.post__title').innerText = item.title
			clonedItem.querySelector('.post__provider').innerText = item.providerTitle
			clonedItem.querySelector('.post__provider').setAttribute('href', item.providerURL)
			clonedItem.querySelector('.posts__list-item').setAttribute('data-provider', item.providerTitle)
			clonedItem.querySelector('.post__description').innerHTML = `${String(item.description).substring(0, 130)}...`
			clonedItem.querySelector('.post__link').setAttribute('href', item.link)
			clonedItem.querySelector('.btn-modal').setAttribute('data-idx', idx)
			listWrapper.append(clonedItem);
		})
	}

	const fetchResources = () => {
		const rssFetch = new Request('https://resourcery.vercel.app/feed.json')
		//const headers = new Headers()
		const options = {
			method: 'GET'
		}
		fetch(rssFetch, options)
			.then(response => response.json())
			.then(data => {
				buildPostsList(data)
			})
			.catch(console.error);
	}

	const getLocation = () => {
		const location = new Request('https://geolocation-db.com/json/59e89620-db25-11eb-ad48-73c00c9b92a3')
		//const headers = new Headers()
		const options = {
			method: 'GET'
		}
		return fetch(location, options)
			.then(response => response.json())
			.then(data => {
				city = data.city.toLowerCase()
				//buildPostsList(data)
			})
			.catch(console.error);
	}

	const fetchWeather = () => {
		const endpointWeather = new Request(`https://resourcery.vercel.app/weather-${city}.json`)
		const options = {
			method: 'GET'
		}
		fetch(endpointWeather, options)
			.then(response => response.json())
			.then(data => {
				const cityName = document.querySelector('.city-name')
				const cityTemp = document.querySelector('.city-temp')
				const citySky = document.querySelector('.city-sky')
				cityName.innerText = city
				cityTemp.innerText = Math.round(data.main.feels_like)
				citySky.innerText = data.weather[0].description
			})
			.catch(console.error)
	}

	const setGreetings = () => {
		const myDate = new Date()
		const hourOfDay = myDate.getHours()
		const greet = document.querySelector('.greet')
		let greetString = 'Hello'
		if (hourOfDay > 5 && hourOfDay <= 12) {
			greetString = 'Good morning'
		}
		if (hourOfDay > 12 && hourOfDay <= 18) {
			greetString = 'Good afternoon'
		}
		if (hourOfDay > 18 && hourOfDay <= 23) {
			greetString = 'Good night'
		}
		if (hourOfDay >= 0 && hourOfDay < 5) {
			greetString = 'It\'s late'
		}

		greet.innerText = greetString

	}

	const initModal = () => {
		const myModal = document.getElementById('contentModal')
		myModal.addEventListener('show.bs.modal', function (evt) {
			const element = fullData[evt.relatedTarget.getAttribute('data-idx')]
			modalBody.innerHTML = element['content:encoded']
		})
	}

	const onNameChange = (evt) => {
		localStorage.setItem('rscry-un', evt.target.value);
	}

	const onCalendarChange = (evt) => {
		localStorage.setItem('rscry-uc', evt.target.value);
	}

	const addListeners = () => {
		const nameField = document.querySelector('.userName')
		const calendarField = document.querySelector('.userCalendar')
		nameField.addEventListener('change', onNameChange)
		calendarField.addEventListener('change', onCalendarChange)
	}

	const getUserPrefs = () => {
		const userName = localStorage.getItem('rscry-un')
		const userCalendar = localStorage.getItem('rscry-uc')
		if (userName) {
			const nameField = document.querySelector('.userName')
			nameField.value = localStorage.getItem('rscry-un')
		}
		if (userCalendar) {
			const calendarField = document.querySelector('.userCalendar')
			calendarField.value = localStorage.getItem('rscry-uc')
			const calendar = document.querySelector('.calendar-frame')
			calendar.setAttribute('src', localStorage.getItem('rscry-uc'))
		}
	}

	const getCalendar = () => {

		//return calendar list
		// need scope https://www.googleapis.com/auth/calendar.readonly
		//GET https://www.googleapis.com/calendar/v3/users/me/calendarList

		// get calendar with id
		//GET https://www.googleapis.com/calendar/v3/calendars/calendarId
	}

	//https://developers.google.com/identity/sign-in/web/sign-in
	const getBasicProfile = (googleUser) => {
		var profile = googleUser.getBasicProfile();
		console.log('ID: ' + profile.getId()); // Do not send to your backend! Use an ID token instead.
		console.log('Name: ' + profile.getName());
		console.log('Image URL: ' + profile.getImageUrl());
		console.log('Email: ' + profile.getEmail()); // This is null if the 'email' scope is not present.
	}

	const handleCredentialResponse = () => {
		console.log('111');
	};
	window.onload = function () {
	  google.accounts.id.initialize({
		client_id: '85500286524-e912nst858563iib207gbhhmcg240fol.apps.googleusercontent.com',
		callback: handleCredentialResponse
	  });
	  //google.accounts.id.prompt();
	}

	//https://developer.chrome.com/docs/apps/app_identity/
	fetchResources()
	getLocation()
		.then(() => {
			fetchWeather()
			setGreetings()
		})
	initModal()
	addListeners()
	getUserPrefs()

	// getCalendar()
})
