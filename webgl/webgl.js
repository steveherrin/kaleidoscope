"use strict";

function createShader(gl, type, source) {
  var shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
  if (success) {
    return shader;
  }

  console.log(gl.getShaderInfoLog(shader));
  gl.deleteShader(shader);
}

function createProgram(gl, vertexShader, fragmentShader) {
  var program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  var success = gl.getProgramParameter(program, gl.LINK_STATUS);
  if (success) {
    return program;
  }

  console.log(gl.getProgramInfoLog(program));
  gl.deleteProgram(program);
}

function resizeCanvasToClientSize(canvas) {
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
  }
}

function render(image) {
  // --- initialization boilerplate ---
  var canvas = document.getElementById("webgl-canvas");
  var gl = canvas.getContext("webgl");
  if (!gl) {
    return;
  }

  var vertexShaderSource = document.getElementById("vertex-shader").text;
  var fragmentShaderSource = document.getElementById("fragment-shader").text;

  var vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
  var fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

  var program = createProgram(gl, vertexShader, fragmentShader);

  // --- end of boilerplate ---
  // --- initialization ---

  var drawBoxCoordLoc = gl.getAttribLocation(program, "a_drawBoxCoord");
  var textureCoordLoc = gl.getAttribLocation(program, "a_textureCoord");

  var drawBoxBuffer = gl.createBuffer();

  gl.bindBuffer(gl.ARRAY_BUFFER, drawBoxBuffer);
  const drawBoxCorners = [
    0, 0,
    image.width, 0,
    0, image.height,
    0, image.height,
    image.width, 0,
	  image.width, image.height,
  ];
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(drawBoxCorners), gl.STATIC_DRAW);

  var textureCoordBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordBuffer);
  const textureCorners = [
    0.0, 0.0,
    1.0, 0.0,
    0.0, 1.0,
    0.0, 1.0,
    1.0, 0.0,
    1.0, 1.0,
  ];
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCorners), gl.STATIC_DRAW);

  var texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

  var resolutionLoc = gl.getUniformLocation(program, "u_resolution");

  // --- rendering --- 

  resizeCanvasToClientSize(gl.canvas);

  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

  gl.clearColor(0, 0, 0, 0);
  gl.clear(gl.COLOR_BUFFER_BIT);

  gl.useProgram(program);

  gl.enableVertexAttribArray(drawBoxCoordLoc);
  gl.bindBuffer(gl.ARRAY_BUFFER, drawBoxBuffer);

  const size = 2;
  const type = gl.FLOAT;
  const normalize = false;
  const stride = 0;
  const offset = 0;
  gl.vertexAttribPointer(
      drawBoxCoordLoc, size, type, normalize, stride, offset);

  gl.enableVertexAttribArray(textureCoordLoc);
  gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordBuffer)

  gl.vertexAttribPointer(
      textureCoordLoc, size, type, normalize, stride, offset);

  gl.uniform2f(resolutionLoc, gl.canvas.width, gl.canvas.height);

  // --- draw ---
  const primitiveType = gl.TRIANGLES;
  const draw_offset = 0;
  const count = drawBoxCorners.length / size;
  gl.drawArrays(primitiveType, offset, count);

}

function main() {

  var image = new Image();
  image.src = "test_image.png";
  image.onload = function() {
    render(image);
  }
}

main();
