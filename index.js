const http = require('http');
const url = require('url');
const fs = require('fs');
const path = require('path');
const mkdirp = require('mkdirp');
const https = require('https');
const express = require('express');

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

let pngPipeline = 0;
let pngPipelineError = 0;

var rmdirRec = function (path) {
	try {
		if (fs.existsSync(path)) {
			fs.readdirSync(path).forEach(function (file) {
				var curPath = path + '/' + file;
				if (fs.lstatSync(curPath).isDirectory()) { // recurse
					rmdirRec(curPath);
				} else { // delete file
					fs.unlinkSync(curPath);
				}
			});
			fs.rmdirSync(path);
		}
	} catch (e) {

	}
};

rmdirRec(path.resolve('images/_backup'));

const server = express()
	.use(express.static(path.join(__dirname, 'public')))
	.get('*', (req, res) => {
		parseRequest(req, res);
		// res.setTimeout(1000, function () {
		// 	pngProgress('error');
		// });
	})
	.listen(port, () =>
		console.log('Express is working on port ' + port)
	);

server.timeout = 60000;

function savePng(uri, dir, file, callback) {
	(function (uri, dir, file, callback) {
		const protocol = uri.indexOf('https://') > -1 ? https : uri.indexOf('http://') > -1 ? http : null;
		if (protocol) {
			protocol.get(uri, function (res) {
				(function (file, callback) {
					let dataPng = '';
					res.setEncoding('binary');
					res.on('data', (chunk) => {
						dataPng += chunk;
					});
					res.on('end', () => {
						fs.writeFile(dir + '/' + file, dataPng, 'binary', function (err) {
							if (err) {
								console.log('Error: ' + err.message);
								callback(null);
							} else {
								callback(dataPng);
							}
						});
					});
				})(file, callback);

			}).on('error', (err) => {
				console.log('Error: ' + err.message);
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
	const images = data.match(/"ou":".*?"/g) || [];
	const imagesAlt = data.match(/"tu":".*?"/g) || [];
	const imageIndex = parseInt(pth.file);
	const i = imageIndex % images.length;
	if (images.length && images[i]) {
		let image = unicodeToChar(images[i].replace(/"ou":"(.*?)"/, '$1'));
		if (image.indexOf('x-raw-image:///') === 0) {
			image = unicodeToChar(imagesAlt[i].replace(/"tu":"(.*?)"/, '$1'));
		}
		savePng(image, pth.dir, pth.file, function (png) {
			for (let im = 0; im < images.length; im++) {
				let imageThis = unicodeToChar(images[im].replace(/"ou":"(.*?)"/, '$1'));
				if (imageThis.indexOf('x-raw-image:///') === 0) {
					imageThis = unicodeToChar(imagesAlt[im].replace(/"tu":"(.*?)"/, '$1'));
				}
				const imageIndexThis = Math.floor(parseInt(pth.file) / images.length) * images.length + im;
				imageList['i' + imageIndexThis] = imageThis;
			}
			callback(png, imageList);
		});
	}
}

function updateImageList(pth, imageList) {
	fs.writeFile(pth.dir + '/_images.json', JSON.stringify(imageList), (er) => {
	});
}

function pngProgress(text) {
	if (text === 'error') {
		//pngPipeline--;
		//pngPipelineError++;
	} else if (text === 'found') {
		pngPipeline++;
	} else if (text === 'saved') {
		pngPipeline--;
	}
	//console.log(pngPipeline, pngPipelineError);
	process.stdout.write('PNG ' + text + ' ' + '.'.repeat(pngPipeline) + '\x1b[31m.\x1b[0m'.repeat(pngPipelineError) + ' \r');
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
			response.writeHead(200, {
				'Access-Control-Allow-Origin': '*',
				'Content-Type': 'image/png'
			});
			fs.access(pth.dir + '/' + pth.file, fs.constants.F_OK, (notFound) => {
				if (notFound) {
					if (imageList['i' + parseInt(pth.file)]) {
						savePng(imageList['i' + parseInt(pth.file)], pth.dir, pth.file, function (png) {
							fs.readFile(pth.dir + '/' + pth.file, function (er, dataPng) {
								updateImageList(pth, imageList); // NOT existing image + Found in image list
								pngProgress('saved');
								response.end(dataPng);
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
									fs.readFile(pth.dir + '/' + pth.file, function (er, dataPng) {
										pngProgress('saved');
										updateImageList(pth, imageList); // NOT existing image + NOT found in image list
										response.end(dataPng);
									});
								});
							});
							res.on('error', function (err) {
								pngProgress('error');
								response.end();
							});
						}).on('error', function (err) {
							pngProgress('error');
							response.writeHead(404);
							response.end();
						}).end();
					}
				} else {
					fs.readFile(pth.dir + '/' + pth.file, function (er, dataPng) { // Existing image + Found in image list
						pngProgress('saved');
						response.end(dataPng);
					});
				}
			});
		});
	} else {
		response.writeHead(200, {
			'Access-Control-Allow-Origin': '*',
			'Content-Type': mimetype
		});
		if (fsPathName.match(/\.jpg$/) && !fs.existsSync(baseDirectory + fsPathName)) {
			fsPathName = fsPathName.replace(/\.jpg$/, '.png');
		}
		fileStream = fs.createReadStream(baseDirectory + fsPathName);
		(function (fileStream, response) {
			fileStream.on('open', function () {
				fileStream.pipe(response);
			});
			fileStream.on('error', function (err) {
				response.writeHead(404);
				response.end();
			});
		})(fileStream, response);
	}
}