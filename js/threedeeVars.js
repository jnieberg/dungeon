//Threedee variables
var controls, effect, controlsEnabled;
var raycaster;
var timer = 0;
var imagePath = 'images/';
var tdScreenWidth = 800;
var tdScreenHeight = 600;
var vertexShader = document.getElementById('vertexShaderDepth').textContent;
var fragmentShader = document.getElementById('fragmentShaderDepth').textContent;
var reflectionCube, imageLoader;
var themeOverride = '';
var imageId = {
	'wall': {
		'id': '+texture+wall',
		'max': 1000000 //37
	},
	'wallSecret': {
		'id': '+rune+OR+symbol',
		'extra': 'ic:trans,itp:lineart',
		'max': 1000000 //6
	},
	'wallWood': {
		'id': '+texture+wall+OR+wood',
		'max': 1000000 //21
	},
	'wallWoodDoor': {
		'id': '+texture+wall+OR+wood+door+OR+gate+OR+portcullis',
		'max': 1000000 //21
	},
	'door': {
		'id': '+texture+door+OR+gate+OR+portcullis',
		'max': 1000000 //21
	},
	'floor': {
		'id': '+texture+floor+OR+ceiling+OR+ground',
		'max': 1000000 //33
	},
	'ceiling': {
		'id': '+texture+ceiling+OR+floor+OR+plafond',
		'max': 1000000 //33
	},
	'teleport': {
		'id': '+sparkles+OR+particles+OR+glitters+OR+dust+-cosmetics',
		'extra': 'ic:trans',
		'max': 1000000 //4
	},
	'wallSwitch': {
		'id': '+switch+OR+button+OR+lever',
		'extra': 'ic:trans,itp:clipart',
		'max': 1000000 //9
	},
	'wallDeco': {
		'id': '+decoration+texture', //+wall+decoration+OR+decorative+OR+blood+OR+hole+OR+slime+OR+dirt+OR+grass+OR+moss+OR+cracks+OR+painting+OR+banner
		'extra': 'ic:trans',
		'max': 1000000 //23
	},
	'floorDeco': {
		'id': '+decoration+texture+floor+OR+ceiling', //+floor+OR+ground+decoration+OR+decorative+OR+blood+OR+hole+OR+slime+OR+dirt+OR+cracks+OR+grate
		'extra': 'ic:trans',
		'max': 1000000 //10
	},
	'obstacle': {
		'id': 'obstacle',
		'max': 2
	},
	'wallLight': {
		'id': 'wall-light',
		'max': 1
	},
	'window': {
		'id': '+',
		'extra': 'ic:color',
		'max': 1000000
	},
	'rune': {
		'id': '+',
		'extra': 'ic:trans,itp:lineart',
		'max': 1000000
	},
	'trace': {
		'id': 'trace',
		'max': 1
	},
};

var aryImageLoader = [];

var scene, renderer, camera, tdPlayer;
var yawObject, pitchObject, rollObject;
var light, ambientLight;
var roomLight = [];
var tdSprite = {
	'forward': {
		image: 'forward',
		offsetZ: 0.75,
		position: 'relative',
		scale: 0.2
	},
	'backward': {
		image: 'backward',
		offsetY: 0.2,
		offsetZ: 0.75,
		position: 'relative',
		scale: 0.2
	},
	'use': {
		image: 'use',
		offsetY: -0.2,
		offsetZ: 0.75,
		position: 'relative',
		visible: wallAction,
		scale: 0.2
	},
	'random': {
		image: 'random',
		offsetX: 0.15,
		offsetY: 0,
		offsetZ: 0.75,
		position: 'relative',
		scale: 0.1
	},
	'crosshair': {
		image: 'crosshair',
		offsetZ: 0.74,
		position: 'fixed',
		scale: 0.1
	}
};
var tdGeometryCTM = [];
var tdTexture = {};
var tdGeometry = [];
var tdMaterial = {
	'wall': {
		image: imageId.wall,
		normal: true,
		specular: true,
		specularColor: 0x808080
	},
	'ceil': {
		image: imageId.ceiling,
		normal: true,
		specular: true,
		specularColor: 0x808080
	},
	'wall2': {
		image: imageId.wall,
		transparent: true,
		normal: true,
		specular: true,
		specularColor: 0x808080,
		opacity: 0.5
	},
	'wall-x20': {
		image: imageId.wall,
		normal: true,
		specular: true,
		specularColor: 0x808080,
		scale: { x: 2, y: 1 }
	},
	'wall-x01': {
		image: imageId.wall,
		normal: true,
		specular: true,
		specularColor: 0x808080,
		scale: { x: 0.1, y: 1 },
		translate: { x: 0.45, y: 0 }
	},
	'wall-x025': {
		image: imageId.wall,
		normal: true,
		specular: true,
		specularColor: 0x808080,
		scale: { x: 0.25, y: 1 }
	},
	'wall-x05': {
		image: imageId.wall,
		normal: true,
		specular: true,
		specularColor: 0x808080,
		scale: { x: 0.5, y: 1 }
	},
	'wall-y01': {
		image: imageId.wall,
		normal: true,
		specular: true,
		specularColor: 0x808080,
		scale: { x: 1, y: 0.1 },
		translate: { x: 0, y: 0.9 }
	},
	'wall-x05-y02': {
		image: imageId.wall,
		normal: true,
		specular: true,
		specularColor: 0x808080,
		scale: { x: 0.5, y: 0.2 }
	},
	'wall-x20-y02': {
		image: imageId.wall,
		normal: true,
		specular: true,
		specularColor: 0x808080,
		scale: { x: 2.0, y: 0.2 }
	},
	'wall-secret': {
		image: imageId.wallSecret,
		transparent: true,
		opacity: 0.25,
		reflection: 0.5
	},
	'wall-wood': {
		image: imageId.wallWood,
		transparent: true,
		normal: true,
		specular: true,
		specularColor: 0x808080
	},
	'wall-wood-x05': {
		image: imageId.wallWood,
		transparent: true,
		normal: true,
		specular: true,
		specularColor: 0x808080,
		scale: { x: 0.5, y: 1 }
	},
	'wall-wood-x01': {
		image: imageId.wallWood,
		transparent: true,
		normal: true,
		specular: true,
		specularColor: 0x808080,
		scale: { x: 0.1, y: 1 },
		translate: { x: 0.95, y: 0 }
	},
	'wall-wood-y01': {
		image: imageId.wallWood,
		transparent: true,
		normal: true,
		specular: true,
		specularColor: 0x808080,
		scale: { x: 1, y: 0.1 }
	},
	'door-wood-left': {
		image: imageId.wallWood,
		transparent: true,
		normal: true,
		specular: true,
		specularColor: 0x808080,
		scale: { x: 0.25, y: 1 }
	},
	'door-wood': {
		image: imageId.wallWood,
		transparent: true,
		normal: true,
		specular: true,
		specularColor: 0x808080,
		scale: { x: 0.5, y: 0.75 },
		translate: { x: 0.25, y: 0.0 }
	},
	'door-wood-right': {
		image: imageId.wallWood,
		transparent: true,
		normal: true,
		specular: true,
		specularColor: 0x808080,
		scale: { x: 0.25, y: 1 },
		translate: { x: 0.75, y: 0 }
	},
	'door-wood-top': {
		image: imageId.wallWood,
		transparent: true,
		normal: true,
		specular: true,
		specularColor: 0x808080,
		scale: { x: 0.5, y: 0.25 },
		translate: { x: 0.25, y: 0.75 }
	},
	'door': {
		image: imageId.door,
		transparent: true,
		normal: true,
		reflection: 0.5
	},
	'floor': {
		image: imageId.floor,
		normal: true,
		specular: true,
		specularColor: 0x808080
	},
	'teleport': {
		image: imageId.teleport,
		shadow: false,
		light: true,
		lightColor: 'random',
		lightDistance: 0.5,
		transparent: true,
		normal: false,
		specular: false,
		blend: THREE.AdditiveBlending,
		side: THREE.DoubleSide,
		animate: 'random,40'
	},
	'teleport-up': {
		image: imageId.teleport,
		shadow: false,
		light: true,
		lightColor: 'random',
		lightDistance: 0.5,
		transparent: true,
		normal: false,
		specular: false,
		blend: THREE.AdditiveBlending,
		side: THREE.DoubleSide,
		animate: 'move-y,40,-0.05'
	},
	'wall-switch': {
		image: imageId.wallSwitch,
		transparent: true,
		normal: true,
		shadow: false,
		reflection: 0.5
	},
	'wall-switch-off': {
		image: imageId.wallSwitch,
		color: '#222222',
		transparent: true,
		normal: true,
		shadow: false,
		reflection: 0.5
	},
	'wall-deco': {
		image: imageId.wallDeco,
		transparent: true,
		normal: true,
		specular: true,
		specularColor: 0x202020,
		shadow: false
	},
	'floor-deco': {
		image: imageId.floorDeco,
		transparent: true,
		normal: true,
		shadow: false,
		reflection: 0.5
	},
	'obstacle': {
		image: imageId.obstacle,
		normal: true,
		specular: true,
		specularColor: 0x808080
	},
	'ceil-light': {
		image: imageId.wall,
		light: true,
		lightColor: 'random2',
		lightDistance: 1,
		specular: true,
		specularColor: 0xffffff,
		shadow: false,
		reflection: 0.5
	},
	'wall-light': {
		image: imageId.wallLight,
		light: true,
		lightColor: 'random2',
		lightDistance: 1,
		normal: true,
		specular: true,
		specularColor: 0xffffff,
		shadow: false
	},
	'window': {
		image: imageId.window,
		normal: true,
		transparent: true,
		opacity: 0.25,
		reflection: 0.25,
		blend: THREE.NormalBlending
	},
	'rune': {
		image: imageId.rune,
		color: 'random',
		normal: true,
		specular: true,
		specularColor: 0x808080,
		transparent: true,
		blend: THREE.NormalBlending,
		animate: '1,20'
	},
	'trace': {
		image: imageId.trace,
		color: 'random',
		shadow: false,
		transparent: true,
		opacity: 0.1,
		blend: THREE.AdditiveBlending
	},
	'test': {
		color: '#ff00ff'
	}
};
//setCookie('_tdMaterial', tdMaterial);
var tdMeshFix = {
	'obstacle': [{ //statue roman
		x1: 0.44, y1: 0.55, z1: 0.0,
		x2: 0.25, y2: 0.25, z2: 0.9
	}, { //rock
		x1: 0.2, y1: 0.2, z1: 0.0,
		x2: 0.6, y2: 0.6, z2: 0.6
	}]
};
