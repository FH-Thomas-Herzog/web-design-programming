/**
 * Created by cchet on 11/15/2014.
 */
var url = "http://teaching.thespielplatz.com/api/chat/";
var lastId = 0;

function init() {
    window.setInterval(getMessages, 1000);
    $("#btnSend").click(function () {
        var name = $("#inputName").val();
        var msg = $("#inputText").val();

        $.ajax({
                url: url,
                type: "POST",
                data: {name: name, message: msg}
            }
        );
    });
    $("#content").on("click", "li", function () {
        $(this).addClass("read");
    });
    $("#content").on("click", "button", function () {
        $(this).closest("li").fadeOut();
    });
}

$(init)

function getMessages() {
    $.ajax({
            url: url + lastId
        }
    ).done(onGetNewsComplete);
}

function onGetNewsComplete(newsData) {
    console.log(newsData);

    $.each(newsData, function (idx, msg) {
        lastId = (newId > lastId) ? newId : lastId;

        var message = msg.message;
        message = message.replace(":)", "<img src='http://teaching.thespielplatz.com/WDP/uebung06-javascript-advanced/img/happy.jpg' >");
        message = message.replace(":(", "<img src='http://teaching.thespielplatz.com/WDP/uebung06-javascript-advanced/img/sad.jpg' >");
        message = message.replace(":8", "<img src='http://teaching.thespielplatz.com/WDP/uebung06-javascript-advanced/img/cool.png >'");
        $("<li></li>").html(message).prepend("<b>" + msg.name + ": </b> ").prepend("<button></button>").prependTo("#content").hide().slideDown();
        /*$("<li><b>" + msg.name + ":</b> " + msg.message + "</li>").prependTo("#content").hide().slideDown();*/
        var newId = parseInt(msg.id);
    });
}

function markAsRead() {
    $(this).css(".read");
}