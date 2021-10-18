const API_KEY = "AIzaSyCACn68SfWwozQbzOXYPqCskkN-XKlgNug";

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
	if (request.message === "get_auth_token") {
		chrome.identity.getAuthToken({ interactive: true }, function (token) {
			console.log(`Token: ${token}`);
		});
	} else if (request.message === "get_profile") {
		chrome.identity.getProfileUserInfo(
			{ accountStatus: "ANY" },
			function (user_info) {
				console.log(user_info);
			}
		);
	} else if (request.message === "get_user_information") {
		chrome.identity.getAuthToken({ interactive: true }, function (token) {
			let fetch_url = `https://people.googleapis.com/v1/people/me?personFields=names,emailAddresses&key=${API_KEY}`;
			let fetch_options = {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			};

			fetch(fetch_url, fetch_options)
				.then((res) => res.json())
				.then((res) => console.log(res));
		});
	} else if (request.message === "get_contacts") {
		chrome.identity.getAuthToken({ interactive: true }, function (token) {
			let fetch_url = `https://people.googleapis.com/v1/contactGroups/all?maxMembers=20&key=${API_KEY}`;
			let fetch_options = {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			};

			fetch(fetch_url, fetch_options)
				.then((res) => res.json())
				.then((res) => {
					if (res.memberCount) {
						const members = res.memberResourceNames;
						fetch_url = `https://people.googleapis.com/v1/people:batchGet?personFields=names&key=${API_KEY}`;

						members.forEach((member) => {
							fetch_url += `&resourceNames=${encodeURIComponent(
								member
							)}`;
						});

						fetch(fetch_url, fetch_options)
							.then((res) => res.json())
							.then((res) => console.log(res));
					}
				});
		});
	}
});
