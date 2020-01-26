import fsSource from './shader.frag';
import vsSource from './shader.vert';

import * as dat from 'dat.gui';


class State {
    zoom: number;
    t: number;

    constructor() {
        this.zoom = 1.0;
        this.t = 1.2;
    }
}

const update = (state: State, guiState: GuiState) : State => {
    state.t += 0.001;
    if (state.t > 4.0) {
      state.t = 1.2;
    }
  
    state.zoom = guiState.zoom;

    return state;
}

class GuiState {
    zoom: number;

    constructor() {
        this.zoom = 300.0;
    }
}

const main = () => {
    let guiState = new GuiState();
    const gui = new dat.GUI();

    gui.add(guiState, 'zoom', 0.5, 1000.0);

    const canvas = document.querySelector('#canvas') as HTMLCanvasElement;
    const gl = canvas.getContext('webgl');

    const shaderProgram = initShaderProgram(gl, vsSource, fsSource);
  
    const programInfo = {
      program: shaderProgram,
      attribLocations: {
        pos: gl.getAttribLocation(shaderProgram, 'pos'),
      },
      uniformLocations: {
          zoom: gl.getUniformLocation(shaderProgram, 'zoom'),
          center: gl.getUniformLocation(shaderProgram, 'center'),
          t: gl.getUniformLocation(shaderProgram, 't'),
      },
    };
  
    const buffers = initBuffers(gl);

    let state = new State();

    const drawLoop = () => {
        state = update(state, guiState);

        const dim = resize(canvas);
        draw(gl, programInfo, buffers, state, dim);
        requestAnimationFrame(drawLoop);
    }

    drawLoop();
  }
  
  const initBuffers = (gl) => {
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  
    const positions = [
       1.0,  1.0,
      -1.0,  1.0,
       1.0, -1.0,
      -1.0, -1.0,
    ];
    
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

    return {
      position: positionBuffer,
    };
  }

  function resize(canvas) {
    const displayWidth  = canvas.clientWidth;
    const displayHeight = canvas.clientHeight;
    canvas.width  = displayWidth;
    canvas.height = displayHeight;


    return [canvas.width, canvas.height];
  }
  
  const draw = (gl, programInfo, buffers, state: State, dim) => {
    gl.viewport(0, 0, dim[0], dim[1]);
    gl.clearColor(0.0, 0.0, 0.0, 1.0); 
  
    gl.clear(gl.COLOR_BUFFER_BIT);
  
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
    gl.vertexAttribPointer(
        programInfo.attribLocations.vertexPosition,
        2,
        gl.FLOAT,
        false,
        0,
        0);
    gl.enableVertexAttribArray(
        programInfo.attribLocations.vertexPosition);
  
    gl.useProgram(programInfo.program);
  
    gl.uniform1f(programInfo.uniformLocations.t, state.t);
    gl.uniform1f(programInfo.uniformLocations.zoom, state.zoom);
    
    gl.uniform2f(programInfo.uniformLocations.center, dim[0] / 2.0, dim[1] / 2.0);

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }
  

  const initShaderProgram = (gl, vsSource, fsSource) => {
    const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
    const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);
  
    const shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
      alert('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
      return null;
    }
  
    return shaderProgram;
  }
  

  const loadShader = (gl, type, source) => {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
  
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      alert('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      return null;
    }
  
    return shader;
  }
  
  main();