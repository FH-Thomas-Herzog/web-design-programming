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
    canvas = document.getElementById("gamescreen");
    ctx = canvas.getContext("2d");

    /* create bottom boxes */
    var boxWidth = canvas.width / 3;
    var boxHeight = canvas.height - 40;

    var boxRed = createShape(0, boxHeight, boxWidth, 40, colors[0]);
    var boxGreen = createShape(boxWidth, boxHeight, boxWidth, 40, colors[1]);
    var boxBlue = createShape(boxWidth * 2, boxHeight, boxWidth, 40, colors[2]);
    boxes = [boxRed, boxGreen, boxBlue];

    window.setInterval(gameLoop, 1000.0 / 100.0);
    gameLoop();
    var test = new GamingController();
    test.init("gamescreen", "start", 5);
}

function gameLoop() {
    if (running) {
        update();
        draw();
    }
}

function update() {
    cubeCreatedCnt--;
    if (cubeCreatedCnt < 0) {
        cubeCreatedCnt = 30;
        createCube();
    }
    for (var i = cubes.length - 1; i >= 0; i--) {
        var cube = cubes[i];
        cube.y += 1;

        for (var j = boxes.length - 1; j >= 0; j--) {
            var box = boxes[j];
            if (hitTest(cube, box)) {
                if (cube.c === box.c) {
                    points++;
                    // delete from shapes array
                    var idx = shapes.indexOf(cube);
                    shapes.splice(idx, 1);
                    // delete from cubes array
                    cubes.splice(i, 1);
                } else {
                    running = false;
                }
                break;
            }
        }
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#000';
    ctx.font = 'bold 15px Verdana';
    ctx.fillText("Points: " + points, 5, 15);
    for (var i = 0; i < shapes.length; i++) {
        var shape = shapes[i];
        ctx.fillStyle = shape.c;
        ctx.fillRect(shape.x, shape.y, shape.w, shape.h);
    }
}

function createShape(x, y, w, h, c) {
    var shape = {};

    shape.x = x;
    shape.y = y;
    shape.w = w;
    shape.h = h;
    shape.c = c;

    shapes.push(shape);

    return shape;
}

function createCube() {
    var x = Math.random() * (canvas.width - 25);
    var randomColorIdx = Math.floor(Math.random() * 3);
    var c = colors[randomColorIdx];
    var y = 10;

    var cube = createShape(x, y, 25, 25, c);
    cubes.push(cube);
}

function hitTest(a, b) {
    return (a.x < (b.x + b.w)) && ((a.x + a.w) > b.x) && (a.y < (b.y + b.h)) && ((a.y + a.h) > b.y);
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