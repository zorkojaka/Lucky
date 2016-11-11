var canvas;
var gl;

function initGL(canvas) { // inicializiraj GL kontekst
  gl = null;
  try { // poskusimo dobiti novo instanco gl konteksta
    gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
  }
  catch(e) {}
  if (!gl) {
    alert("Unable to initialize WebGL. Your browser may not support it.");
  }
  return gl;
}

function drawScene() {
  // set the rendering environment to full canvas size
  gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
  // Clear the canvas before we start drawing on it.
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  
  // Establish the perspective with which we want to view the
  // scene. Our field of view is 45 degrees, with a width/height
  // ratio and we only want to see objects between 0.1 units
  // and 100 units away from the camera.
  mat4.perspective(45, gl.viewportWidth / gl.viewportHeight, 0.1, 100.0, pMatrix);

  // Set the drawing position to the "identity" point, which is
  // the center of the scene.
  mat4.identity(mvMatrix);

  // Now move the drawing position a bit to where we want to start
  // drawing the cube.
  mat4.translate(mvMatrix, [0.0, 0.0, positionCubeZ]);

  // Rotate before we draw.
  mat4.rotate(mvMatrix, degToRad(rotationCubeX), [1, 0, 0]);
  mat4.rotate(mvMatrix, degToRad(rotationCubeY), [0, 1, 0]);
  mat4.rotate(mvMatrix, degToRad(rotationCubeZ), [0, 0, 1]);

  // Draw the cube by binding the array buffer to the cube's vertices
  // array, setting attributes, and pushing it to GL.
  gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexPositionBuffer);
  gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, cubeVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
  
  // Set the texture coordinates attribute for the vertices.
  gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexTextureCoordBuffer);
  gl.vertexAttribPointer(shaderProgram.textureCoordAttribute, cubeVertexTextureCoordBuffer.itemSize, gl.FLOAT, false, 0, 0);

  // Specify the texture to map onto the faces.
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, cubeTextureSet[filter]);
  gl.uniform1i(shaderProgram.samplerUniform, 0);

  // Draw the cube.
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeVertexIndexBuffer);
  setMatrixUniforms();
  gl.drawElements(gl.TRIANGLES, cubeVertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
}
function animate() {
  var timeNow = new Date().getTime();
  if (lastTime != 0) {
    var elapsed = timeNow - lastTime;

    // rotate the cube for a small amount
    rotationCubeX += (rotationVelocityCubeX * elapsed) / 1000.0;
    rotationCubeY += (rotationVelocityCubeY * elapsed) / 1000.0;
  }
  lastTime = timeNow;
}

//
// Keyboard handling helper functions
//
// handleKeyDown    ... called on keyDown event
// handleKeyUp      ... called on keyUp event
//
function handleKeyDown(event) { // ko pritisnemo tipko
  // storing the pressed state for individual key
  currentlyPressedKeys[event.keyCode] = true; // tipka z določeno kodo je trenutno pritisnjena

  // handling single keypress for switching filters
  if (String.fromCharCode(event.keyCode) == "F") { // če pritisnemo tipko za menjavo filtrov
    filter += 1;
    if (filter == 3) {
      filter = 0;
    }
  }
}

function handleKeyUp(event) { // ko spustimo tipko
  // reseting the pressed state for individual key
  currentlyPressedKeys[event.keyCode] = false;
}

//
// handleKeys
//
// Called every time before redeawing the screen for keyboard
// input handling. Function continuisly updates helper variables.
//
function handleKeys() {
  if (currentlyPressedKeys[33]) {
    // Page Up == koda 33
    positionCubeZ -= 0.05;
  }
  if (currentlyPressedKeys[34]) {
    // Page Down
    positionCubeZ += 0.05;
  }
  if (currentlyPressedKeys[37]) {
    // Left cursor key
    rotationVelocityCubeY -= 1;
  }
  if (currentlyPressedKeys[39]) {
    // Right cursor key
    rotationVelocityCubeY += 1;
  }
  if (currentlyPressedKeys[38]) {
    // Up cursor key
    rotationVelocityCubeX -= 1;
  }
  if (currentlyPressedKeys[40]) {
    // Down cursor key
    rotationVelocityCubeX += 1;
  }
}
function start() {
  canvas = document.getElementById("glcanvas");
  gl = initGL(canvas);
  if (gl) {
	// rgb(alfa - prosojnost) 
    gl.clearColor(0.0, 0.0, 0.0, 1.0);  // Set clear color to black, fully opaque
    // vse globinske vrednosti pikslov so 1 (vsi so isto oddaljeni)
	gl.clearDepth(1.0); // Clear everything
    // vključimo globinsko testiranje
	gl.enable(gl.DEPTH_TEST);   // Enable depth testing
    // določimo kakšna naj bo funkcija izračuna globine
	// LEQUAL - tiste ki so manjše/enake (bližje opazovalcu) se zapišejo v medpomnilnik -> načeloma bo videl tiste spredaj, tistih zadaj pa ne, zato se bodo prepisovale
	gl.depthFunc(gl.LEQUAL);   	// Near things obscure far things
    // pobrišemo vsebino izrisovalnega polja
	// pobrišemo barvni & globinski medpomnilnik
	gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);      // Clear the color as well as the depth buffer.
	
	// Bind keyboard handling functions to document handlers
    document.onkeydown = handleKeyDown; // proži to metodo (brez oklepajev!)
    document.onkeyup = handleKeyUp;
    
    // Set up to draw the scene periodically.
    setInterval(function() {
        requestAnimationFrame(animate);
        handleKeys();
        drawScene();
    }, 15);
  }
}