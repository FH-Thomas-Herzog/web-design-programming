/**
 * Created by cchet on 11/26/2014.
 */
/* -------------------- Template section --------------------------- */
var
    /**
     * This object represents a shape object which can be defined within a cube shape.
     * @constructor
     *          This object is initialized via init() function.
     */
    ShapeObject = function () {
        this.x = 0;
        this.y = 0;
        this.w = 0;
        this.h = 0;

        /**
         * Initializes the shape object by setting its dimension members
         * @param x the x position in the canvas
         * @param y the y position in the canvas
         * @param w the width of the shape within the cube
         * @param h the height of the shape within in the cube
         */
        this.initShape = function (x, y, w, h) {
            this.x = x;
            this.y = y;
            this.w = w;
            this.h = h;
        }
    }
    ,
    /**
     * The base shape object which can be used for any placed element on the game field.
     * @constructor
     */
    BaseShapeObject = function () {
        this.c = "#000";

        this.initBase = function (x, y, w, h, color) {
            this.c = color;
            this.initShape(x, y, w, h);
        }
    }
    ,
    /**
     * This object represents the default shape object which is an colored cube.
     * @param move the flag which indicates if this shape is movable or not.
     * @param color the color of the cube
     * @constructor (move, color)
     */
    GameCubeShapeObject = function (x, y, w, h, color, move) {
        this.move = move;
        this.selected = false;

        /* init object instance */
        this.initBase(x, y, w, h, color);

        /**
         * Answers teh question if this element is selected or not
         * @param mousePos the object which provides the mouse position.
         * @returns {boolean} true if this element is selected, false otherwise.
         */
        this.isSelected = function (mousePos) {
            return ((mousePos.x >= this.x) && (mousePos.x <= (this.x + this.w))) && ((mousePos.y >= this.y) && (mousePos.y <= (this.y + this.h)))
        };

        /**
         * Sets the position of this element depending ont he given mouse position
         * @param mousePos the object providing the mouse position coordinates
         */
        this.setMouseRelatedPos = function (mousePos) {
            if (this.selected) {
                this.x = mousePos.x;
                this.y = (mousePos.y >= this.y) ? mousePos.y : this.y;
            } else {
                console.log("Element not selected but tried to repositioned !!!");
            }
        };
    }
    ,
    /**
     * The shape representing the goody element.
     * @param x the x coordinate of the goody
     * @param y the y coordinate of the goody
     * @param w the width of the goody
     * @param h the height of the gody
     * @param color the color of the goody
     * @constructor (x, y, w, h, color)
     */
    GoddyShapeObject = function (x, y, w, h, color) {
        this.initBase(x, y, w, h, color);
    }
    ,
    /**
     * The object which represents a played game.
     * @constructor ()
     */
    GamePlay = function GamePlayObject() {
        this.points = 0;
        this.status = "running";

        var
            durationInterval = 0,
            counter = 1;

        /**
         * Increases the duration counter by one.
         */
        this.increaseDuration = function () {
            counter++;
        };

        /**
         * Increases the points by one.
         */
        this.increasePoints = function () {
            this.points++;
        };

        /**
         * Starts the game within this object and register the interval for duration increasing.
         */
        this.start = function () {
            this.points = 0;
            durationInterval = setInterval(this.increaseDuration, 1000);
        };

        /**
         * Stops the game within this object by removing the interval
         */
        this.stop = function () {
            clearInterval(durationInterval);
        };

        /**
         * Provides the current duration value.
         * @returns {number}
         */
        this.getDuration = function () {
            return counter;
        }


        this.markAsCancled = function () {
            this.status = "cancled";
        }

        this.markAsLost = function () {
            this.status = "lost";
        }

        this.isCancled = function () {
            return this.status === "cancled";
        }

        this.isLost = function () {
            return this.status === "lost";
        }

        this.isRunning = function () {
            return this.status === "running";
        }
    };

/* define prototypes for the defined objects */
BaseShapeObject.prototype = new ShapeObject();
GameCubeShapeObject.prototype = new BaseShapeObject();
GoddyShapeObject.prototype = new BaseShapeObject();

/**
 * This object represents the gaming controller which hanldes the game runtime.
 * @constructor
 */
var GamingController = function GamingControllerObject() {
    /* -------------------- Private members -------------------- */

    var
        /**
         * The controlled canvas instance
         */
        canvas = null,
        /**
         * The controlled canvas Context
         */
        canvasCtx = null,
        /**
         * The game switch button
         */
        button = null,
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
         * The iteration counter which defines when a new element shall be added.
         * @type {number}
         */
        iterationCount = 0,
        /**
         * The current played game
         */
        currentGame = null,
        /**
         * The current present goody on the game field.
         * @type {null}
         */
        goody = null,
        /**
         * The current speed of the elements
         */
        speed = 0;

    /* -------------------- Internal constant section --------------------------- */
    var
        /**
         * The id of the set interval for unset interval
         */
        loopInterval,
        /**
         * The interval for increasing the speed
         */
        moveInterval,
        /**
         * The height of the drawed header.
         */
        headerHeight = 30,
        /**
         * The height of the game elements
         * @type {number}
         */
        elementHeight = 25,
        /**
         * the width of the game elements
         * @type {number}
         */
        elementWidth = 25;
    ;

    /* -------------------- Private section --------------------------- */
    var
    /* -------------------- Controller section --------------------------- */
        /**
         * The game switch which switches from start -> stop and visa versa.
         */
        gameSwitch = function () {
            if (currentGame != null) {
                stop();
                button.html("Start");
            } else {
                start();
                button.html("Stop");
            }
        }
        ,
        /**
         * Starts teh game by preparing all related variables and contexts.
         */
        start = function () {
            /* Reset the variables */
            elements = [];
            iterationCount = 0;
            speed = 1;

            /* init new game */
            currentGame = new GamePlay();
            currentGame.start();

            /* clear game field */
            canvasCtx.clearRect(0, 0, canvas.width, canvas.height);

            /* register events */
            registerGameEvents();

            /* draw the boxes */
            initBoxes();
        }
        ,
        /**
         * Stops the game by saving the game play in the backed array and reseting of the game.
         */
        stop = function () {
            /* Save current game */
            currentGame.stop();
            plays.push(currentGame);
            currentGame = null;

            /* Clear the game state */
            clearGame();
            initBoxes();

            /* Remove registered event */
            unregistereGameEvents();

            /* Update game history */
            handleDisplayHistory();
        }
        ,
        /**
         * The loop function which gets called via interval.
         * Here the drawing and hit test are performed.
         */
        loop = function () {
            if (currentGame != null) {
                var hitCtx = update();
                /* Cube not null means hit */
                if (hitCtx != null) {
                    /* handle invalid hit */
                    if (!handleHit(hitCtx.element, hitCtx.box)) {
                        currentGame.markAsLost();
                    }
                }
                /* draw game filed */
                draw();
                /* stop game if game is lost */
                if (currentGame.isLost()) {
                    gameSwitch();
                }
            }
        }
        ,
        /**
         * The iupdate function which updates the canvas elements.
         * @returns {*} a object containing the element and the hit box
         *          for check if the element is suitable for the hit box, or null if no hit occurred.
         */
        update = function () {
            var hitCtx = null;

            /* Add a cube each 30 iteration */
            iterationCount--;
            if (iterationCount < 0) {
                iterationCount = 30;
                createCube();
            }

            /* Add goody each 5 seconds */
            if ((goody == null) && ((currentGame.getDuration() % 5) === 0)) {
                goody = createGoody();
            }

            /* Move goody through game field */
            if (goody != null) {
                goody.y += (speed * 2);
            }

            /* iterate over the game elements */
            for (var i = elements.length - 1; i >= 0; i--) {
                var element = elements[i];

                /* check if shape shall be moved */
                if (element.move) {
                    element.y += speed;
                }

                /* hit test for goody on elements */
                if ((goody != null) && (hitTest(goody, element))) {
                    removeElement(element);
                    currentGame.increasePoints();
                }
                /* if not hit by goody then check for box hit */
                else {

                    /* hit test for bottom boxes on elements and goody */
                    for (var j = boxes.length - 1; j >= 0; j--) {
                        var box = boxes[j];
                        /* return result if hit occurred */
                        if ((hitCtx == null) && (hitTest(element, box))) {
                            hitCtx = {
                                element: element,
                                box: box
                            };
                        }
                        /* Remove if bottom boxes are reached */
                        if ((goody != null) && (hitTest(goody, box))) {
                            shapes.splice(shapes.indexOf(goody), 1);
                            goody = null;
                        }
                    }
                }
            }

            return hitCtx;
        }
        ,
    /* -------------------- Draw handler section --------------------------- */
        /**
         * Draws the game filed elements
         */
        draw = function () {
            /* clear game field */
            canvasCtx.clearRect(0, 0, canvas.width, canvas.height);

            /* draw field borders */
            canvasCtx.fillStyle = '#000';
            canvasCtx.strokeRect(0, 0, canvas.width, canvas.height);

            /* draw the header */
            drawHeader();

            /* draw error if game is lost  */
            if (currentGame.isLost()) {
                drawError();
            }

            /* draw the elements */
            for (var i = 0; i < shapes.length; i++) {
                var shape = shapes[i];
                canvasCtx.fillStyle = shape.c;
                canvasCtx.fillRect(shape.x, shape.y, shape.w, shape.h);

                /* draw field borders */
                canvasCtx.fillStyle = '#000';
                canvasCtx.strokeRect(shape.x, shape.y, shape.w, shape.h);
            }
        }
        ,
        /**
         * Draws the header.
         */
        drawHeader = function () {
            canvasCtx.fillStyle = '#000';
            canvasCtx.font = 'bold 12px Verdana';
            canvasCtx.fillText("Points: " + currentGame.points + " | Duration: " + currentGame.getDuration(), 5, headerHeight);

            /* draw header borders */
            canvasCtx.fillStyle = '#000';
            canvasCtx.strokeRect(0, 0, canvas.width, headerHeight + 5);
        }
        ,
        /**
         * Draws the error message if the game stops because of an invalid hit.
         */
        drawError = function () {
            canvasCtx.fillStyle = '#000';
            canvasCtx.font = 'bold 15px Verdana';
            canvasCtx.fillText("You are dead", (canvas.width / 2), (canvas.height / 2));
        }
        ,
    /* -------------------- Event handler section --------------------------- */
        /**
         * Registers the events needed during the game
         */
        registerGameEvents = function () {
            /* registered mouse events */
            $(canvas).mousedown(handleMouseDown);
            $(canvas).mousemove(handleMouseMove);
            $(canvas).mouseup(handleMouseUp);
            $(canvas).on('touchstart', handleMouseDown);
            $(canvas).on('touchmove', handleMouseMove);
            $(canvas).on('touchend', handleMouseUp);

            /* registered intervals */
            loopInterval = window.setInterval(loop, 1000.0 / 25.0);
            moveInterval = window.setInterval(function () {
                speed++;
            }, 5000);
        }
        ,
        /**
         * Unregisters the set event which are used during a running game.
         */
        unregistereGameEvents = function () {
            canvas.removeEventListener("mousedown", handleMouseDown, false);

            /* clear intervals */
            window.clearInterval(loopInterval);
            window.clearInterval(moveInterval);
        }
        ,
        /**
         * Handles the hit of an element with an box.
         * @param element the element which hit the box
         * @param box the box which got hit
         * @returns {boolean} true if it was an valid hit, false otherwise
         */
        handleHit = function (element, box) {
            if (element.c === box.c) {
                currentGame.increasePoints();
                removeElement(element);
                return true;
            } else {
                return false;
            }
        }
        ,
        /**
         * Handles the mouse move down event by marking an element as clicked
         * @param evt the event object
         */
        handleMouseDown = function (evt) {
            var mousePtr = canvasMousePosition(evt);
            var idx = clickedElementIdx(mousePtr);
            if (idx >= 0) {
                var element = elements[idx];
                element.move = false;
                element.selected = true;
            }
        }
        ,
        /**
         * Handles the mouse up event by releasing tee clicked element
         * @param evt the event object
         */
        handleMouseUp = function (evt) {
            for (var i = 0; i < elements.length; i++) {
                var element = elements[i];
                element.move = true;
                element.selected = false;
            }
        }
        ,
        /**
         * Handles the mouse move event by moving the clicked element.
         * @param evt the event object
         */
        handleMouseMove = function (evt) {
            var mousePtr = canvasMousePosition(evt);
            var idx = selectedElementIdx(mousePtr);
            if (idx >= 0) {
                var element = elements[idx];
                if ((mousePtr.x + elementWidth) < $(canvas).width()) {
                    elements[idx].setMouseRelatedPos(mousePtr);
                }
            }
        }
        ,
        /**
         * Handles the display of the played game history.
         */
        handleDisplayHistory = function () {
            /* TODO: display played games */
            for (var i = 0; i < plays.length; i++) {
                var game = plays[i];
                console.log("Played game: points: " + game.points + " | duration: " + game.getDuration());
            }
        }
        ,
        /**
         * Clears the played game history by resetting teh saved games.
         */
        handleResetHistory = function () {
            plays = [];
        }
        ,
    /* -------------------- Utility function section --------------------------- */
        /**
         * Tests for a hit
         * @param a the first element
         * @param b the second element
         * @returns {boolean} true if there was hit, false otherwise
         */
        hitTest = function (a, b) {
            return (a.x < (b.x + b.w)) && ((a.x + a.w) > b.x) && (a.y < (b.y + b.h)) && ((a.y + a.h) > b.y);
        }
        ,
        /**
         * Gets the index of teh clicked element.
         * @param mousePtr the object providing the mouse coordinates
         * @returns {number} >= 0 if the element could be found, < 0 otherwise
         */
        clickedElementIdx = function (mousePtr) {
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
        /**
         * Gets the index of the selected element.
         * @returns {number} >= 0 if the element could be found, < 0 otherwise
         */
        selectedElementIdx = function () {
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
        /**
         * Gets teh mouse position within the canvas game  field.
         * @param evt the event object providing the information
         * @returns {{x: number, y: number}} the object representing the mouse coordinates
         */
        canvasMousePosition = function (evt) {
            var rect = canvas.getBoundingClientRect();
            return {
                x: (evt.clientX - rect.left),
                y: (evt.clientY - rect.top)
            };
        }
        ,
        /**
         * Removes a element from the backed array
         * @param element the element to be removed
         */
        removeElement = function (element) {
            shapes.splice(shapes.indexOf(element), 1);
            // delete from cubes array
            elements.splice(elements.indexOf(element), 1);
        }
        ,
        /**
         * Init the bottom palced boxes.
         */
        initBoxes = function () {
            /* create bottom boxes */
            var boxWidth = canvas.width / 3;
            var boxHeight = canvas.height - 40;

            boxes = [
                createShape(0, boxHeight, boxWidth, 40, colors[0]),
                createShape(boxWidth, boxHeight, boxWidth, 40, colors[1]),
                createShape(boxWidth * 2, boxHeight, boxWidth, 40, colors[2])
            ];
        }
        ,
        /**
         * Creates a shape for the game and adds it to the backed shapes array.
         * @param x the x coordinate
         * @param y the y coordinate
         * @param w the width of the element
         * @param h the height of the element
         * @param c the color of the shape.
         * @returns {GameCubeShapeObject} representing the element
         */
        createShape = function (x, y, w, h, c) {
            var shape = new GameCubeShapeObject(x, y, w, h, c, true);
            shapes.push(shape);
            return shape;
        }
        ,
        /**
         * Creates a goody for the game
         */
        createGoody = function () {
            var x = Math.random() * (canvas.width - 25);
            var goody = new GoddyShapeObject(x, headerHeight, 25, 25, "#000");
            shapes.push(goody);
            return goody;
        }
        ,
        /**
         * Creates a cube for the game field and adds it to the backed elements array.
         */
        createCube = function () {
            var x = Math.random() * (canvas.width - 25);
            var randomColorIdx = Math.floor(Math.random() * 3);
            var c = colors[randomColorIdx];
            var y = headerHeight;

            elements.push(createShape(x, y, elementWidth, elementHeight, c));
        }
        ,
        /**
         * Clears the game by resetting the game related variables
         */
        clearGame = function () {
            goody = null;
            elements = [];
            shapes = [];
            iterationCount = 0;
        };
    /* -------------------- Public section --------------------------- */
    /**
     * Initializes the game.
     * @param _canvasId the related canvas element id
     * @param _startButtonId the related start button id
     */
    this.init = function init(_canvasId, _startButtonId) {
        button = $("#" + _startButtonId);
        if (button == null) {
            throw new Error("Game switch button not found !!! " + _startButtonId);
        }

        /* Init canvas */
        canvas = document.getElementById(_canvasId);
        if (canvas == null) {
            throw new Error("Canvas not found for id '" + _canvasId + "'");
        }
        /* Init canvas context */
        canvasCtx = canvas.getContext("2d");

        /* Init the game field */
        initBoxes();
        /* Link to start button */
        button.html("Start");
        button.on("click", gameSwitch);
    };
}

