const e=async()=>{chrome.identity.getAuthToken({interactive:!0},(function(e){return e}))},t=e=>{const t=new Date;"start"===e?t.setUTCHours(0,0,0,0):t.setUTCHours(23,59,59,999);return t.toISOString()},n=(e,t)=>{chrome.tabs.query({active:!0,currentWindow:!0},(function(n){const o=n[0];chrome.tabs.sendMessage(o.id,{action:"chrome-message",message:e,data:t})}))};chrome.runtime.onMessage.addListener(((o,s,a)=>{"get_auth_token"===o.message?e():"get_profile"===o.message?chrome.identity.getProfileUserInfo({accountStatus:"ANY"},(function(e){n("user_profile",e)})):"get_user_information"===o.message?chrome.identity.getAuthToken({interactive:!0},(function(e){fetch("https://people.googleapis.com/v1/people/me?personFields=names,emailAddresses&key=AIzaSyCACn68SfWwozQbzOXYPqCskkN-XKlgNug",{headers:{Authorization:`Bearer ${e}`}}).then((e=>e.json())).then((e=>n("user_info",e)))})):"get_contacts"===o.message?chrome.identity.getAuthToken({interactive:!0},(function(e){const t={headers:{Authorization:`Bearer ${e}`}};fetch("https://people.googleapis.com/v1/contactGroups/all?maxMembers=20&key=AIzaSyCACn68SfWwozQbzOXYPqCskkN-XKlgNug",t).then((e=>e.json())).then((e=>{if(e.memberCount){const o=e.memberResourceNames;let s="https://people.googleapis.com/v1/people:batchGet?personFields=names&key=AIzaSyCACn68SfWwozQbzOXYPqCskkN-XKlgNug";o.forEach((e=>{s+=`&resourceNames=${encodeURIComponent(e)}`})),fetch(s,t).then((e=>e.json())).then((e=>n("user_contacts",e)))}}))})):"get_calendar_list"===o.message?chrome.identity.getAuthToken({interactive:!0},(function(e){fetch("https://www.googleapis.com/calendar/v3/users/me/calendarList?&key=AIzaSyCACn68SfWwozQbzOXYPqCskkN-XKlgNug",{method:"GET",headers:{Authorization:`Bearer ${e}`,Accept:"application/json"}}).then((e=>e.json())).then((function(e){n("user_calendar_list",e)}))})):"get_calendar_by_id"===o.message?chrome.identity.getAuthToken({interactive:!0},(function(e){const o=t("start"),s=t("end");fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${o}&timeMax=${s}&key=AIzaSyCACn68SfWwozQbzOXYPqCskkN-XKlgNug`,{method:"GET",headers:{Authorization:`Bearer ${e}`,Accept:"application/json"}}).then((e=>e.json())).then((function(e){n("user_calendar_events",e)}))})):"sign_out"===o.message?(async()=>{console.log("AAA");const t=await e();console.log("BBB",t)})():console.log("Command not found!")}));
//# sourceMappingURL=background.js.map