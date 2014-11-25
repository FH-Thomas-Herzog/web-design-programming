/**
 * Created by cchet on 11/15/2014.
 */
var url = "http://teaching.thespielplatz.com/api/chat/"
var lastId = 0;
var name = "undefined";
var started = false;
var intervalId;

function init() {
    started = false;

    /* display only register container */
    $("#chat-container").hide();
    $("#register-container").show();
    $("#start").html("Start");

    /* Event handler for elements */
    $("#start").click(function () {
        run();
    });
    $("#register").click(register);
    $("#registerName").keypress(function (e) {
        if (e.which == 13) {
            register();
        }
    });
    $("#send").click(post);
    $("#chatText").keypress(function (e) {
        if (e.which == 13) {
            post();
        }
    });
    $("#clear").click(function () {
            $("#content").empty();
            $("#chatText").val("");
        }
    );
    $("#content").on("click", "li", function () {
        $(this).addClass("read");
    });
    $("#content").on("click", "button", function () {
        $(this).closest("li").fadeOut();
    });
}

$(init)

/**
 * Loads the data from the server.
 */
function load() {
    $.ajax({
            url: url + lastId
        }
    ).done(oncompleteGetNews);
}

/**
 * Registers the chat user by setting his name globally.
 */
function register() {
    name = $("#registerName").val();
    $("#chat-container").show();
    $("#register-container").hide();
    $("#content").empty();
    $("#chatText").focus();
    run();
}

/**
 * Posts a message to the server.
 */
function post() {
    $.ajax({
        url: url,
        type: "POST",
        data: {"name": name, "message": $("#chatText").val()}
    });
    $("#chatText").val("");
}

function run() {
    if (started) {
        $("#start").html("Start");
        window.clearInterval(intervalId);
        $("#chatText").attr('disabled','disabled');
        $("#send").attr('disabled','disabled');
        started = false;
    } else {
        $("#start").html("Pause");
        intervalId = window.setInterval(load, 1000);
        $("#chatText").removeAttr('disabled');
        $("#send").removeAttr('disabled');
        started = true;
    }
}
/**
 * Handles the retrieved news data.
 *
 * @param newsData
 *              the retrieved new data to be added to the view
 */
function oncompleteGetNews(newsData) {
    var newId;

    $.each(newsData, function (idx, msg) {
        lastId = (newId > lastId) ? newId : lastId;

        var message = msg.message;
        message = message.replace(":)", "<img src='http://teaching.thespielplatz.com/WDP/uebung06-javascript-advanced/img/happy.jpg' >");
        message = message.replace(":(", "<img src='http://teaching.thespielplatz.com/WDP/uebung06-javascript-advanced/img/sad.jpg' >");
        message = message.replace(":8", "<img src='http://teaching.thespielplatz.com/WDP/uebung06-javascript-advanced/img/cool.png >'");

        var label = msg.timestamp + " " + msg.name;
        $("<li></li>").addClass("message-content")
            .text(message).prepend("<label class='message-label'>" + label + ":</label> ")
            .prepend("<button>x</button> ")
            .prependTo("#content").hide().slideDown()

        newId = parseInt(msg.id);
    });
}