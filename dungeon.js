const http = require('http');
const url = require('url');
const fs = require('fs');
const path = require('path');
const mkdirp = require('mkdirp');
const https = require('https');

const baseDirectory = __dirname;

const port = process.env.PORT || 8080;

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

http.createServer(function (req, response) {
	try {
		parseRequest(req, response);
	} catch (e) {
		response.writeHead(500);
		response.end();
		console.log(e.stack);
	}
}).listen(port);

console.log('listening on port ' + port);

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
								throw err;
							}
							console.log('PNG SAVED:', file);
							callback(dataPng);
						});
					});
				})(file, callback);

			}).on('error', (err) => {
				console.log('Error: ' + err.message);
			});
		} else {
			callback(null);
		}
	})(uri, dir, file, callback);
}

function savePngs(pth, data, imageList, callback) {
	const images = data.match(/"ou":".*?"/g) || [];
	const imageIndex = parseInt(pth.file);
	const i = imageIndex % images.length;
	if (images.length && images[i]) {
		const image = images[i].replace(/"ou":"(.*?)"/, '$1');
		savePng(image, pth.dir, pth.file, function (png) {
			for (let im = 0; im < images.length; im++) {
				const imageThis = images[im].replace(/"ou":"(.*?)"/, '$1');
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

function parseRequest(req, response) {
	const requestUrl = url.parse(req.url);
	fsPathName = requestUrl.pathname === '/' ? '/index.html' : requestUrl.pathname;

	const ext = path.extname(fsPathName);
	const mimetype = mimetypes[ext] || 'text/plain';

	if (fsPathName.indexOf('/search') === 0) {
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
				'Content-Type': 'image/png'
			});
			fs.access(pth.dir + '/' + pth.file, fs.constants.F_OK, (notFound) => {
				if (notFound) {
					if (imageList['i' + parseInt(pth.file)]) {
						savePng(imageList['i' + parseInt(pth.file)], pth.dir, pth.file, function (png) {
							fs.readFile(pth.dir + '/' + pth.file, function (er, dataPng) {
								updateImageList(pth, imageList); // NOT existing image + Found in image list
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
										updateImageList(pth, imageList); // NOT existing image + NOT found in image list
										response.end(dataPng);
									});
								});
							});
							res.on('error', function (err) {
								response.end(err.message);
							});
						}).on('error', function (err) {
							response.writeHead(404);
							response.end();
						}).end();
					}
				} else {
					fs.readFile(pth.dir + '/' + pth.file, function (er, dataPng) { // Existing image + Found in image list
						response.end(dataPng);
					});
				}
			});
		});
	} else {
		response.writeHead(200, {
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