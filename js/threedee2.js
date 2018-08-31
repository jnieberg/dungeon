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
		'extra': 'ic:trans,itp:photo',
		'max': 1000000 //23
	},
	'floorDeco': {
		'id': '+decoration+texture+floor+OR+ceiling', //+floor+OR+ground+decoration+OR+decorative+OR+blood+OR+hole+OR+slime+OR+dirt+OR+cracks+OR+grate
		'extra': 'ic:trans,itp:photo',
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

function tdAnimate() {
	requestAnimationFrame(tdAnimate);
	//if(gameLoaded) {
	//if (isMobile) {
	//controls.update();
	//}
	tdRender();
	//}
}
function tdRender() {
	for (var ob in tdMaterial) {
		if (typeof tdMaterial[ob].animate !== 'undefined' && typeof tdTexture[ob] !== 'undefined') {
			var at = tdMaterial[ob].animate.split(',');
			if (timer % Math.floor(60.0 / at[1]) === 0) {
				for (var i in tdTexture[ob]) {
					if (typeof tdTexture[ob][i] !== 'undefined' && tdTexture[ob][i] !== null) {
						if (at[0] === 'random') {
							tdTexture[ob][i].offset.x = Math.random();
							tdTexture[ob][i].offset.y = Math.random();
						} else if (at[0] === 'move-x') {
							tdTexture[ob][i].offset.x = parseFloat(at[2]) * timer;
						} else if (at[0] === 'move-y') {
							tdTexture[ob][i].offset.y = parseFloat(at[2]) * timer;
						}
					}
				}
			}
		}
	}
	setTimeout(function () {
		for (let r in roomLight) {
			if (roomLight[r].makeVisible === 1) {
				if (!roomLight[r].mesh.visible) {
					roomLight[r].mesh.visible = true;
				}
				roomLight[r].mesh.intensity += 0.05;
				if (roomLight[r].mesh.intensity >= 2) {
					roomLight[r].makeVisible = 0;
				}
			} else if (roomLight[r].makeVisible === -1) {
				roomLight[r].mesh.intensity -= 0.05;
				if (roomLight[r].mesh.intensity <= 0) {
					roomLight[r].makeVisible = 0;
					roomLight[r].mesh.visible = false;
				}
			}
		}
	}, 1);
	timer++;
	printDebug();
	TWEEN.update();
	if (controlsEnabled && !keysFrozen) {
		tdUpdateCamera(true);
	}
	if (stereo) {
		effect.render(scene, camera);
	} else {
		renderer.render(scene, camera);
	}
}

function tdGetImageData(img, ob, i, reflection) {
	imageLoader.load(img,
		function (result) {
			tdMaterial[ob].material['m' + i].extension = 'png';
			tdUpdateTexture(result, ob, i);
			var pre = 'norm';
			if (typeof tdTexture[pre + '-' + ob] === 'undefined') {
				tdTexture[pre + '-' + ob] = [];
			}
			if (typeof tdTexture[pre + '-' + ob][i] === 'undefined') {
				tdUpdateNormal(result, ob, i, true);
			}
			pre = 'spec';
			if (typeof tdTexture[pre + '-' + ob] === 'undefined') {
				tdTexture[pre + '-' + ob] = [];
			}
			if (typeof tdTexture[pre + '-' + ob][i] === 'undefined') {
				tdUpdateSpecular(result, ob, i, reflection);
			}
		},
		function () { },
		function () {
			tdTexture[ob][i] = null;
			console.warn('DUNGEON: Texture not found: ' + img);
			tdGetImageData('/images/empty.png', ob, i, false);
			loadingCountError++;
		}
	);
}

function tdCreateMaterial(ob, i) {
	i = i || 0;
	var color = new THREE.Color(0xFFFFFF);
	var image = tdMaterial[ob].image;
	var img = image.id + '/' + i;
	if (typeof tdMaterial[ob].color !== 'undefined') {
		if (tdMaterial[ob].color === 'random') {
			var h = rand(Math.floor(origin.f / floorSize), 0, 0, 97.13, viewSize) * 0.01;
			var s = 1.0;
			var l = 0.5 - rand(Math.floor(origin.f / floorSize), 0, 0, 531.09, 25) * 0.01;
			color = new THREE.Color().setHSL(h, s, l);
		} else {
			color = new THREE.Color(tdMaterial[ob].color);
		}
	} else if (tdMaterial[ob].lightColor === 'random') {
		var h = rand(Math.floor(origin.f / floorSize), 0, 0, 112.11, viewSize) * 0.01;
		var s = 1.0;
		var l = 0.5 - rand(Math.floor(origin.f / 10), 0, 0, 665.57, 25) * 0.01;
		color = new THREE.Color().setHSL(h, s, l);
	}
	var emissiveIntensity = 1;
	var emissive = (rand(Math.floor(origin.f / floorSize), 0, 0, 112.10, 8));
	emissive += ',' + (rand(Math.floor(origin.f / floorSize), 0, 0, 843.59, 8));
	emissive += ',' + (rand(Math.floor(origin.f / floorSize), 0, 0, 650.22, 8));
	emissive = new THREE.Color('rgb(' + emissive + ')');
	if (typeof tdMaterial[ob].emissive !== 'undefined') {
		emissive = new THREE.Color(tdMaterial[ob].emissive);
		emissiveIntensity = 1;
	}
	if (typeof tdMaterial[ob].material === 'undefined') {
		tdMaterial[ob].material = [];
	} else if (typeof tdMaterial[ob].material['m' + i] !== 'undefined') {
		tdMaterial[ob].material['m' + i].color = color;
		tdMaterial[ob].material['m' + i].emissive = emissive;
		return tdMaterial[ob].material['m' + i];
	}
	if (image && image.id !== '') {
		var trans = false;
		if (typeof tdMaterial[ob].transparent !== 'undefined' && tdMaterial[ob].transparent) {
			trans = true;
		}
		var opac = 1.0;
		if (typeof tdMaterial[ob].opacity !== 'undefined' && tdMaterial[ob].opacity !== 1.0) {
			opac = tdMaterial[ob].opacity;
		}
		var blend = THREE.NormalBlending;
		if (typeof tdMaterial[ob].blend !== 'undefined') {
			blend = tdMaterial[ob].blend;
		}
		var side = THREE.FrontSide;
		if (typeof tdMaterial[ob].side !== 'undefined') {
			side = tdMaterial[ob].side;
		}
		var reflection = null;
		var reflectivity = 0.0;
		var normalScale = new THREE.Vector2(1.2, 1.2);
		var bumpScale = 0.02;
		if (typeof tdMaterial[ob].reflection !== 'undefined' && tdMaterial[ob].reflection > 0.0) {
			reflection = reflectionCube;
			reflectivity = tdMaterial[ob].reflection;
			intensity = (1.0 - reflectivity);
			normalScale = new THREE.Vector2(intensity, intensity);
			bumpScale = intensity * 0.02;
		}
		var fog = true;
		//if(typeof tdMaterial[ob].light !== 'undefined' && tdMaterial[ob].light) {
		//emissive = new THREE.Color(0x000000);
		//emissiveIntensity = 0;
		//fog = false;
		//}
		if (blend !== THREE.NormalBlending) {
			var parameters = {
				color: color,
				emissive: new THREE.Color('rgb(0, 0, 0)'),
				emissiveIntensity: 0,
				blending: blend,
				transparent: trans,
				opacity: opac,
				side: side,
				envMap: reflection,
				reflectivity: reflectivity,
				shininess: 0,
				fog: fog
			};
			tdMaterial[ob].material['m' + i] = new THREE.MeshPhongMaterial(parameters);
		} else {
			var parameters = {
				color: color,
				emissive: emissive,
				emissiveIntensity: emissiveIntensity,
				normalScale: normalScale,
				bumpScale: bumpScale,
				blending: blend,
				transparent: trans,
				opacity: opac,
				side: side,
				envMap: reflection,
				reflectivity: reflectivity,
				fog: fog
			};
			tdMaterial[ob].material['m' + i] = new THREE.MeshPhongMaterial(parameters);
		}

		if (typeof tdTexture[ob] === 'undefined') {
			tdTexture[ob] = [];
		}

		if (typeof tdTexture[ob][i] === 'undefined') {
			if (image.id.indexOf('+') === 0) {
				(function (ob, i) {
					setTimeout(function () { //GOOGLE STARTS HERE!!!
						// const themeRand = rand(Math.floor(origin.f / floorSize), 0, 0, 712.83, themeList.length);
						// themeOverride = themeOverride || themeList[themeRand];
						const themePath = themeOverride.replace(/^(?:(.*?\+.*?\+.*?)\+.*?)$|^([^\+]*?)$/g, '$1$2') || 'any';
						const imageId = image.id.replace(/^\+/, '') || 'any';
						const tdPath = '/' + themePath + '/' + imageId + '/' + i; //+ '.png'
						const uri = '/search?q=' + themeOverride + image.id + '+-minecraft&tbs=isz:ex,iszw:512,iszh:512&tbm=isch&tdPath=' + tdPath; //ift:png,
						tdGetImageData(uri, ob, i, reflection);
						setTheme();
					}, 1);
				})(ob, i);
			} else {
				(function (ob, i) {
					setTimeout(function () {
						imageLoader.load(imagePath + imagePathQuality + img + '.jpg',
							function (result) {
								tdMaterial[ob].material['m' + i].extension = 'jpg';
								tdUpdateTexture(result, ob, i);
							},
							function () { },
							function () {
								loadingCountError++;
								imageLoader.load(imagePath + imagePathQuality + img + '.png',
									function (result) {
										tdMaterial[ob].material['m' + i].extension = 'png';
										tdUpdateTexture(result, ob, i);
									},
									function () { },
									function () {
										tdTexture[ob][i] = null;
										console.warn('DUNGEON: Texture not found: ' + imagePath + imagePathQuality + img);
										loadingCountError++;
									}
								);
							}
						);
					}, 1);

					if (typeof tdMaterial[ob].normal !== 'undefined' && tdMaterial[ob].normal) {
						var pre = 'norm';
						if (typeof tdTexture[pre + '-' + ob] === 'undefined') {
							tdTexture[pre + '-' + ob] = [];
						}
						if (typeof tdTexture[pre + '-' + ob][i] === 'undefined') {
							(function (ob, i, pre) {
								setTimeout(function () {
									imageLoader.load(imagePath + pre + '/' + img + '.jpg',
										function (result) {
											tdUpdateNormal(result, ob, i);
										},
										function () { },
										function () {
											loadingCountError++;
											console.warn('DUNGEON: Normal not found: ' + imagePath + pre + img);
										}
									);
								}, 50);
							})(ob, i, pre);
						}
					}
					if (typeof tdMaterial[ob].specular !== 'undefined' && tdMaterial[ob].specular && reflection === null) {
						var pre = 'spec';
						if (typeof tdTexture[pre + '-' + ob] === 'undefined') {
							tdTexture[pre + '-' + ob] = [];
						}
						if (typeof tdTexture[pre + '-' + ob][i] === 'undefined') {
							(function (ob, i, pre) {
								setTimeout(function () {
									//var loader = new THREE.ImageLoader(loadingManager);
									imageLoader.load(imagePath + pre + '/' + img + '.jpg',
										function (result) {
											tdUpdateSpecular(result, ob, i, reflection);
										},
										function () { },
										function () {
											loadingCountError++;
											console.warn('DUNGEON: Specular not found: ' + imagePath + pre + img);
										}
									);
								}, 100);
							})(ob, i, pre);
						}
					}
				})(ob, i);
			}
		} else if (tdTexture[ob][i] === null) {
			return null;
		}
		return tdMaterial[ob].material['m' + i];
		//i++;
		//}
	} else if (typeof tdMaterial[ob].color !== 'undefined' && tdMaterial[ob].color !== null) {
		tdMaterial[ob].material['m' + i] = new THREE.MeshLambertMaterial({ color: color, emissive: emissive, side: THREE.FrontSide });
		return tdMaterial[ob].material['m' + i];
	}
	return null;
}

function tdUpdateTexture(image, ob, i) {
	if (typeof tdMaterial[ob].material['m' + i] !== 'undefined') {
		(function (image, ob, i) {
			setTimeout(function () {
				tdTexture[ob][i] = new THREE.Texture();
				tdTexture[ob][i].image = image;
				if (typeof tdMaterial[ob].scale !== 'undefined') {
					tdTexture[ob][i].repeat.set(tdMaterial[ob].scale.x, tdMaterial[ob].scale.y);
				}
				if (typeof tdMaterial[ob].translate !== 'undefined') {
					tdTexture[ob][i].offset.x = tdMaterial[ob].translate.x;
					tdTexture[ob][i].offset.y = tdMaterial[ob].translate.y;
				}
				tdTexture[ob][i].wrapT = tdTexture[ob][i].wrapS = THREE.RepeatWrapping;
				if (typeof tdMaterial[ob].wrapS !== 'undefined') {
					tdTexture[ob][i].wrapS = tdMaterial[ob].wrapS;
				}
				if (typeof tdMaterial[ob].wrapT !== 'undefined') {
					tdTexture[ob][i].wrapT = tdMaterial[ob].wrapT;
				}
				if (!isMobile) {
					tdTexture[ob][i].anisotropy = renderer.capabilities.getMaxAnisotropy();
				}
				tdTexture[ob][i].magFilter = THREE.LinearFilter;
				tdTexture[ob][i].minFilter = THREE.LinearMipMapLinearFilter;
				tdTexture[ob][i].mapping = THREE.SphericalReflectionMapping;
				tdTexture[ob][i].needsUpdate = true;
				tdMaterial[ob].material['m' + i].map = tdTexture[ob][i];
				tdMaterial[ob].material['m' + i].needsUpdate = true;
				/*if(!isMobile) {
						if(tdMaterial[ob].material['m' + i].map.image.src.endsWith('.png') && typeof tdMaterial['shade-' + ob] !== 'undefined' && typeof tdMaterial['shade-' + ob].material !== 'undefined' && typeof tdMaterial['shade-' + ob].material['m' + i] !== 'undefined') {
								var uniforms = { texture: { type: 't', value: tdTexture[ob][i] } };
								tdMaterial['shade-' + ob].material['m' + i].uniforms = uniforms;
								//tdMaterial['shade-' + ob].material['m' + i].vertexShader = vertexShader;
								//tdMaterial['shade-' + ob].material['m' + i].fragmentShader = fragmentShader;
								tdMaterial['shade-' + ob].material['m' + i].needsUpdate = true;
								tdMaterial['shade-' + ob].material['m' + i].uniforms.texture.needsUpdate = true;
						}
				}*/
			}, 1);
		})(image, ob, i);
	}
}

function tdUpdateNormal(image, ob, i, bump = false) {
	if (typeof tdMaterial[ob].normal !== 'undefined' && tdMaterial[ob].normal) {
		if (typeof tdMaterial[ob].material['m' + i] !== 'undefined') {
			(function (image, ob, i) {
				setTimeout(function () {
					tdTexture['norm-' + ob][i] = new THREE.Texture();
					tdTexture['norm-' + ob][i].image = image;
					if (typeof tdMaterial[ob].scale !== 'undefined') {
						tdTexture['norm-' + ob][i].repeat.set(tdMaterial[ob].scale.x, tdMaterial[ob].scale.y);
					}
					if (typeof tdMaterial[ob].translate !== 'undefined') {
						tdTexture['norm-' + ob][i].offset.x = tdMaterial[ob].translate.x;
						tdTexture['norm-' + ob][i].offset.y = tdMaterial[ob].translate.y;
					}
					tdTexture['norm-' + ob][i].wrapT = tdTexture['norm-' + ob][i].wrapS = THREE.RepeatWrapping;
					tdTexture['norm-' + ob][i].anisotropy = renderer.capabilities.getMaxAnisotropy();
					tdTexture['norm-' + ob][i].needsUpdate = true;
					tdTexture['norm-' + ob][i].magFilter = THREE.LinearFilter;
					tdTexture['norm-' + ob][i].minFilter = THREE.LinearMipMapLinearFilter;
					tdTexture['norm-' + ob][i].mapping = THREE.UVMapping;
					if (bump) {
						tdMaterial[ob].material['m' + i].bumpMap = tdTexture['norm-' + ob][i];
					} else {
						tdMaterial[ob].material['m' + i].normalMap = tdTexture['norm-' + ob][i];
					}
					tdMaterial[ob].material['m' + i].needsUpdate = true;
				}, 1);
			})(image, ob, i);
		}
	}
}

function tdUpdateSpecular(image, ob, i, reflection) {
	if (typeof tdMaterial[ob].specular !== 'undefined' && tdMaterial[ob].specular && reflection === null) {
		if (typeof tdMaterial[ob].material['m' + i] !== 'undefined') {
			(function (image, ob, i) {
				setTimeout(function () {
					var col = tdMaterial[ob].specularColor;
					if (typeof col === 'undefined' || col === '') {
						col = 0x000000;
					}
					tdTexture['spec-' + ob][i] = new THREE.Texture();
					tdTexture['spec-' + ob][i].image = image;
					if (typeof tdMaterial[ob].scale !== 'undefined') {
						tdTexture['spec-' + ob][i].repeat.set(tdMaterial[ob].scale.x, tdMaterial[ob].scale.y);
					}
					if (typeof tdMaterial[ob].translate !== 'undefined') {
						tdTexture['spec-' + ob][i].offset.x = tdMaterial[ob].translate.x;
						tdTexture['spec-' + ob][i].offset.y = tdMaterial[ob].translate.y;
					}
					tdTexture['spec-' + ob][i].wrapT = tdTexture['spec-' + ob][i].wrapS = THREE.RepeatWrapping;
					tdTexture['spec-' + ob][i].anisotropy = renderer.capabilities.getMaxAnisotropy();
					tdTexture['spec-' + ob][i].magFilter = THREE.LinearFilter;
					tdTexture['spec-' + ob][i].minFilter = THREE.LinearMipMapLinearFilter;
					tdTexture['spec-' + ob][i].mapping = THREE.UVMapping;
					tdTexture['spec-' + ob][i].needsUpdate = true;
					tdMaterial[ob].material['m' + i].specularMap = tdTexture['spec-' + ob][i];
					tdMaterial[ob].material['m' + i].specular = new THREE.Color(col); //0x302820
					tdMaterial[ob].material['m' + i].shininess = 10;
					//tdMaterial[ob].material['m' + i].displacementMap = tdTexture['spec-' + ob][i];
					//tdMaterial[ob].material['m' + i].displacementScale = 0.036143; // from original model
					//tdMaterial[ob].material['m' + i].displacementBias = -0.128408; // from original model
					tdMaterial[ob].material['m' + i].needsUpdate = true;
				}, 1);
			})(image, ob, i);
		}
	}
}

function tdCreateMaterials() {
	for (var ob in tdMaterial) {
		var i = 0;
		while (tdCreateMaterial(ob, i) !== null) {
			i++;
		}
	}
}

function tdCreateScene() {
	if (!isMobile) {
		checkPointerLock();
	}

	var canvas = document.getElementById('view');
	//canvas.width  = window.innerWidth - viewSize * squareSize - 10;
	//canvas.height = window.innerHeight - 70;

	renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: false });
	//renderer.shadow.mapSize.debug = true;
	renderer.setPixelRatio(window.devicePixelRatio);
	//renderer.setViewport(0, 0, canvas.width, canvas.height);
	renderer.setClearColor(0x000000, 0);
	//renderer.sortObjects = false;
	renderer.alpha = true;
	renderer.gammaInput = true;
	renderer.gammaOutput = true;
	//renderer.preserveDrawingBuffer = true;
	if (!isMobile) {
		renderer.shadowMap.enabled = true;
		renderer.shadowMap.type = THREE.PCFShadowMap;
	}
	//renderer.setSize( canvas.width, canvas.height );

	camera = new THREE.PerspectiveCamera(45, canvas.width / canvas.height, 0.75, tdViewSize);

	tdPlayer = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, tdPlayerHeight, 8, 1));
	tdPlayer.castShadow = true;

	scene = new THREE.Scene();
	if (!isMobile) {
		controls = new THREE.PointerLockControls(camera);
		//scene.add(controls.getObject());
	} else {
		controls = new THREE.DeviceOrientationControls(camera);
		if (stereo) {
			controlsEnabled = true;
		}
	}

	scene.add(camera);
	//camera.add(tdPlayer);

	//if(stereo) {
	effect = new THREE.StereoEffect(renderer);
	//effect.setSize(window.innerWidth, window.innerHeight);
	//}
	raycaster = new THREE.Raycaster(new THREE.Vector3(), new THREE.Vector3(0, - 1, 0), 0, 10);

	var loader = new THREE.DDSLoader();
	reflectionCube = loader.load('images/envmap2.dds', function (tex) {
		tex.magFilter = THREE.LinearFilter;
		tex.minFilter = THREE.LinearMipMapLinearFilter;
		tex.mapping = THREE.CubeReflectionMapping;
	});

	window.addEventListener('resize', function () {
		tdReloadView();
	});
	if (isMobile) {
		window.addEventListener('deviceorientation', function (e) {
			tdUpdateCamera(true);
			//origin.d = Math.round(camera.rotation.y / (-Math.PI / 2) + 4) % 4;
			//camera.rotation.y = -Math.PI / 2 * origin.d;
		});
	}

	//SPRITES
	var spr;
	for (var s in tdSprite) {
		spr = new THREE.TextureLoader(loadingManager);
		(function (s) {
			spr.load(imagePath + 'sprite/' + tdSprite[s].image + '.png', function (tex) {
				var mat = new THREE.SpriteMaterial({ map: tex, color: 0xffffff, depthWrite: false, depthTest: false, opacity: 0.0 });
				tdSprite[s].mesh = new THREE.Sprite(mat);
				if (typeof tdSprite[s].scale !== 'undefined') {
					tdSprite[s].mesh.scale.set(tdSprite[s].scale, tdSprite[s].scale, tdSprite[s].scale);
				}
				tdSprite[s].mesh.position.z = -1;
				tdSprite[s].mesh.receiveShadow = false;
				tdSprite[s].mesh.castShadow = false;
				camera.add(tdSprite[s].mesh);
			});
		})(s);
	}
}

function tdReloadView() {
	var canvas = document.getElementById('view');
	canvas.width = isMobile ? window.innerWidth : window.innerWidth - viewSize * squareSize - 50;
	canvas.height = isMobile ? window.innerHeight : window.innerHeight - 70;
	renderer.setViewport(0, 0, canvas.width, canvas.height);
	renderer.setSize(canvas.width, canvas.height);
	camera.fov = 45;
	camera.near = tdSquareSize.x * 0.5;
	tdBackStep = 0.8;
	light.shadow.camera.fov = 45;
	light.shadow.camera.near = tdSquareSize.x;
	for (var s in tdSprite) {
		if (typeof tdSprite[s].mesh !== 'undefined') {
			tdSprite[s].mesh.material.opacity = 0;
		}
	}
	if (stereo) {
		effect.setSize(window.innerWidth, window.innerHeight);
		camera.fov = 90;
		camera.near = 0.01;
		tdBackStep = 0;
		light.shadow.camera.fov = 90;
		light.shadow.camera.near = 0.01;
	}
	camera.aspect = canvas.width / canvas.height;
	camera.updateProjectionMatrix();
}

function tdCreateLight() {
	scene.fog = new THREE.Fog(0x000000, 1, tdViewSize);
	ambientLight = new THREE.AmbientLight(0x202020, 0.5); //0x302820
	scene.add(ambientLight);

	light = new THREE.SpotLight(0xffffff);
	light.intensity = 1;
	light.penumbra = 0;
	light.decay = 1;
	light.distance = tdViewSize * 0.5;
	light.angle = Math.PI / 4.5;
	light.shadow.camera.near = 0.25;//tdSquareSize.x;
	light.shadow.camera.far = tdViewSize * 0.5;
	light.shadow.camera.fov = 45;
	light.shadow.camera.matrixAutoUpdate = false;
	light.shadow.mapSize.width = 512;
	light.shadow.mapSize.height = 512;
	light.shadow.bias = -0.01;
	light.castShadow = true;
	light.target = camera;
	light.matrixAutoUpdate = false;
	camera.add(light);
}

function tdDraw(f, x, y) {
	var c = toMapCoord(x, y);
	if (c.x >= 0 && c.x < viewSize && c.y >= 0 && c.y < viewSize) {
		tdClearObject(map[c.x][c.y].mesh);
		map[c.x][c.y].mesh = tdCreateObject(f, x, y);
	}
}

function tdDrawAll(force, callback) {
	//(function(force) {
	//    setTimeout(function() {
	if (typeof force !== 'undefined' && force) {
		origin.xt = origin.x;
		origin.yt = origin.y;

		var emissive = (rand(Math.floor(origin.f / floorSize), 0, 0, 112.10, 8) * 4 + 16);
		emissive += ',' + (rand(Math.floor(origin.f / floorSize), 0, 0, 843.59, 8) * 4 + 16);
		emissive += ',' + (rand(Math.floor(origin.f / floorSize), 0, 0, 650.22, 8) * 4 + 16);
		emissive = 'rgb(' + emissive + ')';
		renderer.setClearColor(emissive, 1);
		scene.fog.color = new THREE.Color(emissive);
		ambientLight.color = new THREE.Color(emissive);
		tdUpdateCameraLight();
		//tdGenerateTexture(Math.floor(origin.f / floorSize));
	}
	var i = 0;
	for (var x = 0; x < viewSize; x++) {
		for (var y = 0; y < viewSize; y++) {
			if (typeof map[x] !== 'undefined' && typeof map[x][y] !== 'undefined') {
				var c = toRealCoord(x, y);
				if (origin.x >= c.x - Math.floor(tdViewSize / 2) - 1 && origin.x <= c.x + Math.floor(tdViewSize / 2) + 1 && origin.y >= c.y - Math.floor(tdViewSize / 2) - 1 && origin.y <= c.y + Math.floor(tdViewSize / 2) + 1) {
					//if(typeof force !== 'undefined' || force || typeof scene.getObjectByName(keyLocation(origin.f, origin.x + x, origin.y + y)) === 'undefined') {
					if ((typeof force !== 'undefined' && force) || typeof map[x][y].mesh === 'undefined' || map[x][y].mesh === null) {
						tdDraw(origin.f, c.x, c.y);
						i++;
					}
					map[x][y].mesh.visible = true;
				} else if (typeof map[x][y].mesh !== 'undefined' && map[x][y].mesh !== null) {
					map[x][y].mesh.visible = false;
				}
			}
		}
	}
	for (var r in roomLight) {
		var dx = (origin.x - roomLight[r].x);
		var dy = (origin.y - roomLight[r].y);
		var dis = Math.sqrt(dx * dx + dy * dy);
		roomLight[r].distance = dis;
	}
	roomLight.sort(function (a, b) { return a.distance - b.distance });
	for (var r = 0; r < roomLight.length; r++) {
		if (r < terrainLightMax && roomLight[r].mesh.intensity < 2) {
			roomLight[r].makeVisible = 1;
		} else if (r >= terrainLightMax && roomLight[r].mesh.intensity > 0) {
			roomLight[r].makeVisible = -1;
		} else {
			roomLight[r].makeVisible = 0;
		}
	}
	tdUpdateCamera();
	//console.log('Meshes updated: ' + i);
	if (typeof callback === 'function') {
		callback();
	}
	//}, 100);
	//})(force);
}

function tdCreateObject(f, x, y) {
	//var xo = x + origin.x;
	//var yo = y + origin.y;
	var c = toMapCoord(x, y);
	var ob = getSquareObjs(x, y);
	var ms = null;
	var ms1 = null;
	var ms2 = null;
	var ms3 = null;
	msg = new THREE.Object3D();
	msg.name = 'F' + f + ',X' + x + ',Y' + y;
	msg.position.x = (x - origin.xt) * tdSquareSize.x;
	msg.position.y = (f - origin.f) * tdSquareSize.y;
	msg.position.z = (y - origin.yt) * tdSquareSize.x;
	scene.add(msg);

	for (var o = 0; o < ob.length; o++) {
		var mat = '', type = '';
		var x1 = 0, y1 = 0, z1 = 0, x2 = 1, y2 = 1, z2 = 0;
		var seed = 0;
		var rnd = 1;
		switch (ob[o].replace(/[0-9]/g, '')) {
			case 'wall': x1 = 0, y1 = 0, z1 = 0, x2 = 1, y2 = 1, z2 = 1; type = 'wall'; mat = 'wall'; rnd = viewSize; seed = 129.22; break;
			case 'wall-wood': x1 = 0, y1 = 0.99, z1 = 0, x2 = 1, y2 = 0.02, z2 = 1; type = 'wall-wood'; mat = 'wall-wood'; rnd = viewSize; seed = 444.01; break;
			case 'door-wood': x1 = 0, y1 = 0.99, z1 = 0, x2 = 1, y2 = 0.02, z2 = 1; type = 'door-wood'; mat = 'wall-wood-x05'; rnd = viewSize; seed = 444.01; break;
			case 'door-wood-open': x1 = 0, y1 = 0.99, z1 = 0, x2 = 1, y2 = 0.02, z2 = 1; type = 'door-wood-open'; mat = 'wall-wood-x05'; rnd = viewSize; seed = 444.01; break;
			case 'floor': x1 = 0, y1 = 0, z1 = 0, x2 = 1, y2 = 1, z2 = 1; type = 'floor-ceil'; mat = 'floor'; rnd = viewSize; break;
			case 'wall-secret': x1 = 0, y1 = 0, z1 = 0, x2 = 1, y2 = 1, z2 = 1; type = 'wall-secret'; mat = 'wall-secret'; rnd = viewSize; break;
			case 'pillar': x1 = 0.35, y1 = 0.35, z1 = 0, x2 = 0.3, y2 = 0.3, z2 = 1; type = 'pillar'; mat = 'wall'; rnd = viewSize; seed = 129.22; break;
			case 'obstacle': x1 = 0, y1 = 0, z1 = 0, x2 = 1, y2 = 1, z2 = 1; type = 'obstacle'; mat = 'obstacle'; rnd = viewSize; seed = 129.22; break;
			case 'door': x1 = 0, y1 = 0.45, z1 = 0, x2 = 1, y2 = 0.1, z2 = 1; type = 'door'; mat = 'door'; rnd = viewSize; break;
			case 'door-open': x1 = 0, y1 = 0.45, z1 = 0, x2 = 1, y2 = 0.1, z2 = 1; type = 'door-open'; mat = 'door'; rnd = viewSize; break;
			case 'teleport': x1 = 0.002, y1 = 0.002, z1 = 0.002, x2 = 0.996, y2 = 0.996, z2 = 0.996; type = 'box'; mat = 'teleport'; rnd = viewSize; seed = 515.78; break;
			case 'teleport-up': x1 = 0.002, y1 = 0.002, z1 = 0.002, x2 = 0.996, y2 = 0.996, z2 = 0.996; type = 'box'; mat = 'teleport-up'; rnd = viewSize; seed = 515.78; break;
			case 'pit': x1 = 0, y1 = 0, z1 = -1, x2 = 1, y2 = 1, z2 = 1; type = 'pit'; mat = 'floor'; rnd = viewSize; seed = 51.33; break;
			case 'pit-ceil': x1 = 0, y1 = 0, z1 = 1, x2 = 1, y2 = 1, z2 = 1; type = 'pit'; mat = 'ceil'; rnd = viewSize; seed = 51.33; break;
			case 'stairs-up': x1 = 0, y1 = 0, z1 = 0, x2 = 1, y2 = 1, z2 = 1; type = 'stairs-up'; mat = 'wall'; rnd = viewSize; break;
			case 'stairs-down': x1 = 0, y1 = 0, z1 = -1, x2 = 1, y2 = 1, z2 = 1; type = 'stairs-down'; mat = 'wall'; rnd = viewSize; break;
			case 'wall-switch': x1 = 0.4, y1 = 1.002, z1 = 0.6, x2 = 0.2, y2 = 1, z2 = 0.2; type = 'wall-deco'; mat = 'wall-switch'; seed = 123.43; break;
			case 'wall-switch-off': x1 = 0.4, y1 = 1.002, z1 = 0.6, x2 = 0.2, y2 = 1, z2 = 0.2; type = 'wall-deco'; mat = 'wall-switch-off'; seed = 123.43; break;
			case 'wall-deco': x1 = 0, y1 = 1.003, z1 = 0, x2 = 1, y2 = 1, z2 = 1; type = 'wall-deco'; mat = 'wall-deco'; seed = 860.97; break;
			case 'wall-deco-high': x1 = 0, y1 = 1.003, z1 = 1, x2 = 1, y2 = 1, z2 = 1; type = 'wall-deco'; mat = 'wall-deco'; seed = 443.13; break;
			case 'floor-deco': x1 = 0, y1 = 0, z1 = 0.003, x2 = 1, y2 = 1, z2 = 1; type = 'floor-deco'; mat = 'floor-deco'; break;
			case 'ceil-light': x1 = 0.4, y1 = 0.4, z1 = 1.5, x2 = 0.2, y2 = 0.2, z2 = 0.5; type = 'ceil-light'; mat = 'ceil-light'; rnd = viewSize; seed = 129.22; break;
			case 'wall-light': x1 = 0.45, y1 = 1.002, z1 = 0.7, x2 = 0.1, y2 = 0.15, z2 = 0.2; type = 'wall-light'; mat = 'wall-light'; break;
			case 'wall-light-high': x1 = 0.45, y1 = 1.002, z1 = 1.7, x2 = 0.1, y2 = 0.15, z2 = 0.2; type = 'wall-light-high'; mat = 'wall-light'; break;
			case 'window-high': x1 = 0, y1 = 0.49, z1 = 1, x2 = 1, y2 = 0.02, z2 = 1; type = 'window'; mat = 'window'; seed = 812.93; break;
			case 'rune': x1 = 0, y1 = 0, z1 = 0.002, x2 = 1, y2 = 1, z2 = 1; type = 'floor-deco'; mat = 'rune'; break;
			case 'trace': x1 = 0, y1 = 0, z1 = 0.002, x2 = 1, y2 = 1, z2 = 1; type = 'floor-deco'; mat = 'trace'; break;
			default: break;
		}
		var d = parseInt(getSquareDirections(x, y).substring(o, o + 1));
		ms = tdDrawObject(type, msg, f, x, y, x1, y1, z1, x2, y2, z2, d, type, mat, rnd, seed);
		if (ms !== null) {
			tdRotateInWorld('y', ms, (-(d + 2) * 90) * Math.PI / 180);
			ms.updateMatrix();
		}
		if (o === 0) {
			if (getSquareFeature(x, y, 'double') === 'ceil') {
				ms1 = tdDrawObject('floor-ceil-double', msg, f, x, y, 0, 0, 1, 1, 1, 1, 0, 'floor-ceil', 'floor', viewSize);
				if (ms1 !== null) {
					tdRotateInWorld('y', ms1, (-(d + 2) * 90) * Math.PI / 180);
				}
			} else if (getSquareFeature(x, y, 'double') === 'wall') {
				ms2 = tdDrawObject('wall', msg, f, x, y, 0, 0, 1, 1, 1, 1, 0, 'wall', 'wall', viewSize, 129.22);
				if (ms2 !== null) {
					tdRotateInWorld('y', ms2, (-(d + 2) * 90) * Math.PI / 180);
				}
			}
			if (getSquareFeature(x, y, 'triple') === 'wall') {
				ms3 = tdDrawObject('wall', msg, f + 1, x, y, 0, 0, 2, 1, 1, 1, 0, 'wall', 'wall', viewSize, 129.22);
				if (ms3 !== null) {
					tdRotateInWorld('y', ms3, (-(d + 2) * 90) * Math.PI / 180);
				}
			}
		}
	}
	return msg;
}

function tdDrawObject(type, msg, f, x, y, x1, y1, z1, x2, y2, z2, d, metatype, mat, rnd, seed) {
	var m = null;
	var ms = null;
	var ms1 = null;
	var geo = null;
	var d1 = (d + 1) % 4;
	var d2 = (d + 2) % 4;
	var d3 = (d + 3) % 4;
	var geotype = type + '-' + x2 + '-' + y2 + '-' + z2;
	if (metatype !== '') {
		switch (metatype) {
			case 'box':
				i = rand(Math.floor(f / floorSize), Math.floor(x / rnd), Math.floor(y / rnd), seed, tdMaterial[mat].image.max);
				//i = 38;
				m = tdCreateMaterial(mat, i);
				if (m !== null) {
					if (typeof tdGeometry[geotype] === 'undefined' || tdGeometry[geotype] === null) {
						geo = new THREE.BoxGeometry(x2, z2, y2, 1, 1);
						tdGeometry[geotype] = new THREE.BufferGeometry().fromGeometry(geo);
						tdGeometry[geotype].computeVertexNormals();
						//tdBlurGeometry(tdGeometry[geotype]);
					}
					ms = new THREE.Mesh(tdGeometry[geotype], m);
					ms.scale.set(tdSquareSize.x, tdSquareSize.y, tdSquareSize.x);
					ms.rotation.y = (-(d + 2) * 90) * Math.PI / 180;
					ms.position.x = (x1 + (x2 / 2)) * tdSquareSize.x - tdSquareSize.x * 0.5;
					ms.position.y = (z1 + (z2 / 2)) * tdSquareSize.y;
					ms.position.z = (y1 + (y2 / 2)) * tdSquareSize.x - tdSquareSize.x * 0.5;
				}
				break;

			case 'box4':
				var i = rand(Math.floor(f / floorSize), Math.floor(x / rnd), Math.floor(y / rnd), seed, tdMaterial[mat].image.max);
				//i = 38;
				m = tdCreateMaterial(mat, i);
				if (m !== null) {
					if (typeof tdGeometry[geotype] === 'undefined' || tdGeometry[geotype] === null) {
						geo = new THREE.BoxGeometry(x2, z2, y2, 1, 1);
						geo.faces.splice(4, 4); //remove top and bottom
						tdGeometry[geotype] = new THREE.BufferGeometry().fromGeometry(geo);
						tdGeometry[geotype].computeVertexNormals();
						//tdBlurGeometry(tdGeometry[geotype]);
					}
					ms = new THREE.Mesh(tdGeometry[geotype], m);
					ms.scale.set(tdSquareSize.x, tdSquareSize.y, tdSquareSize.x);
					ms.rotation.y = (-(d + 2) * 90) * Math.PI / 180;
					ms.position.x = (x1 + (x2 / 2)) * tdSquareSize.x - tdSquareSize.x * 0.5;
					ms.position.y = (z1 + (z2 / 2)) * tdSquareSize.y;
					ms.position.z = (y1 + (y2 / 2)) * tdSquareSize.x - tdSquareSize.x * 0.5;
				}
				break;

			case 'floor':
				var i = rand(Math.floor(f / floorSize), Math.floor(x / rnd), Math.floor(y / rnd), seed, tdMaterial[mat].image.max);
				//i = 32;
				m = tdCreateMaterial(mat, i);
				if (m !== null) {
					if (typeof tdGeometry[geotype] === 'undefined' || tdGeometry[geotype] === null) {
						tdGeometry[geotype] = new THREE.PlaneBufferGeometry(x2, y2, 1, 1);
						tdGeometry[geotype].computeVertexNormals();
						//tdBlurGeometry(tdGeometry[geotype]);
					}
					ms = new THREE.Mesh(tdGeometry[geotype], m);
					ms.scale.set(tdSquareSize.x, tdSquareSize.x, tdSquareSize.y);
					ms.position.set((x1 + (x2 / 2)) * tdSquareSize.x - tdSquareSize.x * 0.5, (z1 + (z2 / 2)) * tdSquareSize.y - tdSquareSize.y * 0.5, (y1 + (y2 / 2)) * tdSquareSize.x - tdSquareSize.x * 0.5);
					ms.rotation.y = (-(d + 2) * 90) * Math.PI / 180;
					ms.rotateX(-Math.PI / 2);
				}
				break;

			case 'ceil':
				var i = rand(Math.floor(f / floorSize), Math.floor(x / rnd), Math.floor(y / rnd), seed, tdMaterial[mat].image.max);
				//i = 32;
				m = tdCreateMaterial(mat, i);
				if (m !== null) {
					if (typeof tdGeometry[geotype] === 'undefined' || tdGeometry[geotype] === null) {
						tdGeometry[geotype] = new THREE.PlaneBufferGeometry(x2, y2, 1, 1);
						tdGeometry[geotype].computeVertexNormals();
						//tdBlurGeometry(tdGeometry[geotype]);
					}
					ms = new THREE.Mesh(tdGeometry[geotype], m);
					ms.scale.set(tdSquareSize.x, tdSquareSize.x, tdSquareSize.y);
					ms.position.set((x1 + (x2 / 2)) * tdSquareSize.x - tdSquareSize.x * 0.5, (z1 + (z2 / 2)) * tdSquareSize.y + tdSquareSize.y * 0.5, (y1 + (y2 / 2)) * tdSquareSize.x - tdSquareSize.x * 0.5);
					ms.rotation.y = (-(d + 2) * 90) * Math.PI / 180;
					ms.rotateX(-3.0 * Math.PI / 2);
				}
				break;

			case 'wall-deco':
				var i = rand(Math.floor(f / floorSize), Math.floor(x / rnd), Math.floor(y / rnd), seed, tdMaterial[mat].image.max);
				m = tdCreateMaterial(mat, i);
				if (m !== null) {
					if (typeof tdGeometry[geotype] === 'undefined' || tdGeometry[geotype] === null) {
						geo = new THREE.PlaneGeometry(x2, z2, 1, 1);
						//tdBlurGeometry(geo);
						tdGeometry[geotype] = new THREE.BufferGeometry().fromGeometry(geo);
						tdGeometry[geotype].computeVertexNormals();
					}
					ms = new THREE.Mesh(tdGeometry[geotype], m);
					ms.scale.set(tdSquareSize.x, tdSquareSize.y, tdSquareSize.x);
					ms.rotateY((-(d + 2) * 90) * Math.PI / 180);
					ms.translateX((x1 + (x2 / 2)) * tdSquareSize.x - tdSquareSize.x * 0.5);
					ms.translateY((z1 + (z2 / 2)) * tdSquareSize.y);
					ms.translateZ((y1 + (y2 / 2)) * tdSquareSize.x - tdSquareSize.x);
					ms.rotateY(((d + 2) * 90) * Math.PI / 180);
					//ms.translateX(y1 * 0.0);
				}
				break;

			case 'ramp-reversed':
				var i = rand(Math.floor(f / floorSize), Math.floor(x / rnd), Math.floor(y / rnd), seed, tdMaterial[mat].image.max);
				m = tdCreateMaterial(mat, i);
				if (m !== null) {
					if (typeof tdGeometry[geotype] === 'undefined' || tdGeometry[geotype] === null) {
						tdGeometry[geotype] = new THREE.PlaneBufferGeometry(x2, y2, 1, 1);
						tdGeometry[geotype].computeVertexNormals();
					}
					ms = new THREE.Mesh(tdGeometry[geotype], m);
					ms.scale.set(tdSquareSize.x, Math.sqr(tdSquareSize.x * tdSquareSize.x + tdSquareSize.y * tdSquareSize.y), tdSquareSize.y);
					ms.position.set((x1 + (x2 / 2)) * tdSquareSize.x - tdSquareSize.x * 0.5, (z1 + (z2 / 2)) * tdSquareSize.y + tdSquareSize.y, (y1 + (y2 / 2)) * tdSquareSize.x - tdSquareSize.x * 0.5);
					ms.rotateX(124 * Math.PI / 180);
				}
				break;

			case 'cylinder':
				var i = rand(Math.floor(f / floorSize), Math.floor(x / rnd), Math.floor(y / rnd), seed, tdMaterial[mat].image.max);
				m = tdCreateMaterial(mat, i);
				if (m !== null) {
					if (typeof tdGeometry[geotype] === 'undefined' || tdGeometry[geotype] === null) {
						tdGeometry[geotype] = new THREE.CylinderBufferGeometry(x2 * 0.5, y2 * 0.5, z2, 8, 1);
						tdGeometry[geotype].computeVertexNormals();
					}
					ms = new THREE.Mesh(tdGeometry[geotype], m);
					ms.scale.set(tdSquareSize.x, tdSquareSize.y, tdSquareSize.x);
					ms.position.set((x1 + (x2 / 2)) * tdSquareSize.x - tdSquareSize.x * 0.5, (z1 + (z2 / 2)) * tdSquareSize.y, (y1 + (y2 / 2)) * tdSquareSize.x - tdSquareSize.x * 0.5);
				}
				break;

			case 'cylinder-rx':
				var i = rand(Math.floor(f / floorSize), Math.floor(x / rnd), Math.floor(y / rnd), seed, tdMaterial[mat].image.max);
				m = tdCreateMaterial(mat, i);
				if (m !== null) {
					if (typeof tdGeometry[geotype] === 'undefined' || tdGeometry[geotype] === null) {
						tdGeometry[geotype] = new THREE.CylinderBufferGeometry(x2 * 0.5, y2 * 0.5, z2, 8, 1);
						tdGeometry[geotype].computeVertexNormals();
					}
					ms = new THREE.Mesh(tdGeometry[geotype], m);
					ms.scale.set(tdSquareSize.x, tdSquareSize.y * 0.6666, tdSquareSize.x);
					ms.position.set((x1 + (x2 / 2)) * tdSquareSize.x - tdSquareSize.x * 0.5, (z1 + (z2 / 2)) * tdSquareSize.y, (y1 + (y2 / 2)) * tdSquareSize.x - tdSquareSize.x * 0.5);
					ms.rotation.x = 90 * Math.PI / 180;
				}
				break;

			case 'cylinder-rz':
				var i = rand(Math.floor(f / floorSize), Math.floor(x / rnd), Math.floor(y / rnd), seed, tdMaterial[mat].image.max);
				m = tdCreateMaterial(mat, i);
				if (m !== null) {
					if (typeof tdGeometry[geotype] === 'undefined' || tdGeometry[geotype] === null) {
						tdGeometry[geotype] = new THREE.CylinderBufferGeometry(x2 * 0.5, y2 * 0.5, z2, 8, 1);
						tdGeometry[geotype].computeVertexNormals();
					}
					ms = new THREE.Mesh(tdGeometry[geotype], m);
					ms.scale.set(1, tdSquareSize.x * 0.6666, 1);
					ms.position.set((x1 + (x2 / 2)) * tdSquareSize.x - tdSquareSize.x * 0.5, (z1 + (z2 / 2)) * tdSquareSize.y, (y1 + (y2 / 2)) * tdSquareSize.x - tdSquareSize.x * 0.5);
					ms.rotation.z = 90 * Math.PI / 180;
				}
				break;

			case 'light':
				//m = tdCreateMaterial(mat, 0);
				//if(m !== null) {
				var col = (rand(f, x, y, 112.10, 127) + 128);
				col += ',' + (rand(f, x, y, 843.59, 127) + 128);
				col += ',' + (rand(f, x, y, 650.22, 127) + 128);
				/*m.color = new THREE.Color('rgb(' + col + ')');
				if(typeof tdGeometry[geotype] === 'undefined' || tdGeometry[geotype] === null) {
						geo = new THREE.SphereGeometry(1, 8, 8);
						tdGeometry[geotype] = new THREE.BufferGeometry().fromGeometry(geo);
						tdGeometry[geotype].computeVertexNormals();
				}
				ms = new THREE.Mesh(tdGeometry[geotype], m);*/
				ms = new THREE.Object3D();
				ms.scale.set(x2, z2, y2);
				ms.position.x = (x1 + (x2 / 2)) * tdSquareSize.x - tdSquareSize.x * 0.5;
				ms.position.y = (z1 + (z2 / 2)) * tdSquareSize.y;
				ms.position.z = (y1 + (y2 / 2)) * tdSquareSize.x - tdSquareSize.x * 0.5;
				//ms.rotation.set(0, 0, 0);
				ms1 = new THREE.PointLight(new THREE.Color('rgb(' + col + ')'));
				//ms1.position.set( 0, 0, 0 );
				//ms1.angle = Math.PI / 2.5;
				ms1.intensity = 0;
				ms1.distance = tdViewSize;
				//ms1.shadow.camera.fov = 45;
				//ms1.shadow.camera.aspect = canvas.width / canvas.height;
				//ms1.penumbra = 1;
				ms1.decay = 2;
				ms1.visible = false;
				ms1.castShadow = true;
				ms1.matrixAutoUpdate = false;
				//ms1.target = ms;
				ms1.shadow.camera.near = 0.25;
				ms1.shadow.camera.far = tdViewSize;
				ms1.shadow.mapSize.width = 256;
				ms1.shadow.mapSize.height = 256;
				//ms1.shadow.camera.matrixAutoUpdate = false;
				roomLight.push({ mesh: ms1, x: x, y: y });
				ms.add(ms1);
				//var ms2 = new THREE.SpotLightHelper( ms1 );
				//scene.add( ms2 );
				//console.log('Light added: ' + roomLight.length);
				//}
				break;



			//META OBJECTS
			case 'wall':
				ms = new THREE.Object3D();
				ms1 = tdDrawObject(type, ms, f, x, y, x1, y1, z1, x2, y2, z2, 0, 'box4', mat, rnd, 129.22);
				tdHideWallFaces(ms1, x, y);
				var r = rand(Math.floor(f / floorSize), Math.floor(x / rnd), Math.floor(y / rnd), 391.87, 12);
				if (r === 0) {
					if ((x + y) % 2 === 0) {
						ms1 = tdDrawObject(type, ms, f, x, y, x1 - 0.05, y1 - 0.05, z1 + 0.001, 0.101, 0.101, z2 - 0.002, 0, 'cylinder', 'wall-wood-x05', rnd, 444.01);
						ms1 = tdDrawObject(type, ms, f, x, y, x1 - 0.05, y1 + 0.95, z1 + 0.001, 0.100, 0.100, z2 - 0.002, 0, 'cylinder', 'wall-wood-x05', rnd, 444.01);
						ms1 = tdDrawObject(type, ms, f, x, y, x1 + 0.95, y1 - 0.05, z1 + 0.001, 0.099, 0.099, z2 - 0.002, 0, 'cylinder', 'wall-wood-x05', rnd, 444.01);
						ms1 = tdDrawObject(type, ms, f, x, y, x1 + 0.95, y1 + 0.95, z1 + 0.001, 0.098, 0.098, z2 - 0.002, 0, 'cylinder', 'wall-wood-x05', rnd, 444.01);
					}
				} else if (r === 1) {
					ms1 = tdDrawObject(type, ms, f, x, y, x1 + 0.45, y1 - 0.05, z1 + 0.25, 0.1, 0.1, z2 * 1.5, 0, 'cylinder-rz', 'wall-wood-x05', rnd, 444.01);
					ms1 = tdDrawObject(type, ms, f, x, y, x1 + 0.95, y1 + 0.45, z1 + 0.25, 0.1, 0.1, z2 * 1.5, 0, 'cylinder-rx', 'wall-wood-x05', rnd, 444.01);
					ms1 = tdDrawObject(type, ms, f, x, y, x1 + 0.45, y1 + 0.95, z1 + 0.25, 0.1, 0.1, z2 * 1.5, 0, 'cylinder-rz', 'wall-wood-x05', rnd, 444.01);
					ms1 = tdDrawObject(type, ms, f, x, y, x1 - 0.05, y1 + 0.45, z1 + 0.25, 0.1, 0.1, z2 * 1.5, 0, 'cylinder-rx', 'wall-wood-x05', rnd, 444.01);
				} else if (r === 2) {
					if (rand(f, x, y, 197.76, 2) === 0) {
						ms1 = tdDrawObject('box4', ms, f, x, y, x1 - 0.05, y1 - 0.05, z1, 0.101, 0.101, z2, 0, 'box4', 'wall-wood-x01', rnd, 444.01);
					}
				} else if (r === 4) {
					if ((x + y) % 2 === 0) {
						ms1 = tdDrawObject(type, ms, f, x, y, x1 - 0.05, y1 - 0.05, z1 + 0.001, 0.101, 0.101, z2 - 0.002, 0, 'cylinder', 'wall-x05', rnd, 129.22);
						ms1 = tdDrawObject(type, ms, f, x, y, x1 - 0.05, y1 + 0.95, z1 + 0.001, 0.100, 0.100, z2 - 0.002, 0, 'cylinder', 'wall-x05', rnd, 129.22);
						ms1 = tdDrawObject(type, ms, f, x, y, x1 + 0.95, y1 - 0.05, z1 + 0.001, 0.099, 0.099, z2 - 0.002, 0, 'cylinder', 'wall-x05', rnd, 129.22);
						ms1 = tdDrawObject(type, ms, f, x, y, x1 + 0.95, y1 + 0.95, z1 + 0.001, 0.098, 0.098, z2 - 0.002, 0, 'cylinder', 'wall-x05', rnd, 129.22);
					}
				} else if (r === 5) {
					ms1 = tdDrawObject(type, ms, f, x, y, x1 + 0.45, y1 - 0.05, z1 + 0.25, 0.1, 0.1, z2 * 1.5, 0, 'cylinder-rz', 'wall-x05', rnd, 129.22);
					ms1 = tdDrawObject(type, ms, f, x, y, x1 + 0.95, y1 + 0.45, z1 + 0.25, 0.1, 0.1, z2 * 1.5, 0, 'cylinder-rx', 'wall-x05', rnd, 129.22);
					ms1 = tdDrawObject(type, ms, f, x, y, x1 + 0.45, y1 + 0.95, z1 + 0.25, 0.1, 0.1, z2 * 1.5, 0, 'cylinder-rz', 'wall-x05', rnd, 129.22);
					ms1 = tdDrawObject(type, ms, f, x, y, x1 - 0.05, y1 + 0.45, z1 + 0.25, 0.1, 0.1, z2 * 1.5, 0, 'cylinder-rx', 'wall-x05', rnd, 129.22);
				} else if (r === 6) {
					ms1 = tdDrawObject(type, ms, f, x, y, x1 - 0.001, y1 - 0.001, z1, x2 + 0.002, y2 + 0.002, z2, 0, 'box4', 'wall2', rnd, 8.27);
				}
				break;

			case 'wall-wood':
				ms = new THREE.Object3D();
				ms1 = tdDrawObject(type, ms, f, x, y, x1, y1, z1, x2, y2, z2, 0, 'box4', mat, rnd, seed);
				var r = rand(Math.floor(f / floorSize), Math.floor(x / rnd), Math.floor(y / rnd), 391.87, 10);
				if (r === 0) {
					if ((x + y) % 2 === 0) {
						ms1 = tdDrawObject(type, ms, f, x, y, -0.05, 0.95, z1 + 0.001, 0.1, 0.1, z2 - 0.002, 0, 'cylinder', 'wall-wood-x05', rnd, seed);
						ms1 = tdDrawObject(type, ms, f, x, y, 0.95, 0.95, z1 + 0.001, 0.1, 0.1, z2 - 0.002, 0, 'cylinder', 'wall-wood-x05', rnd, seed);
					}
				} else if (r === 1) {
					ms1 = tdDrawObject(type, ms, f, x, y, 0.45, 0.95, z1 + 0.25, 0.1, 0.1, z2 * 1.5, 0, 'cylinder-rz', 'wall-wood-x05', rnd, seed);
					//ms1 = tdDrawObject(type, ms, f, x, y, 0.45, 0.95, z1 - 0.75, 0.1, 0.1, z2 * 1.5, 0, 'cylinder-rz', 'wall-wood-x05', rnd, seed);
				}
				break;

			case 'door-wood':
				ms = new THREE.Object3D();
				ms1 = tdDrawObject(type, ms, f, x, y, x1, y1, z1, 0.25, y2, z2, 0, 'box4', 'door-wood-left', rnd, seed);
				ms1 = tdDrawObject(type, ms, f, x, y, x1 + 0.75, y1, z1, 0.25, y2, z2, 0, 'box4', 'door-wood-right', rnd, seed);
				ms1 = tdDrawObject(type, ms, f, x, y, x1 + 0.25, y1, 0.75, 0.5, y2, 0.25, 0, 'box', 'door-wood-top', rnd, seed);
				ms1 = tdDrawObject(type, ms, f, x, y, x1 + 0.26, y1 + 0.005, z1, 0.48, y2 - 0.01, 0.74, 0, 'box4', 'door-wood', rnd, seed);
				var r = rand(Math.floor(f / floorSize), Math.floor(x / rnd), Math.floor(y / rnd), 391.87, 10);
				if (r === 0) {
					if ((x + y) % 2 === 0) {
						ms1 = tdDrawObject(type, ms, f, x, y, -0.05, 0.95, z1 + 0.001, 0.1, 0.1, z2 - 0.002, 0, 'cylinder', 'wall-wood-x05', rnd, seed);
						ms1 = tdDrawObject(type, ms, f, x, y, 0.95, 0.95, z1 + 0.001, 0.1, 0.1, z2 - 0.002, 0, 'cylinder', 'wall-wood-x05', rnd, seed);
					}
				} else if (r === 1) {
					ms1 = tdDrawObject(type, ms, f, x, y, 0.45, 0.95, z1 + 0.25, 0.1, 0.1, z2 * 1.5, 0, 'cylinder-rz', 'wall-wood-x05', rnd, seed);
					//ms1 = tdDrawObject(type, ms, f, x, y, 0.45, 0.95, z1 - 0.75, 0.1, 0.1, z2 * 1.5, 0, 'cylinder-rz', 'wall-wood-x05', rnd, seed);
				}
				break;

			case 'door-wood-open':
				ms = new THREE.Object3D();
				ms1 = tdDrawObject(type, ms, f, x, y, x1, y1, z1, 0.25, y2, z2, 0, 'box4', 'door-wood-left', rnd, seed);
				ms1 = tdDrawObject(type, ms, f, x, y, x1 + 0.75, y1, z1, 0.25, y2, z2, 0, 'box4', 'door-wood-right', rnd, seed);
				ms1 = tdDrawObject(type, ms, f, x, y, x1 + 0.25, y1, 0.75, 0.5, y2, 0.25, 0, 'box', 'door-wood-top', rnd, seed);
				var r = rand(Math.floor(f / floorSize), Math.floor(x / rnd), Math.floor(y / rnd), 391.87, 10);
				if (r === 0) {
					ms1 = tdDrawObject(type, ms, f, x, y, -0.05, 0.95, z1 + 0.001, 0.1, 0.1, z2 - 0.002, 0, 'cylinder', 'wall-wood-x05', rnd, seed);
					ms1 = tdDrawObject(type, ms, f, x, y, 0.95, 0.95, z1 + 0.001, 0.1, 0.1, z2 - 0.002, 0, 'cylinder', 'wall-wood-x05', rnd, seed);
				} else if (r === 1) {
					ms1 = tdDrawObject(type, ms, f, x, y, 0.45, 0.95, z1 + 0.25, 0.1, 0.1, z2 * 1.5, 0, 'cylinder-rz', 'wall-wood-x05', rnd, seed);
					//ms1 = tdDrawObject(type, ms, f, x, y, 0.45, 0.95, z1 - 0.75, 0.1, 0.1, z2 * 1.5, 0, 'cylinder-rz', 'wall-wood-x05', rnd, seed);
				}
				break;

			case 'wall-secret':
				ms = new THREE.Object3D();
				ms1 = tdDrawObject('wall', ms, f, x, y, x1, y1, z1, x2, y2, z2, 0, 'wall', 'wall', rnd, 129.22);
				ms1 = tdDrawObject(type, ms, f, x, y, x1, y1, z1, x2, y2, z2, 0, 'box4', mat, rnd, 929.39);
				break;

			case 'pit':
				var i = rand(Math.floor(f / floorSize), Math.floor(x / rnd), Math.floor(y / rnd), seed, tdMaterial[mat].image.max);
				ms = new THREE.Object3D();
				var z3 = 0;
				if (z1 === 1) {
					if (getSquareFeature(x, y, 'double') === 'ceil') {
						z3 = 1;
					} else {
						tdLoadObjectOBJ(type, ms, x1, y1, z1 + 1, x2, y2, z2, 0, mat, i);
					}
				}
				tdLoadObjectOBJ(type, ms, x1, y1, z1 + z3, x2, y2, z2, 0, mat, i);
				break;

			case 'stairs':
				var i = rand(Math.floor(f / floorSize), Math.floor(x / rnd), Math.floor(y / rnd), seed, tdMaterial[mat].image.max);
				ms = new THREE.Object3D();
				//tdLoadObjectOBJ(metatype, ms, x1, y1, z1, x2, y2, z2, 0, mat, i);
				for (var s = 0; s < 10; s++) {
					ms1 = tdDrawObject(type, ms, f, x, y, x1, y1 + s * 0.1, z1 - s * 0.1 + 0.9, x2, y2 * 0.1, z2 * 0.1, 0, 'box', 'wall-y01', rnd, 129.22);
				}
				break;

			case 'pillar2':
				ms = new THREE.Object3D();
				var r = rand(Math.floor(f / floorSize), Math.floor(x / rnd), Math.floor(y / rnd), 529.52, 5);
				if (r === 0) {
					ms1 = tdDrawObject('cylinder', ms, f, x, y, x1, y1, z1, x2, y2, z2, 0, 'cylinder', mat, rnd, 129.22);
					ms1 = tdDrawObject('cylinder', ms, f, x, y, x1 - 0.1, y1 - 0.1, z1, x2 + 0.2, y2 + 0.2, 0.2, 0, 'cylinder', 'wall-x20-y02', rnd, 129.22);
					ms1 = tdDrawObject('cylinder', ms, f, x, y, x1 - 0.1, y1 - 0.1, z1 + 0.8, x2 + 0.2, y2 + 0.2, 0.2, 0, 'cylinder', 'wall-x20-y02', rnd, 129.22);
				} else if (r === 1) {
					ms1 = tdDrawObject('cylinder', ms, f, x, y, x1 - 0.1, y1 - 0.1, z1, x2 + 0.2, y2 + 0.2, z2, 0, 'cylinder', 'wall-x20', rnd, 129.22);
				} else if (r === 2) {
					ms1 = tdDrawObject('box4', ms, f, x, y, x1, y1, z1, x2, y2, z2, 0, 'box4', 'wall-x025', rnd, 129.22);
					ms1 = tdDrawObject('box', ms, f, x, y, x1 - 0.1, y1 - 0.1, z1, x2 + 0.2, y2 + 0.2, 0.2, 0, 'box', 'wall-x05-y02', rnd, 129.22);
					ms1 = tdDrawObject('box', ms, f, x, y, x1 - 0.1, y1 - 0.1, z1 + 0.8, x2 + 0.2, y2 + 0.2, 0.2, 0, 'box', 'wall-x05-y02', rnd, 129.22);
				} else if (r === 3) {
					ms1 = tdDrawObject('box4', ms, f, x, y, x1, y1, z1, x2, y2, z2, 0, 'box4', 'wall-x025', rnd, 129.22);
					//var i = rand(Math.floor(f / floorSize), Math.floor(x / rnd), Math.floor(y / rnd), seed, tdMaterial[mat].image.max);
					//ms = new THREE.Object3D();
					//tdLoadObjectOBJ('pillar', ms, x1, y1, z1, x2, y2, z2, 0, mat, i);
				} else {
					ms1 = tdDrawObject('cylinder', ms, f, x, y, x1, y1, z1, x2, y2, z2, 0, 'cylinder', mat, rnd, 129.22);
					ms1 = tdDrawObject('cylinder', ms, f, x, y, x1 - 0.1, y1 + 0.15, z1 + 0.6, x2 + 0.2, 0, 0.4, 0, 'cylinder', 'wall-x20', rnd, 129.22);
					ms1 = tdDrawObject('cylinder', ms, f, x, y, x1 + 0.15, y1 - 0.1, z1, 0, y2 + 0.2, 0.4, 0, 'cylinder', 'wall-x20', rnd, 129.22);
				}
				break;

			case 'pillar':
				ms = new THREE.Object3D();
				ms1 = tdDrawObject(type, ms, f, x, y, x1, y1, z1, x2, y2, z2, 0, 'pillar2', mat, rnd, 129.22);
				if (getSquareFeature(x, y, 'double') === 'ceil') {
					ms1 = tdDrawObject(type, ms, f, x, y, x1, y1, z1 + 1, x2, y2, z2, 0, 'pillar2', mat, rnd, 129.22);
					ms1.rotation.y = 90 * Math.PI / 180;
				}
				break;

			case 'obstacle':
				var i = rand(f, x, y, seed, tdMaterial[mat].image.max);
				ms = new THREE.Object3D();
				tdLoadObjectOBJ(metatype, ms, x1, y1, z1, x2, y2, z2, 0, mat, i, true);
				break;

			case 'door':
				ms = new THREE.Object3D();
				ms1 = tdDrawObject(type, ms, f, x, y, x1 + x2 * 0.1, y1 + (y2 * 0.4), z1, x2 * 0.8, y2 * 0.2, z2, 0, 'box', mat, rnd, 356.11);
				ms1 = tdDrawObject('door-rim', ms, f, x, y, x1 + 0.9, y1, z1, 0.1, y2, z2, 0, 'box4', 'wall-x01', rnd, 129.22);
				ms1 = tdDrawObject('door-rim', ms, f, x, y, x1, y1, z1, 0.1, y2, z2, 0, 'box4', 'wall-x01', rnd, 129.22);
				break;

			case 'door-open':
				ms = new THREE.Object3D();
				ms1 = tdDrawObject(type, ms, f, x, y, x1 + x2 * 0.1, y1 + (y2 * 0.4), z1 + z2 * 0.8, x2 * 0.8, y2 * 0.2, z2, 0, 'box', mat, rnd, 356.11);
				ms1 = tdDrawObject('door-rim', ms, f, x, y, x1 + 0.9, y1, z1, 0.1, y2, z2, 0, 'box4', 'wall-x01', rnd, 129.22);
				ms1 = tdDrawObject('door-rim', ms, f, x, y, x1, y1, z1, 0.1, y2, z2, 0, 'box4', 'wall-x01', rnd, 129.22);
				break;

			case 'floor-ceil':
				ms = new THREE.Object3D();
				var r = rand(Math.floor(f / floorSize), Math.floor(x / rnd), Math.floor(y / rnd), 128.13, 12);
				if (type === 'floor-ceil-double') {
					if (hasSquare(x, y, 'wall') > -1) {
						ms1 = tdDrawObject(type, ms, f, x, y, x1, y1, z1, x2, y2, z2, 0, 'floor', mat, rnd, 51.33);
					}
					if (hasSquare(x, y, 'pit-ceil') === -1) {
						ms1 = tdDrawObject(type, ms, f, x, y, x1, y1, z1, x2, y2, z2, 0, 'ceil', 'ceil', rnd, 51.33);
					}
				} else {
					if (hasSquare(x, y, 'pit') === -1) {
						ms1 = tdDrawObject(type, ms, f, x, y, x1, y1, z1, x2, y2, z2, 0, 'floor', mat, rnd, 51.33);
					}
					if (getSquareFeature(x, y, 'double') !== 'ceil' && getSquareFeature(x, y, 'double') !== 'none' && hasSquare(x, y, 'pit-ceil') === -1) {
						ms1 = tdDrawObject(type, ms, f, x, y, x1, y1, z1 - 0.001, x2, y2, z2, 0, 'ceil', 'ceil', rnd, 51.33);
					}
				}
				if (r === 0) {
					if (rand(f, x, y, 197.76, 2) === 0) {
						ms1 = tdDrawObject('box4', ms, f, x, y, x1 - 0.05, y1 - 0.05, z1, 0.101, 0.101, z2, 0, 'box4', 'wall-wood-x01', rnd, 444.01);
					}
				} else if (r === 1) {
					ms1 = tdDrawObject('box', ms, f, x, y, x1, y1 - 0.05, z1 + 0.95, x2, 0.101, 0.05, 0, 'box', 'wall-wood-y01', rnd, 444.01);
					ms1 = tdDrawObject('box', ms, f, x, y, x1, y1 + 0.95, z1 + 0.95, x2, 0.101, 0.05, 0, 'box', 'wall-wood-y01', rnd, 444.01);
					ms1 = tdDrawObject('box', ms, f, x, y, x1 - 0.05, y1 + 0.05, z1 + 0.95, 0.101, y2 - 0.1, 0.05, 0, 'box', 'wall-wood-y01', rnd, 444.01);
					ms1 = tdDrawObject('box', ms, f, x, y, x1 + 0.95, y1 + 0.05, z1 + 0.95, 0.101, y2 - 0.1, 0.05, 0, 'box', 'wall-wood-y01', rnd, 444.01);
				}
				break;

			case 'floor-deco':
				ms = new THREE.Object3D();
				ms1 = tdDrawObject(type, ms, f, x, y, x1, y1, z1, x2, y2, z2, 0, 'floor', mat, rnd, 707.89);
				break;

			case 'ceil-deco':
				ms = new THREE.Object3D();
				ms1 = tdDrawObject(type, ms, f, x, y, x1, y1, z1, x2, y2, z2, 0, 'ceil', mat, rnd, 110.07);
				break;

			case 'stairs-up':
				ms = new THREE.Object3D();
				ms1 = tdDrawObject(type, ms, f, x, y, x1, y1, z1, x2, y2, z2, 0, 'stairs', mat, rnd, 129.22);
				ms1 = tdDrawObject(type, ms, f, x, y, x1, y1 - 1, z1 + 1, x2, y2, z2, 0, 'stairs', mat, rnd, 129.22);
				ms1 = tdDrawObject(type, ms, f + 1, x, y, x1, y1 - 2, z1 + 2, x2, y2, z2, 0, 'stairs', mat, rnd, 129.22);
				//ms1 = tdDrawObject('floor', ms, f, x, y, x1, y1, z1, x2, y2, z2, 0, 'floor', 'floor', rnd, 51.33);
				//ms1 = tdDrawObject('box4', ms, f, x + dir[d1].x, y + dir[d1].y, x1 - 1, y1, z1 + 1, x2, y2, z2, 0, 'box4', 'wall', rnd, 129.22);
				//ms1 = tdDrawObject('box4', ms, f, x + dir[d3].x, y + dir[d3].y, x1 + 1, y1, z1 + 1, x2, y2, z2, 0, 'box4', 'wall', rnd, 129.22);
				//ms1 = tdDrawObject('box4', ms, f, x + dir[d1].x, y + dir[d1].y, x1 - 1, y1 - 1, z1 + 1, x2, y2, z2, 0, 'box4', 'wall', rnd, 129.22);
				//ms1 = tdDrawObject('box4', ms, f, x + dir[d3].x, y + dir[d3].y, x1 + 1, y1 - 1, z1 + 1, x2, y2, z2, 0, 'box4', 'wall', rnd, 129.22);
				//ms1 = tdDrawObject('ramp-reversed', ms, f, x, y, x1, y1, z1, x2, y2, z2, 0, 'ramp-reversed', 'floor', rnd, 51.33);
				break;

			case 'stairs-down':
				ms = new THREE.Object3D();
				ms1 = tdDrawObject(type, ms, f, x, y, x1, y1, z1, x2, y2, z2, 0, 'stairs', mat, rnd, 129.22);
				ms1 = tdDrawObject(type, ms, f - 1, x, y, x1, y1 + 1, z1 - 1, x2, y2, z2, 0, 'stairs', mat, rnd, 129.22);
				ms1 = tdDrawObject(type, ms, f - 1, x, y, x1, y1 + 2, z1 - 2, x2, y2, z2, 0, 'stairs', mat, rnd, 129.22);
				//ms1 = tdDrawObject(type, ms, f + 1, x, y, x1, y1 + 3, z1 - 3, x2, y2, z2, 0, 'stairs', mat, rnd, 129.22);
				if (getSquareFeature(x, y, 'double') === 'wall') {
					ms1 = tdDrawObject('floor', ms, f, x, y, x1, y1, z1 + 1, x2, y2, z2, 0, 'ceil', 'ceil', rnd, 51.33);
				}
				ms1 = tdDrawObject('box4', ms, f, x + dir[d1].x, y + dir[d1].y, x1 - 1, y1, z1, x2, y2, z2, 0, 'box4', 'wall', rnd, 129.22);
				ms1 = tdDrawObject('box4', ms, f, x + dir[d3].x, y + dir[d3].y, x1 + 1, y1, z1, x2, y2, z2, 0, 'box4', 'wall', rnd, 129.22);
				ms1 = tdDrawObject('box4', ms, f, x + dir[d1].x, y + dir[d1].y, x1 - 1, y1 + 1, z1, x2, y2, z2, 0, 'box4', 'wall', rnd, 129.22);
				ms1 = tdDrawObject('box4', ms, f, x + dir[d3].x, y + dir[d3].y, x1 + 1, y1 + 1, z1, x2, y2, z2, 0, 'box4', 'wall', rnd, 129.22);
				ms1 = tdDrawObject('box4', ms, f, x + dir[d1].x, y + dir[d1].y, x1 - 1, y1 + 2, z1, x2, y2, z2, 0, 'box4', 'wall', rnd, 129.22);
				ms1 = tdDrawObject('box4', ms, f, x + dir[d3].x, y + dir[d3].y, x1 + 1, y1 + 2, z1, x2, y2, z2, 0, 'box4', 'wall', rnd, 129.22);
				ms1 = tdDrawObject('box4', ms, f - 1, x + dir[d1].x, y + dir[d1].y, x1 - 1, y1 + 1, z1 - 1, x2, y2, z2, 0, 'box4', 'wall', rnd, 129.22);
				ms1 = tdDrawObject('box4', ms, f - 1, x + dir[d3].x, y + dir[d3].y, x1 + 1, y1 + 1, z1 - 1, x2, y2, z2, 0, 'box4', 'wall', rnd, 129.22);
				ms1 = tdDrawObject('box4', ms, f - 1, x + dir[d1].x, y + dir[d1].y, x1 - 1, y1 + 2, z1 - 1, x2, y2, z2, 0, 'box4', 'wall', rnd, 129.22);
				ms1 = tdDrawObject('box4', ms, f - 1, x + dir[d3].x, y + dir[d3].y, x1 + 1, y1 + 2, z1 - 1, x2, y2, z2, 0, 'box4', 'wall', rnd, 129.22);
				ms1 = tdDrawObject('box4', ms, f - 1, x + dir[d1].x, y + dir[d1].y, x1 - 1, y1 + 2, z1 - 2, x2, y2, z2, 0, 'box4', 'wall', rnd, 129.22);
				ms1 = tdDrawObject('box4', ms, f - 1, x + dir[d3].x, y + dir[d3].y, x1 + 1, y1 + 2, z1 - 2, x2, y2, z2, 0, 'box4', 'wall', rnd, 129.22);
				//ms1 = tdDrawObject('ramp-reversed', ms, f, x, y, x1, y1, z1, x2, y2, z2, 0, 'ramp-reversed', 'floor', rnd, 51.33);
				//ms1 = tdDrawObject('ramp-reversed', ms, f, x, y, x1, y1 + 1, z1 - 1, x2, y2, z2, 0, 'ramp-reversed', 'floor', rnd, 51.33);
				break;

			case 'wall-light':
				ms = new THREE.Object3D();
				ms.scale.set(tdSquareSize.x, tdSquareSize.y, tdSquareSize.y);
				ms.position.set((x1 + (x2 / 2)) * tdSquareSize.x - tdSquareSize.x * 0.5, (z1 + (z2 / 2)) * tdSquareSize.y, 0);//(0, 0.5, 0);
				ms.rotateY((-(d + 2) * 90) * Math.PI / 180);
				ms.translateZ(y1 * tdSquareSize.x * 0.5 + 0.1);
				ms.rotateY(((d + 2) * 90) * Math.PI / 180);
				//ms1 = tdDrawObject('light', ms, f, x, y, x1, y1, z1, x2, y2, z2, 0, 'light', 'light', 0, 0);
				//if(ms1 !== null) {
				tdLoadObjectOBJ('wall-light', ms, x1, 0.4, 0, x2, y2, z2, 0, mat, 0);
				//tdRotateInWorld('x', roomLight[roomLight.length - 1].mesh, -45 * Math.PI / 180);
				//roomLight[roomLight.length - 1].mesh.matrixAutoUpdate = false;
				//}
				break;

			case 'wall-light-high':
				ms = new THREE.Object3D();
				ms.scale.set(tdSquareSize.x, tdSquareSize.y, tdSquareSize.y);
				ms.position.set((x1 + (x2 / 2)) * tdSquareSize.x - tdSquareSize.x * 0.5, (z1 + (z2 / 2)) * tdSquareSize.y, 0);//(0, 0.5, 0);
				ms.rotateY((-(d + 2) * 90) * Math.PI / 180);
				ms.translateZ(y1 * tdSquareSize.x * 0.5 + 0.1);
				ms.rotateY(((d + 2) * 90) * Math.PI / 180);
				//ms1 = tdDrawObject('light', ms, f, x, y, x1, y1, z1, x2, y2, z2, 0, 'light', 'light', 0, 0);
				//if(ms1 !== null) {
				tdLoadObjectOBJ('wall-light', ms, x1, 0.4, 0, x2, y2, z2, 0, mat, 0);
				//tdRotateInWorld('x', roomLight[roomLight.length - 1].mesh, -30 * Math.PI / 180);
				//roomLight[roomLight.length - 1].mesh.matrixAutoUpdate = false;
				//}
				break;

			case 'ceil-light':
				i = rand(Math.floor(f / floorSize), Math.floor(x / rnd), Math.floor(y / rnd), seed, tdMaterial[mat].image.max);
				ms = new THREE.Object3D();
				ms.position.x = (x1 + (x2 / 2)) * tdSquareSize.x - tdSquareSize.x * 0.5;
				ms.position.y = (z1 + (z2 / 2)) * tdSquareSize.y;
				ms.position.z = (y1 + (y2 / 2)) * tdSquareSize.x - tdSquareSize.x * 0.5;
				//m = tdCreateMaterial(mat, 0);
				//if(m !== null) {
				//var i = rand(f, x, y, seed, tdMaterial[mat].image.max);
				/*var col = (rand(f, x, y, 112.10, 127) + 128);
				col += ',' + (rand(f, x, y, 843.59, 127) + 128);
				col += ',' + (rand(f, x, y, 650.22, 127) + 128);
				m.color = new THREE.Color('rgb(' + col + ')');
				if(typeof tdGeometry[geotype] === 'undefined' || tdGeometry[geotype] === null) {
						geo = new THREE.SphereGeometry(1, 8, 8);
						tdGeometry[geotype] = new THREE.BufferGeometry().fromGeometry(geo);
						tdGeometry[geotype].computeVertexNormals();
				}
				ms = new THREE.Mesh(tdGeometry[geotype], m);*/
				//ms1 = tdDrawObject('light', ms, f, x, y, x1, y1, z1, x2, y2, z2, 0, 'light', 'light', 0, 0);
				//if(ms1 !== null) {
				//x1 = 0.05, y1 = 0.95, z1 = 1.675, x2 = 0.2, y2 = 0.2, z2 = 0.5;
				tdLoadObjectOBJ(metatype, ms, 0.05, 0.975, -0.075, x2, y2, z2, 0, mat, i);
				//tdRotateInWorld('x', roomLight[roomLight.length - 1].mesh, -30 * Math.PI / 180);
				//roomLight[roomLight.length - 1].mesh.matrixAutoUpdate = false;
				//}
				//}
				break;

			case 'window':
				ms = new THREE.Object3D();
				ms1 = tdDrawObject(type, ms, f, x, y, x1, y1, z1, x2, y2, z2, 0, 'box4', mat, rnd, seed);
				break;
		}
		if (ms !== null) {
			if (mat !== '') {
				if (typeof tdMaterial[mat].light !== 'undefined' && tdMaterial[mat].light) {
					var dist = 1;
					if (typeof tdMaterial[mat].lightDistance !== 'undefined') {
						dist = tdMaterial[mat].lightDistance;
					}
					if (tdMaterial[mat].lightColor === 'random') {
						var h = rand(Math.floor(f / 10), 0, 0, 112.11, viewSize) * 0.01;
						var s = 1.0;
						var l = 0.5 - rand(Math.floor(f / 10), 0, 0, 665.57, 25) * 0.01;
						col = new THREE.Color().setHSL(h, s, l);
					} else if (tdMaterial[mat].lightColor === 'random2') {
						var h = rand(f, x, y, 441.97, viewSize) * 0.01;
						var s = 1.0;
						var l = 1.0 - rand(f, x, y, 423.12, 25) * 0.01;
						col = new THREE.Color().setHSL(h, s, l);
					} else {
						col = new THREE.Color(tdMaterial[mat].lightColor);
					}
					ms1 = new THREE.PointLight(col);
					ms1.position.set(0, 0, 0);
					ms1.intensity = 0;
					ms1.distance = tdViewSize * dist;
					ms1.decay = 2;
					ms1.visible = false;
					ms1.castShadow = true;
					ms1.matrixAutoUpdate = false;
					ms1.shadow.camera.near = 0.25;
					ms1.shadow.camera.far = tdViewSize * dist;
					ms1.shadow.mapSize.width = 256;
					ms1.shadow.mapSize.height = 256;
					//ms1.shadow.camera.matrixAutoUpdate = false;
					roomLight.push({ mesh: ms1, x: x, y: y });
					//ms1.shadow.camera.updateMatrix();
					ms.add(ms1);
					//var ms2 = new THREE.SpotLightHelper( ms1 );
					//scene.add( ms2 );
					//console.log('Light added: ' + roomLight.length);
				}
				if ((typeof tdMaterial[mat].shadow === 'undefined' || tdMaterial[mat].shadow) && (typeof ms.material === 'undefined' || ms.material.extension !== 'png')) {
					ms.castShadow = true;
					if (!isMobile) {
						if (typeof tdMaterial[mat].transparent !== 'undefined' && tdMaterial[mat].transparent && typeof ms.material !== 'undefined' && typeof i !== 'undefined' && typeof ms.material !== 'undefined' && ms.material.extension === 'png') {
							if (typeof tdMaterial['shade-' + mat] === 'undefined') {
								tdMaterial['shade-' + mat] = {};
								tdMaterial['shade-' + mat].material = [];
								var uniforms = {
									texture: { type: 't', value: tdTexture[mat][i] }
								};
								tdMaterial['shade-' + mat].material['m' + i] = new THREE.ShaderMaterial({
									uniforms: uniforms,
									vertexShader: vertexShader,
									fragmentShader: fragmentShader
								});
							}
							ms.customDepthMaterial = tdMaterial['shade-' + mat].material['m' + i];
							//ms.material.map.needsUpdate = true;
						}
					}
				}
			}
			//if (ms.material) ms.material.opacity = 0.1;
			ms.matrixAutoUpdate = false;
			ms.receiveShadow = true;
			ms.updateMatrix();
			ms.name = metatype;
			msg.add(ms);
			return ms;
		}
	}
	return null;
}

function tdBlurGeometry(g) {
	g.dynamic = true;
	for (var v in g.vertices) {
		var x = g.vertices[v].x;
		var y = g.vertices[v].y;
		var z = g.vertices[v].z;
		g.vertices[v].x += rand(origin.f, g.id, 0, 212.88 * v, viewSize) * 0.0004 - 0.02;
		g.vertices[v].y += rand(origin.f, g.id, 0, 763.99 * v, viewSize) * 0.0004 - 0.02;
		g.vertices[v].z += rand(origin.f, g.id, 0, 30.71 * v, viewSize) * 0.0002;
	}
	g.verticesNeedUpdate = true;
}

function tdLoadObjectOBJ(type, msg, x1, y1, z1, x2, y2, z2, d, mat, i, i2) {
	var file = type;
	if (typeof i2 !== 'undefined' && i2) {
		file = file + '-' + i;
		var mf = tdMeshFix[type][i];
		if (typeof mf !== 'undefined') {
			x1 = mf.x1;
			y1 = mf.y1;
			z1 = mf.z1;
			x2 = mf.x2;
			y2 = mf.y2;
			z2 = mf.z2;
		}
	}
	if (typeof tdGeometryCTM[file] === 'undefined' || tdGeometryCTM[file] === null) {
		var loader = new THREE.CTMLoader(true);
		loader.load('models/' + file + '.ctm', function (geo) {
			m = tdCreateMaterial(mat, i);
			var obj = new THREE.Mesh(geo, m);
			tdFixObject(obj, geo, x1, y1, z1, x2, y2, z2);
			tdGeometryCTM[file] = geo;//.clone();
			if (typeof geo !== 'undefined') {
				obj.traverse(function (ms) {
					//if(ms instanceof THREE.Mesh) {
					if (m !== null) {
						ms.material = m;
					}
					if ((typeof tdMaterial[mat].shadow === 'undefined' || tdMaterial[mat].shadow) && (typeof ms.material === 'undefined' || ms.material.extension !== 'png')) {
						ms.receiveShadow = true;
						ms.castShadow = true;
					}
					//}
				});
				msg.add(obj);
			}
		});
	} else {
		m = tdCreateMaterial(mat, i);
		var geo = tdGeometryCTM[file];//.clone();
		var obj = new THREE.Mesh(geo, m);
		tdFixObject(obj, geo, x1, y1, z1, x2, y2, z2);
		if (typeof geo !== 'undefined') {
			obj.traverse(function (ms) {
				//if(ms instanceof THREE.Mesh) {
				if (m !== null) {
					ms.material = m;
				}
				if ((typeof tdMaterial[mat].shadow === 'undefined' || tdMaterial[mat].shadow) && (typeof ms.material === 'undefined' || ms.material.extension !== 'png')) {
					ms.receiveShadow = true;
					ms.castShadow = true;
				}
				//}
			});
			msg.add(obj);
		}
	}
}

function tdFixObject(obj, geo, x1, y1, z1, x2, y2, z2) {
	var xMin = 10000000.0;
	var yMin = 10000000.0;
	var zMin = 10000000.0;
	var xMax = -10000000.0;
	var yMax = -10000000.0;
	var zMax = -10000000.0;
	obj.geometry = geo;
	obj.traverse(function (ms) {
		if (ms instanceof THREE.Mesh) {
			var pos = ms.geometry.attributes.position.array;
			if (typeof ms.geometry !== 'undefined' && typeof pos !== 'undefined') {
				for (j = 0; j < pos.length; j += 3) {
					if (xMin > pos[j]) {
						xMin = pos[j];
					}
					if (yMin > pos[j + 1]) {
						yMin = pos[j + 1];
					}
					if (zMin > pos[j + 2]) {
						zMin = pos[j + 2];
					}
					if (xMax < pos[j]) {
						xMax = pos[j];
					}
					if (yMax < pos[j + 1]) {
						yMax = pos[j + 1];
					}
					if (zMax < pos[j + 2]) {
						zMax = pos[j + 2];
					}
				}
			}
		}
	});
	var xScl = xMax - xMin;
	var yScl = yMax - yMin;
	var zScl = zMax - zMin;
	var xOff = (xMin + xScl * 0.5) / xScl;
	var yOff = (yMin + yScl * 0.5) / yScl;
	var zOff = (zMin + zScl * 0.5) / zScl;
	obj.position.x = (x1 + x2 / 2 - xOff) * tdSquareSize.x - tdSquareSize.x * 0.5;
	obj.position.y = (z1 - yOff) * tdSquareSize.y + tdSquareSize.y * 0.5;
	obj.position.z = (y1 + y2 / 2 - zOff) * tdSquareSize.x - tdSquareSize.x * 0.5;
	obj.scale.set((tdSquareSize.x * x2) / xScl, (tdSquareSize.y * z2) / yScl, (tdSquareSize.x * y2) / zScl);
}

function tdHideWallFaces(ms, x, y) {
	if (ms !== null) {

	}
}

function tdMoveCameraXY(x, y, z, abs) {
	if (typeof x === 'undefined') {
		tdMoveCameraXY(-origin.d * (Math.PI / 2), undefined, undefined, true);
	} else {
		if (typeof abs !== 'undefined' && abs) {
			yawObject.rotation.y = x;
		} else {
			yawObject.rotation.y -= x;
		}
		while (yawObject.rotation.y < 0.0) {
			yawObject.rotation.y += 4.0 * (Math.PI / 2);
		}
		while (yawObject.rotation.y >= 4.0 * (Math.PI / 2)) {
			yawObject.rotation.y -= 4.0 * (Math.PI / 2);
		}
	}
	if (typeof y !== 'undefined') {
		if (typeof abs !== 'undefined' && abs) {
			pitchObject.rotation.x = y;
		} else {
			pitchObject.rotation.x -= y;
		}
		if (pitchObject.rotation.x < -1.0) {
			pitchObject.rotation.x = -1.0;
		}
		if (pitchObject.rotation.x > 1.0) {
			pitchObject.rotation.x = 1.0;
		}
	}
	if (typeof z !== 'undefined') {
		if (typeof abs !== 'undefined' && abs) {
			rollObject.rotation.z = z;
		} else {
			rollObject.rotation.z -= z;
		}
	}

	camera.rotation.z = 0;
	camera.rotation.y = 0;
	camera.rotation.x = 0;
	camera.rotateY(yawObject.rotation.y);
	camera.rotateX(pitchObject.rotation.x);
	camera.rotateZ(rollObject.rotation.z);
}

function tdMoveCamera(d) {
	if (playerCanMove(d) === 1) {
		keysFrozen = true;
		var xo = dir[d].x;
		var yo = dir[d].y;
		var zo1 = tdPlayerHeight;
		var zo2 = tdPlayerHeight;
		if (hasSquare(origin.x, origin.y, 'stairs-up') > -1) {
			zo1 += tdSquareSize.y * 0.5;
		}
		if (hasSquare(origin.x + xo, origin.y + yo, 'stairs-up') > -1) {
			zo2 += tdSquareSize.y * 0.5;
		}
		if (hasSquare(origin.x, origin.y, 'stairs-down') > -1) {
			zo1 -= tdSquareSize.y * 0.5;
		}
		if (hasSquare(origin.x + xo, origin.y + yo, 'stairs-down') > -1) {
			zo2 -= tdSquareSize.y * 0.5;
		}
		shiftMeshes(d);
		origin.x = origin.x + xo;
		origin.y = origin.y + yo;
		//floorAction(origin.x, origin.y);
		new TWEEN.Tween({ x: origin.x - origin.xt - xo, y: origin.y - origin.yt - yo, z: zo1 })
			.to({ x: origin.x - origin.xt, y: origin.y - origin.yt, z: zo2 }, 400)
			.easing(TWEEN.Easing.Sinusoidal.InOut)
			.onUpdate(function () {
				tdFinetuneResetCamera();
				camera.position.x = this.x * tdSquareSize.x;
				camera.position.y = this.z;
				camera.position.z = this.y * tdSquareSize.x;
				tdFinetuneCamera();
				tdUpdateCameraLight();
			})
			.onComplete(function () {
				reloadAll(false);
				tdUpdateCamera();
				keysFrozen = false;
			})
			.start();
	}
}

function tdRotateCamera(d) {
	keysFrozen = true;
	var do1 = origin.d; //-Math.PI / 2 * 
	var d1 = d; //-Math.PI / 2 * 
	//origin.d = (origin.d + d + 4) % 4;
	origin.d = (origin.d + d + 4) % 4;
	if (floorAction(origin.x, origin.y, origin.d)) {
		reloadAll();
	}
	new TWEEN.Tween({ d: yawObject.rotation.y }) //do1
		.to({ d: yawObject.rotation.y - d1 * (Math.PI / 2) }, 400) //do1 + d1
		.easing(TWEEN.Easing.Sinusoidal.InOut)
		.onUpdate(function () {
			tdFinetuneResetCamera();
			camera.position.x = (origin.x - origin.xt) * tdSquareSize.x;
			var zo1 = tdPlayerHeight;
			if (hasSquare(origin.x, origin.y, 'stairs-up') > -1) {
				zo1 += tdSquareSize.y * 0.5;
			}
			if (hasSquare(origin.x, origin.y, 'stairs-down') > -1) {
				zo1 -= tdSquareSize.y * 0.5;
			}
			camera.position.y = zo1;
			camera.position.z = (origin.y - origin.yt) * tdSquareSize.x;
			tdMoveCameraXY(this.d, undefined, undefined, true); //yawObject.rotation.y + this.d * (Math.PI / 2)
			tdFinetuneCamera();
			tdUpdateCameraLight();
		})
		.onComplete(function () {
			tdUpdateCamera();
			keysFrozen = false;
		})
		.start();
}

//doc = device orientation control
function tdUpdateCamera(fast = false) {
	//var rx = camera.rotation.x;
	//var rz = camera.rotation.z;
	if (!fast || controlsEnabled) {
		tdFinetuneResetCamera();
		camera.position.x = (origin.x - origin.xt) * tdSquareSize.x;
		camera.position.y = tdPlayerHeight;
		camera.position.z = (origin.y - origin.yt) * tdSquareSize.x;

		//if(typeof doc === 'undefined' || !doc) {
		//camera.rotation.y = -Math.PI / 2 * origin.d;
		//}
		if (hasSquare(origin.x, origin.y, 'stairs-up') > -1) {
			camera.position.y += tdSquareSize.y * 0.5;
		} else if (hasSquare(origin.x, origin.y, 'stairs-down') > -1) {
			camera.position.y -= tdSquareSize.y * 0.5;
			//} else {
			//    camera.position.y = tdSquareSize.y * 0.5;
		}
		tdFinetuneCamera();
		tdPlayer.position.set(0, -tdPlayerHeight * 0.5 + 0.1, 0);

		var dirc = controls.getDirection();
		var od = origin.d;
		origin.d = Math.round(dirc.y / (-Math.PI / 2)) % 4;
		while (origin.d < 0) {
			origin.d += 4;
		}
		if (od !== origin.d) { //rotation changed
			if (floorAction(origin.x, origin.y, origin.d)) {
				reloadAll();
			}
		}
		if (controlsEnabled) {
			tdUpdateCameraLight();
		}
	}

	//SPRITES
	if (stereo) {
		for (var s in tdSprite) {
			if (typeof tdSprite[s].mesh !== 'undefined') {
				var vis = 2;
				if (typeof tdSprite[s].visible !== 'undefined') {
					vis = tdSprite[s].visible(origin.x, origin.y, origin.d, true);
				}
				if (vis > 0) {
					if (tdSprite[s].position === 'relative') {
						tdSprite[s].mesh.position.set(0, 0, 0);
						tdSprite[s].mesh.rotation.set(0, 0, 0);
						tdSprite[s].mesh.rotateY(-dirc.y + (-Math.PI / 2) * (4 + origin.d));
						tdSprite[s].mesh.rotateX(-dirc.x);
						if (typeof tdSprite[s].offsetZ !== 'undefined') {
							tdSprite[s].mesh.translateZ(-tdSprite[s].offsetZ);
						} else {
							tdSprite[s].mesh.translateZ(-1.0);
						}
						if (typeof tdSprite[s].offsetY !== 'undefined') {
							tdSprite[s].mesh.translateY(-tdSprite[s].offsetY);
						}
						if (typeof tdSprite[s].offsetX !== 'undefined') {
							tdSprite[s].mesh.translateX(tdSprite[s].offsetX);
						}
						var op = tdGetSpriteOpacity(s);
						if (op > 0.4) {
							var sc = tdSprite[s].mesh.scale.x;
							if (tdSprite[s].mesh.material.opacity < 1.2) {
								tdSprite[s].mesh.material.opacity += 0.05;
							}
							if (sc > tdSprite[s].scale * 1.2) {
								//if(typeof tdSprite[s].scale !== 'undefined') {
								//    tdSprite[s].mesh.scale.set(tdSprite[s].scale, tdSprite[s].scale, tdSprite[s].scale);
								//} else {
								//    tdSprite[s].mesh.scale.set(1, 1, 1);
								//}
								//tdSprite[s].mesh.material.opacity = 0.0;
								//buttonEvents();
							} else {
								tdSprite[s].mesh.scale.set(sc * 1.01, sc * 1.01, sc * 1.01);
							}
						} else {
							if (typeof tdSprite[s].scale !== 'undefined') {
								tdSprite[s].mesh.scale.set(tdSprite[s].scale, tdSprite[s].scale, tdSprite[s].scale);
							} else {
								tdSprite[s].mesh.scale.set(1, 1, 1);
							}
							tdSprite[s].mesh.material.opacity = op;
						}
					} else {
						tdSprite[s].mesh.material.opacity = 1.0;
						tdSprite[s].mesh.position.set(0, 0, 0);
						tdSprite[s].mesh.rotation.set(0, 0, 0);
						if (typeof tdSprite[s].offsetZ !== 'undefined') {
							tdSprite[s].mesh.translateZ(-tdSprite[s].offsetZ);
						} else {
							tdSprite[s].mesh.translateZ(-1.0);
						}
						if (typeof tdSprite[s].offsetY !== 'undefined') {
							tdSprite[s].mesh.translateY(-tdSprite[s].offsetY);
						}
						if (typeof tdSprite[s].offsetX !== 'undefined') {
							tdSprite[s].mesh.translateX(tdSprite[s].offsetX);
						}
					}
				} else {
					tdSprite[s].mesh.material.opacity = 0.0;
				}
			}

		}
	}
	if (!fast) {
		light.position.set(0, 0, tdSquareSize.x * 0.3);
		light.updateMatrix();
		tdUpdateCameraLight();
		var coo = 'F: ' + origin.f + ', X: ' + origin.x + ', Y: ' + origin.y + ', D: ' + origin.d;
		$('body input#coordinates').val(coo);
		setCoords(origin);
	}
}

function tdFinetuneResetCamera() {
	if (isMobile) {
		camera.rotation.x = 0;
	}
}

function tdFinetuneCamera() {
	camera.translateZ(tdBackStep);
	if (isMobile) {
		camera.rotation.x = -0.07;
	}
}

function tdUpdateCameraLight() {
	if (typeof light !== 'undefined') {
		light.shadow.camera.updateMatrix();
	}
}

function tdGetSpriteOpacity(id) {
	op = 0.0;
	if (typeof tdSprite[id].mesh !== 'undefined') {
		var canvas = document.getElementById('view');
		var cx = canvas.width;
		var cy = canvas.height;
		var vector = new THREE.Vector3();
		vector.setFromMatrixPosition(tdSprite[id].mesh.matrixWorld);
		xy = tdCreateVector(vector.x, vector.y, vector.z, camera, cx, cy);
		op = Math.abs(xy.x - 0.5 * cx) / (cx / 24.0);
		op = op + Math.abs(xy.y - 0.5 * cy) / (cy / 12.0);
		if (op > 1.0) op = 1.0;
		if (op < 0.0) op = 0.0;
		op = 1.0 - op;
	}
	return op;
}

function tdCreateVector(x, y, z, camera, width, height) {
	var p = new THREE.Vector3(x, y, z);
	var vector = p.project(camera);

	vector.x = (vector.x + 1) / 2 * width;
	vector.y = -(vector.y - 1) / 2 * height;

	return vector;
}

function tdRotateInWorld(axis, object, radians) {
	switch (axis) {
		case 'x': var a = new THREE.Vector3(1, 0, 0); break;
		case 'y': var a = new THREE.Vector3(0, 1, 0); break;
		case 'z': var a = new THREE.Vector3(0, 0, 1); break;
	}
	var rotWorldMatrix = new THREE.Matrix4();
	rotWorldMatrix.makeRotationAxis(a.normalize(), radians);
	rotWorldMatrix.multiply(object.matrix);
	object.matrix = rotWorldMatrix;
	object.rotation.setFromRotationMatrix(object.matrix);
}

function tdClearWorld() {
	var obj, i;
	for (i = scene.children.length - 1; i >= 0; i--) {
		obj = scene.children[i];
		tdClearObject(obj);
	}
	for (var x = 0; x < viewSize; x++) {
		for (var y = 0; y < viewSize; y++) {
			if (typeof map !== 'undefined' && typeof map[x] !== 'undefined' && typeof map[x][y] !== 'undefined') {
				delete map[x][y].mesh;
			}
		}
	}
}

function tdClearObject(obj, p) {
	if (typeof obj !== 'undefined' && obj !== null) {
		if (obj !== ambientLight && obj !== light && obj !== camera) {
			if (typeof p === 'undefined') {
				p = scene;
			}
			if (typeof obj.children !== 'undefined') {
				for (var c = obj.children.length - 1; c >= 0; c--) {
					tdClearObject(obj.children[c], obj);
				}
			}
			if ((obj.type === 'SpotLight' || obj.type === 'PointLight') && (typeof lit === 'undefined' || !lit)) {
				for (i in roomLight) {
					if (obj === roomLight[i].mesh) {
						roomLight.splice(i, 1);
						console.log('Light removed: ' + roomLight.length);
						break;
					}
				}
			}
			p.remove(obj);
			if (typeof obj.geometry !== 'undefined') {
				obj.geometry.dispose();
			}
			if (typeof obj.material !== 'undefined') {
				if (typeof obj.material.map !== 'undefined' && obj.material.map !== null) {
					obj.material.map.dispose();
				}
				obj.material.dispose();
			}
			return true;
		}
	}
	return false;
}

function tdGetRainbowColor(rgb, up) {
	var col = { red: 0, green: 0, blue: 0 };
	if (rgb < 256) { //red to yellow
		col.red = 255;
		col.green = rgb;
	} else if (rgb < 512) { //yellow to green
		col.red = 512 - rgb - 1;
		col.green = 255;
	} else if (rgb < 768) { //green to cyan
		col.green = 255;
		col.blue = rgb - 512;
	} else if (rgb < 1024) { //cyan to blue
		col.green = 1024 - rgb - 1;
		col.blue = 255;
	} else if (rgb < 1280) { //blue to magenta
		col.red = rgb - 1024;
		col.blue = 255;
	}
}

function checkPointerLock() {
	var havePointerLock = 'pointerLockElement' in document || 'mozPointerLockElement' in document || 'webkitPointerLockElement' in document;

	if (havePointerLock) {

		var element = document.body;

		var pointerlockchange = function (event) {

			if (document.pointerLockElement === element || document.mozPointerLockElement === element || document.webkitPointerLockElement === element) {
				controls.enabled = true;
				controlsEnabled = true;
			} else {

				controls.enabled = false;
				controlsEnabled = false;
			}

		};

		var pointerlockerror = function (event) {

		};

		// Hook pointer lock state change events
		document.addEventListener('pointerlockchange', pointerlockchange, false);
		document.addEventListener('mozpointerlockchange', pointerlockchange, false);
		document.addEventListener('webkitpointerlockchange', pointerlockchange, false);

		document.addEventListener('pointerlockerror', pointerlockerror, false);
		document.addEventListener('mozpointerlockerror', pointerlockerror, false);
		document.addEventListener('webkitpointerlockerror', pointerlockerror, false);

		document.getElementById('view').addEventListener('click', function (event) {

			// Ask the browser to lock the pointer
			element.requestPointerLock = element.requestPointerLock || element.mozRequestPointerLock || element.webkitRequestPointerLock;

			if (/Firefox/i.test(navigator.userAgent)) {

				var fullscreenchange = function (event) {

					if (document.fullscreenElement === element || document.mozFullscreenElement === element || document.mozFullScreenElement === element) {

						document.removeEventListener('fullscreenchange', fullscreenchange);
						document.removeEventListener('mozfullscreenchange', fullscreenchange);

						element.requestPointerLock();
					}

				};

				document.addEventListener('fullscreenchange', fullscreenchange, false);
				document.addEventListener('mozfullscreenchange', fullscreenchange, false);

				element.requestFullscreen = element.requestFullscreen || element.mozRequestFullscreen || element.mozRequestFullScreen || element.webkitRequestFullscreen;

				element.requestFullscreen();

			} else {

				element.requestPointerLock();

			}

		}, false);
	}
}