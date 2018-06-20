var http = require('http');
var url = require('url');
var fs = require('fs');
var gm = require('gm');

var server = http.createServer(function(request, response) {
	var url_parts = url.parse(request.url).path.substring(1).split("/");

	var width = url_parts[0];
	var height = url_parts[1];
	if(width !== 'favicon.ico') {
		var max = Math.max(width, height);
		console.log(width + ', ' + height);

		if(!isNaN(width) && !isNaN(height)) {
			response.writeHead(200, {'content-type': 'image/png'});
			console.log('image found');
			gm('nodejs.png')
				.resize(max, max)
				.crop(width, height, 0, 0)
				.stream('nodejs2.png', function(err, stdout, stderr) {
				    if(err) {
				        console.log('error: ' + err);
				    } else {
				    	stdout.pipe(response);
				        console.log('succes! ' + response);
				    }
				});
		} else {
		    response.writeHead(400, {'content-type' : 'text/plain'});
		    console.log('image not found');
		    response.end();
		}
	}
}).listen(1337, '127.0.0.1');