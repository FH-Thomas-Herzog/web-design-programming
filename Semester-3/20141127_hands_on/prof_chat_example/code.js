console.log("Works")
var lastId = 0
var urlGetPosts = "http://teaching.thespielplatz.com/api/chat/" 
var urlSendPost = "http://teaching.thespielplatz.com/api/chat/"

// Startup Initialisierung
function init() {
	window.setInterval(getMessages, 1000)
	$("#btnSend").click(postMessage)
	
	$("#content").on("click", "li", function(){
		$(this).addClass("read")
	})
	
	$("#content").on("click", "button", function(){
		$(this).closest("li").fadeOut()
	})
}

$(init)

function post() {
	var name = $("#inputName").val()
	var text = $("#inputText").val()
	
	var options = {
		url : urlSendPost,
		type : "POST",
		data : { "name" : name, "message" : text}
	}
	$.ajax(options)
}

// get news feed
function getMessages() {
	console.log("load")
	
	var options = {
		url : urlGetPosts + lastId 	
	}
	
	$.ajax(options).done(onGetMessagesComplete)
}

function onGetMessagesComplete(posts) {
	console.log("onGetMessagesComplete")
	
	$.each(posts, function(i, post) {
		if (parseInt(post.id) > lastId) {
			lastId = parseInt(post.id)
		}
		
		var message = post.message
		message = message.replace(":)", '<img src="http://teaching.thespielplatz.com/WDP/uebung06-javascript-advanced/img/happy.jpg">')
		message = message.replace(":(", '<img src="http://teaching.thespielplatz.com/WDP/uebung06-javascript-advanced/img/sad.jpg">')
		message = message.replace(":8", '<img src="http://teaching.thespielplatz.com/WDP/uebung06-javascript-advanced/img/cool.png">')
		
		$("<li></li>")
			.html(message).prepend("<b>" + post.name + ":</b> ")
			.prepend("<button>x</button> ")
			.prependTo("#content").hide().slideDown()	
	})
}
































