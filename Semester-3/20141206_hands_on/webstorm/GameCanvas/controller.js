/**
 * Created by cchet on 11/26/2014.
 */
var GamingController = function GamingControllerObject() {
    /* -------------------- Private members -------------------- */
    /**
     * The controlled canvas instance
     */
    var canvas = null,
        /**
         * The controlled canvas Context
         */
        canvasCtx = null,
        /**
         * Holds the shapes for the  game elements
         * @type {Array}
         */
        shapes = [],
        /**
         * Holds the cubes positioned on the game field
         * @type {Array}
         */
        elemets = [],
        /**
         * The counter for the on the gaming field positioned elemets
         * @type {number}
         */
        elementCount = 0,
        /**
         * The available color for the game elements
         * @type {string[]}
         */
        colors = ['#FF0000', '#00FF00', '#0000FF'],
        /**
         * The on the bottom of the game field placed boxes
         * @type {Array}
         */
        boxes = [],
        /**
         * Holds the played game results
         * @type {Array}
         */
        plays = [],
        /**
         * Boolean which indicates a running game
         * @type {boolean}
         */
        running = false,
        /**
         * The id of the set interval for unset interval
         */
        intervalId;

    var
        /**
         * The id of the game switch button
         */
        startButtonId,
        /**
         * The interval set for the game field
         */
        interval;

    this.init = function (_canvasId, _startButtonId, _interval) {
        startButtonId = _startButtonId;
        interval = _interval;

        /* Init canvas */
        canvas = document.getElementById(_canvasId);
        if (canvas == null) {
            throw new Error("Canvas not found for id '" + _canvasId + "'");
        }
        canvasCtx = canvas.getContext("2d");

        /* Init the game field */
        initGameField();
    }

    /* -------------------- Private section --------------------------- */


    function loop() {
        if (running) {
            update();
            draw();
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

    function gameSwitch() {
        var button = $("#" + startButtonId);
        if (running) {
            running = false;
            button.html("Start");
            window.clearInterval(intervalId);
        } else {
            running = true;
            button.html("Stop");
            intervalId = window.setInterval(loop, 1000.0 / 100.0);
        }
    }

    function initGameField() {
        /* create bottom boxes */
        var boxWidth = canvas.width / 3;
        var boxHeight = canvas.height - 40;

        boxes = [
            createShape(0, boxHeight, boxWidth, 40, colors[0]),
            createShape(boxWidth, boxHeight, boxWidth, 40, colors[1]),
            createShape(boxWidth * 2, boxHeight, boxWidth, 40, colors[2])
        ];

        /* Link to start button */
        var button = $("#" + startButtonId);
        button.html("Start");
        button.on("click", gameSwitch);
    }


    function update() {
        console.log("update called");
    }

    function draw() {
        console.log("draw called");
    }

    function hitTest(a, b) {
        return (a.x < (b.x + b.w)) && ((a.x + a.w) > b.x) && (a.y < (b.y + b.h)) && ((a.y + a.h) > b.y);
    }
}

var GamePlayTemplate = function GamePlayObject(startTime, endTime, points) {

}
