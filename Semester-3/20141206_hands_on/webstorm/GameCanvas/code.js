console.log("Code.js loaded")
var canvas;
var ctx;
var shapes = [];
var cubes = [];
var cubeCreatedCnt = 0;
var colors = ['#FF0000', '#00FF00', '#0000FF'];
var boxes = [];
var points = 0;
var running = true;


$(init)


function init() {
    var test = new GamingController();
    test.init("gamescreen", "start", 5);
}

function onMouseUp(event) {
    event.preventDefault();
}

function onMouseMove(event) {
    event.preventDefault();
}

function onMouseDown(event) {
    event.preventDefault();
}