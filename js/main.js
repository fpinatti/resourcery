document.addEventListener('DOMContentLoaded', () => {
	let fullData
	const modalBody = document.querySelector('.modal-body')
	const city = 'campinas'

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
			clonedItem.querySelector('.post__provider').innerText = item.provider
			clonedItem.querySelector('.post__provider').setAttribute('data-provider', item.provider)
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

	// const updateSigninStatus = (isSignedIn) => {
	// 	console.log('uodate sign in status')
	// }

	// const initClient = () => {
	// 	console.log('init client')

	// 	gapi.client.init({
	// 		apiKey: 'AIzaSyCg4bkUSxBl9CUo0pPsqHtO9Px1_gy-Jx4',
	// 		discoveryDocs: ["https://people.googleapis.com/$discovery/rest?version=v1"],
	// 		clientId: '85500286524-e912nst858563iib207gbhhmcg240fol.apps.googleusercontent.com',
	// 		scope: 'profile'
	// 	}).then(function () {
	// 		// Listen for sign-in state changes.
	// 		//gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);

	// 		// Handle the initial sign-in state.
	// 		//updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());

	// 		// authorizeButton.onclick = handleAuthClick;
	// 		// signoutButton.onclick = handleSignoutClick;
	// 	});
	// 	// // 2. Initialize the JavaScript client library.
	// 	// gapi.client.init({
	// 	// 	'apiKey': 'AIzaSyCg4bkUSxBl9CUo0pPsqHtO9Px1_gy-Jx4',
	// 	// 	// clientId and scope are optional if auth is not required.
	// 	// 	'clientId': '85500286524-e912nst858563iib207gbhhmcg240fol.apps.googleusercontent.com',
	// 	// 	'scope': 'profile',
	// 	// }).then(function () {
	// 	// 	// 3. Initialize and make the API request.
	// 	// 	return gapi.client.request({
	// 	// 		'path': 'https://people.googleapis.com/v1/people/me?requestMask.includeField=person.names',
	// 	// 	})
	// 	// }).then(function (response) {
	// 	// 	console.log(response.result);
	// 	// }, function (reason) {
	// 	// 	console.log('Error: ' + reason.result.error.message);
	// 	// });
	// };

	// const initGAPI = () => {
	// 	gapi.load('client:auth2', initClient);
	// }

	fetchResources()
	fetchWeather()
	setGreetings()
	initModal()
	addListeners()
	getUserPrefs()
	//initGAPI()
})
