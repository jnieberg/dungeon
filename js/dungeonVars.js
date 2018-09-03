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
