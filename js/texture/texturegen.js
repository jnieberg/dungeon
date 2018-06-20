function tdGenerateTexture(s, canvas) {
	var s1 = rand(s, 0, 0, 852.97, 255);
	var r1 = rand(s, 0, 0, 112.10, 255);
	var g1 = rand(s, 0, 0, 521.95, 255);
	var b1 = rand(s, 0, 0, 145.04, 255);
	ch = new Chromanin(256, canvas);
	ch.initlayers(256, 256);
	ch.colorLayer(0, r1, g1, b1);
	for(var l = 1; l < rand(s, l, 0, 173.77, 4) + 2; l++) {
		if(rand(s, l, 0, 273.72, 3) === 0) {
			//ch.colorLayer(l, rand(s, l, 0, 176.12, 255), rand(s, l, 0, 463.73, 255), rand(s, l, 0, 236.92, 255));
		}
		switch(rand(s, l, 0, 19.87, 4)) {
			case 0: ch.perlinNoise(l, 64, s+l, 256, s1, 8, false); break;
			case 1: ch.sineDistort(l, l, 0.100000001490116, 25, 0.125, s1); break;
			case 2: ch.kaleidLayer(l, l, 1); break;
			case 3: ch.woodLayer(l, l, 2); break;
			default: break;
		}
		switch(rand(s, l, 0, 419.19, 5)) {
			case 0: ch.embossLayer(l, l); break;
			case 1: ch.sculptureLayer(l, l); break;
			case 2: ch.dilateLayer(l, l); break;
			case 3: ch.noiseDistort(l, l, s, 3); break;
			case 4: ch.blobsLayer(l, s+l, 16, false); break;
			default: break;
		}

	}
	for(var l = 1; l < rand(s, l, 0, 173.77, 4) + 2; l++) {
		var l2 = rand(s, l, 0, 211.13, l);
		switch(rand(s, l, 0, 943.14, 5)) {
			case 0: ch.addLayers(l, l2, 5, 1, 1); break;
			case 1: ch.andLayers(l, l2, 5, 1, 1); break;
			case 2: ch.orLayers(l, l2, 5, 1, 1); break;
			case 3: ch.mulLayers(l, l2, 5, 1, 1); break;
			case 4: ch.xorLayers(l, l2, 5, 1, 1); break;
			default: break;
		}
	}
	ch.makeTilable(l-1, l-1, 128);
	return ch.writeCanvas();
}

var seedIndex = 437;

function random(s) {
	var x = Math.sin(s) * 10000;
	return x - Math.floor(x);
}

function rand() {
	var arg = Array.prototype.slice.call(arguments);
	var s = arg[arg.length - 1];
	var sum = 0;
	for (var x = 0; x < arg.length; x++) {
		sum = sum + arg[x] * (random(x) + random(seedIndex));
	}
	return Math.floor(random(sum) * s);
}
