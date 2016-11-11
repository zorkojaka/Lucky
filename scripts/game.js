
var camera, scene, renderer;
var clock = new THREE.Clock();
var delta;
var timer=0;
var timeLeft = 30;
var directionalLight;

var speed = 150;
var currentlyPressedKeys =  {};
var camSpeed = 0;
var loadedMesh = false;

var floorMesh;
///////SOUND//////////
var sound1;
var soundSpeed;
var displayWidth = window.innerWidth *0.6;
var displayHeight = window.innerHeight * 0.75;


			var mesh;
      var Smesh;
// SCORE TEXT //////////////
var text2 = document.createElement('div');
text2.style.position = 'absolute';
//text2.style.zIndex = 1;    // if you still don't see the label, try uncommenting this
text2.style.width = displayWidth;
text2.style.height = displayHeight/10;
text2.style.align = "center";
text2.style.fontSize = 50;
text2.innerHTML = "0 : 0";
text2.style.top = displayHeight/100 + 'px';
text2.style.left = displayWidth*0.5 + 'px';
document.body.appendChild(text2);
//////////////Time Text////////////////
var text3 = document.createElement('div');
text3.style.position = 'absolute';
//text2.style.zIndex = 1;    // if you still don't see the label, try uncommenting this
text3.style.width = displayWidth/2;
text3.style.height = displayHeight/10;

text3.style.fontSize = 50;
text3.innerHTML = "";
text3.style.top = displayHeight + 'px';
text3.style.left = displayWidth*0.5 + 'px';

document.body.appendChild(text3);


////PLAYER VARIABLES////////
			var player2;
			var p2Texture;
			var score = [0,0];
			//init();
      var player1;
			var p1Texture;
///////////PARTICLE VARIABLES///////////////
var particleGroup =new THREE.Object3D();
particleAttributes = {startSize: [], startPosition: [], randomness: []};
var totalParticles = 6;
var radiusRange = 40;
////////////Predmeti za pobrat////////////////
function predmet(disMesh,ind,spwnd,currTime){
	this.mesh = disMesh;
	this.posIndex = ind;
	this.spawned = spwnd;
	this.despawnTime = currTime;
	this.particleSystem;
	this.particleSystemActive = false;
}
	var predmeti=[];
	var mlekoMesh;
	var mlekoLoaded=false;
	var spawnLocations = [[200,0],[-200,0],[200,-300],[-200,-300],[50,-150],[-50,-150],[250,200],[-250,200]];
	function startSpawnProducts(){
					for(var i = 0; i<spawnLocations.length; i++){
					var tmpMesh = mlekoMesh.clone();
					var tmpPredmet = new predmet(tmpMesh,i,true);
					tmpMesh.scale.set(10,10,10);
					tmpMesh.position.x = spawnLocations[i][0];
					tmpMesh.position.z = spawnLocations[i][1];
					tmpMesh.position.y = 2;
					predmeti.push(tmpPredmet);
					scene.add(tmpMesh);
				}
				mlekoLoaded=true;
}
function respawnProducts(){
		for(var i = 0;i< predmeti.length;i++){
				if(!predmeti[i].spawned && timer - predmeti[i].despawnTime> 8){
					predmeti[i].spawned =true;
					scene.add(predmeti[i].mesh);
					scene.remove(predmeti[i].particleSystem);
					predmeti[i].particleSystemActive = false;

				}
		}
}
function animateProducts(){
		for(var i=0; i<predmeti.length; i++){
			var tmpMesh = predmeti[i].mesh;
			tmpMesh.rotation.y += delta;
			tmpMesh.position.y = 2+Math.cos(deg2rad(timer)*200)*10;
			if(predmeti[i].particleSystemActive){
			updateParticles(predmeti[i].particleSystem);
		}
		}
}

///////////////PARTICLES////////////////


function loadParticles(){
	var texLoader = new THREE.TextureLoader();
	texLoader.load(
		// resource URL
		'assets/particle.png',
		// Function when resource is loaded
		function (textr) {
		var	particleTexture = textr;
	for( var i = 0; i < totalParticles; i++ )
	{

	    var spriteMaterial = new THREE.SpriteMaterial( { map: particleTexture, color: 0xffffff } );
		var sprite = new THREE.Sprite( spriteMaterial );
		sprite.scale.set( 16, 16, 1.0 ); // imageWidth, imageHeight
		sprite.position.set( Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5 );
		// for a cube:
		// sprite.position.multiplyScalar( radiusRange );
		// for a solid sphere:
		// sprite.position.setLength( radiusRange * Math.random() );
		// for a spherical shell:
		sprite.position.setLength( radiusRange * (Math.random() * 0.1 + 0.9) );

		// sprite.color.setRGB( Math.random(),  Math.random(),  Math.random() );
		sprite.material.color.setHSL( Math.random(), 0.9, 0.7 );

		sprite.opacity = 0.80; // translucent particles
		sprite.material.blending = THREE.AdditiveBlending; // "glowing" particles
		particleGroup.add( sprite );
		// add variable qualities to arrays, if they need to be accessed later
		particleAttributes.startPosition.push( sprite.position.clone() );
		particleAttributes.randomness.push( Math.random() );
	}
	//particleGroup.position.y = 10;
	//particleGroup.position.x = 200;
	//scene.add( particleGroup );
});

}
function updateParticles(pGroup){
			var time = 4* timer;
			for ( var c = 0; c < pGroup.children.length; c ++ ){
			var sprite = pGroup.children[ c ];
			var a = particleAttributes.randomness[c] + 1;
			var pulseFactor = Math.sin(a * time) * 0.1 + 0.9;
			sprite.position.x = particleAttributes.startPosition[c].x * pulseFactor;
			sprite.position.y = particleAttributes.startPosition[c].y * pulseFactor;
			sprite.position.z = particleAttributes.startPosition[c].z * pulseFactor;
		}
		pGroup.rotation.y = time * 0.75;
}

//////////////////////////////


//STATS TEST
var stats = new Stats();
stats.setMode(1);
stats.domElement.style.position = 'absolute';
stats.domElement.style.left = '0px';
stats.domElement.style.top = '0px';

document.body.appendChild( stats.domElement );
stats.begin();
/////////////////// COLLISION DETECTION //////////////////////
var stopColliderList = [];
var productColliderList = [];
var speedColliderList = [];
function hasSpeedCollided(playerMesh,curMove,curRot){
	for(var i=0; i<playerMesh.geometry.vertices.length; i++){
		var localVertex = playerMesh.geometry.vertices[i].clone();
	var globalVertex = localVertex.applyMatrix4( playerMesh.matrix );
	var directionVector = globalVertex.sub( playerMesh.position );

	var ray = new THREE.Raycaster( playerMesh.position, directionVector.clone().normalize() );
	var collisionResults = ray.intersectObjects( speedColliderList );
	if ( collisionResults.length > 0 && collisionResults[0].distance < directionVector.length() ){
		movePlayer(playerMesh,curMove, curRot);
		if(!soundSpeed.isPlaying)
		soundSpeed.play();
		return true;
	}
	}
	return false;
}

function hasPredmetCollided(playerMesh,pNum){

		for(var i=0; i<playerMesh.geometry.vertices.length; i++){
			var localVertex = playerMesh.geometry.vertices[i].clone();
		var globalVertex = localVertex.applyMatrix4( playerMesh.matrix );
		var directionVector = globalVertex.sub( playerMesh.position );
		var meshList = [];
		var indList= [];
		for(var k = 0; k<predmeti.length;k++){
			if(predmeti[k].spawned){
				meshList.push(predmeti[k].mesh);
				indList.push(k);
			}
		}
		var ray = new THREE.Raycaster( playerMesh.position, directionVector.clone().normalize() );
		for(var k =0; k< meshList.length; k++){
			var collisionResults = ray.intersectObject( meshList[k] );
			if ( collisionResults.length > 0 && collisionResults[0].distance < directionVector.length() ){
				var h = indList[k];
				predmeti[h].despawnTime = timer;
				predmeti[h].spawned=false;
				scene.remove(meshList[k]);
				predmeti[h].particleSystemActive = true;
				if(predmeti[h].paricleSystem === undefined){
				predmeti[h].particleSystem = particleGroup.clone();
				predmeti[h].particleSystem.position.x = spawnLocations[h][0];
				predmeti[h].particleSystem.position.z = spawnLocations[h][1];
				predmeti[h].particleSystem.position.y = 30;
				}
				scene.add(predmeti[h].particleSystem);
				score[pNum-1]++;
				sound1.play();
				console.log("Player "+pNum+" Score: "+score[pNum-1]);
				onScoreChange();
				return true;
			}
		}
		}
		return false;
}

function hasStopCollided(playerMesh){

		for(var i=0; i<playerMesh.geometry.vertices.length; i++){
			var localVertex = playerMesh.geometry.vertices[i].clone();
		var globalVertex = localVertex.applyMatrix4( playerMesh.matrix );
		var directionVector = globalVertex.sub( playerMesh.position );

		var ray = new THREE.Raycaster( playerMesh.position, directionVector.clone().normalize() );
		var collisionResults = ray.intersectObjects( stopColliderList );
		if ( collisionResults.length > 0 && collisionResults[0].distance < directionVector.length() ){
			directionVector = directionVector.normalize();
			playerMesh.position.x -= directionVector.x*4;
			playerMesh.position.z -= directionVector.z*4;
			return true;
		}
		}
		return false;
}
//sta se igralca zaletela
function hasPlayerCollided(playerMesh1,playerMesh2){

		for(var i=0; i<playerMesh1.geometry.vertices.length; i++){
			var localVertex = playerMesh1.geometry.vertices[i].clone();
		var globalVertex = localVertex.applyMatrix4( playerMesh1.matrix );
		var directionVector = globalVertex.sub( playerMesh1.position );

		var ray = new THREE.Raycaster( playerMesh1.position, directionVector.clone().normalize() );
		var collisionResults = ray.intersectObject( playerMesh2 );
		if ( collisionResults.length > 0 && collisionResults[0].distance < directionVector.length() ){
			directionVector = directionVector.normalize();
			playerMesh1.position.x -= directionVector.x*2.5;
			playerMesh1.position.z -= directionVector.z*2.5;
			return true;
		}
		}
		return false;
}



//////////// HELPER FUNCTIONS /////////////////////////
//inefficient-- rajš ne uporablat
			function loadObject(pathObject,pathTexture,pos,rot,scale,collidable){
						var tex = THREE.ImageUtils.loadTexture(pathTexture);
						var mat = new THREE.MeshLambertMaterial({map:tex});
						var loader = new THREE.JSONLoader();
						loader.load(pathObject, function (geometry) {
							var obj = new THREE.Mesh(
								geometry,
								mat
							);
							obj.scale.set(scale,scale,scale);
							obj.position.set(pos.x,pos.y,pos.z);
							obj.rotation.setFromVector3(rot.toVector3());
							scene.add(obj);
							if(collidable)stopColliderList.push(obj);
							obj = obj.clone();
							obj.scale.set(scale,scale,scale);
							obj.position.set(pos.x+200,pos.y,pos.z);
							obj.rotation.setFromVector3(rot.toVector3());
							scene.add(obj);
							obj = obj.clone();
							obj.scale.set(scale,scale,scale);
							obj.position.set(pos.x-200,pos.y,pos.z);
							obj.rotation.setFromVector3(rot.toVector3());
							scene.add(obj);
							return obj;
						});

			}

			function deg2rad(angle){
				return angle*Math.PI/180;
			}
			function init() {
/////////////////////CAMERA////////////////////////
				camera = new THREE.PerspectiveCamera( 70, 1, 1, 10000 );
				camera.position.z = 50;
				camera.position.y = 550;
				camera.rotation.x = deg2rad(-80);
				var listener = new THREE.AudioListener();
				camera.add(listener);
				scene = new THREE.Scene();




	loadParticles();
///////////////////////FLOR MESH //////////////
				var floorTexture = THREE.ImageUtils.loadTexture('assets/floor-tiles.jpg');
				var mat1 = new THREE.MeshBasicMaterial({map:floorTexture});
				floorTexture.wrapS = floorTexture.wrapT = THREE.RepeatWrapping;
				//kolikokrat se bo tekstura pojavila na povrsini objekta
				floorTexture.repeat.set(15,15);
        var FloorGeometry = new THREE.BoxGeometry(1500,10,1500);
         floorMesh = new THREE.Mesh(FloorGeometry,mat1);
         floorMesh.position.y -=20;
        scene.add( floorMesh );

				sound1 = new THREE.Audio( listener );
				sound1.load( 'assets/coin7.wav' );
				sound1.setRefDistance( 200 );
				sound1.autoplay = true;
				floorMesh.add( sound1 );

///////////////////////POLICE/OVIRE OZ. STOPCOLLIDERS /////////////
var loader = new THREE.JSONLoader();
var tmpTexture = THREE.ImageUtils.loadTexture('assets/hladilnik_texture.png');
var tmpMat = new THREE.MeshLambertMaterial({map:tmpTexture});
//tmpMat.transparent = true;
//tmpMat.opacity = 0.5;
loader.load('assets/hladilnik.json', function (geometry) {
			for(i=0; i<5;i++){

				 var tmpMesh = new THREE.Mesh(geometry,tmpMat);
				 tmpMesh.position.x = -200 + 100*i;
				 tmpMesh.position.y = 0;
				 tmpMesh.position.z = -150;
				 tmpMesh.scale.set(15,15,15);

				scene.add( tmpMesh );
				stopColliderList.push(tmpMesh);
			}
		});
///////////////////////// POLICA Z MAJICAMI ///////////////////
loader = new THREE.JSONLoader();
var tmpTexture2 = THREE.ImageUtils.loadTexture('assets/polica_obleke.png');
var tmpMat2 = new THREE.MeshLambertMaterial({map:tmpTexture2});
//tmpMat.transparent = true;
//tmpMat.opacity = 0.5;
loader.load('assets/polica_obleke.json', function (geometry) {

				 var tmpMesh = new THREE.Mesh(geometry,tmpMat2);
				 tmpMesh.position.y = 0;
				 tmpMesh.position.z = 80;
				 tmpMesh.rotateOnAxis(new THREE.Vector3(0,1,0),deg2rad(-90));
				 tmpMesh.scale.set(35,25,35);
				scene.add( tmpMesh );
				var colliderGeo = new THREE.BoxGeometry(220,20,150);
				var collMat = new THREE.MeshLambertMaterial({map:tmpTexture2});
				collMat.transparent = true;
				collMat.opacity =0.5;
				 var colliderMesh = new THREE.Mesh(colliderGeo,collMat);
				colliderMesh.position.y = 0;
				colliderMesh.position.z = 80;
				scene.add(colliderMesh);
				stopColliderList.push(colliderMesh);

		});
//////////////////////// KOSARA S SADJEM /////////////////////////////
	loader = new THREE.JSONLoader();
	var tmpTexture3 = THREE.ImageUtils.loadTexture('assets/fruit_cart_texture.png');
	var tmpMat3 = new THREE.MeshLambertMaterial({map:tmpTexture3});
	loader.load('assets/fruit_cart.json', function (geometry) {
					for(var i = 0; i<2;i++){
					 var tmpMesh = new THREE.Mesh(geometry,tmpMat3);
					 tmpMesh.position.x = 200 * Math.pow(-1,i);
					 tmpMesh.position.z = 80;
					 tmpMesh.rotateOnAxis(new THREE.Vector3(0,1,0),deg2rad(-90));
					 tmpMesh.scale.set(25,25,25);
					scene.add( tmpMesh );
					//var tmpGeometry = new THREE.BoxGeometry(50,20,50);
					stopColliderList.push(tmpMesh);
				}
			});
			/////////////////ZASTAVE ///////////////////////////////
			var zastavaPos = [[-200,-320],[200,-320]];
			loader = new THREE.JSONLoader();
			var tmpTexture4 = THREE.ImageUtils.loadTexture('assets/zastava1.png');
			var tmpMat4 = new THREE.MeshBasicMaterial({map:tmpTexture4});
			loader.load('assets/zastava1.json', function (geometry) {
							for(var i = 0; i<2;i++){
							 var tmpMesh = new THREE.Mesh(geometry,tmpMat4);
							 //tmpMesh.rotateOnAxis(new THREE.Vector3(0,1,0),deg2rad(180));
							 tmpMesh.position.x = zastavaPos[i][0];
							 tmpMesh.position.z = zastavaPos[i][1];
							 tmpMesh.position.y = 0;

							 tmpMesh.scale.set(25,25,25);
							scene.add( tmpMesh );
							//var tmpGeometry = new THREE.BoxGeometry(50,20,50);
						}
					});
//////////////////////// ZIDOVI ////////////////////////////
tmpTexture = THREE.ImageUtils.loadTexture('assets/crate.gif');
var tmpGeometry = new THREE.BoxGeometry(50,50,1000);
			for(i=0; i<4;i++){

				 var tmpMesh = new THREE.Mesh(tmpGeometry,mat1);

				 tmpMesh.position.x = (i<2) ? -400*Math.pow(-1,i):0;
				 tmpMesh.position.y = 25;
				 tmpMesh.position.z = (i>=2) ? ((i==3)?400:300)*Math.pow(-1,i):0;
				 tmpMesh.rotateOnAxis(new THREE.Vector3(0,1,0),deg2rad((i<2)?0:90));
				scene.add( tmpMesh );
				stopColliderList.push(tmpMesh);
			}
/////////////////// SPEED BOOST ////////////////////////
	tmpGeometry = new THREE.BoxGeometry(100,3,200,1,1,1);
	var speedTexture = THREE.ImageUtils.loadTexture('assets/SpeedBoostTexture.png');
	var speedMat = new THREE.MeshLambertMaterial({map:speedTexture, transparent: true, opacity: 0.6});
	var speedMesh1 = new THREE.Mesh(tmpGeometry,speedMat);
			speedMesh1.position.set(300,5,-150);
	var	speedMesh2 = new THREE.Mesh(tmpGeometry,speedMat);
			speedMesh2.position.set(-300,5,-150);

			soundSpeed = new THREE.Audio( listener );
			soundSpeed.load( 'assets/speed.wav' );
			soundSpeed.setRefDistance( 200 );
			speedMesh2.add( soundSpeed );
			speedMesh1.add( soundSpeed );
					scene.add(speedMesh1);
					scene.add(speedMesh2);
					speedColliderList.push(speedMesh1);
					speedColliderList.push(speedMesh2);



//////////////// MODEL POLICA //////////////
			loadObject('assets/polica.json','assets/polica_tex1.png',new THREE.Vector3(0,0,-370),new THREE.Euler(0,deg2rad(180),0,'XYZ'),10,false);
///////////////////MILK CARTON// MLEKO//////////////////////
loader = new THREE.JSONLoader();
var tmpTexture5 = THREE.ImageUtils.loadTexture('assets/milkCarton.png');
var tmpMat5 = new THREE.MeshLambertMaterial({map:tmpTexture5});
loader.load('assets/milk_carton.json', function (geometry) {
				 mlekoMesh = new THREE.Mesh(geometry,tmpMat5);
				 startSpawnProducts();
		});

/////////////////SPAWN POINTS ///////////////////
		var spawnMaterial = new THREE.MeshPhongMaterial({
			color: 0x00ff00
		});
		var spawnGeometry = new THREE.RingGeometry(15,20,9);

		for(var i = 0; i<spawnLocations.length; i++){
		var spawnPoint = new THREE.Mesh(spawnGeometry,spawnMaterial);
		spawnPoint.position.x = spawnLocations[i][0];
		spawnPoint.position.z = spawnLocations[i][1];
		spawnPoint.position.y = -14.5;
		spawnPoint.rotateOnAxis(new THREE.Vector3(1,0,0),deg2rad(-90));
		scene.add(spawnPoint);
		}

//////////////////// LIGHTS /////////////////////

        var ambient = new THREE.AmbientLight( 0xeef0ff );
//				scene.add( ambient );

				directionalLight = new THREE.DirectionalLight( 0xeef0ff,1.1 );
				directionalLight.position.set( 0, 2, 1 );
				scene.add( directionalLight );
				directionalLight = new THREE.DirectionalLight( 0xeef0ff,1.1 );
				directionalLight.position.set( 0, 2, -1 );
				scene.add( directionalLight );

//////////////// PLAYER /////////////////////////////////
      loader = new THREE.JSONLoader();
        // init loading
        loader.load('assets/vozicek1.json', function (SSgeometry) {

          var texLoader = new THREE.TextureLoader();
          var mat;
texLoader.load(
	// resource URL
	'assets/vozicek1Texture.png',
	// Function when resource is loaded
	function (textr) {
		// do something with the texture
		p1Texture = textr;
		mat = new THREE.MeshPhongMaterial( {
			map: textr
		 } );
     player1 = new THREE.Mesh(
       SSgeometry,
       mat
     );


     player1.scale.set(10,10,10);
		 player1.position.x-=70;
		 player1.position.z = 220;
     scene.add(player1);
     console.log("added player1");

	},
	// Function called when download progresses
	function ( xhr ) {
		console.log( (xhr.loaded / xhr.total * 100) + '% loaded' );
	},
	// Function called when download errors
	function ( xhr ) {
		console.log( 'An error happened' );
	}
);
//vozicek 2
texLoader.load(
	// resource URL
	'assets/vozicek2Texture.png',
	// Function when resource is loaded
	function (textr) {
		// do something with the texture
		var mat2 = new THREE.MeshBasicMaterial( {
			map: textr
		 } );
		 p2Texture = textr;
		 player2 = new THREE.Mesh(
			 SSgeometry,
			 mat2
		 );
		 player2.scale.set(10,10,10);
		 player2.position.x+=70;
		 player2.position.z = 220;
		 scene.add(player2);

		 loadedMesh = true;
	},
	// Function called when download progresses
	function ( xhr ) {
		console.log( (xhr.loaded / xhr.total * 100) + '% loaded' );
	},
	// Function called when download errors
	function ( xhr ) {
		console.log( 'An error happened' );
	}
);
          // create a mesh with models geometry and material

        });



        renderer = new THREE.WebGLRenderer();
				renderer.setPixelRatio( window.devicePixelRatio );
				renderer.setSize( displayWidth, displayHeight );
        var c = document.getElementById("gameCanvas");
				c.appendChild( renderer.domElement );

				//


        document.onkeydown = handleKeyDown;
        document.onkeyup = handleKeyUp;
				window.addEventListener( 'resize', onWindowResize, false );
        animate();
			}
			function onScoreChange(){
				text2.innerHTML = score[0]+ " : "+score[1];
			}
			function onWindowResize() {
				displayWidth = window.innerWidth*0.6;
				displayHeight = window.innerHeight*0.75;
				//camera.aspect = displayWidth /displayHeight;
				camera.updateProjectionMatrix();
				text3.style.width = displayWidth/2;
				text3.style.height = displayHeight/10;
				text2.style.width = displayWidth/2;
				text2.style.height = displayHeight/10;
				text3.style.top = displayHeight + 'px';
				text3.style.left = displayWidth*0.5 + 'px';
				text2.style.top = displayHeight/100 + 'px';
				text2.style.left = displayWidth*0.5 + 'px';

				renderer.setSize( 	displayWidth, displayHeight );

			}
      function handleKeyDown(event) {
        // storing the pressed state for individual key
        currentlyPressedKeys[event.keyCode] = true;
      }

      function handleKeyUp(event) {
        // reseting the pressed state for individual key
        currentlyPressedKeys[event.keyCode] = false;
      }

      //
      // handleKeys
      //
      // Called every time before redeawing the screen for keyboard
      // input handling. Function continuisly updates helper variables.
      //
			function movePlayer(moveMesh,moveDir, rotAngle){
					moveMesh.rotateOnAxis(new THREE.Vector3(0,1,0),rotAngle);
					moveMesh.translateZ(moveDir);
			}
      function handleKeys() {

				var MoveAndRot = [];


					var rotateAngle = Math.PI / 2 * delta;
        if (currentlyPressedKeys[65]) {
          //A
					//player1.rotateOnAxis(new THREE.Vector3(0,1,0),rotateAngle);
					MoveAndRot.push(rotateAngle);
        } else if (currentlyPressedKeys[68]) {
          // Ds
					MoveAndRot.push(-rotateAngle);
					//player1.rotateOnAxis(new THREE.Vector3(0,1,0),-rotateAngle);

        }else{
					MoveAndRot.push(0);
				}

        if (currentlyPressedKeys[87]) {
          // W
					//player1.translateZ(-150*delta);
					MoveAndRot.push(-speed*delta);
				} else if (currentlyPressedKeys[83]) {
          // S
					MoveAndRot.push(speed*delta);
					//player1.translateZ(150*delta);
        }else{
					MoveAndRot.push(0);
				}

				//PLAYER 2

				if (currentlyPressedKeys[37]) {
					// Left cursor key
					MoveAndRot.push(rotateAngle);

					//player2.rotateOnAxis(new THREE.Vector3(0,1,0),rotateAngle);

				} else if (currentlyPressedKeys[39]) {
					// Right cursor key
						MoveAndRot.push(-rotateAngle);

					//player2.rotateOnAxis(new THREE.Vector3(0,1,0),-rotateAngle);
				}else{
					MoveAndRot.push(0);
				}
				if (currentlyPressedKeys[38] ) {
          // Up cursor key
						MoveAndRot.push(-speed*delta);
					//player2.translateZ(-150*delta);
        } else if (currentlyPressedKeys[40]) {
          // Down cursor key
					MoveAndRot.push(speed*delta);
					//player2.translateZ(150*delta);
        }else{
					MoveAndRot.push(0);
				}

				return MoveAndRot;
      }


			function restartGame(){
					player1.position.set(-70,0,220);
					player2.position.set(+70,0,220);
					text3.innerHTML = "";
					text2.innerHTML = "0 : 0";
					text3.style.top = displayHeight + 'px';
					text3.style.left = displayWidth*0.5 + 'px';
					text3.style.color = "black";
					timeLeft = 30;
					score = [0,0];
					scene.add(player1);
					scene.add(player2);
			}

			var secTimer = 0;
			function animate() {
				delta = clock.getDelta();
				timer+=delta;
				timeLeft-=delta;
				secTimer+=delta;
				if(secTimer > 1 && timeLeft > -1){
				text3.innerHTML = timeLeft.toFixed(0);
				secTimer=0;
			}else if(timeLeft < -1){
				text3.innerHTML = "  Game Over </br> Enter to restart";
				text3.style.top = displayHeight*0.3+'px';
				text3.style.left = displayWidth*0.4 + 'px';
				text3.style.color = "red";
				scene.remove(player1);
				scene.remove(player2);
				if(currentlyPressedKeys[13]){
						restartGame();
				}
			}
				requestAnimationFrame( animate );
				if(loadedMesh){
					var nextMove = handleKeys();
					movePlayer(player1,nextMove[1],nextMove[0]);
					hasSpeedCollided(player1,nextMove[1],nextMove[0]);
					hasStopCollided(player1)
					hasPlayerCollided(player1,player2);
					hasPredmetCollided(player1,1);

					movePlayer(player2,nextMove[3],nextMove[2]);
					hasSpeedCollided(player2,nextMove[3],nextMove[2])
					hasStopCollided(player2);
					hasPlayerCollided(player2,player1);
					hasPredmetCollided(player2,2);
					if(player1.position.z > 300 || player1.position.z < -390)
						player1.position.set(-20,0,250);
					if(player2.position.z > 300 || player2.position.z < -390)
						player2.position.set(-20,0,250);
				}
				if(mlekoLoaded){
					animateProducts();
					respawnProducts();
				}

				stats.update();
				renderer.render( scene, camera );

			}
