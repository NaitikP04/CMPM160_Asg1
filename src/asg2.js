// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE = `
  attribute vec4 a_Position;
  uniform float u_Size;
  void main() {
    gl_Position = a_Position; 
    gl_PointSize = u_Size; 
  }`

// Fragment shader program
var FSHADER_SOURCE =`
  precision mediump float;
  uniform vec4 u_FragColor;
  void main() {
    gl_FragColor = u_FragColor;
  }`

// Global variables
let canvas, gl, a_Position, u_FragColor, u_Size;

function setupWebGL() {
  // Retrieve <canvas> element
  canvas = document.getElementById('webgl');

  // Get the rendering context for WebGL
  // gl = getWebGLContext(canvas);
  gl = canvas.getContext("webgl", {preserveDrawingBuffer:true});
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }
}

function connectVariablesToGLSL() {
  // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }

  // // Get the storage location of a_Position
  a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return;
  }

  // Get the storage location of u_FragColor
  u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
  if (!u_FragColor) {
    console.log('Failed to get the storage location of u_FragColor');
    return;
  }

  // Get the storage location of u_Size
  u_Size = gl.getUniformLocation(gl.program, 'u_Size');
  if (!u_Size) {
    console.log('Failed to get the storage location of u_Size');
    return;
  }
}

// Constants
const POINT = 0;
const TRIANGLE = 1;
const CIRCLE = 2;

// Global UI variables
let g_selectedSize = 5; // default point size
let g_selectedSegments = 10; // default number of segments for circle
let g_selectedColor = [1.0, 1.0, 1.0, 1.0]; // white
let g_selectedType = POINT; // default shape type

// Actions for HTML UI
function addActionsforHtmlUI(){

  // Button Events 
  document.getElementById('green').onclick = function() { g_selectedColor = [0.0, 1.0, 0.0, 1.0]; };
  document.getElementById('red').onclick = function() { g_selectedColor = [1.0, 0.0, 0.0, 1.0]; };
  document.getElementById('blue').onclick = function() { g_selectedColor = [0.0, 0.0, 1.0, 1.0]; };

  // Clear Button Event
  document.getElementById('clear').onclick = function() { g_shapesList = []; renderAllShapes(); };

  // Shape Button Events
  document.getElementById('pointButton').onclick = function() { g_selectedType = POINT};
  document.getElementById('triangleButton').onclick = function() { g_selectedType = TRIANGLE};
  document.getElementById('circleButton').onclick = function() { g_selectedType = CIRCLE};

  // Drawing Button Event
  document.getElementById('makeDrawing').onclick = function() { g_shapesList = []; renderAllShapes(); makeDrawing();};

  // Slider Events
  const updateColorAndDisplay = (sliderId, colorIndex, displayId) => {
    const slider = document.getElementById(sliderId);
    const display = document.getElementById(displayId);

    slider.addEventListener('mouseup', function() {
      const value = this.value / 100;
      g_selectedColor[colorIndex] = value;
      display.textContent = value.toFixed(2);
    });
  };

  updateColorAndDisplay('redSlide', 0, 'redValue');
  updateColorAndDisplay('greenSlide', 1, 'greenValue');
  updateColorAndDisplay('blueSlide', 2, 'blueValue');

  const alphaSlider = document.getElementById('alphaSlide');
  const alphaDisplay = document.getElementById('alphaValue'); 
  alphaSlider.addEventListener('mouseup', function() {
    const value = this.value / 100;
    g_selectedColor[3] = value;
    alphaDisplay.textContent = value.toFixed(2);
  });

  // Size Slider Events
  const sizeSlider = document.getElementById('sizeSlide');
  const sizeDisplay = document.getElementById('sizeValue');
  sizeSlider.addEventListener('mouseup', function() {
    g_selectedSize = this.value;
    sizeDisplay.textContent = this.value;
  });

  // Segment Slider Events
  const segmentSlider = document.getElementById('segSlide');
  const segmentDisplay = document.getElementById('segValue');
  segmentSlider.addEventListener('mouseup', function() {
    g_selectedSegments = this.value;
    segmentDisplay.textContent = this.value;
  });

}


function makeDrawing() {
  // Define colors for triangles
  const colors = [
    [1, 1, 1, 1], // White
    [1, 0.5, 0, 1], // Orange
    [0, 0, 0, 1], // Black
    [0.2, 0.2, 0.2, 1], // Dark Gray
    [0.6, 0.4, 0.2, 1] // Brown
  ];

  // Function to create a triangle
  function createTriangle(v1, v2, v3, position = [0, 0, 0], size = 10, colorIndex = 0) {
    const tri = new Triangle();
    tri.position = position;
    tri.color = colors[colorIndex];
    tri.size = size;
    tri.setVertices(v1, v2, v3); 
    g_shapesList.push(tri);
  }

  //face
  createTriangle([-2, 1.5], [2, 1.5], [0, -2.5], [0, 0, 0], 50, 1); // Triangle 1
  //ears
  createTriangle([-2, 1.5], [-1, 1.5], [-2.25,2.5], [0, 0, 0], 50, 1); // Triangle 2
  createTriangle([2, 1.5], [1, 1.5], [2.25,2.5], [0, 0, 0], 50, 1); // Triangle 3
  createTriangle([-1.75, 1.5], [-1.25, 1.5], [-2, 2.1], [0, 0, 0], 50, 0); // Triangle 4
  createTriangle([1.75, 1.5], [1.25, 1.5], [2, 2.1], [0, 0, 0], 50, 0); // Triangle 5
  //eyes
  createTriangle([-1, 0.7], [-0.6, 0.7], [-1.1, 1], [0, 0, 0], 50, 3); // Triangle 6
  createTriangle([-0.6, 0.7], [-1.1, 1], [-0.7, 1],[0, 0, 0], 50, 3); // Triangle 7
  createTriangle([1, 0.7], [0.6, 0.7], [1.1, 1], [0, 0, 0], 50, 3); // Triangle 8
  createTriangle([0.6, 0.7], [1.1, 1], [0.7, 1],[0, 0, 0], 50, 3); // Triangle 9
  //fur
  createTriangle([-1.25, 0], [0, -0.5], [0, -2.5], [0, 0, 0], 50, 0); // Triangle 10
  createTriangle([1.25, 0], [0, -0.5], [0, -2.5], [0, 0, 0], 50, 0); // Triangle 11
  //nose
  createTriangle([-0.3, 0], [0.3, 0], [0, -0.7], [0, 0, 0], 50, 2); // Triangle 12
  //mouth
  createTriangle([-0.02, -1.3], [0.02, -1.3], [0, -0.7], [0, 0, 0], 50, 2); // Triangle 13
  createTriangle([0, -1.3], [-0.3, -1.25], [-0.5, -1.15], [0, 0, 0], 50, 2); // Triangle 14
  createTriangle([0, -1.3], [0.3, -1.25], [0.5, -1.15], [0, 0, 0], 50, 2); // Triangle 15
  //paws
  createTriangle([-2.2, -1], [-1.6, -1], [-1.9, -1.6], [0, 0, 0], 50, 4); // Triangle 16
  createTriangle([-1.9, -1], [-1.3, -1], [-1.6, -1.6], [0, 0, 0], 50, 4); // Triangle 17
  createTriangle([-2.2, -1], [-1.3, -1], [-1.75, -0.8], [0, 0, 0], 50, 4); // Triangle 18
  createTriangle([2.2, -1], [1.6, -1], [1.9, -1.6], [0, 0, 0], 50, 4); // Triangle 19
  createTriangle([1.9, -1], [1.3, -1], [1.6, -1.6], [0, 0, 0], 50, 4); // Triangle 20
  createTriangle([2.2, -1], [1.3, -1], [1.75, -0.8], [0, 0, 0], 50, 4); // Triangle 21

  renderAllShapes();
}

function main() {

  setupWebGL();
  connectVariablesToGLSL();

  addActionsforHtmlUI();

  // Register function (event handler) to be called on a mouse press
  canvas.onmousedown = click;
  canvas.onmousemove = function(ev){ if (ev.buttons==1) click(ev); };

  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);
}

var g_shapesList = [];

// var g_points = [];  // The array for the position of a mouse press
// var g_colors = [];  // The array to store the color of a point
// var g_sizes = [];  // The array to store the size of a point

function click(ev) {

  // Extract event click and convert to WebGL coordinates
  [x, y] = convertCoordinatesEvenToGL(ev);

  let point;
  if (g_selectedType == POINT) {
    point = new Point();
  } else if (g_selectedType == TRIANGLE) {
    point = new Triangle();
  } else { 
    point = new Circle();
  }
  point.position = [x, y];
  point.color = g_selectedColor.slice();
  point.size = g_selectedSize;
  if (point.type == 'circle') point.segments = g_selectedSegments;
  g_shapesList.push(point);

  // Draw all the shapes that are supposed to be on the canvas
  renderAllShapes();

}

function convertCoordinatesEvenToGL(ev){
  var x = ev.clientX; // x coordinate of a mouse pointer
  var y = ev.clientY; // y coordinate of a mouse pointer
  var rect = ev.target.getBoundingClientRect();

  x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
  y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);

  return ([x, y]);
}

function renderAllShapes(){

  // Get start time
  var startTime = performance.now();

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);

  // var len = g_points.length;
  var len = g_shapesList.length;

  for(var i = 0; i < len; i++) {
    g_shapesList[i].render();
  }

  var duration = performance.now() - startTime;
  sendTextToHTML("numdot: " + len + " ms: " + Math.floor(duration) + " fps: " + Math.floor(10000/duration)/10, "numdot");

}

// Set text of a HTML element
function sendTextToHTML(text, htmlID) {
  var htmlElm = document.getElementById(htmlID);
  if (!htmlElm) {
    console.log('Failed to retrieve the <' + htmlID + '> element');
    return;
  }
  htmlElm.innerHTML = text;
}
