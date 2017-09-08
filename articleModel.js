const Promise = require('bluebird');
const mongoose = require('mongoose');

/**
 * Article Schema
 */
const ArticleSchema = new mongoose.Schema({
	rssid: {
		type: String,
		required: true,
	},
	posturl: {
		type: String,
		required: true,
	},    
	thumburl: {
		type: String,
		required: true,
	},
	createdAt: {
		type: Date,
		default: Date.now,
	},
	updatedAt: {
		type: Date,
		default: Date.now,
	}
});

/**
 * @typedef Article
 */
module.exports = mongoose.model('Article', ArticleSchema);
