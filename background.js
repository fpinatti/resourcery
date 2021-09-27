const API_KEY = "AIzaSyCACn68SfWwozQbzOXYPqCskkN-XKlgNug";

let user_signed_in = false;

chrome.identity.onSignInChanged.addListener(function (account_id, signedIn) {
	if (signedIn) {
		user_signed_in = true;
	} else {
		user_signed_in = false;
	}

	alert(
		`User sign-In status: ${user_signed_in ? "Signed In" : "Signed Out"}`
	);
});

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
