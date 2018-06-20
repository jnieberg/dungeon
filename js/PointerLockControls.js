/**
 * @author mrdoob / http://mrdoob.com/
 */

THREE.PointerLockControls = function ( object ) {

	var scope = this;

	//camera.rotation.set( 0, 0, 0 );

	rollObject = new THREE.Object3D();
	rollObject.add( object );

	pitchObject = new THREE.Object3D();
	pitchObject.add( rollObject );

	yawObject = new THREE.Object3D();
	tdMoveCameraXY();
	yawObject.add( pitchObject );

	var PI_2 = Math.PI / 2;

	var onMouseMove = function ( event ) {

		if ( scope.enabled === false ) return;

		var movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
		var movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;

		tdMoveCameraXY(movementX * 0.002, movementY * 0.002);
	};

	this.dispose = function() {

		document.removeEventListener( 'mousemove', onMouseMove, false );

	};

	document.addEventListener( 'mousemove', onMouseMove, false );

	this.enabled = false;

	this.getObject = function () {

		return yawObject;

	};

	this.getDirection = function() {
		return { x: pitchObject.rotation.x, y: yawObject.rotation.y, z: rollObject.rotation.z };
	};

};
