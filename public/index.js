(() => {
	new Fingerprint2().get((result, components) => {
		const user_agent = components[0].value;
		document.getElementById('fingerprint').value = JSON.stringify({
			hash: result,
			user_agent,
		});
	});
})();