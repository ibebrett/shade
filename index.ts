import fsSource from './shader.frag';
import vsSource from './shader.vert';

import * as dat from 'dat.gui';


class State {
    offsetX: number;
    offsetY: number;
    t: number;
    top: number;

    constructor() {
        this.offsetX = 0.1;
        this.offsetY = 0.1;
        this.t = 0.0;
        this.top = 1000;
    }
}

const update = (state: State, guiState: GuiState) : State => {
    if (!guiState.update) {
        return state;
    }

    state.t = guiState.t;
    state.offsetX = guiState.offsetX;
    state.offsetY = guiState.offsetY;
    state.top = guiState.top

    return state;
}

class GuiState {
    offsetX: number;
    offsetY: number;
    update: boolean;
    t: number;
    top: number;

    constructor() {
        this.offsetX = 0.01;
        this.offsetY = 10.63;
        this.update = true;
        this.t = 2.0;
        this.top = 1000;
    }
}

const main = () => {
    let guiState = new GuiState();
    const gui = new dat.GUI();

    gui.add(guiState, 'offsetX', -1, 1);
    gui.add(guiState, 'offsetY', 0.0, 100.0);
    gui.add(guiState, 'update');
    gui.add(guiState, 't', 0.01, 200);
    gui.add(guiState, 'top', 10, 10000).step(1.0);

    const canvas = document.querySelector('#glcanvas') as HTMLCanvasElement;
    const gl = canvas.getContext('webgl');
    gl.viewport(0, 0, 1000, 1000);
  
    // If we don't have a GL context, give up now
  
    if (!gl) {
      alert('Unable to initialize WebGL. Your browser or machine may not support it.');
      return;
    }

    // Initialize a shader program; this is where all the lighting
    // for the vertices and so forth is established.
    const shaderProgram = initShaderProgram(gl, vsSource, fsSource);
  
    // Collect all the info needed to use the shader program.
    // Look up which attributes our shader program is using
    // for aVertexPosition, aVevrtexColor and also
    // look up uniform locations.
    const programInfo = {
      program: shaderProgram,
      attribLocations: {
        vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
        vertexColor: gl.getAttribLocation(shaderProgram, 'aVertexColor'),
      },
      uniformLocations: {
          offset: gl.getUniformLocation(shaderProgram, 'offset'),
          t: gl.getUniformLocation(shaderProgram, 't'),
          top: gl.getUniformLocation(shaderProgram, 'top'),
      },
    };
  
    // Here's where we call the routine that builds all the
    // objects we'll be drawing.
    const buffers = initBuffers(gl);

    // Run the main loop.
    let state = new State();

    const drawLoop = () => {
        state = update(state, guiState);

        drawScene(gl, programInfo, buffers, state);
        requestAnimationFrame(drawLoop);
    }

    drawLoop();
  }
  
  //
  // initBuffers
  //
  // Initialize the buffers we'll need. For this demo, we just
  // have one object -- a simple two-dimensional square.
  //
  function initBuffers(gl) {
  
    // Create a buffer for the square's positions.
  
    const positionBuffer = gl.createBuffer();
  
    // Select the positionBuffer as the one to apply buffer
    // operations to from here out.
  
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  
    // Now create an array of positions for the square.
  
    const positions = [
       1.0,  1.0,
      -1.0,  1.0,
       1.0, -1.0,
      -1.0, -1.0,
    ];
  
    // Now pass the list of positions into WebGL to build the
    // shape. We do this by creating a Float32Array from the
    // JavaScript array, then use it to fill the current buffer.
  
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
  
    // Now set up the colors for the vertices
  
    var colors = [
      1.0,  1.0,  1.0,  1.0,    // white
      1.0,  0.0,  0.0,  1.0,    // red
      0.0,  1.0,  0.0,  1.0,    // green
      0.0,  0.0,  1.0,  1.0,    // blue
    ];
  
    const colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
  
    return {
      position: positionBuffer,
      color: colorBuffer,
    };
  }
  
  //
  // Draw the scene.
  //
  function drawScene(gl, programInfo, buffers, state: State) {
    gl.clearColor(0.0, 0.0, 0.0, 1.0);  // Clear to black, fully opaque
    gl.clearDepth(1.0);                 // Clear everything
    gl.enable(gl.DEPTH_TEST);           // Enable depth testing
    gl.depthFunc(gl.LEQUAL);            // Near things obscure far things
  
    // Clear the canvas before we start drawing on it.
  
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  
    // Tell WebGL how to pull out the positions from the position
    // buffer into the vertexPosition attribute
    {
      const numComponents = 2;
      const type = gl.FLOAT;
      const normalize = false;
      const stride = 0;
      const offset = 0;
      gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
      gl.vertexAttribPointer(
          programInfo.attribLocations.vertexPosition,
          numComponents,
          type,
          normalize,
          stride,
          offset);
      gl.enableVertexAttribArray(
          programInfo.attribLocations.vertexPosition);
    }
  
    // Tell WebGL how to pull out the colors from the color buffer
    // into the vertexColor attribute.
    {
      const numComponents = 4;
      const type = gl.FLOAT;
      const normalize = false;
      const stride = 0;
      const offset = 0;
      gl.bindBuffer(gl.ARRAY_BUFFER, buffers.color);
      gl.vertexAttribPointer(
          programInfo.attribLocations.vertexColor,
          numComponents,
          type,
          normalize,
          stride,
          offset);
      gl.enableVertexAttribArray(
          programInfo.attribLocations.vertexColor);
    }
  
    // Tell WebGL to use our program when drawing
  
    gl.useProgram(programInfo.program);
  
    // Set uniforms
    gl.uniform2f(programInfo.uniformLocations.offset, state.offsetX, state.offsetY);
    gl.uniform1f(programInfo.uniformLocations.t, state.t);
    gl.uniform1i(programInfo.uniformLocations.top, state.top);


    // Set the shader uniforms
    {
      const offset = 0;
      const vertexCount = 4;
      gl.drawArrays(gl.TRIANGLE_STRIP, offset, vertexCount);
    }
  }
  
  //
  // Initialize a shader program, so WebGL knows how to draw our data
  //
  function initShaderProgram(gl, vsSource, fsSource) {
    const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
    const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);
  
    // Create the shader program
  
    const shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);
  
    // If creating the shader program failed, alert
  
    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
      alert('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
      return null;
    }
  
    return shaderProgram;
  }
  
  //
  // creates a shader of the given type, uploads the source and
  // compiles it.
  //
  function loadShader(gl, type, source) {
    const shader = gl.createShader(type);
  
    // Send the source to the shader object
  
    gl.shaderSource(shader, source);
  
    // Compile the shader program
  
    gl.compileShader(shader);
  
    // See if it compiled successfully
  
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      alert('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      return null;
    }
  
    return shader;
  }
  main();