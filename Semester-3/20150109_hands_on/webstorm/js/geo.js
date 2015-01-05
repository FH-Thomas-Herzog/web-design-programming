/**
 * Created by cchet on 1/5/2015.
 */
/**
 * This sections holds the used ids int eh html page
 */
var
    resultContainerID = "resultContainer"
    ,
    errorContainerID = "errorContainer"
    ,
    currentLocationButtonID = "searchCurrentLocationButton"
    ,
    searchBoxID = "searchBox"
    ,
    geoHandler = null;

/**
 * This section specifies thee used JS object for geo resolving and local storage handling.
 */
var
    Coordinates = function (latitude, longitude) {
        this.longitude = longitude;
        this.latitude = latitude;
    }
    ,
    GeoHandler = function () {
        var
            initialized = false
            ,
            currentLocationButton = null
            ,
            searchBox = null
            ,
            googleSearchBox = null
            ,
            selectedPosition = null;

        var
            populateError = function (msg) {
                console.log(msg);
//                $("#" + resultContainerID).html("Could not resolve your location !!!");
            }
            ,
            /**
             * Function for handling the success of the geo location resolving
             * @param data the data received by geo location
             */
            getPositionSuccessCallback = function (data) {
                console.log(JSON.stringify(data));
                selectedPosition = new Coordinates(data.coords.latitude, data.coords.longitude);
                resolveAddressFromCoordinates();

                /* search images for location */
                searchImagesForLocation();
            }
            ,
            /**
             * Callback function which handles the error which could occur during geo location resolving
             */
            getPositionErrorCallback = function () {
                populateError("Could not resolve your location !!!");
            }
            ,
            searchImagesSuccessCallback = function (data) {

            }
            ,
            /**
             * Callback for error which could occur during image search.
             */
            searchImagesErrorCallback = function () {
                populateError("Error during search of images for your location !!! ");
            }
            ,
            /**
             * Displays the images in the view.
             * @param data the received images from google search
             */
            displayImages = function (data) {

            }
            ,
            /**
             * Handles the place selected event
             */
            placesChangedListener = function () {
                //TODO: set new selected position
                console.log(googleSearchBox.getPlaces()[0]);
                console.log("place selected");
            }
            ,
            /**
             * Searches for images for given coordinates
             * @param coordinates the coordinates to search images for
             */
            searchImagesForLocation = function () {
                console.log("searchImagesForLocation called " + JSON.stringify(selectedPosition));
            }
            ,
            /**
             * Resolves the address for the given coordinates.
             * @param latitude
             * @param longitude
             */
            resolveAddressFromCoordinates = function () {
                if (selectedPosition != null) {
                    geocoder = new google.maps.Geocoder();
                    geocoder.geocode({'latLng': new google.maps.LatLng(selectedPosition.latitude, selectedPosition.longitude)}, function (results, status) {
                        if (status == google.maps.GeocoderStatus.OK) {
                            if (results.length > 0) {
                                //formatted address
                                searchBox.value = results[0].formatted_address;
                            } else {
                                populateError("Could not get Addressf or coordinates ");
                            }
                        } else {
                            populateError("Geocoder failed due to: " + status);
                        }
                        return null;
                    });
                }
            }
            ;

        this.init = function () {
            /* Init search box */
            searchBox = document.getElementById(searchBoxID);
            if (searchBox == null) {
                populateError("Search box could not be found in page !!! id:" + searchBoxID);
                return;
            }
            googleSearchBox = new google.maps.places.SearchBox(searchBox);

            /* Prepare place changed event handling */
            $(searchBox).keyup(function (event) {
                if (event.which == 13) {
                    google.maps.event.trigger(googleSearchBox, "place_changed");
                }
            });
            google.maps.event.addListener(googleSearchBox, 'place_changed', placesChangedListener);

            /* Prepare current location button */
            currentLocationButton = document.getElementById(currentLocationButtonID);
            if (currentLocationButton == null) {
                populateError("Current location button not found !!! id: " + currentLocationButtonID);
            } else {
                $(currentLocationButton).click(function (event) {
                    /* get current location and address */
                    navigator.geolocation.getCurrentPosition(getPositionSuccessCallback, getPositionErrorCallback);
                });
            }
            initialized = true;
        }
    };

$(function () {
    geoHandler = new GeoHandler();
    geoHandler.init();
});