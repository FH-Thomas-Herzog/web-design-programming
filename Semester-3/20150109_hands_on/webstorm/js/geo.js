/**
 * Created by cchet on 1/5/2015.
 */
/**
 * This sections holds the used ids of the html page
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
    geoHandler = null
    ,
    googleImageSearchURL = "https://ajax.googleapis.com/ajax/services/search/images"
    ,
    googleGeocodeURL = "https://maps.googleapis.com/maps/api/geocode/json";

/**
 * This section specifies thee used JS object for geo resolving and local storage handling.
 */
var
    Coordinates = function (address, latitude, longitude) {
        this.address = address;
        this.longitude = longitude;
        this.latitude = latitude;
    }
    ,
    GeoHandler = function () {
        var
            errorContainer = null
            ,
            resultContainer
            ,
            currentLocationButton = null
            ,
            searchBox = null
            ,
            geocoder = null
            ,
            googleSearchBox = null
            ,
            selectedPosition = null;

        var
            populateError = function (msg) {
                console.log(msg);
                $("#" + resultContainerID).html("Could not resolve your location !!!");
            }
            ,
            /**
             * Function for handling the success of the geo location resolving
             * @param data the data received by geo location
             */
            getPositionSuccessCallback = function (data) {
                console.log(JSON.stringify(data));
                selectedPosition = new Coordinates(null, data.coords.latitude, data.coords.longitude);
                resolveAddressFromCoordinates();
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
                console.log(JSON.stringify(data));
                $(resultContainer).empty();
                $.each(data.responseData.results, function (idx, value) {
                    $(resultContainer).append('<img width="150" src="' + value.unescapedUrl + '">');
                })
            }
            ,
            /**
             * Handles the place selected event
             */
            placesChangedListener = function () {
                //TODO: set new selected position
                console.log(googleSearchBox.getPlaces()[0]);
                selectedPosition = new Coordinates(googleSearchBox.getPlaces()[0].formatted_address, null, null);
                searchImagesForLocation();
            }
            ,
            /**
             * Searches for images for given coordinates
             * @param coordinates the coordinates to search images for
             */
            searchImagesForLocation = function () {
                console.log("searchImagesForLocation called " + JSON.stringify(selectedPosition));
                $.ajax({
                    url: googleImageSearchURL + "?v=1.0&q=" + selectedPosition.address.split(' ').join('+'),
                    dataType: 'jsonp',
                    success: displayImages,
                    error: function () {
                        populateError("Could not query images for location !!! address: " + selectedPosition.address);
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
                                populateError("Could not get Address for coordinates ");
                            }
                        } else {
                            populateError("Geocoder failed due to: " + status);
                        }
                        return null;
                    });
                }
            };

        this.init = function () {
            /* get all html components */
            errorContainer = document.getElementById(errorContainerID);
            if (errorContainer == null) {
                populateError("Cannot find error container !!! id: " + errorContainerID);
                return;
            }
            resultContainer = document.getElementById(resultContainerID);
            if (resultContainer == null) {
                populateError("Cannot find result container !!! id: " + resultContainerID);
                return;
            }
            searchBox = document.getElementById(searchBoxID);
            if (searchBox == null) {
                populateError("Search box could not be found in page !!! id:" + searchBoxID);
                return;
            }
            currentLocationButton = document.getElementById(currentLocationButtonID);
            if (currentLocationButton == null) {
                populateError("Current location button not found !!! id: " + currentLocationButtonID);
                return;
            }

            /* Init search box */
            googleSearchBox = new google.maps.places.SearchBox(searchBox);

            /* Prepare place changed event handling */
            $(searchBox).keyup(function (event) {
                if (event.which == 13) {
                    google.maps.event.trigger(googleSearchBox, "place_changed");
                }
            });
            google.maps.event.addListener(googleSearchBox, 'place_changed', placesChangedListener);

            /* Prepare current location button */
            $(currentLocationButton).click(function (event) {
                /* get current location and address */
                navigator.geolocation.getCurrentPosition(getPositionSuccessCallback, getPositionErrorCallback);
            });

            /* geocoder instance ofr resolving addresses and coordinates */
            geocoder = new google.maps.Geocoder();
        }
    };

$(function () {
    geoHandler = new GeoHandler();
    geoHandler.init();
});