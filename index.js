const express = require('express');

const app = express();
app.set('port', process.env.PORT || 80);
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
	res.send('hey');
});

app.listen(app.get('port'), () => {
	console.log(`App listening on port ${app.get('port')}.`);
});