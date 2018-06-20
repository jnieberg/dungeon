"use strict";

var webserver = require('webserver');
var page = require('webpage').create();
var system = require('system');

page.onConsoleMessage = function(msg) {
    system.stderr.writeLine(msg);
};

console.log('Starting...');
page.open('', function(status) {
	page.content = '\
	<html>\
		<head>\
		</head>\
		<body>\
			<canvas id="texture"></canvas>\
		</body>\
	</html>\
	';

	var server = webserver.create();
	var service = server.listen('127.0.0.1:1337', function(request, response) {
		var parts = request.url.substring(1).split('/');
		var seed = 0;
		for(var p = 0; p < parts.length; p++) {
			if(parts[p] !== '') {
				seed += parseInt(parts[p]);
			}
		}
	  	response.writeHead(200, {'content-type': 'text/html'});
		console.log('Texture request: ' + request.url.substring(1));
		page.includeJs("http://nb-jni-01.eperium.local/dungeon/js/texture/chromanin.js", function() {
			console.log('Chromanin loaded');
			page.includeJs("http://nb-jni-01.eperium.local/dungeon/js/texture/texturegen.js", function() {
				page.evaluate(function(seed, response) {
					console.log('Texture rendering...');
				    //var el = document.getElementById('texture'),
				        //context = el.getContext('2d'),
				    //imageData = context.createImageData(width, height);
				    tdGenerateTexture(seed, 'texture');
				    document.body.style.margin = '0px';
					console.log('Texture render done!');
				    //context.putImageData(imageData, 0, 0);
				}, seed, response);
				page.viewportSize = { width: 256, height : 256 };
				document.body.style.width = page.viewportSize.width;
				document.body.style.height = page.viewportSize.height;
				page.render('images/texture-' + seed + '.png');
				console.log('Texture save done!');
				//response.write(page.render('images/texture-' + f + '-' + x + '-' + y '.png');//);
				//phantom.exit();
  				response.close();
			});
			//response.write('<img style="-webkit-user-select: none" src="images/texture-' + seed + '.png"/>');
		});
	});
});
