const Promise = require("bluebird");
const mongoose = require("mongoose");
const Pageres = require("pageres");
const shortid = require("shortid");
const feedparser = require("feedparser-promised");
const config = require("../config");
const Article = require("../articleModel");

const request = require("request-promise");
const download = require("image-downloader");
const rq = require("request");
const fs = require("fs");
const cheerio = require("cheerio");
const sharp = require("sharp");
const Jimp = require("jimp");

Promise.promisifyAll(mongoose);

mongoose.connect(config.db, { server: { socketOptions: { keepAlive: 1 } } });
mongoose.connection.on("error", () => {
	throw new Error(`Unable to connect to database: ${config.db}`);
});

let rssurl = "https://www.vrfocus.com/feed/";

let previewUrl = 'https://www.vrfocus.com/category/previews/feed/';
let featuresUrl = 'https://www.vrfocus.com/category/features/feed/';
let reviewsUrl = 'https://www.vrfocus.com/category/reviews/feed/';

let newsUrl = 'https://www.vrfocus.com/category/news/feed/';
let trendingUrl = 'https://www.vrfocus.com/category/trending/feed//';


const options = {
	delay: 25,
	scale: 2,
	transparent: true,
	filename: "",
	format: "jpg",
	css: "./none.css",
	userAgent:
		"Mozilla/5.0 (iPhone; CPU iPhone OS 9_1 like Mac OS X) AppleWebKit/601.1.46 (KHTML, like Gecko) Version/9.0 Mobile/13B143 Safari/601.1"
};

let parse = function(url) {
	return new Promise((resolve, reject) => {
		let generatedFileName = shortid.generate();
		options.filename = generatedFileName;

		const articleHead = new Pageres(options)
			// .src(url, ["iPhone 6 Plus"])
			.src(url, ["512x256"])
			.dest(`${__dirname}/img`)
			.run()
			.then(() => resolve(generatedFileName))
			.catch(e => {
				console.log(e);
				reject(e);
			});
	});
};

let check = function(url) {
	return new Promise((resolve, reject) => {
		Article.countAsync({ posturl: url }, (err, count) => {
			if (count > 0) {
				reject("Article already exist!");
			} else {
				resolve(true);
			}
		});
	});
};

let save = function(
	url,
	title,
	description,
	articleView,
	smallThumb,
	bigThumb,
	feed
) {
	return new Promise((resolve, reject) => {
		check(url)
			.then(new_article => {
				const article = new Article({
					posturl: url,
					title: title,
					shortDescription: description,
					articleView: articleView,
					smallthumburl: smallThumb,
					bigthumburl: bigThumb,
					feed: feed
				});
				return article.saveAsync();
			})
			.then(savedArticle => resolve(savedArticle))
			.catch(e => {
				console.log(e);
				reject(e);
			});
	});
};

let getImage = function(pageUrl, imageName, position) {
	return new Promise((resolve, reject) => {
		let crop = {};
		if(position == 'vertical') {
			crop.width = 192;
			crop.heigth = 256;			
		} else {
			crop.width = 256;
			crop.heigth = 192;
		}


		const coverOptions = {
			uri: pageUrl,
			transform: function(body) {
				return cheerio.load(body);
			}
		};

		const imageoptions = {
			url: "",
			dest: `${__dirname}/img/original/`
		};

		// optimize main images
		Jimp.read(`${__dirname}/img/${imageName}.jpg`).then(image => {
				image.resize(1024, Jimp.AUTO);
				image.write(`${__dirname}/img/${imageName}.jpg`)
			}).catch(err => {
				reject(err);
			});

		request(coverOptions)
			.then($ => {
				let gago = $(".post-tp-6-header")
					.css("background-image")
					.replace(/^url\((.*?)\)$/, "$1");
				console.log(gago);
				imageoptions.url = gago;
				download
					.image(imageoptions)
					.then(({ filename, image }) => {
						sharp(filename)
							.resize(512, 256)
							.toFile(
								`${__dirname}/img/${imageName}-big.jpg`,
								(err, info) => {
									console.log(err, info);
									sharp(filename)
										.resize(crop.width, crop.heigth, {
											centreSampling: true
										})
										.toFile(
											`${__dirname}/img/${imageName}-small.jpg`,
											(err, info) => {
												console.log(err, info);
												if (err) {
													reject(err);
												}
												resolve(info);
											}
										);
								}
							);
					})
					.catch(err => {
						console.error("img download error: ", err);
						reject(err);
					});
			})
			.catch(err => {
				console.error("request parser error: ", err);
				reject(err);
			});
	});
};


let startParse = function(url, feed, cropPosition) {
	return new Promise((resolve, reject) => {
		feedparser
			.parse(url)
			.then(items => {
				items.forEach((item, value) => {
					check(item["link"])
						.then(new_article => parse(item["link"]))
						.then(fileName =>
							save(
								item["link"],
								item["title"],
								item["summary"],
								fileName,
								fileName + "-small",
								fileName + "-big",
								feed
							)
						)
						.then(savedArticle =>
							getImage(item["link"], savedArticle.articleView, cropPosition)
						)
						.catch(e => {console.error("parse error: ", e); reject(e); });
				});
			})
			.catch(error => {console.error("feedparser error: ", error); reject(error); });
	})
}


startParse(previewUrl, 'previews', 'horizonal');
startParse(featuresUrl, 'features', 'horizonal');
startParse(reviewsUrl, 'reviews', 'horizonal');

startParse(newsUrl, 'news', 'vertical');
startParse(trendingUrl, 'trending', 'vertical');