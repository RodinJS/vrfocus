const express = require('express');
const Promise = require('bluebird');
const mongoose = require('mongoose');
const config = require('../config');
const Article = require('../articleModel');

Promise.promisifyAll(mongoose);

mongoose.connect(config.db, {server: {socketOptions: {keepAlive: 1}}});
mongoose.connection.on('error', () => {
	throw new Error(`Unable to connect to database: ${config.db}`);
});

const app = express();

app.get('/', (req, res) => {
	res.send('Hello World!');
})

app.listen(config.port, () => {
	console.log(`vrfocus public api listening on port ${config.port}!`);
})