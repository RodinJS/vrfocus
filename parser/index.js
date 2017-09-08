const Promise = require('bluebird');
const mongoose = require('mongoose');
const Pageres = require('pageres');
const shortid = require('shortid');
const fp = require('feedparser-promised');
const config = require('../config');
const Article = require('../articleModel');

// Promise.promisifyAll(mongoose);

// mongoose.connect(config.db, {server: {socketOptions: {keepAlive: 1}}});
// mongoose.connection.on('error', () => {
// 	throw new Error(`Unable to connect to database: ${config.db}`);
// });

let rssurl = 'https://www.vrfocus.com/feed/';

const options = {
	delay: 10, 
	scale: 3, 
	transparent: true,
	filename: '',
	format: 'jpg', 
	css: './none.css', 
	userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 9_1 like Mac OS X) AppleWebKit/601.1.46 (KHTML, like Gecko) Version/9.0 Mobile/13B143 Safari/601.1"
};



let parse = function(url) {
	return new Promise((resolve, reject) => {
		let generatedFileName = shortid.generate();
		options.filename = generatedFileName;
		const pageres = new Pageres(options)
			.src(url, ['iPhone 6 Plus'] )
			.dest(`${__dirname}/img`)
			.run()
			.then(() => resolve(generatedFileName))
			.catch(e => {console.log(e); reject(e)});
	})
}

// let save = function(url) {
// 	return new Promise((resolve, reject) => {
// 		Article.countAsync({posturl: url}, (err, count) => { (count > 0) ? reject() : resolve() }); 
// 	})
// }



 
fp.parse(rssurl)
	.then((items) => {
		items.forEach((item, value) => {
			(function (value) { 
				parse(item.link)
					.then((fileName) => {
						console.log("filename: ", fileName);
						// save(item.link)
					})
					.catch(e => console.error('error: ', e))
			})(value);
			// console.log('title:', item);
		});
	})
	.catch(error => console.error('error: ', error));