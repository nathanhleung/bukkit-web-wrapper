(async () => {
	new Fingerprint2().get((result, components) => {
		const user_agent = components[0].value;
		document.getElementById('fingerprint').value = JSON.stringify({
			hash: result,
			user_agent,
		});
	});

	const app = new Vue({
	    el: '#app',
	    data: {
	    	onlineCount: 0,
	    },
	  });

	  const res = await fetch('/api/users-online');
	  const json = await res.json();
	  
	  if (json.success) {
	  	const { onlineCount } = json;
	  	app.onlineCount = onlineCount;
	  }
})();