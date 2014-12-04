/**
 * Created by cchet on 11/26/2014.
 */
/* -------------------- Constant section --------------------------- */
var
    /**
     * The id of the result container
     * @type {string}
     */
    RESULT_CONTAINER_ID = "result-container",
    /**
     * The id of the start button
     * @type {string}
     */
    START_BUTTON_ID = "start",
    /**
     * The id of the start button
     * @type {string}
     */
    RESET_BUTTON_ID = "reset",
    /**
     * The id of the canvas element
     * @type {string}
     */
    CANVAS_ID = "gamescreen";

/* -------------------- Template section --------------------------- */
var
    /**
     * This object represents a shape object which can be defined within a cube shape.
     * @constructor
     *          This object is initialized via init() function.
     */
    Shape = function ShapeObject() {
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
    BaseShape = function BaseShapeObject() {
        this.c = "#000";
        this.selected = false;

        this.initBase = function (x, y, w, h, color) {
            this.c = color;
            this.initShape(x, y, w, h);
        }
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
     * This object represents the default shape object which is an colored cube.
     * @param move the flag which indicates if this shape is movable or not.
     * @param color the color of the cube
     * @constructor (move, color)
     */
    GameCubeShape = function GameCubeShapeObject(x, y, w, h, color, move) {
        this.move = move;

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
    GoodyShape = function GoodyShapeObject(x, y, w, h, color) {
        this.initBase(x, y, w, h, color);
    }
    ,
    /**
     * The object which represents a played game.
     * @constructor ()
     */
    GamePlay = function GamePlayObject() {
        this.points = 0;
        this.goodyCount = 0;
        this.lifeCount = 3;
        this.status = "stopped";

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
            this.goodyCount = 0;
            this.status = "running";
            durationInterval = setInterval(this.increaseDuration, 1000);
        };

        /**
         * Stops the game within this object by removing the interval
         */
        this.stop = function () {
            clearInterval(durationInterval);
            this.status = "stopped";
        };

        /**
         * Provides the current duration value.
         * @returns {number}
         */
        this.getDuration = function () {
            return counter;
        }


        this.markAsCanceled = function () {
            this.status = "canceled";
        }

        this.markAsLost = function () {
            this.status = "lost";
        }

        this.isCanceled = function () {
            return this.status === "canceled";
        }

        this.isLost = function () {
            return this.status === "lost";
        }

        this.isRunning = function () {
            return this.status === "running";
        }

        this.isStopped = function () {
            return this.status === "stopped";
        }
    }
    ,
    /**
     * This game handler object handles the played games and displays the results
     * @constructor
     */
    GamePlayHandler = function GamePlayHandlerObject() {
        var
            games = [];

        this.update = function update(game) {
            games.push(game);

            var
                row = $("<tr>");

            row.append(
                $("<td>").text(game.getDuration())
            );
            row.append(
                $("<td>").text(game.points)
            );
            row.append(
                $("<td>").text(game.goodyCount)
            );
            row.append(
                $("<td>").text(game.lifeCount)
            );
            $("#" + RESULT_CONTAINER_ID).find("tbody").first().prepend(row);
        }

        this.reset = function reset() {
            $("#" + RESULT_CONTAINER_ID).find("tbody").empty();
        }
    };

/* define prototypes for the defined objects */
BaseShape.prototype = new Shape();
GameCubeShape.prototype = new BaseShape();
GoodyShape.prototype = new BaseShape();

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
        speed = 0,
        /**
         * The current selected element
         * @type {null}
         */
        selectedElement = null;

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
         * The interval id of the interval which controls the goody touch duration
         */
        goodyInterval,
        /**
         * The height of the drawed header.
         */
        HEADER_HEIGHT = 30,
        /**
         * The height of the game elements
         * @type {number}
         */
        ELEMENT_HEIGHT = 25,
        /**
         * the width of the game elements
         * @type {number}
         */
        ELEMENT_WIDTH = 25,
        /**
         * The duration (sec) how long the goody is allowed to be hold.
         * @type {number}
         */
        GOODY_HOLD_DURATION = 2,
        /**
         * The handler instance which holds all played games and handles the results
         * @type {ResultHandler}
         */
        gamePlayHandlerInst = new GamePlayHandler();
    ;

    /* -------------------- Private section --------------------------- */
    var
    /* -------------------- Controller section --------------------------- */
        /**
         * The game switch which switches from start -> stop and visa versa.
         */
        gameSwitch = function () {
            if ((currentGame == null) || (currentGame.isStopped())) {
                start();
                button.html("Stop");
            } else {
                stop();
                button.html("Start");
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

            /* Update game history */
            gamePlayHandlerInst.update(currentGame);
            currentGame = null;

            /* Clear the game state */
            clearGame();
            initBoxes();

            /* Remove registered event */
            unregistereGameEvents();
        }
        ,
        /**
         * The loop function which gets called via interval.
         * Here the drawing and hit test are performed.
         */
        loop = function () {
            if (currentGame.isRunning()) {
                var hitCtx = update();
                /* Cube not null means hit */
                if (hitCtx != null) {
                    /* handle invalid hit */
                    handleHit(hitCtx.element, hitCtx.box);
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
                currentGame.goodyCount++;
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
                if ((goody != null) && (isHit(goody, element))) {
                    removeElement(element);
                    currentGame.increasePoints();
                }
                /* if not hit by goody then check for box hit */
                else {

                    /* hit test for bottom boxes on elements and goody */
                    for (var j = boxes.length - 1; j >= 0; j--) {
                        var box = boxes[j];
                        /* return result if hit occurred */
                        if ((hitCtx == null) && (isHit(element, box))) {
                            hitCtx = {
                                element: element,
                                box: box
                            };
                        }
                        /* Remove if bottom boxes are reached */
                        if ((goody != null) && (isHit(goody, box))) {
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
            canvasCtx.fillText("Lifes: " + currentGame.lifeCount + " | Points: " + currentGame.points + " | Duration: " + currentGame.getDuration(), 5, HEADER_HEIGHT);

            /* draw header borders */
            canvasCtx.fillStyle = '#000';
            canvasCtx.strokeRect(0, 0, canvas.width, HEADER_HEIGHT + 5);
        }
        ,
        /**
         * Draws the error message if the game stops because of an invalid hit.
         */
        drawError = function () {
            canvasCtx.fillStyle = '#000';
            canvasCtx.font = 'bold 15px Verdana';
            var text;

            /* add this point game not stopped therefore life count invalid */
            if ((currentGame.lifeCount - 1) == 0) {
                text = "You are dead";
            } else {
                text = (currentGame.lifeCount - 1) + " life left";
            }
            canvasCtx.fillText(text, (canvas.width / 2), (canvas.height / 2));
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
            /* remove element not mather is proper color */
            removeElement(element);

            /* if color hit valid */
            if (element.c === box.c) {
                currentGame.increasePoints();
            }
            /* if color hit invalid */
            else {
                if ((currentGame.lifeCount - 1) != 0) {
                    currentGame.lifeCount--;
                } else {
                    currentGame.markAsLost();
                }
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

            /* element has been selected */
            if (idx >= 0) {
                selectedElement = elements[idx];
                selectedElement.move = false;
                selectedElement.selected = true;
            }
            /* goody present on field */
            else if ((goody != null) && (!goody.selected)) {
                var mouseShape = new Shape();
                mouseShape.initShape(mousePtr.x, mousePtr.y, 1, 1);

                /* if mouse selected goody */
                if (isHit(mouseShape, goody)) {
                    goody.selected = true;
                    goodyInterval = setInterval(function () {
                        /* Clear the set interval */
                        clearInterval(goodyInterval);

                        /* remove goody from field */
                        shapes.splice(shapes.indexOf(goody), 1);

                        /* remove goody from controller */
                        goody = null;
                    }, (GOODY_HOLD_DURATION * 1000));
                }
            }
        }
        ,
        /**
         * Handles the mouse up event by releasing tee clicked element
         * @param evt the event object
         */
        handleMouseUp = function (evt) {
            /* handle element selected */
            if (selectedElement != null) {
                selectedElement.move = true;
                selectedElement.selected = false;
                selectedElement = null;
            }
            /* handle goody selected */
            else if ((goody != null) && (goody.selected)) {
                goody.selected = false;
                clearInterval(goodyInterval);
            }
        }
        ,
        /**
         * Handles the mouse move event by moving the clicked element.
         * @param evt the event object
         */
        handleMouseMove = function (evt) {
            var mousePtr = canvasMousePosition(evt);

            /* element selected */
            if (selectedElement != null) {
                if ((mousePtr.x + selectedElement.w) < $(canvas).width()) {
                    selectedElement.setMouseRelatedPos(mousePtr);
                }
            }
            /* goody selected */
            else if ((goody != null) && (goody.selected)) {
                /* move goody */
                if ((mousePtr.x + goody.w) < $(canvas).width()) {
                    goody.setMouseRelatedPos(mousePtr);
                }
                for (var i = (elements.length - 1); i >= 0; i--) {
                    if (isHit(elements[i], goody)) {
                        currentGame.increasePoints();
                        removeElement(elements[i]);
                    }
                }
            }
        }
        ,
    /* -------------------- Utility function section --------------------------- */
        /**
         * Tests for a hit
         * @param a the first element
         * @param b the second element
         * @returns {boolean} true if there was hit, false otherwise
         */
        isHit = function (a, b) {
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
         * @returns {GameCubeShape} representing the element
         */
        createShape = function (x, y, w, h, c) {
            var shape = new GameCubeShape(x, y, w, h, c, true);
            shapes.push(shape);
            return shape;
        }
        ,
        /**
         * Creates a goody for the game
         */
        createGoody = function () {
            var x = Math.random() * (canvas.width - 25);
            var goody = new GoodyShape(x, HEADER_HEIGHT, 25, 25, "#000");
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
            var y = HEADER_HEIGHT + 5;

            elements.push(createShape(x, y, ELEMENT_WIDTH, ELEMENT_HEIGHT, c));
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
     * @param _resetButtonId the id of the reset button which clears displayed results
     */
    this.init = function init(_canvasId, _startButtonId, _resetButtonId) {
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

        /* Link to game lay handler */
        $("#" + _resetButtonId).html("Clear Table").on("click", gamePlayHandlerInst.reset);

    };
}

console.log("controller.js loaded");

$(init)

function init() {
    var test = new GamingController();
    test.init(CANVAS_ID, START_BUTTON_ID, RESET_BUTTON_ID);
}

