/**
 * Created by cchet on 11/26/2014.
 */
/* -------------------- Template section --------------------------- */
var ShapeObject = function () {
    this.x = 0;
    this.y = 0;
    this.w = 0;
    this.h = 0;
    this.c = "#000";

    this.init = function (x, y, w, h, c) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.c = c;
    }
};

var GameShape = function (move) {
    this.move = move;
    this.selected = false;

    this.isSelected = function (mousePos) {
        return ((mousePos.x >= this.x) && (mousePos.x <= (this.x + this.w))) && ((mousePos.y >= this.y) && (mousePos.y <= (this.y + this.h)))
    };

    this.setMouseRelatedPos = function (mousePos) {
        if (this.selected) {
            this.x = mousePos.x;
            this.y = (mousePos.y >= this.y) ? mousePos.y : this.y;
        } else {
            console.log("Element not selected !!!");
        }
    };
};
GameShape.prototype = new ShapeObject();


var GamePlay = function GamePlayObject() {
    this.duration = 0;
    this.points = 0;

    this.durationCounter = function () {
        counter++;
    }

    this.increasePoints = function () {
        this.points++;
    }
}

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
        elements = [],
        /**
         * The counter for the on the gaming field positioned elements
         * @type {number}
         */
        elementCount = 0,
        /**
         * The count of played games
         * @type {number}
         */
        playCount = 0,
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
         * The current played game
         */
        currentGame,
        /**
         * Boolean which indicates a running game
         * @type {boolean}
         */
        running = false;

    /* -------------------- Internal constant section --------------------------- */
    var
        /**
         * The id of the set interval for unset interval
         */
        intervalId,
        /**
         * The id of the game switch button
         */
        startButtonId,
        /**
         * The interval set for the game field
         */
        interval,
        /**
         * The height of the drawed header.
         */
        headerHeight = 30;
    ;

    /* -------------------- Private section --------------------------- */
    var
        loop = function () {
            if (running) {
                var hitCtx = update();
                /* Cube not null means hit */
                if (hitCtx != null) {
                    if (handleHit(hitCtx.element, hitCtx.box)) {
                        draw();
                    }
                }
                else {
                    draw();
                }
            }
        },
        createShape = function (x, y, w, h, c) {
            var shape = new GameShape(true);
            shape.init(x, y, w, h, c);

            shapes.push(shape);
            return shape;
        },
        createCube = function () {
            var x = Math.random() * (canvas.width - 25);
            var randomColorIdx = Math.floor(Math.random() * 3);
            var c = colors[randomColorIdx];
            var y = 10;

            elements.push(createShape(x, y, 25, 25, c));
            elementCount++;
        },
        gameSwitch = function () {
            var button = $("#" + startButtonId);
            if (running) {
                stop();
                button.html("Start");
                window.clearInterval(intervalId);
            } else {
                start();
                button.html("Stop");
                intervalId = window.setInterval(loop, 1000.0 / 100.0);
            }
        },
        initGameField = function () {

            initBoxes();

            /* Link to start button */
            var button = $("#" + startButtonId);
            button.html("Start");
            button.on("click", gameSwitch);
        },
        start = function () {
            elements = [];
            elementCount = 0;
            currentGame = new GamePlay();
            playCount++;
            running = true;
            canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
            setMoveItemEvents();
            initBoxes();
        },
        stop = function () {
            plays[playCount] = currentGame;
            clearGame();
            running = false;
            canvas.removeEventListener("mousedown", handleMouseDown, false);
            removeMoveItemEvents();
            /* TODO: Save game */
        },
        update = function () {
            elementCount--;
            if (elementCount < 0) {
                elementCount = 30;
                createCube();
            }
            for (var i = elements.length - 1; i >= 0; i--) {
                var element = elements[i];

                /* check if shape shall be moved */
                if (element.move) {
                    element.y += 1;
                }

                for (var j = boxes.length - 1; j >= 0; j--) {
                    var box = boxes[j];
                    if (hitTest(element, box)) {
                        return {
                            element: element,
                            box: box
                        };
                    }
                }
            }

            return null;
        }
        ,
        clearGame = function () {
            elements = [];
            shapes = [];
            elementCount = 0;
        }
        ,
        draw = function () {
            canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
            canvasCtx.fillStyle = '#000';
            canvasCtx.font = 'bold 15px Verdana';
            canvasCtx.fillText("Points: " + currentGame.points, 5, 15);
            for (var i = 0; i < shapes.length; i++) {
                var shape = shapes[i];
                canvasCtx.fillStyle = shape.c;
                canvasCtx.fillRect(shape.x, shape.y, shape.w, shape.h);
            }
        }
        ,
        drawError = function () {
            canvasCtx.fillStyle = '#000';
            canvasCtx.font = 'bold 15px Verdana';
            canvasCtx.fillText("You are dead", (canvas.width / 2), (canvas.height / 2));
        }
        ,
        hitTest = function (a, b) {
            return (a.x < (b.x + b.w)) && ((a.x + a.w) > b.x) && (a.y < (b.y + b.h)) && ((a.y + a.h) > b.y);
        }
        ,
    /* -------------------- Event handler section --------------------------- */
        handleHit = function (element, box) {
            if (element.c === box.c) {
                currentGame.increasePoints();
                removeElement(element);
                return true;
            } else {
                removeMoveItemEvents();
                /* Draw error on canvas */
                drawError();
                gameSwitch();
                return false;
                /* TODO: Keep game status */
            }
        }
        ,
        setMoveItemEvents = function () {
            $(canvas).mousedown(handleMouseDown);
            $(canvas).mousemove(handleMouseMove);
            $(canvas).mouseup(handleMouseUp);
            $(canvas).on('touchstart', handleMouseDown);
            $(canvas).on('touchmove', handleMouseMove);
            $(canvas).on('touchend', handleMouseUp);
        }
        ,
        removeMoveItemEvents = function () {
        }
        ,
        handleMouseDown = function (evt) {
            var mousePtr = getCanvasMousePosition(evt);
            var idx = getClickedElementIdx(mousePtr);
            if (idx >= 0) {
                var element = elements[idx];
                element.move = false;
                element.selected = true;
            }
        }
        ,
        handleMouseUp = function (evt) {
            for (var i = 0; i < elements.length; i++) {
                var element = elements[i];
                element.move = true;
                element.selected = false;
            }
        }
        ,
        handleMouseMove = function (evt) {
            var mousePtr = getCanvasMousePosition(evt);
            var idx = getSelectedElementIdx(mousePtr);
            if (idx >= 0) {
                elements[idx].setMouseRelatedPos(mousePtr);
            }
        }
        ,
    /* -------------------- Utility function section --------------------------- */
        getClickedElementIdx = function (mousePtr) {
            var i = 0;
            if (elements.length > 0) {
                while ((i < (elements.length - 1)) && (!elements[i].isSelected(mousePtr))) {
                    i++;
                }
                i = (i == (elements.length - 1)) ? -1 : i;
            } else {
                i = -1;
            }
            return i;
        }
        ,
        getSelectedElementIdx = function () {
            var i = 0;
            if (elements.length > 0) {
                while ((elements.length != 0) && (i < (elements.length - 1)) && (!elements[i].selected)) {
                    i++;
                }
                i = (i == (elements.length - 1)) ? -1 : i;
            } else {
                i = -1;
            }
            return i;
        }
        ,
        getCanvasMousePosition = function (evt) {
            var rect = canvas.getBoundingClientRect();
            return {
                x: (evt.clientX - rect.left),
                y: (evt.clientY - rect.top)
            };
        }
        ,
        removeElement = function (element) {
            shapes.splice(shapes.indexOf(element), 1);
            // delete from cubes array
            elements.splice(elements.indexOf(element), 1);
        }
        ,
        initBoxes = function () {
            /* create bottom boxes */
            var boxWidth = canvas.width / 3;
            var boxHeight = canvas.height - 40;

            boxes = [
                createShape(0, boxHeight, boxWidth, 40, colors[0]),
                createShape(boxWidth, boxHeight, boxWidth, 40, colors[1]),
                createShape(boxWidth * 2, boxHeight, boxWidth, 40, colors[2])
            ];
        };
    /* -------------------- Public section --------------------------- */
    this.init = function init(_canvasId, _startButtonId, _interval) {
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
    };
}

