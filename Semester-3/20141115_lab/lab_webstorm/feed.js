/**
 * Created by cchet on 11/15/2014.
 */
function init_backup() {
    /* with native javascript */
    var list = document.getElementById("content");
    console.log(list);

    /* via jquery */
    var jqueryList = $(list);

    /* or with jquery */
    list = $("#content");
    console.log(list);

    window.setInterval(getNews, 1000);
}

function init() {
    window.setInterval(getNews, 1000);
    $("#btnSearch").click(function () {
        $("#content").empty();
    });
}

$(init)

function getNews() {
    console.log("getNewss called");
    $.ajax({
        url: "http://www.reddit.com/new.json?limit=1"
    }).done(onGetNewsComplete);
}

function onGetNewsComplete(newsData) {
    console.log("getMessages complete");
    var title = newsData.data.children[0].data.title;
    console.log(title);

    /* first approach
     var newItem = $("<li>" + title + "</li>");
     newItem.hide();
     $("#content").prepend(newItem);
     newItem.slideDown();
     */

    $("<li>" + title + "</li>").prependTo("#content").hide().slideDown();
}