const Promise = require("bluebird");
const mongoose = require("mongoose");

/**
 * Article Schema
 */
const ArticleSchema = new mongoose.Schema({
	posturl: {
		type: String,
		required: true
	},
	articleView: {
		type: String,
		required: true
	},
	smallthumburl: {
		type: String,
		required: true
	},
	bigthumburl: {
		type: String,
		required: true
	},
	title: {
		type: String,
		required: true
	},
	shortDescription: {
		type: String,
		required: true
	},	
	feed: {
		type: String,
		required: true
	},
	createdAt: {
		type: Date,
		default: Date.now
	},
	updatedAt: {
		type: Date,
		default: Date.now
	}
});

/**
 * Statics
 */
ArticleSchema.statics = {
	/**
	* List articles in descending order of 'createdAt' timestamp.
	* @param {number} skip - Number of articles to be skipped.
	* @param {number} limit - Limit number of articles to be returned.
	* @returns {Promise<Article[]>}
	*/
	list({ skip = 0, limit = 50, feed = 'news' } = {}) {
		return this.find({feed: feed})
			.sort({ createdAt: -1 })
			.skip(+skip)
			.limit(+limit)
			.exec();
	}
};

/**
 * @typedef Article
 */
module.exports = mongoose.model("Article", ArticleSchema);
