//Big room:			F: 68012, X: -602624, Y: 729466, D: 0
//Grate doors:		F: -96109, X: 697844, Y: -835703, D: 2
//Many lights:		F: 29030, X: 352572, Y: -211505, D: 3
//FPS test: 		F: 45431, X: -412832, Y: 241472, D: 3
var debug = false;
var stereo = false;
var gameLoaded = false;
var dir = [{ x: 0, y: -1 }, { x: 1, y: 0 }, { x: 0, y: 1 }, { x: -1, y: 0 }];

var imagePathQuality = 'high/'; //image folder to load images from
var squareSize = 4; //map square size 16
var mapSize = 50; //map size 30
var floorSize = 6; //floor size 10
var viewSize = 50; //visible size of map 12
var tdViewSize = 14; //visible size of 3D 14
if (isMobile) {
	var terrainLightMax = 0;
} else {
	var terrainLightMax = 1; //maximum number of terrain lights 1
}

var tdSquareSize = { x: 1.25, y: 1 };
var tdPlayerHeight = 0.6;
var tdBackStep;
var keysFrozen = false;
var origin = { f: 0, x: 0, y: 0 };
var map, mutation = {};
var stats;
var canvas;
var mapCtx;
var loadingManager;
var loadingCountError = 0;
var loadingCountTotal = 0;
var rollObject = new THREE.Object3D();
var pitchObject = new THREE.Object3D();
var yawObject = new THREE.Object3D();

$(function () {
	initPlayer();
	loadGame(0);
	init();

	$(document).keydown(function (e) {
		if (!keysFrozen) {
			var d = origin.d;
			var d1 = (origin.d + 1) % 4;
			var d2 = (origin.d + 2) % 4;
			var d3 = (origin.d + 3) % 4;
			switch (e.which) {
				case 82: // r
					initPlayer(true);
					reloadAll();
					break;

				case 65: // a
					tdMoveCamera(d3);
					break;

				case 67: // c
					stereo = stereo ? false : true;
					if (stereo) {
						requestFullscreen();
					}
					tdReloadView();
					tdUpdateCamera();
					break;

				case 87: // w
					tdMoveCamera(d);
					break;

				case 68: // d
					tdMoveCamera(d1);
					break;

				case 83: // s
					tdMoveCamera(d2);
					break;

				case 81: // q
					tdRotateCamera(-1);
					break;

				case 69: // e
					tdRotateCamera(1);
					break;

				case 33: // page up
					origin.f++;
					reloadAll();
					break;

				case 34: // page down
					origin.f--;
					reloadAll();
					break;

				case 32: // space
					wallAction(origin.x, origin.y, d);
					break;

				default: // exit this handler for other keys
					return;
			}
			e.preventDefault();
		}
	});

	$(document).on('click', function (event) {
		buttonEvents(event);
		return false;
	});

	$('body #coordinates').on('change', function () {
		origin = parseCoordinates($(this).val());
		themeOverride = coordsToTheme();
		reloadAll();
	});

	$('body #theme').on('change', function () {
		let val = $(this).val();
		val = val.replace(/\W/g, ' ');
		val = val.replace(/\s+/g, '+');
		val = val.replace(/\+or\+/gi, '+OR+');
		val = val.replace(/(.{16}).*/gi, '$1');
		themeOverride = val;
		resetPlayer();
		origin = themeToCoords();
		reloadAll();
	});
	$('body #theme').focusin(function () {
		keysFrozen = true;
	}).focusout(function () {
		keysFrozen = false;
	});

	$('body #random').on('click', function () {
		initPlayer(true);
		reloadAll();
	});

	$('body #reset-game').on('click', function () {
		mutation = {};
		deleteGame(0);
		reloadAll();
	});

	$('body #stereo').on('click', function () {
		stereo = stereo ? false : true;
		if (stereo) requestFullscreen();
		tdReloadView();
		tdUpdateCamera();
	});
});

function init() {
	if (debug) {
		stats = new Stats();
		stats.setMode(0); // 0: fps, 1: ms, 2: mb
		stats.domElement.style.position = 'absolute';
		stats.domElement.style.left = '0px';
		stats.domElement.style.bottom = '0px';
		document.body.appendChild(stats.domElement);
	} else {
		//$('#footer').remove();
	}
	if (isMobile) {
		$('#map').remove();
	}

	loadingManager = THREE.DefaultLoadingManager;
	loadingManager.onProgress = function (item, loaded, total) {
		if (!gameLoaded) {
			var width = $('#loading').innerWidth() - 2;
			var tot = total - loadingCountError - loadingCountTotal;
			var ldd = loaded - loadingCountTotal;
			//console.log(item, ldd, tot);
			var w = Math.floor((1.0 * ldd / tot) * width);
			$('#loading .bar').css('width', w + 'px');
			$('#loading .light').css('left', (w - 6) + 'px');
			$('#loading .light').css('opacity', (1.0 * w / width));
			if (!stereo) {
				$('#loading').show();
			}
			if (ldd >= tot) {
				loadingCountTotal = loaded;
				gameLoaded = true;
				$('#loading').fadeOut();
				//tdDrawAll(true);
			}
		}
	}
	imageLoader = new THREE.ImageLoader(loadingManager);
	canvas = document.getElementById('canvas');
	if (!isMobile) {
		mapCtx = canvas.getContext('2d');
		mapCtx.canvas.width = viewSize * squareSize;
		mapCtx.canvas.height = $(document).height() - 50;
	}
	startEngine();
}

function reloadAll(force, callback) {
	if (typeof force === 'undefined') {
		force = true;
	}
	if (force) {
		tdClearWorld();
		initField(function () {
			if (floorAction(origin.x, origin.y)) {
				reloadAll(true, callback);
			} else {
				tdDrawAll(true, function () {
					drawAll(true, function () {
						if (typeof callback === 'function') {
							callback();
						}
					});
				});
			}
		});
	} else {
		if (floorAction(origin.x, origin.y)) {
			reloadAll(true, callback);
		} else {
			tdDrawAll(false, function () {
				drawAll(false, function () {
					if (typeof callback === 'function') {
						callback();
					}
				});
			});
		}
	}
}

function startEngine() {
	tdCreateScene();
	tdCreateLight();
	tdReloadView();
	reloadAll();
	tdAnimate();
}

function parseCoordinates(str) {
	var or = { f: 0, x: 0, y: 0, d: 0 };
	var c = str.toUpperCase();
	c = c.replace(/ /g, '').split(',');
	for (var i = 0; i < c.length; i++) {
		var c1 = c[i].split(':');
		if (c1.length === 2) {
			if (c1[0] === 'F') {
				or.f = parseInt(c1[1]);
			} else if (c1[0] === 'X') {
				or.x = parseInt(c1[1]);
			} else if (c1[0] === 'Y') {
				or.y = parseInt(c1[1]);
			} else if (c1[0] === 'D') {
				or.d = parseInt(c1[1]);
			}
		}
	}
	return or;
}

function setTheme() {
	if ($('body #theme').val() !== themeOverride) {
		$('body #theme').val(themeOverride);
	}
}

function themeToCoords() {
	const theme = themeOverride.length < 3 ? (themeOverride + '   ').substring(0, 3) : themeOverride;
	let coordString = '';
	for (let i = 0; i < theme.length; i++) {
		const themeChar = theme.charCodeAt(i) - 32;
		coordString = coordString + ('00' + themeChar).slice(-2);
	}
	const l = coordString.length;
	const themeSplit = {
		x: parseInt(coordString.slice(0, Math.floor(l * 0.35))) * viewSize + (origin.x % viewSize),
		y: parseInt(coordString.slice(Math.floor(l * 0.35), Math.floor(l * 0.7))) * viewSize + (origin.y % viewSize),
		f: parseInt(coordString.slice(Math.floor(l * 0.7))) * floorSize + (origin.f % floorSize),
		d: origin.d
	};
	console.log('T2C:', themeOverride, themeSplit);
	return themeSplit;
}

function coordsToTheme() {
	let x = Math.floor(origin.x / viewSize);
	let y = Math.floor(origin.y / viewSize);
	let f = Math.floor(origin.f / floorSize);
	x = x < 10 ? '0' + x : '' + x;
	y = y < 10 ? '0' + y : '' + y;
	f = f < 10 ? '0' + f : '' + f;
	const themeInt = x + y + f;
	let theme = '';
	for (let i = 0; i < themeInt.length; i += 2) {
		theme = theme + String.fromCharCode(parseInt(themeInt.substring(i, i + 2)) + 32);
	}
	console.log('C2T:', origin, theme);
	return theme;
}

function initPlayer(force = false) {
	let coord = {};
	if (!force) {
		coord = getCoords();
	}
	if (coord && coord.f) { //custom
		origin = {
			f: coord.f,
			x: coord.x,
			y: coord.y,
			d: coord.d
		};
		themeOverride = coordsToTheme();
		tdRotateCamera(origin.d);
	} else { //random
		const themeRand = Math.floor(Math.random() * themeList.length);
		themeOverride = themeList[themeRand];
		resetPlayer();
		origin = themeToCoords();
		origin.d = Math.floor(Math.random() * 4);
		setCoords(origin);
	}
}

function playerCanMove(d) {
	var xo = dir[d].x;
	var yo = dir[d].y;
	if (hasSquare(origin.x, origin.y, 'wall-wood', d) > -1 || hasSquare(origin.x + xo, origin.y + yo, 'wall-wood', (d + 2) % 4) > -1 || hasSquare(origin.x, origin.y, 'door-wood', d) > -1 || hasSquare(origin.x + xo, origin.y + yo, 'door-wood', (d + 2) % 4) > -1) {
		return -1;
	} else if (hasSquare(origin.x + xo, origin.y + yo, 'wall-secret') === -1 && (hasSquare(origin.x + xo, origin.y + yo, 'wall') > -1 || hasSquare(origin.x + xo, origin.y + yo, 'pillar') > -1 || hasSquare(origin.x + xo, origin.y + yo, 'obstacle') > -1 || hasSquare(origin.x + xo, origin.y + yo, 'door') > -1)) {
		return 0;
	}
	return 1;
}

function initField(callback) {
	var o = toRealCoord(0, 0);
	clearField(o.x, o.y, o.x + viewSize, o.y + viewSize, true);
	setTimeout(function () {
		var o = toRealCoord(0, 0);
		generateField(o.x, o.y, o.x + viewSize, o.y + viewSize);
		if (typeof callback === 'function') {
			callback();
		}
	}, 1);
	/*var x = Math.floor(origin.x / 100) * 100;
	var y = Math.floor(origin.y / 100) * 100;
	clearField(x, y, x + mapSize, y + mapSize, true);
	setTimeout(function() {
		generateField(x, y, x + mapSize, y + mapSize);
		if(typeof callback === 'function') {
			callback();
		}
	}, 1);*/
}

function resetPlayer() {
	origin = {
		f: Math.floor(floorSize / 2),
		x: Math.floor(viewSize / 2),
		y: Math.floor(viewSize / 2),
		d: Math.floor(Math.random() * 4)
	};
}

function shiftMeshes(d) {
	/*switch(d) {
		case 0:
			for(var i = 0; i < mapSize; i++) {
				tdClearObject(map[i][mapSize - 1].mesh);
			}
			map = deleteColumn(map, mapSize - 1);
			for(var i = 0; i < mapSize; i++) {
		        map[i].unshift(null);
		    }
			break;
		case 1:
			for(var i = 0; i < mapSize; i++) {
				tdClearObject(map[0][i].mesh);
			}
			map = deleteRow(map, 0);
			map.push(null);
			break;
		case 2:
			for(var i = 0; i < mapSize; i++) {
				tdClearObject(map[i][0].mesh);
			}
			map = deleteColumn(map, 0);
			for (var i = 0; i < mapSize; i++) {
		        map[i].push(null);
		    }
			break;
		case 3:
			for(var i = 0; i < mapSize; i++) {
				tdClearObject(map[mapSize - 1][i].mesh);
			}
			map = deleteRow(map, mapSize - 1);
			map.unshift(null);
			break;
		default: break;
	}*/
}

function clearField(x1, y1, x2, y2, force) {
	if (typeof map === 'undefined') {
		map = [];
	}
	if (typeof force === 'undefined') {
		var force = false;
	}
	for (var x = x1; x < x2; x++) {
		var o = toMapCoord(x, 0);
		if (typeof map[o.x] === 'undefined' || map[o.x] === null) {
			map[o.x] = [];
		}
		for (var y = y1; y < y2; y++) {
			o = toMapCoord(x, y);
			if (typeof map[o.x][o.y] === 'undefined' || map[o.x][o.y] === null) {
				map[o.x][o.y] = { obj: 'wall', rotation: '0', features: {} };
			}
			setSquare(x, y, 'wall', null, '0', force, {});
		}
	}
}

function generateField(x1, y1, x2, y2) {
	for (var y = y1; y < y2; y++) {
		for (var x = x1; x < x2; x++) {
			//generateStairs(x, y);
			generateFloor(x, y);
		}
	}
	for (var y = y1; y < y2; y++) {
		for (var x = x1; x < x2; x++) {
			generateRoom(x, y, rand(origin.f, x, y, 859.35, 2) * 2 + 3, rand(origin.f, x, y, 123.76, 2) * 2 + 3);
			generateRoomWood(x, y, rand(origin.f, x, y, 859.35, 4) + 1, rand(origin.f, x, y, 123.76, 4) + 1);
			//generateDoor(x, y);
		}
	}
	for (var y = y1; y < y2; y++) {
		for (var x = x1; x < x2; x++) {
			generateRoomAfter(x, y);
		}
	}
	for (var y = y1; y < y2; y++) {
		for (var x = x1; x < x2; x++) {
			generatePillar(x, y);
			generateStairs(x, y);
			generateDeco(x, y);
		}
	}
	for (var y = y1; y < y2; y++) {
		for (var x = x1; x < x2; x++) {
			generateRoomWoodAfter(x, y);
		}
	}
	for (var y = y1; y < y2; y++) {
		for (var x = x1; x < x2; x++) {
			generateStart(x, y);
			generateWindow(x, y);
		}
	}
	for (var y = y1; y < y2; y++) {
		for (var x = x1; x < x2; x++) {
			var sq = getMutation(x, y);
			if (sq !== null) {
				if (equalsSquare(getSquare(x, y), sq)) {
					deleteMutation(x, y);
				} else {
					setSquare(x, y, sq.obj, null, sq.rotation, true, sq.features);
				}
			}
		}
	}
}

function generateFloor(x, y) {
	if (x.mod(2) === 0 && y.mod(2) === 0) {
		//setSquare(x, y, 'test');
		if (rand(origin.f, x, y, 0, 4) === 0) {
			setSquare(x + 1, y, 'floor');
		}
		if (rand(origin.f, x, y, 0, 4) === 1) {
			setSquare(x, y + 1, 'floor');
		}
		if (rand(origin.f, x, y, 0, 4) === 2) {
			setSquare(x - 1, y, 'floor');
		}
		if (rand(origin.f, x, y, 0, 4) === 3) {
			setSquare(x, y - 1, 'floor');
		}
		setSquare(x, y, 'floor');
	}
}

function generateStairs(x, y) {
	if ((x + y).mod(2) === 1) {
		if (rand(origin.f, x, y, 0, 20) === 0 && origin.f.mod(floorSize) !== floorSize - 1) { //up
			if ((x.mod(8) === 0 && y.mod(8) === 7) || (x.mod(8) === 4 && y.mod(8) === 3)) {
				var d = 2;
			} else if ((x.mod(8) === 1 && y.mod(8) === 0) || (x.mod(8) === 5 && y.mod(8) === 4)) {
				var d = 3;
			} else if ((x.mod(8) === 0 && y.mod(8) === 1) || (x.mod(8) === 4 && y.mod(8) === 5)) {
				var d = 0;
			} else if ((x.mod(8) === 7 && y.mod(8) === 0) || (x.mod(8) === 3 && y.mod(8) === 4)) {
				var d = 1;
			}
			if (typeof d !== 'undefined') {
				d1 = (d + 1) % 4;
				d2 = (d + 2) % 4;
				d3 = (d + 3) % 4;
				if (((d === 2 && y.mod(viewSize) > 3) || (d === 0 && y.mod(viewSize) < viewSize - 3) || (d === 1 && x.mod(viewSize) > 3) || (d === 3 && x.mod(viewSize) < viewSize - 3)) && setSquare(x, y, 'stairs-up', null, d, true)) {
					setSquareFeature(x, y, 'protected', 'true');
					setSquareFeature(x, y, 'double', 'ceil');
					setSquare(x + dir[d1].x, y + dir[d1].y, 'wall', null, '0', true, { double: 'wall', triple: 'wall', protected: true });
					setSquare(x + dir[d2].x, y + dir[d2].y, 'wall', null, '0', true, { double: 'none', protected: true });
					setSquare(x + dir[d3].x, y + dir[d3].y, 'wall', null, '0', true, { double: 'wall', triple: 'wall', protected: true });
					setSquare(x + dir[d].x, y + dir[d].y, 'floor', null, '0', false);
					if (getSquareFeature(x + dir[d].x, y + dir[d].y, 'double') !== 'ceil') {
						setSquareFeature(x + dir[d].x, y + dir[d].y, 'double', 'wall');
					}
					setSquareFeature(x + dir[d].x, y + dir[d].y, 'protected', 'true');

					setSquareFeature(x + dir[d1].x + dir[d2].x, y + dir[d1].y + dir[d2].y, 'double', 'wall');
					setSquareFeature(x + dir[d3].x + dir[d2].x, y + dir[d3].y + dir[d2].y, 'double', 'wall');
					setSquareFeature(x + dir[d2].x * 2, y + dir[d2].y * 2, 'double', 'wall');
					setSquareFeature(x + dir[d1].x + dir[d2].x, y + dir[d1].y + dir[d2].y, 'triple', 'wall');
					setSquareFeature(x + dir[d3].x + dir[d2].x, y + dir[d3].y + dir[d2].y, 'triple', 'wall');
					setSquareFeature(x + dir[d1].x + dir[d2].x * 2, y + dir[d1].y + dir[d2].y * 2, 'triple', 'wall');
					setSquareFeature(x + dir[d3].x + dir[d2].x * 2, y + dir[d3].y + dir[d2].y * 2, 'triple', 'wall');
				}
			}
		}
		if (rand(origin.f - 1, x, y, 0, 20) === 0 && origin.f.mod(floorSize) !== 0) { //down
			if ((x.mod(8) === 0 && y.mod(8) === 7) || (x.mod(8) === 4 && y.mod(8) === 3)) {
				var d = 0;
			} else if ((x.mod(8) === 1 && y.mod(8) === 0) || (x.mod(8) === 5 && y.mod(8) === 4)) {
				var d = 1;
			} else if ((x.mod(8) === 0 && y.mod(8) === 1) || (x.mod(8) === 4 && y.mod(8) === 5)) {
				var d = 2;
			} else if ((x.mod(8) === 7 && y.mod(8) === 0) || (x.mod(8) === 3 && y.mod(8) === 4)) {
				var d = 3;
			}
			if (typeof d !== 'undefined') {
				d1 = (d + 1) % 4;
				d2 = (d + 2) % 4;
				d3 = (d + 3) % 4;
				var x1 = x + dir[d].x * 2;
				var y1 = y + dir[d].y * 2;
				if (((d === 2 && y1.mod(viewSize) > 3) || (d === 0 && y1.mod(viewSize) < viewSize - 3) || (d === 1 && x1.mod(viewSize) > 3) || (d === 3 && x1.mod(viewSize) < viewSize - 3)) && setSquare(x1, y1, 'stairs-down', null, d2, true, { double: 'wall', protected: true })) {
					setSquare(x1 + dir[d1].x, y1 + dir[d1].y, 'wall', null, '0', true);
					setSquare(x1 + dir[d2].x, y1 + dir[d2].y, 'wall', null, '0', true);
					setSquare(x1 + dir[d3].x, y1 + dir[d3].y, 'wall', null, '0', true);
					setSquare(x1 + dir[d].x, y1 + dir[d].y, 'floor', null, '0', false);
					setSquareFeature(x1 + dir[d1].x, y1 + dir[d1].y, 'protected', 'true');
					setSquareFeature(x1 + dir[d2].x, y1 + dir[d2].y, 'protected', 'true');
					setSquareFeature(x1 + dir[d3].x, y1 + dir[d3].y, 'protected', 'true');
					setSquareFeature(x1 + dir[d].x, y1 + dir[d].y, 'protected', 'true');
				}
			}
		}
	}
	if (x.mod(4) === 2 && y.mod(4) === 2) {
		if (rand(origin.f, x, y, 0, floorSize) === 0 && origin.f.mod(floorSize) !== floorSize - 1) { //up
			appendSquare(x, y, 'pit-ceil', '', '', true);
		}
		if (rand(origin.f - 1, x, y, 0, floorSize) === 0 && origin.f.mod(floorSize) !== 0) { //down
			appendSquare(x, y, 'pit', 'floor', '', true);
		}
	}
	if (x.mod(2) === 0 && y.mod(2) === 0) {
		const obj = getSquareObjs(x, y);
		if (obj && obj[0] === 'floor') {
			var e = 0;
			var d1 = 0;
			for (var d = 0; d < 4; d++) {
				if (hasSquare(x + dir[d].x, y + dir[d].y, 'floor') > -1) {
					d1 = (rand(origin.f, x, y, 919.19, 3) + d + 1) % 4;
					d2 = (rand(origin.f, x, y, 127.73, 3) + d + 1) % 4;
					e++;
				}
			}
			if (e <= 1) {
				var db = getSquareFeature(x + dir[d1].x, y + dir[d1].y, 'double');
				switch (rand(origin.f, x, y, 811.77, 12)) {
					//switch(2) {
					case 0: //switch
						var m = rand(origin.f, x, y, 666.89, 2);
						switch (m) {
							case 0: m = 'once'; break;
							case 1: m = 'toggle'; break;
							default: m = 'repeat'; break;
						}
						setSquare(x + dir[d1].x, y + dir[d1].y, 'wall,wall-switch', '', '0' + (d1 + 2) % 4, false, {
							protected: true,
							target: {
								f: origin.f,
								x: x + dir[d2].x,
								y: y + dir[d2].y,
								mode: m
							},
							double: db
						});
						switch (rand(origin.f, x, y, 811.77, 3)) {
							case 0:
								setSquare(x + dir[d2].x, y + dir[d2].y, 'wall', '', '', true, { double: db });
								break;
							case 1:
								setSquare(x + dir[d2].x, y + dir[d2].y, 'floor,pillar', '', '', true, { double: db });
								break;
							case 2: generateDoor(x + dir[d2].x, y + dir[d2].y, true, true); break;
						}
						break;
					case 1: //teleport up
						if (rand(origin.f, x, y, 283.01, 2) === 0) {
							setSquare(x, y, 'floor,teleport', '', '', false, {
								teleport: {
									x: Math.floor(origin.x / viewSize) * viewSize + rand(origin.f, x, y, 811.44, viewSize / 2 - 1) * 2 + 2,
									y: Math.floor(origin.y / viewSize) * viewSize + rand(origin.f, x, y, 12.97, viewSize / 2 - 1) * 2 + 2
								},
								double: db
							});
						} else if (origin.f.mod(floorSize) !== 0) {
							setSquare(x, y, 'floor,teleport-up', '', '', false, {
								teleport: {
									f: origin.f + 1
								},
								double: db
							});
						} else {
							setSquare(x + dir[d1].x, y + dir[d1].y, 'floor', '', '', false, { double: db });
						}
						break;
					case 2: //secret wall
						setSquare(x + dir[d1].x, y + dir[d1].y, 'floor,wall-secret', 'wall', '', false, { double: db });
						break;
					case 3: //door
						generateDoor(x + dir[d2].x, y + dir[d2].y, true);
						break;
					case 4: //rotating floor
						setSquare(x, y, 'floor', '', '', false, {
							teleport: {
								d: Math.floor(Math.random() * 4)
							},
							double: db
						});
						setSquare(x + dir[d1].x, y + dir[d1].y, 'floor', '', '', false, { double: db });
						setSquare(x + dir[d2].x, y + dir[d2].y, 'floor', '', '', false, { double: db });
						break;
					default:
						setSquare(x + dir[d1].x, y + dir[d1].y, 'floor', '', '', false, { double: db });
						break;
				}
			}
		}
	}
}

function generateDeco(x, y) {
	var d = rand(origin.f, x, y, 123.13, 4);
	var dr = d;
	//if(hasSquare(x, y, 'door') > -1) {
	//	dr = '';
	//}
	if (hasSquare(x, y, 'wall') > -1 && hasSquare(x, y, 'wall-switch') === -1) {
		if (hasSquare(x + dir[d].x, y + dir[d].y, 'wall') === -1 && hasSquare(x + dir[d].x, y + dir[d].y, 'door') === -1 && hasSquare(x + dir[d].x, y + dir[d].y, 'stairs-up') === -1 && hasSquare(x + dir[d].x, y + dir[d].y, 'stairs-down') === -1) {
			if (rand(origin.f, x, y, 860.97, 2) === 0) {
				appendSquare(x, y, 'wall-deco', null, dr, true);
			}
			if (rand(origin.f, x, y, 293.12, 40) === 0) {
				appendSquare(x, y, 'wall-light', null, dr, true);
			}
		}
	} else if (hasSquare(x, y, 'floor') > -1 && hasSquare(x, y, 'pit') === -1) {
		if (rand(origin.f, x, y, 860.97, 30) === 0) {
			appendSquare(x, y, 'floor-deco', null, dr, true);
		}
	}
	if (getSquareFeature(x, y, 'double') === 'wall') {
		if (getSquareFeature(x + dir[d].x, y + dir[d].y, 'double') === 'ceil') {
			if (rand(origin.f, x, y, 12.08, 2) === 0) {
				appendSquare(x, y, 'wall-deco-high', null, dr, true);
			}
			if (rand(origin.f, x, y, 121.91, 40) === 0) {
				appendSquare(x, y, 'wall-light-high', null, dr, true);
			}
		}
	}
}

function generateRoom(x1, y1, xs, ys) {
	if (Math.abs(x1) % 2 === 0 && Math.abs(y1) % 2 === 0) {
		if (rand(origin.f, x1, y1, 94.09, 12) === 0) {
			x1 = x1 - Math.floor(xs / 4) * 2;
			y1 = y1 - Math.floor(ys / 4) * 2;
			for (var y = y1; y < y1 + ys; y++) {
				for (var x = x1; x < x1 + xs; x++) {
					setSquare(x, y, 'floor');
					if (getSquareFeature(x, y, 'double') !== 'none') {
						setSquareFeature(x, y, 'double', 'ceil');
					}
				}
			}
			if (rand(origin.f, x1 + Math.floor(xs / 2), y1 + Math.floor(ys / 2), 293.12, 5) === 0) {
				appendSquare(x1 + Math.floor(xs / 2), y1 + Math.floor(ys / 2), 'ceil-light', null, 0, true);
			}
		}
	}
}

function generateRoomAfter(x, y) {
	if (getSquareFeature(x, y, 'double') !== 'ceil' && getSquareFeature(x, y, 'double') !== 'none') {
		if (getSquareFeature(x - 1, y, 'double') === 'ceil') {
			setSquareFeature(x, y, 'double', 'wall');
		}
		if (getSquareFeature(x + 1, y, 'double') === 'ceil') {
			setSquareFeature(x, y, 'double', 'wall');
		}
		if (getSquareFeature(x, y - 1, 'double') === 'ceil') {
			setSquareFeature(x, y, 'double', 'wall');
		}
		if (getSquareFeature(x, y + 1, 'double') === 'ceil') {
			setSquareFeature(x, y, 'double', 'wall');
		}
	} else {
		if (hasSquare(x, y, 'door') > -1) {
			setSquareFeature(x, y, 'double', 'wall');
		}
	}
	if (hasSquare(x, y, 'floor') > -1 && hasSquare(x, y, 'pillar') === -1 && hasSquare(x, y, 'obstacle') === -1 && getSquareFeature(x, y, 'double') === 'wall') {
		generateDoor(x, y, true);
	}
}

function generateStart(x, y) {
	if (x.mod(viewSize) === 0 || y.mod(viewSize) === 0) {
		setSquare(x, y, '', null, '0', true);
	} else if (x.mod(viewSize) === 1 || y.mod(viewSize) === 1 || x.mod(viewSize) === viewSize - 1 || y.mod(viewSize) === viewSize - 1) {
		setSquare(x, y, 'wall', null, '0', true, { double: 'wall', triple: 'wall' });
	} else if (origin.f.mod(floorSize) === Math.floor(floorSize / 2) && x.mod(viewSize) === Math.floor(viewSize / 2) && y.mod(viewSize) === Math.floor(viewSize / 2)) {
		setSquare(x, y, 'floor,rune', null, '00', true);
		setSquare(x - 1, y, 'floor', null, '0', true);
		setSquare(x + 1, y, 'floor', null, '0', true);
		setSquare(x, y - 1, 'floor', null, '0', true);
		setSquare(x, y + 1, 'floor', null, '0', true);
		setSquare(x - 2, y, 'floor', null, '0');
		setSquare(x + 2, y, 'floor', null, '0');
		setSquare(x, y - 2, 'floor', null, '0');
		setSquare(x, y + 2, 'floor', null, '0');
		setSquare(x - 1, y - 1, 'floor,wall-wood,wall-wood', null, '030', true);
		setSquare(x + 1, y - 1, 'floor,wall-wood,wall-wood', null, '001', true);
		setSquare(x - 1, y + 1, 'floor,wall-wood,wall-wood', null, '023', true);
		setSquare(x + 1, y + 1, 'floor,wall-wood,wall-wood', null, '012', true);
		if (hasSquare(x, y - 2, 'wall') === -1 && hasSquare(x, y - 2, 'wall-wood', '2') === -1) {
			setSquare(x, y - 1, 'floor,door-wood', null, '00', true);
		}
		if (hasSquare(x, y + 2, 'wall') === -1 && hasSquare(x, y + 2, 'wall-wood', '0') === -1) {
			setSquare(x, y + 1, 'floor,door-wood', null, '02', true);
		}
		if (hasSquare(x - 2, y, 'wall') === -1 && hasSquare(x - 2, y, 'wall-wood', '1') === -1) {
			setSquare(x - 1, y, 'floor,door-wood', null, '03', true);
		}
		if (hasSquare(x + 2, y, 'wall') === -1 && hasSquare(x + 2, y, 'wall-wood', '3') === -1) {
			setSquare(x + 1, y, 'floor,door-wood', null, '01', true);
		}
	}
}

function generateWindow(x, y) {
	if (Math.abs(x + y) % 2 === 1) {
		if (hasSquare(x, y, 'wall') > -1 && hasSquare(x, y, 'wall-deco-high') === -1 && hasSquare(x, y, 'wall-light-high') === -1 && getSquareFeature(x, y, 'double') === 'wall') {
			if (getSquareFeature(x - 1, y, 'double') === 'ceil' && getSquareFeature(x + 1, y, 'double') === 'ceil' && rand(origin.f, x, y, 91.11, 1) === 0) {
				appendSquare(x, y, 'window-high', null, 1);
				setSquareFeature(x, y, 'double', 'ceil');
				setSquareFeature(x, y - 1, 'double', 'wall');
				setSquareFeature(x, y + 1, 'double', 'wall');
			}
			if (getSquareFeature(x + 1, y, 'double') === 'ceil' && getSquareFeature(x - 1, y, 'double') === 'ceil' && rand(origin.f, x, y, 91.11, 1) === 0) {
				appendSquare(x, y, 'window-high', null, 1);
				setSquareFeature(x, y, 'double', 'ceil');
				setSquareFeature(x, y - 1, 'double', 'wall');
				setSquareFeature(x, y + 1, 'double', 'wall');
			}
			if (getSquareFeature(x, y - 1, 'double') === 'ceil' && getSquareFeature(x, y + 1, 'double') === 'ceil' && rand(origin.f, x, y, 91.11, 1) === 0) {
				appendSquare(x, y, 'window-high', null, 0);
				setSquareFeature(x, y, 'double', 'ceil');
				setSquareFeature(x - 1, y, 'double', 'wall');
				setSquareFeature(x + 1, y, 'double', 'wall');
			}
			if (getSquareFeature(x, y + 1, 'double') === 'ceil' && getSquareFeature(x, y - 1, 'double') === 'ceil' && rand(origin.f, x, y, 91.11, 1) === 0) {
				appendSquare(x, y, 'window-high', null, 0);
				setSquareFeature(x, y, 'double', 'ceil');
				setSquareFeature(x - 1, y, 'double', 'wall');
				setSquareFeature(x + 1, y, 'double', 'wall');
			}
		}
	}
}

function generateDoor(x, y, force, locked) {
	if (typeof force === 'undefined') {
		var force = false;
	}
	var lk = '';
	if (typeof locked !== 'undefined' && locked) {
		lk = ',locked';
	}
	if (x.mod(2) === 0 && Math.abs(y + 1) % 2 === 0) {
		if (force || rand(origin.f, x, y, 388.92, 20) === 0) {
			if (!getSquareFeature(x, y, 'wood')) {
				if (setSquare(x, y, 'floor,door' + lk, null, '00')) {
					setSquare(x - 1, y, 'wall', null, '0', true, { double: 'wall', protected: true });
					setSquare(x + 1, y, 'wall', null, '0', true, { double: 'wall', protected: true });
					//setSquare(x, y - 1, 'floor');
					//setSquare(x, y + 1, 'floor');
				}
			}
		}
	}
	if (x.mod(2) === 1 && y.mod(2) === 0) {
		if (force || rand(origin.f, x, y, 129.01, 20) === 0) {
			if (!getSquareFeature(x, y, 'wood')) {
				if (setSquare(x, y, 'floor,door' + lk, null, '01')) {
					setSquare(x, y - 1, 'wall', null, '0', true, { double: 'wall', protected: true });
					setSquare(x, y + 1, 'wall', null, '0', true, { double: 'wall', protected: true });
					//setSquare(x - 1, y, 'floor');
					//setSquare(x + 1, y, 'floor');
				}
			}
		}
	}
}

function generatePillar(x, y) {
	if (x.mod(2) === 1 || y.mod(2) === 1) {
		if (rand(origin.f, x, y, 321.11, 20) === 0) {
			if (hasSquare(x, y, 'door-wood') === -1 && !appendSquare(x, y, 'pillar', 'wall-wood')) {
				setSquare(x, y, 'floor,pillar');
			}
		} else if (rand(origin.f, x, y, 321.11, 10) === 1) {
			if (hasSquare(x, y, 'door-wood') === -1 && !appendSquare(x, y, 'obstacle', 'wall-wood')) {
				var d = rand(origin.f, x, y, 612.77, 4);
				if (hasSquare(x + dir[d].x, y + dir[d].y, 'floor') > -1 && !getSquareFeature(x + dir[d].x, y + dir[d].y, 'wood') && hasSquare(x + dir[d].x, y + dir[d].y, 'pillar') === -1 && hasSquare(x - dir[d].x, y - dir[d].y, 'wall') > -1) {
					setSquare(x, y, 'floor,obstacle', '', '0' + d);
				}
			}
		}
	}
}

function generateRoomWood(x1, y1, xs, ys) {
	if (Math.abs(x1) % 2 === 1 || Math.abs(y1) % 2 === 1) {
		if (rand(origin.f, x1, y1, 109.90, 24) === 1) {
			x1 = x1 - Math.floor(xs / 2) * 2;
			y1 = y1 - Math.floor(ys / 2) * 2;
			for (var y = y1; y < y1 + ys; y++) {
				for (var x = x1; x < x1 + xs; x++) {
					//if(hasSquare(x, y, 'door') === -1) {
					if (hasSquare(x, y, 'wall') > -1) {
						setSquare(x, y, 'floor');
					}
					if (hasSquare(x, y, 'floor') > -1) {
						setSquareFeature(x, y, 'wood', true);
					}
					/*if(hasSquare(x, y, 'floor') > -1) {
						appendSquare(x, y, 'floor-wood', null, '', true);
					} else if(hasSquare(x, y, 'wall') > -1) {
						setSquare(x, y, 'floor,floor-wood');
					}*/
					//}
				}
			}
		}
	}
}

function generateRoomWoodAfter(x, y) {
	if (getSquareFeature(x, y, 'wood')) {
		for (var d = 0; d < 4; d++) {
			var lw = [checkLegalWood(x, y - 1), checkLegalWood(x + 1, y), checkLegalWood(x, y + 1), checkLegalWood(x - 1, y)];
			var ls = checkSurroundings(x, y, 'door-wood') && checkSurroundings(x, y, 'pillar') && checkSurroundings(x, y, 'obstacle') && checkSurroundings(x, y, 'pit');
			if (lw[d] && checkLegalWood(x, y, false)) {
				if (ls) {
					appendSquare(x, y, 'door-wood', null, d, true);
				} else {
					appendSquare(x, y, 'wall-wood', null, d, true);
				}
			}
		}
	}
}

function checkSurroundings(x, y, obj) {
	return hasSquare(x, y, obj) === -1 && hasSquare(x, y - 1, obj) === -1 && hasSquare(x + 1, y, obj) === -1 && hasSquare(x, y + 1, obj) === -1 && hasSquare(x - 1, y, obj) === -1;
}

function checkLegalWood(x, y, wood) {
	var isWood = false;
	if (typeof wood === 'undefined' || wood) {
		isWood = getSquareFeature(x, y, 'wood');
	}
	if (hasSquare(x, y, 'wall') === -1 && hasSquare(x, y, 'stairs-up') === -1 && hasSquare(x, y, 'stairs-down') === -1 && hasSquare(x, y, 'door') === -1 && !isWood) {
		return true;
	}
	return false;
}

function getSquare(x, y) {
	var c = toMapCoord(x, y);
	if (map && typeof map[c.x] !== 'undefined' && typeof map[c.x][c.y] !== 'undefined' && c.x >= 0 && c.x < viewSize && c.y >= 0 && c.y < viewSize) {
		return map[c.x][c.y];
	}
	return null;
}
function getSquareObjs(x, y) {
	var s = getSquare(x, y);
	if (s && s.obj) {
		return s.obj.split(',');
	}
	return ['floor'];
}
function getSquareObj(x, y, obj) {
	var s = getSquare(x, y);
	if (s && s.obj.split(',').indexOf(obj) > -1) {
		return true;
	}
	return false;
}
function getSquareFeatures(x, y) {
	var s = getSquare(x, y);
	if (s) {
		return s.features;
	}
	return null;
}
function getSquareFeature(x, y, feat) {
	var s = getSquare(x, y);
	if (s) {
		return s.features[feat];
	}
	return false;
}
function getSquareDirections(x, y) {
	var s = getSquare(x, y);
	if (s) {
		return s.rotation;
	}
	return '0';
}
function getSquareDirection(x, y, ob) {
	var i = hasSquare(x, y, ob);
	if (i > -1) {
		return parseInt(getSquareDirections(x, y).substring(i, i + 1));
	}
	return 0;
}

function hasSquare(x, y, obf, d) {
	var dir = true;
	var object = getSquareObjs(x, y);
	//var i = object.indexOf(obf);
	for (var i = 0; i < object.length; i++) {
		if (typeof d !== 'undefined') {
			dir = getSquareDirections(x, y).substring(i, i + 1) === '' + d;
		}
		if (object[i] === obf && dir) {
			return i;
		}
	}
	return -1;
}

function setSquare(x, y, ob, a, d, force, feat) {
	var success = false;
	var c = toMapCoord(x, y);
	if (c.x >= 0 && c.x < mapSize && c.y >= 0 && c.y < mapSize) {
		if (typeof map[c.x] !== 'undefined' && typeof map[c.x][c.y] !== 'undefined' && ((typeof force !== undefined && force) || !getSquareFeature(x, y, 'protected'))) {
			var oo = map[c.x][c.y].obj.split(',');
			var allowedOn = [];
			if (typeof a !== 'undefined' && a !== null && a !== '') {
				var allowedOn = a.split(',');
			}
			for (var old = 0; old < oo.length; old++) {
				if (map[c.x][c.y] === null || allowedOn.length === 0 || allowedOn.indexOf(oo[old]) > -1) {
					success = true;
					map[c.x][c.y].obj = ob;
					if (typeof feat !== 'undefined') {
						map[c.x][c.y].features = feat;
					}
					var obl = ob.split(',').length;
					var dr = getSquareDirections(x, y);
					if (typeof d !== 'undefined' && d !== null) {
						if (d !== '') {
							dr = d;
						}
					} else {
						dr = '0';
					}
					dr = Array(obl + 1).join(dr).substring(0, obl);
					map[c.x][c.y].rotation = dr;
				}
			}
		}
	}
	return success;
}

function appendSquare(x, y, ob, a, d, force) {
	var sq = getSquareObjs(x, y).join(',');
	var dr = getSquareDirections(x, y);
	return setSquare(x, y, sq + ',' + ob, a, dr + d, force);
}

function replaceSquare(x, y, ob1, ob2) {
	var sq = ',' + getSquareObjs(x, y).join(',');
	if (typeof ob2 !== 'undefined' && ob2 !== '') {
		ob2 = ',' + ob2;
	}
	sq = sq.replace(',' + ob1, ob2).substring(1);
	return setSquare(x, y, sq, null, '', true);
}

function equalsSquare(sq1, sq2) {
	if (sq1.obj === sq2.obj && sq1.rotation === sq2.rotation && JSON.stringify(sq1.features) === JSON.stringify(sq2.features)) {
		return true;
	}
	return false;
}

function replaceSquareIndex(x, y, i, ob) {
	if (i > -1) {
		var sq = getSquareObjs(x, y);
		if (typeof ob !== 'undefined' && ob !== '') {
			sq[i] = ob;
		} else {
			sq.splice(i, 1);
		}
		return setSquare(x, y, sq.join(), null, '', true);
	}
	return false;
}

function setSquareFeature(x, y, feat, val) {
	var s = getSquare(x, y);
	if (s) {
		s.features[feat] = val;
		return true;
	}
	return false;
}

function drawAll(force, callback) {
	if (!isMobile) {
		if (typeof force !== 'undefined' && force) {
			for (var y = 0; y < viewSize; y++) {
				for (var x = 0; x < viewSize; x++) {
					var c = toRealCoord(x, y);
					drawSquare(c.x, c.y);
				}
			}
		} else {
			for (var y = origin.y - 1; y <= origin.y + 1; y++) {
				for (var x = origin.x - 1; x <= origin.x + 1; x++) {
					drawSquare(x, y);
				}
			}
		}

		drawRect(origin.x, origin.y, 0.2, 0.2, 0.6, 0.6, 0, '#FFCC00');
		if (debug) {
			for (var y = 0; y < viewSize; y++) {
				for (var x = 0; x < viewSize; x++) {
					if (typeof map[x] !== 'undefined' && typeof map[x][y] !== 'undefined') {
						if (typeof map[x][y].mesh === 'undefined' || typeof map[x][y].mesh === null) {
							mapCtx.fillStyle = '#000040';
						} else if (!map[x][y].mesh.visible) {
							mapCtx.fillStyle = '#1020F0';
						} else {
							mapCtx.fillStyle = '#2040F0';
						}
						mapCtx.fillRect(x * 2, y * 2 + 400, 2, 2);
					}
				}
			}
		}
	}
	if (typeof callback === 'function') {
		callback();
	}
}

function drawSquare(x, y) {
	var object = getSquareObjs(x, y);//map[x - origin.x + Math.floor(mapSize / 2)][y - origin.y + Math.floor(mapSize / 2)].obj;
	// var object = [];
	// if (typeof ob !== 'undefined' && ob !== null) {
	// 	var object = ob.split(',');
	// }
	for (o = 0; o < object.length; o++) {
		var d = parseInt(getSquareDirections(x, y).substring(o, o + 1));
		if (object[o] === '') {
			drawRect(x, y, 0, 0, 1, 1, d, '#000000');
		} else if (object[o] === 'floor') {
			drawRect(x, y, 0, 0, 1, 1, d, '#FFFFFF');
		} else if (object[o] === 'wall') {
			drawRect(x, y, 0, 0, 1, 1, d, '#777777');
		} else if (object[o] === 'wall-wood') {
			drawRect(x, y, 0, 0, 1, 0.1, d, '#994400');
		} else if (object[o] === 'door-wood') {
			drawRect(x, y, 0.2, 0, 0.6, 0.2, d, '#994400');
		} else if (object[o] === 'door-wood-open') {
			drawRect(x, y, 0.2, 0, 0.6, 0.2, d, '#FFAA88');
		} else if (object[o] === 'wall-switch') {
			drawRect(x, y, 0.4, 0, 0.2, 0.2, d, '#4444FF');
		} else if (object[o] === 'wall-switch-off') {
			drawRect(x, y, 0.4, 0, 0.2, 0.2, d, '#0000FF');
		} else if (object[o] === 'wall-deco') {
			drawRect(x, y, 0.45, 0, 0.1, 0.1, d, '#BBBBBB');
		} else if (object[o] === 'wall-deco-high') {
			drawRect(x, y, 0.45, 0, 0.1, 0.1, d, '#BBBBBB');
		} else if (object[o] === 'floor-deco') {
			drawRect(x, y, 0.45, 0.25, 0.1, 0.1, d, '#BBBBBB');
		} else if (object[o] === 'wall-secret') {
			drawRect(x, y, 0, 0, 1, 1, d, '#777777');
		} else if (object[o] === 'stairs-up') {
			drawRect(x, y, 0, 0, 1, 1, d, '#44FF44');
		} else if (object[o] === 'stairs-down') {
			drawRect(x, y, 0, 0, 1, 1, d, '#FF8888');
		} else if (object[o] === 'locked') {
			drawRect(x, y, 0.4, 0.4, 0.2, 0.2, d, '#FF3333');
		} else if (object[o] === 'door') {
			drawRect(x, y, 0.1, 0.4, 0.8, 0.2, d, '#777777');
		} else if (object[o] === 'door-open') {
			drawRect(x, y, 0.1, 0.4, 0.8, 0.2, d, '#CCCCCC');
		} else if (object[o] === 'test') {
			drawRect(x, y, 0.45, 0.45, 0.1, 0.1, d, '#FF88FF');
		} else if (object[o] === 'pillar') {
			drawRect(x, y, 0.2, 0.2, 0.6, 0.6, d, '#777777');
		} else if (object[o] === 'obstacle') {
			drawRect(x, y, 0.2, 0.2, 0.6, 0.6, d, '#BB7777');
		} else if (object[o] === 'teleport') {
			drawRect(x, y, 0, 0, 1, 1, d, '#88CCFF');
		} else if (object[o] === 'teleport-up') {
			drawRect(x, y, 0, 0, 1, 1, d, '#88CCFF');
		} else if (object[o] === 'pit') {
			drawRect(x, y, 0.2, 0.2, 0.6, 0.6, d, '#000000');
		} else if (object[o] === 'pit-ceil') {
			drawRect(x, y, 0.2, 0.2, 0.6, 0.6, d, '#EEEEEE');
		} else if (object[o] === 'ceil-light') {
			drawRect(x, y, 0.45, 0.45, 0.1, 0.1, d, '#FFEE00');
		} else if (object[o] === 'wall-light') {
			drawRect(x, y, 0.45, 0, 0.1, 0.1, d, '#FFEE00');
		} else if (object[o] === 'wall-light-high') {
			drawRect(x, y, 0.45, 0, 0.1, 0.1, d, '#FFEE00');
		} else if (object[o] === 'trace') {
			drawRect(x, y, 0, 0, 1, 1, d, '#FFCC00', 0.5);
		}
	}
	// if (getSquareFeature(x, y, 'double') !== 'ceil') {
	// 	drawRect(x, y, 0, 0, 1, 1, d, '#000000', 0.1);
	// }
	//	if (getSquareFeature(x, y, 'protected')) {
	//drawRect(x, y, 0.45, 0.45, 0.1, 0.1, d, '#ff0000');
	//}
	//if (getSquareFeature(x, y, 'wood')) {
	//drawRect(x, y, 0, 0, 1, 1, d, '#FF8000', 0.1);
	//}
}

//draw recttancle on square, based on a size of 1
function drawRect(x, y, x1, y1, x2, y2, d, col, a) {
	if (!stereo) {
		var c = toMapCoord(x, y);
		var xp, yp, xs, ys;
		mapCtx.fillStyle = col;
		mapCtx.globalAlpha = 1.0;
		if (typeof a !== 'undefined') {
			mapCtx.globalAlpha = a;
		}
		switch (d) {
			case 0: xp = c.x + x1; yp = c.y + y1; xs = x2; ys = y2; break;
			case 1: xp = c.x + 1 - y1; yp = c.y + x1; xs = -y2; ys = x2; break;
			case 2: xp = c.x + 1 - x1; yp = c.y + 1 - y1; xs = -x2; ys = -y2; break;
			case 3: xp = c.x + y1; yp = c.y + 1 - x1; xs = y2; ys = -x2; break;
		}
		mapCtx.fillRect(xp * squareSize, yp * squareSize, xs * squareSize, ys * squareSize);
	}
}

function floorAction(x, y, d) {
	if (getSquare(x, y) && !getSquareObj(x, y, 'trace')) {
		appendSquare(x, y, 'trace', '', '', true);
		setMutation(x, y);
		tdDraw(origin.f, x, y);
	}
	if (typeof d !== 'undefined') {
		var d2 = (d + 2) % 4;
	} else if (typeof getSquareFeature(x, y, 'teleport') !== 'undefined') {
		var rl = false;
		var s = getSquareFeature(x, y, 'teleport');
		if (typeof s.x !== 'undefined') { //move x
			origin.x = s.x;
			//rl = true;
		}
		if (typeof s.y !== 'undefined') { //move y
			origin.y = s.y;
			//rl = true;
		}
		if (typeof s.d !== 'undefined') { //rotate
			tdMoveCameraXY(yawObject.rotation.y - s.d * (Math.PI / 2), undefined, undefined, true);
		}
		if (typeof s.f !== 'undefined') { //move floor
			origin.f = s.f;
			rl = true;
		}
		if (rl) {
			//reloadAll();
			return true;
		}
	} else if (hasSquare(x, y, 'pit') > -1) {
		origin.f--;
		//reloadAll();
		return true;
	}
	var ds = getSquareDirection(x, y, 'stairs-down');
	var ds1 = (getSquareDirection(x, y, 'stairs-up') + 2) % 4;
	if (hasSquare(x, y, 'stairs-up', d2) > -1 && origin.d === ds1) {
		origin.f++;
		origin.x += dir[ds1].x * 2;
		origin.y += dir[ds1].y * 2;
		//reloadAll();
		return true;
	} else if (hasSquare(x, y, 'stairs-down', d) > -1 && origin.d === ds) {
		origin.f--;
		origin.x += dir[ds].x * 2;
		origin.y += dir[ds].y * 2;
		//reloadAll();
		return true;
	}
	return false;
}

//return values:
//0 = no action
//1 = close action
//2 = open action
//check: only check if there is an action available
function wallAction(x, y, d, check) {
	var di1 = hasSquare(x, y, 'door-wood', d);
	var di2 = hasSquare(x + dir[d].x, y + dir[d].y, 'door-wood', (d + 2) % 4);
	var di3 = hasSquare(x, y, 'door-wood-open', d);
	var di4 = hasSquare(x + dir[d].x, y + dir[d].y, 'door-wood-open', (d + 2) % 4);
	if (di1 > -1) {
		//WOODEN DOOR
		if (typeof check === 'undefined' || !check) {
			replaceSquareIndex(x, y, di1, 'door-wood-open');
			setMutation(x, y);
			drawAll();
			tdDraw(origin.f, x, y);
		}
		return 2;
	} else if (di2 > -1) {
		//WOODEN DOOR
		if (typeof check === 'undefined' || !check) {
			replaceSquareIndex(x + dir[d].x, y + dir[d].y, di2, 'door-wood-open');
			setMutation(x + dir[d].x, y + dir[d].y);
			drawAll();
			tdDraw(origin.f, x + dir[d].x, y + dir[d].y);
		}
		return 2;
	} else if (playerCanMove(d) > -1) {
		//DOOR
		var di1 = hasSquare(x + dir[d].x, y + dir[d].y, 'door');
		var di2 = hasSquare(x + dir[d].x, y + dir[d].y, 'door-open');
		if (hasSquare(x + dir[d].x, y + dir[d].y, 'locked') === -1) {
			if (di1 > -1) {
				if (typeof check === 'undefined' || !check) {
					replaceSquareIndex(x + dir[d].x, y + dir[d].y, di1, 'door-open');
					setMutation(x + dir[d].x, y + dir[d].y);
					drawAll();
					tdDraw(origin.f, x + dir[d].x, y + dir[d].y);
				}
				return 2;
			} else if (di2 > -1) {
				if (typeof check === 'undefined' || !check) {
					replaceSquareIndex(x + dir[d].x, y + dir[d].y, di2, 'door');
					setMutation(x + dir[d].x, y + dir[d].y);
					drawAll();
					tdDraw(origin.f, x + dir[d].x, y + dir[d].y);
				}
				return 1;
			}
		}

		//WALL SWITCH
		var di1 = hasSquare(x + dir[d].x, y + dir[d].y, 'wall-switch', (d + 2) % 4);
		var di2 = hasSquare(x + dir[d].x, y + dir[d].y, 'wall-switch-off', (d + 2) % 4);
		if (di1 > -1 || di2 > -1) {
			if (typeof check === 'undefined' || !check) {
				var feat = getSquareFeatures(x + dir[d].x, y + dir[d].y);
				if (!replaceSquareIndex(x + dir[d].x, y + dir[d].y, di1, 'wall-switch-off')) {
					replaceSquareIndex(x + dir[d].x, y + dir[d].y, di2, 'wall-switch');
				}
				if (typeof feat.target !== 'undefined') {
					var xt = feat.target.x;
					var yt = feat.target.y;
					var dt = feat.target.d;
					if (typeof dt === 'undefined') {
						dt = '0';
					}
					var ss = clone(getSquare(xt, yt)); //source
					if (typeof feat.target.obj !== 'undefined') {
						if (feat.target.obj !== '') {
							setSquare(xt, yt, feat.target.obj, '', dt);
						}
					} else {
						var di1 = hasSquare(xt, yt, 'door');
						var di2 = hasSquare(xt, yt, 'door-open');
						if (di1 > 0) {
							replaceSquareIndex(xt, yt, di1, 'door-open');
						} else if (di2 > 0) {
							replaceSquareIndex(xt, yt, di2, 'door');
						} else {
							setSquare(xt, yt, 'floor', '', dt, true);
						}
					}
					if (typeof feat.target.mode !== 'undefined') {
						if (feat.target.mode === 'toggle') {
							feat.target.obj = ss.obj;
							feat.target.d = ss.rotation;
						} else if (feat.target.mode === 'once') {
							feat.target.obj = '';
						}
					}
					setMutation(x + dir[d].x, y + dir[d].y);
					setMutation(xt, yt);
					drawAll();
					tdDraw(origin.f, x + dir[d].x, y + dir[d].y);
					tdDraw(origin.f, xt, yt);
				}
			}
			return 2;
		}
	}
	if (di3 > -1) {
		//WOODEN DOOR
		if (typeof check === 'undefined' || !check) {
			replaceSquareIndex(x, y, di3, 'door-wood');
			setMutation(x, y);
			drawAll();
			tdDraw(origin.f, x, y);
		}
		return 1;
	} else if (di4 > -1) {
		//WOODEN DOOR
		if (typeof check === 'undefined' || !check) {
			replaceSquareIndex(x + dir[d].x, y + dir[d].y, di4, 'door-wood');
			setMutation(x + dir[d].x, y + dir[d].y);
			drawAll();
			tdDraw(origin.f, x + dir[d].x, y + dir[d].y);
		}
		return 1;
	}
	return 0;
}

function deleteRow(arr, row) {
	arr = arr.slice(0); // make copy
	arr.splice(row, 1);
	return arr;
}

function deleteColumn(arr, col) {
	for (var i = 0; i < arr.length; i++) {
		arr[i].splice(col, 1);
	}
	return arr;
}

function sleep(milliseconds) {
	var start = new Date().getTime();
	for (var i = 0; i < 1e7; i++) {
		if ((new Date().getTime() - start) > milliseconds) {
			break;
		}
	}
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

function setCookie(cname, cvalue) {
	if (cname.indexOf('_') === 0) {
		localStorage.setItem(cname, JSON.stringify(cvalue));
	} else {
		localStorage.setItem(cname, cvalue);
	}
}
function getCookie(cname) {
	let cvalue;
	if (cname.indexOf('_') === 0) {
		cvalue = JSON.parse(localStorage.getItem(cname));
	} else {
		cvalue = localStorage.getItem(cname) || '';
	}
	return cvalue;
}

function setCoords(coord) {
	let coordString = 'f=' + coord.f + '&x=' + coord.x + '&y=' + coord.y + '&d=' + coord.d;
	window.history.replaceState({ path: window.location.origin }, '', window.location.origin + '?' + coordString);
}

function getCoords() {
	return {
		f: parseInt(getParameterByName('f')),
		x: parseInt(getParameterByName('x')),
		y: parseInt(getParameterByName('y')),
		d: parseInt(getParameterByName('d'))
	}
}

function getParameterByName(name, url) {
	if (!url) url = window.location.href;
	name = name.replace(/[\[\]]/g, '\\$&');
	var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
		results = regex.exec(url);
	if (!results) return null;
	if (!results[2]) return '';
	return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

function requestFullscreen() {
	var con = document.getElementById('view');
	if (con.requestFullscreen) {
		con.requestFullscreen();
	} else if (con.msRequestFullscreen) {
		con.msRequestFullscreen();
	} else if (con.mozRequestFullScreen) {
		con.mozRequestFullScreen();
	} else if (con.webkitRequestFullscreen) {
		con.webkitRequestFullscreen();
	}
}

function buttonEvents(event) {
	if (stereo) {
		if (controlsEnabled && !keysFrozen) {
			let d = origin.d;
			let d2 = (origin.d + 2) % 4;
			if (tdGetSpriteOpacity('forward') > 0.4) {
				tdMoveCamera(d);
			} else if (tdGetSpriteOpacity('backward') > 0.4) {
				tdMoveCamera(d2);
			} else if (tdGetSpriteOpacity('use') > 0.4) {
				wallAction(origin.x, origin.y, d);
			} else if (tdGetSpriteOpacity('random') > 0.4) {
				initPlayer(true);
				reloadAll();
			}
			for (s in tdSprite) {
				if (typeof tdSprite[s].mesh !== 'undefined') {
					tdSprite[s].mesh.material.opacity = 0;
				}
			}
		}
	} else if (isMobile) {
		let canvas = $('#main');
		let x = parseInt(event.clientX / canvas.outerWidth() * 3);
		let y = parseInt(event.clientY / canvas.outerWidth() * 3);
		let index = x % 3 + y * 3;
		let d = origin.d;
		let d1 = (origin.d + 1) % 4;
		let d3 = (origin.d + 3) % 4;
		switch (index) {
			case 0: tdRotateCamera(-1); break;
			case 1: tdMoveCamera(d); break;
			case 2: tdRotateCamera(1); break;
			case 3: tdMoveCamera(d3); break;
			case 4: wallAction(origin.x, origin.y, d); break;
			case 5: tdMoveCamera(d1); break;
		}
	}
}

function getMutation(x, y) {
	if (typeof mutation !== 'undefined') {
		var k = getMutationKey(origin.f, x, y);
		if (k.f in mutation) {
			if (k.x in mutation[k.f]) {
				if (k.y in mutation[k.f][k.x]) {
					return mutation[k.f][k.x][k.y];
				}
			}
		}
	}
	return null;
}
function setMutation(x1, y1) {
	var m = toMapCoord(x1, y1);
	if (m.x >= 0 && m.x < mapSize && m.y >= 0 && m.y < mapSize) {
		var k = getMutationKey(origin.f, x1, y1);
		if (typeof mutation === 'undefined') {
			mutation = {};
		}
		if (typeof mutation[k.f] === 'undefined') {
			mutation[k.f] = {};
		}
		if (typeof mutation[k.f][k.x] === 'undefined') {
			mutation[k.f][k.x] = {};
		}
		mutation[k.f][k.x][k.y] = clone(map[m.x][m.y]);
	}
}
function deleteMutation(x, y) {
	var m = getMutation(x, y);
	if (m !== null) {
		var k = getMutationKey(origin.f, x, y);
		delete mutation[k.f][k.x][k.y];
		if ($.isEmptyObject(mutation[k.f][k.x])) {
			delete mutation[k.f][k.x];
			if ($.isEmptyObject(mutation[k.f])) {
				delete mutation[k.f];
			}
		}
	}
}
function getMutationKey(f, x, y) {
	return {
		f: 'F' + f,
		x: 'X' + x,
		y: 'Y' + y
	}
}

function toMapCoord(x, y) {
	var c = toRealCoord(0, 0);
	return { x: x - c.x, y: y - c.y };
}

function toRealCoord(x, y) {
	var x1 = Math.floor(origin.x / viewSize) * viewSize + x.mod(viewSize);
	var y1 = Math.floor(origin.y / viewSize) * viewSize + y.mod(viewSize);
	return { x: x1, y: y1 };
}

function clone(o) {
	var j = $.extend(true, {}, o);
	return j;
}

function fileExist(urlToFile) {
	try {
		var xhr = new XMLHttpRequest();
		xhr.open('HEAD', urlToFile, false);
		xhr.send();
	} catch (err) {
		xhr.abort();
		return false;
	}
	if (xhr.status == '404') {
		xhr.abort();
		return false;
	} else {
		xhr.abort();
		return true;
	}
}

String.prototype.endsWith = function (suffix) {
	return this.indexOf(suffix, this.length - suffix.length) !== -1;
};

function printDebug() {
	if (debug) {
		$('#debug').html('Camera: X ' + camera.position.x.toFixed(2) + ', Y ' + camera.position.y.toFixed(2) + ', Z ' + camera.position.z.toFixed(2) + ', RX ' + camera.rotation.x.toFixed(2) + ', RY ' + camera.rotation.y.toFixed(2) + ', RZ ' + camera.rotation.z.toFixed(2) + '<br>');
		$('#debug').append('Light: X ' + light.position.x.toFixed(2) + ', Y ' + light.position.y.toFixed(2) + ', Z ' + light.position.z.toFixed(2) + ', RX ' + light.rotation.x.toFixed(2) + ', RY ' + light.rotation.y.toFixed(2) + ', RZ ' + light.rotation.z.toFixed(2) + '<br>');
		$('#debug').append('Origin3D: X ' + origin.xt + ', Y ' + origin.yt + '<br>');
		$('#debug').append('Objects: ' + scene.children.length + '<br>');
		$('#debug').append('Faces: ' + renderer.info.render.faces + '<br>');
		$('#debug').append('Vertices: ' + renderer.info.render.vertices);
		stats.update();
	}
}

Number.prototype.mod = function (n) {
	return ((this % n) + n) % n;
};

/*(function () {
    'use strict';

    var methods, generateNewMethod, i, j, cur, old, addEvent;

    if ('console' in window) {
        methods = [
            'log', 'assert', 'clear', 'count',
            'debug', 'dir', 'dirxml', 'error',
            'exception', 'group', 'groupCollapsed',
            'groupEnd', 'info', 'profile', 'profileEnd',
            'table', 'time', 'timeEnd', 'timeStamp',
            'trace', 'warn'
        ];

        generateNewMethod = function (oldCallback, methodName) {
            return function () {
                var args;
                //alert('called console.' + methodName + ', with ' + arguments.length + ' argument(s)');
                args = Array.prototype.slice.call(arguments, 0);
                Function.prototype.apply.call(oldCallback, console, arguments);
            };
        };

        for (i = 0, j = methods.length; i < j; i++) {
            cur = methods[i];
            if (cur in console) {
                old = console[cur];
                console[cur] = generateNewMethod(old, cur);
            }
        }
    }

    window.onerror = function (msg, url, line) {
    	if($('body > #log').length === 0) {
    		$('body').append('<div id='log'></div>')
    	}
        $('#log').text($('#log').html() + msg + ', ' + url + ', line ' + line);
        $('#log').append('<br>');
    };
}());*/