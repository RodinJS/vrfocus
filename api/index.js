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

function filter(articles) {

	let filteredArticles = [];
	// console.log(articles[0]);
	for (let i = 0; i < articles.length; i++) {
		filteredArticles[i] = {
	        title: articles[i].title,
	        mainView: 'http://13.72.78.165/' + articles[i].smallthumburl + '.jpg',
	        shortDescription : articles[i].shortDescription,
	        newsPaperView: 'http://13.72.78.165/' + articles[i].articleView + '.jpg',
	        header: 'http://13.72.78.165/' + articles[i].bigthumburl + '.jpg',
		}
	}
	return filteredArticles;
}

/**
 * Get article list.
 * @property {number} req.query.skip - Number of articles to be skipped.
 * @property {number} req.query.limit - Limit number of articles to be returned.
 * @returns {Article[]}
 */
function list(req, res, next) {
  const { limit = 50, skip = 0, feed = 'news' } = req.query;
  Article.list({ limit, skip, feed })
    .then(articles => res.json(filter(articles)))
    .catch(e => next(e));
}

app.get('/list', (req, res, next) => { // GET /list?limit=2&skip=2
	list(req, res, next);
});

app.use((err, req, res, next) => {
    res.status(err.status).json({
        success: false,
        error: err
    });
});

app.listen(config.port, () => {
	console.log(`vrfocus public api listening on port ${config.port}!`);
});
