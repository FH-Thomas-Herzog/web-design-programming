/**
 * Created by Thomas Herzog on 1/5/2015.
 * This script files contains the whole javascript used by this application
 */

/* globally used instances */
var
    geoHandler = null;

/**
 * Initializes the application
 */
$(function () {
    geoHandler = new GeoHandler(new ErrorHandler()).init();
});

/**
 * Static references to the used ids and css classes.
 */
var
    RESULT_CONTAINER_ID = "resultContainer"
    ,
    ERROR_CONTAINER_ID = "errorContainer"
    ,
    CURRENT_LOC_BUTTON_ID = "searchCurrentLocationButton"
    ,
    CLEAR_STORAGE_BUTTON_ID = "clearStorageButton"
    ,
    DISPLAY_STORAGE_BUTTON_ID = "displayStorage"
    ,
    SEARCH_BOX_ID = "searchBox"
    ,
    COMMENT_TEXT_FIELD_ID = "comment"
    ,
    STORE_BUTTON_ID = "store"
    ,
    GOOGLE_IMAGE_SEARCH_URL = "https://ajax.googleapis.com/ajax/services/search/images"
    ,
    IMAGE_WIDTH = 200
    ,
    SELECTABLE_IMAGE_CSS = "selectable-image"
    ,
    NOT_SELECTABLE_IMAGE_CSS = "not-selectable-image"
    ,
    GOOGLE_MAP_CSS = "google-map";

/**
 * This section specifies the used JS classes for geo resolving and local storage handling.
 */
var
    /**
     * This class specifies the coordinates structure used in the other classes.
     * @param address the formatted address
     * @param latitude
     * @param longitude
     * @constructor (address, latitude, longitude)
     */
    Coordinates = function (address, latitude, longitude) {
        this.address = address;
        this.longitude = longitude;
        this.latitude = latitude;
    }
    ,
    /**
     * This class specifies a error handler which the other classes shall use to encapsulate the error population.
     * @constructor ()
     */
    ErrorHandler = function () {
        var
            errorContainer = $("#" + ERROR_CONTAINER_ID);

        /**
         * Populates a error to the user
         * @param msg
         */
        this.populateError = function (msg) {
            console.log(msg);
            errorContainer.html(msg);
        }

        /**
         * Clears all formerly present error messages
         */
        this.clearError = function () {
            errorContainer.empty();
        }
    }
    ,
    /**
     * This class specifies the storage handler which handles the local storage access
     * @param errorHandler the error handler instance used by the created instance
     * @constructor (errorHandler)
     */
    StorageHandler = function (errorHandler) {
        var
            errorHandler = errorHandler;

        /**
         * Appends the given data to the array identified by the given key.
         * If array does not exist it will create one.
         * @param key the key identifying the array
         * @param data the data appended to the backed array
         */
        this.append = function (key, data) {
            if ((key != null) && (key.length > 0) && (data != null)) {
                var array = null;
                if ((array = this.get(key)) == null) {
                    array = [];
                }
                array.push(data);
                localStorage.setItem(key, JSON.stringify(array));
            }
        }

        /**
         * Gets the array identified by the given key
         * @param key the key identifying the array
         * @returns the found array, null otherwise
         */
        this.get = function (key) {
            var dataStr = localStorage.getItem(key);
            if ((key != null) && (key.length > 0)) {
                return JSON.parse(dataStr);
            } else {
                return null;
            }
        }

        /**
         * Removes the array identified by the given key
         * @param key the key identifying the array
         */
        this.remove = function (key) {
            if (this.get(key) != null) {
                localStorage.removeItem(key);
            } else {
                errorHandler.populateError("Cannot remove not existing item from storage !!! key: " + key)
            }
        }

        /**
         * Displays the stored images in a table if there are data present for display
         * @param key the key identifying the array of images
         */
        this.display = function (key) {
            /* clear errors */
            errorHandler.clearError();

            /* clear content */
            $("#" + RESULT_CONTAINER_ID).empty();

            /* retrieve data from storage */
            var data = this.get(key);

            /* display data if present */
            if (data != null) {
                /* create result table */
                var table = $("<table>");
                var tbody = $("<tbody>");
                var row = $("<tr>");

                row.append(
                    $("<th>").text("comment")
                ).append(
                    $("<th>").text("image")
                ).append(
                    $("<th>").text("address")
                ).append(
                    $("<th>").text("map")
                );
                table.append($("<thead>").append(row)).append(tbody);
                $.each(data, function (idx, value) {
                    row = $("<tr>");
                    tbody.append(row.append(
                            $("<td>").text(value.comment)
                        ).append(
                            $("<td>").append($('<img>').attr("width", IMAGE_WIDTH).attr("src", encodeURI(value.url)))
                        ).append(
                            $("<td>").text(value.position.address)
                        )
                    );

                    /* prepare map for the current image */
                    var mapDiv = $("<div>").attr("class", GOOGLE_MAP_CSS);
                    var mapCol = $("<td>").append(mapDiv);
                    var lat = new google.maps.LatLng(value.position.latitude, value.position.longitude);
                    var mapOptions = {
                        center: lat,
                        zoom: 10,
                        mapTypeId: google.maps.MapTypeId.ROADMAP
                    };

                    /* create map for column */
                    var map = new google.maps.Map(mapDiv[0], mapOptions);

                    var marker = new google.maps.Marker({
                        map: map,
                        position: lat,
                        animation: google.maps.Animation.DROP,
                        draggable: false,
                        visible: true,
                        clickable: false,
                        title: value.address
                    });

                    row.append(mapCol);
                });
                $("#" + RESULT_CONTAINER_ID).prepend(table);
            }
            /* populate no data present */
            else {
                errorHandler.populateError("No data available for display");
            }
        }
    }
    ,
    /**
     * This class specifies the main class used for this web application.
     * @param errorHandler the error handler instance used by a instance of this class.
     * @constructor  (errorHandler)
     */
    GeoHandler = function (errorHandler) {
        var
            errorHandler = errorHandler
            ,
            storageHandler = new StorageHandler(errorHandler)
            ,
            errorContainer = null
            ,
            resultContainer
            ,
            searchBox = null
            ,
            geocoder = null
            ,
            googleSearchBox = null
            ,
            selectedPosition = null;

        /* static variables. Do not modify */
        var
            STORE_KEY = "images";

        var
            /**
             * Function for handling the success of the geo location resolving
             * @param data the data received by geo location
             */
            getPositionSuccessCallback = function (data) {
                //console.log(JSON.stringify(data));
                selectedPosition = new Coordinates(null, data.coords.latitude, data.coords.longitude);
                resolveAddressFromCoordinates();
            }
            ,
            /**
             * Callback function which handles the error which could occur during geo location resolving
             */
            getPositionErrorCallback = function () {
                errorHandler.populateError("Could not resolve your location !!!");
            }
            ,
            /**
             * Displays the images in the view.
             * @param data the received images from google search
             */
            displayImages = function (data) {
                //console.log(JSON.stringify(data));
                $(resultContainer).empty();
                $.each(data.responseData.results, function (idx, value) {
                    /* create image for searched image */
                    var image = $("<img>");
                    image.attr("src", value.unescapedUrl);

                    /* Allow just the first four images to be selected */
                    if (idx < 4) {
                        image.attr("class", SELECTABLE_IMAGE_CSS).attr("alt", "image found on google").attr("title", "Click to save me").click(function (event) {
                            /* clear formerly selected image */
                            $(resultContainer).find("input:text").remove();
                            $(resultContainer).find("button").remove();
                            $(resultContainer).find("br").remove();

                            /* create comment field */
                            var commentText = $("<input id='selectedComment'>").attr("id", COMMENT_TEXT_FIELD_ID);

                            /* append comment and button in surrounding image div */
                            var selectedImage = $(this);
                            var lBreak = $("<br>");

                            /* create button for store */
                            var button = $("<button>").text("Store").attr("id", STORE_BUTTON_ID).click(function (event) {
                                storageHandler.append(STORE_KEY, {
                                    comment: commentText.val(),
                                    url: selectedImage.attr("src"),
                                    position: selectedPosition
                                });
                                commentText.remove();
                                button.remove();
                                lBreak.remove();
                            });

                            selectedImage.parent().prepend(lBreak).prepend(button).prepend(commentText);
                        });
                    }
                    /* Clear comment and store button if unselectable image gets clicked */
                    else {
                        image.attr("class", NOT_SELECTABLE_IMAGE_CSS).click(function (event) {
                            /* clear formerly selected image */
                            $(resultContainer).find("input:text").remove();
                            $(resultContainer).find("button").remove();
                        });
                    }

                    /* append image in surrounding div in result container */
                    $(resultContainer).append(
                        $("<div>").append(image)
                    );
                })
            }
            ,
            /**
             * Handles the place selected event
             */
            placesChangedListener = function () {
                if ((googleSearchBox.getPlaces() != null) && (googleSearchBox.getPlaces().length > 0)) {
                    //console.log(googleSearchBox.getPlaces()[0]);
                    selectedPosition = new Coordinates(googleSearchBox.getPlaces()[0].formatted_address, null, null);
                    resolveCoordinatesFromAddress();
                } else {
                    errorHandler.populateError("Sorry seems that place could not be handled !!! Try to click enter in the search box if a place has been selected.");
                }
            }
            ,
            /**
             * Searches for images for given coordinates
             * @param coordinates the coordinates to search images for
             */
            searchImagesForLocation = function () {
                //console.log("searchImagesForLocation called " + JSON.stringify(selectedPosition));
                $.ajax({
                    url: GOOGLE_IMAGE_SEARCH_URL + "?v=1.0&q=" + selectedPosition.address.split(' ').join('+'),
                    dataType: 'jsonp',
                    success: displayImages,
                    error: function () {
                        errorHandler.populateError("Could not query images for location !!! address: " + selectedPosition.address);
                    }

                });
            }
            ,
            /**
             * Resolves the address for the given coordinates.
             * @param latitude
             * @param longitude
             */
            resolveAddressFromCoordinates = function () {
                if ((selectedPosition != null) && (selectedPosition.longitude != null) && (selectedPosition.latitude != null)) {
                    geocoder.geocode({'latLng': new google.maps.LatLng(selectedPosition.latitude, selectedPosition.longitude)}, function (results, status) {
                        if (status == google.maps.GeocoderStatus.OK) {
                            if (results.length > 0) {
                                /* set found address on selectedPosition */
                                selectedPosition.address = results[0].formatted_address;
                                searchBox.value = selectedPosition.address;
                                /* search images for location */
                                searchImagesForLocation();
                            } else {
                                errorHandler.populateError("Could not get Address for coordinates ");
                            }
                        } else {
                            errorHandler.populateError("Geocoder failed due to: " + status);
                        }
                        return null;
                    });
                }
            }
            ,
            /**
             * Resolves the address for the given coordinates.
             * @param latitude
             * @param longitude
             */
            resolveCoordinatesFromAddress = function () {
                if ((selectedPosition != null) && (selectedPosition.address != null)) {
                    geocoder.geocode({'address': selectedPosition.address.split(" ").join("+")}, function (results, status) {
                        if (status == google.maps.GeocoderStatus.OK) {
                            if (results.length > 0) {
                                /* set found address on selectedPosition */
                                selectedPosition.longitude = results[0].geometry.location.lng();
                                selectedPosition.latitude = results[0].geometry.location.lat();
                                searchImagesForLocation();
                            } else {
                                errorHandler.populateError("Could not get Address for coordinates ");
                            }
                        } else {
                            errorHandler.populateError("Geocoder failed due to: " + status);
                        }
                        return null;
                    });
                }
            };

        /**
         * This function inits the geo handler.
         */
        this.init = function () {
            /* get all html components */
            errorContainer = document.getElementById(ERROR_CONTAINER_ID);
            if (errorContainer == null) {
                errorHandler.populateError("Cannot find error container !!! id: " + ERROR_CONTAINER_ID);
                return;
            }
            resultContainer = document.getElementById(RESULT_CONTAINER_ID);
            if (resultContainer == null) {
                errorHandler.populateError("Cannot find result container !!! id: " + RESULT_CONTAINER_ID);
                return;
            }
            searchBox = document.getElementById(SEARCH_BOX_ID);
            if (searchBox == null) {
                errorHandler.populateError("Search box could not be found in page !!! id:" + SEARCH_BOX_ID);
                return;
            }

            /* Init search box */
            googleSearchBox = new google.maps.places.SearchBox(searchBox);

            /* Prepare place changed event handling */
            $(searchBox).keyup(function (event) {
                if (event.which == 13) {
                    errorHandler.clearError();
                    google.maps.event.trigger(googleSearchBox, "place_changed");
                }
            });
            google.maps.event.addListener(googleSearchBox, 'place_changed', placesChangedListener);

            /* Prepare current location button */
            $("#" + CURRENT_LOC_BUTTON_ID).click(function (event) {
                errorHandler.clearError();
                /* get current location and address */
                navigator.geolocation.getCurrentPosition(getPositionSuccessCallback, getPositionErrorCallback);
            });

            /* prepare clear storage button */
            $("#" + CLEAR_STORAGE_BUTTON_ID).click(function (event) {
                /* clear error */
                errorHandler.clearError();

                /* clear content */
                $("#" + RESULT_CONTAINER_ID).empty();

                /* remove data */
                storageHandler.remove(STORE_KEY);
            });

            /* prepare display storage button */
            $("#" + DISPLAY_STORAGE_BUTTON_ID).click(function (event) {
                storageHandler.display(STORE_KEY);
            });

            /* geocoder instance ofr resolving addresses and coordinates */
            geocoder = new google.maps.Geocoder();
        }
    };
