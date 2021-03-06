const http = require('http');
const url = require('url');
const fs = require('fs');
const path = require('path');
const mkdirp = require('mkdirp');
const https = require('https');
const express = require('express');
const chalk = require('chalk');

const baseDirectory = __dirname;

const port = process.env.PORT || 5000;
const host = process.env.IP || '127.0.0.1';

var mimetypes = {
	'.html': 'text/html',
	'.js': 'text/javascript',
	'.css': 'text/css',
	'.txt': 'text/plain',
	'.jpg': 'image/jpeg',
	'.gif': 'image/gif',
	'.svg': 'image/svg+xml',
	'.png': 'image/png',
	'.ico': 'image/x-icon',
	'.ttf': 'application/x-font-ttf',
	'.woff': 'application/x-font-woff',
	'.woff2': 'text/plain'
};

var magicImageNumbers = {
	jpg: 'ffd8ffe0',
	png: '89504e47',
	gif: '47494638'
};

let pngPipeline = 0;
let pngPipelineError = 0;
let pngPipelineSuccess = 0;

var rmdirRec = function (path) {
	try {
		if (fs.existsSync(path)) {
			fs.readdirSync(path).forEach(function (file) {
				var curPath = path + '/' + file;
				if (fs.lstatSync(curPath).isDirectory()) { // recurse
					rmdirRec(curPath);
				} else if (file !== '_images.json') { // delete file
					fs.unlinkSync(curPath);
				}
			});
			//fs.rmdirSync(path);
		}
	} catch (e) {

	}
};

clearAll();

const server = express()
	.use(express.static(path.join(__dirname, 'public')))
	.get('/reset', (req, res) => {
		clearAll();
		res.redirect('/');
	})
	.get('*', (req, res) => {
		parseRequest(req, res);
		res.setTimeout(30000, function () {
			pngProgress('error');
			res.status(404).end();
		});
	})
	.listen(port, () =>
		console.log('Express is working on port ' + port)
	);

server.timeout = 60000;

function clearAll() {
	rmdirRec(path.resolve('images/_backup'));
}

function savePng(uri, dir, file, callback) {
	(function (uri, dir, file, callback) {
		const protocol = uri.indexOf('https://') > -1 ? https : uri.indexOf('http://') > -1 ? http : null;
		if (protocol) {
			protocol.get(uri, function (res) {
				if (res.statusCode === 301 && res.headers.location && res.headers.location !== uri) { // image moved
					savePng(res.headers.location, dir, file, callback);
				} else {
					(function (file, callback) {
						let dataPng = '';
						res.setEncoding('binary');
						res.on('data', (chunk) => {
							dataPng += chunk;
						});
						res.on('end', () => {
							var magicImageNumbersInBody =
								dataPng.charCodeAt(0).toString(16) +
								dataPng.charCodeAt(1).toString(16) +
								dataPng.charCodeAt(2).toString(16) +
								dataPng.charCodeAt(3).toString(16);
							if (magicImageNumbersInBody === magicImageNumbers.jpg ||
								magicImageNumbersInBody === magicImageNumbers.png ||
								magicImageNumbersInBody === magicImageNumbers.gif) {
								fs.writeFile(dir + '/' + file, dataPng, 'binary', function (err) {
									if (err) {
										//console.log('Error: ' + err.message);
										callback(null);
									} else {
										callback(dataPng);
									}
								});
							} else {
								callback(dataPng);
							}
						});
					})(file, callback);
				}
			}).on('error', (err) => {
				//console.log('Error: ' + err.message);
				callback(null);
			});
		} else {
			callback(null);
		}
	})(uri, dir, file, callback);
}

function unicodeToChar(text) {
	return text.replace(/\\u[\dA-F]{4}/gi,
		function (match) {
			return String.fromCharCode(parseInt(match.replace(/\\u/g, ''), 16));
		});
}

function savePngs(pth, data, imageList, callback) {
	// const images = data.match(/"ou":".*?"/g) || [];
	// const imagesAlt = data.match(/"tu":".*?"/g) || [];
	let images = data.replace(/^[\w\W]*?AF_initDataCallback\({key: 'ds:1', isError:  false , hash: '2', data:([\w\W]*?)}\);[\w\W]*?$/g, '$1') || '{}';
	try {
		images = JSON.parse(images);
		images = images[31][0][12][2].map(item => item[1] ? [item[1][2][0], item[1][3][0]] : ['', '']);
		//fs.writeFile('_temp.json', JSON.stringify(images, null ,2), () => {});
		const imageIndex = parseInt(pth.file);
		const i = imageIndex % images.length;
		if (images.length && images[i]) {
			// let image = unicodeToChar(images[i].replace(/"ou":"(.*?)"/, '$1'));
			let image = images[i][1];
			if (image.indexOf('x-raw-image:///') === 0) { 
				// image = unicodeToChar(imagesAlt[i].replace(/"tu":"(.*?)"/, '$1'));
				image = images[i][0];
			}
			savePng(image, pth.dir, pth.file, function (png) {
				for (let im = 0; im < images.length; im++) {
					// let imageThis = unicodeToChar(images[im].replace(/"ou":"(.*?)"/, '$1'));
					let imageThis = images[im][1];
					if (imageThis.indexOf('x-raw-image:///') === 0) {
						//imageThis = unicodeToChar(imagesAlt[im].replace(/"tu":"(.*?)"/, '$1'));
						imageThis = images[im][0];
					}
					const imageIndexThis = Math.floor(parseInt(pth.file) / images.length) * images.length + im;
					imageList['i' + imageIndexThis] = imageThis;
				}
				callback(png, imageList);
			});
		}
	} catch(err) {}
}

function updateImageList(pth, imageList) {
	fs.writeFile(pth.dir + '/_images.json', JSON.stringify(imageList), (er) => {
	});
}

function pngProgress(text) {
	if (text === 'error') {
		pngPipeline = pngPipeline > 0 ? pngPipeline - 1 : 0;
		pngPipelineError++;
	} else if (text === 'found') {
		pngPipeline++;
	} else if (text === 'saved') {
		pngPipeline = pngPipeline > 0 ? pngPipeline - 1 : 0;
		pngPipelineSuccess++;
	}
	let sameLine = pngPipeline === 0 ? '\n' : '\r';
	var bar = '▉';
	process.stdout.write('IMAGE ' + text + ' ' + chalk.green(bar.repeat(pngPipelineSuccess)) + chalk.gray(bar.repeat(pngPipeline)) + chalk.red(bar.repeat(pngPipelineError)) + ' ' + sameLine);
	if (pngPipeline === 0) {
		pngPipelineError = 0;
		pngPipelineSuccess = 0;
	}
}

function parseRequest(req, response) {
	const requestUrl = url.parse(req.url);
	fsPathName = requestUrl.pathname === '/' ? '/index.html' : requestUrl.pathname;

	const ext = path.extname(fsPathName);
	const mimetype = mimetypes[ext] || 'text/plain';

	if (fsPathName.indexOf('/search') === 0) {
		pngProgress('found');
		const rx = /^.*?[\?&]tdPath=(.*)[\/\\](.*?)($|&.*?$)/;
		const pth = {
			dir: path.resolve('images/_backup' + requestUrl.query.replace(rx, '$1')),
			file: requestUrl.query.replace(rx, '$2')
		};
		let imageList;
		try {
			fs.accessSync(pth.dir + '/_images.json');
			imageList = JSON.parse(fs.readFileSync(pth.dir + '/_images.json')) || {};
		} catch (err) {
			imageList = {};
		}
		fs.access(pth.dir, fs.constants.F_OK, (notFound) => {
			if (notFound) {
				mkdirp.sync(pth.dir);
			}
			response.header('Access-Control-Allow-Origin', '*');
			response.header('vary', 'Accept-Encoding');
			fs.access(pth.dir + '/' + pth.file, fs.constants.F_OK, (notFound) => {
				if (notFound) {
					if (imageList['i' + parseInt(pth.file)]) {
						savePng(imageList['i' + parseInt(pth.file)], pth.dir, pth.file, function (png) {
							fs.readFile(pth.dir + '/' + pth.file, function (err, dataPng) {
								pngProgress('saved');
								updateImageList(pth, imageList); // NOT existing image + Found in image list
								if (!response.headersSent) {
									response.header('image-reference-url', imageList['i' + pth.file]);
								}
								response.status(200).end(dataPng);
							});
						});
					} else {
						const googlePath = fsPathName + '?' + requestUrl.query;
						var options = {
							host: 'www.google.com',
							port: 443,
							path: googlePath,
							method: 'GET',
							headers: {
								'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3396.99 Safari/537.36'
							}
						};
						let data = '';
						https.request(options, function (res) {
							res.on('data', function (chunk) {
								data += chunk;
							});
							res.on('end', function () {
								savePngs(pth, data, imageList, function (img, imageList) {
									if (img) {
										fs.readFile(pth.dir + '/' + pth.file, function (err, dataPng) {
											pngProgress('saved');
											updateImageList(pth, imageList); // NOT existing image + NOT found in image list
											if (!response.headersSent) {
												response.header('image-reference-url', imageList['i' + pth.file]);
											}
											response.status(200).end(dataPng);
										});
									} else {
										pngProgress('error');
										updateImageList(pth, imageList); // NO valid image + NOT found in image list
										if (!response.headersSent) {
											response.header('image-reference-url', imageList['i' + pth.file]);
										}
										response.status(404).end();
									}
								});
							});
							res.on('error', function (err) {
								pngProgress('error');
								response.status(404).end();
							});
						}).on('error', function (err) {
							pngProgress('error');
							response.status(404).end();
						}).end();
					}
				} else {
					fs.readFile(pth.dir + '/' + pth.file, function (err, dataPng) { // Existing image + Found in image list
						pngProgress('saved');
						if (!response.headersSent) {
							response.header('image-reference-url', imageList['i' + pth.file]);
						}
						response.status(200).end(dataPng);
					});
				}
			});
		});
	} else {
		if (fsPathName.indexOf('/index.html') > -1) {
			pngPipeline = 0;
			pngPipelineError = 0;
			pngPipelineSuccess = 0;
		}
		response.writeHead(200, {
			'Access-Control-Allow-Origin': '*',
			'Content-Type': mimetype
		});
		//if (fsPathName.match(/\.jpg$/) && !fs.existsSync(baseDirectory + fsPathName)) {
		//fsPathName = fsPathName.replace(/\.jpg$/, '.png');
		//}
		fileStream = fs.createReadStream(baseDirectory + fsPathName);
		(function (fileStream, response) {
			fileStream.on('open', function () {
				fileStream.pipe(response);
			});
			fileStream.on('error', function (err) {
				response.end();
			});
		})(fileStream, response);
	}
}