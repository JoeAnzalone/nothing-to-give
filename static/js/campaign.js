var QUEUED_PLAY = false;
function playVideo(){

	if(READY_TO_PLAY){
		player.playVideo();
	}else{
		QUEUED_PLAY = true;
	}

	var vid = document.getElementById("video_trailer");
	vid.style.display = "block";
	STOP_DRAWING = true;
}

var player;
var READY_TO_PLAY = false;
window.onload = function(){

	// Loads the IFrame Player API code asynchronously.
	var tag = document.createElement('script');
	tag.src = "https://www.youtube.com/iframe_api";
	var firstScriptTag = document.getElementsByTagName('script')[0];
	firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

};
// Creates an <iframe> (and YouTube player) after the API code downloads.
function onYouTubeIframeAPIReady() {
	player = new YT.Player('video_trailer',{
		width:'800', height:'350',
		videoId:'lksc2WRUOdM',
		playerVars:{ rel:0, showinfo:0, autohide:1 },
		events:{ 'onReady':onPlayerReady, 'onStateChange':onStateChange }
	});
}
function onPlayerReady(event) {
	READY_TO_PLAY = true;
	if(QUEUED_PLAY){
		player.playVideo();
	}
}
function onStateChange(event){
	if(event.data===0){
		var vid = document.getElementById("video_trailer");
		vid.style.display = "none";
		STOP_DRAWING = false;
		draw();
	}
}

//////////

var canvas = document.getElementById("video_meta");
var ctx = canvas.getContext("2d");

var layerCanvas = document.createElement("canvas");
layerCanvas.width = 1142;
layerCanvas.height = 900;
var layerContext = layerCanvas.getContext("2d");

var layerBGCanvas = document.createElement("canvas");
layerBGCanvas.width = 1142;
layerBGCanvas.height = 900;
var layerBGContext = layerBGCanvas.getContext("2d");

var imagesLeft=3;
var onImageLoad = function(){
	imagesLeft--;
	if(imagesLeft==0) createSplash();
}
var logo = new Image();
var progress = new Image();
var cursor = new Image();
logo.src = "/img/logo.png";
logo.onload = onImageLoad;
progress.src = "/img/progress.png";
progress.onload = onImageLoad;
cursor.src = "/img/cursor.png";
cursor.onload = onImageLoad;

var STOP_DRAWING = false;
var draw;

function createSplash(){

	// Draw layer canvas
	var drawLayerBG = function(){

		var ctx = layerBGContext;

		// Background
		ctx.fillStyle = "#eee";
		ctx.fillRect(0,0,layerCanvas.width,layerCanvas.height);

		// Logo
		ctx.drawImage(logo,171,75);

		// Progress
		ctx.drawImage(progress,171,625);

		// Banner
		ctx.fillStyle = "#333";
		ctx.fillRect(0,275,layerCanvas.width,350);

		// Hole
		ctx.clearRect(171,275,800,350);

	};
	drawLayerBG();

	// Draw layer canvas 2
	var drawLayer = function(){

		var ctx = layerContext;
		ctx.clearRect(0,0,layerCanvas.width,layerCanvas.height);

		// Layer BG
		ctx.drawImage(layerBGCanvas,0,0);
		
		// Cursor
		var scrollTop = (document.documentElement && document.documentElement.scrollTop) || document.body.scrollTop;
		var mx = Mouse.x+171;
		var my = Mouse.y+480+scrollTop;
		ctx.drawImage(cursor,mx,my);

		// Darken it
		ctx.fillStyle = "rgba(0,0,0,0.25)";
		ctx.fillRect(0,0,layerCanvas.width,layerCanvas.height);

	};

	// Parallax
	var RAF = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame;
	var time = 0;
	var thumbnails = document.querySelectorAll(".project_info > div > #thumbnail");
	var misc_links = document.getElementById("misc_links");
	draw = function(){

		// Scroll Top, for parallax
		var scrollTop = (document.documentElement && document.documentElement.scrollTop) || document.body.scrollTop;

		// Moving the parallax for all content thumbnails
		for(var i=0;i<thumbnails.length;i++){
			var thumbnail = thumbnails[i];
			var offset = thumbnail.offsetTop + thumbnail.parentNode.offsetTop;
			var y = (scrollTop-offset)*0.2 - 25;
			thumbnail.style.backgroundPosition = "0 "+y+"px";
		}

		// Misc Links Parallax
		var offset = misc_links.offsetTop + misc_links.parentNode.offsetTop;
		var y = (scrollTop-offset)*0.5;
		misc_links.style.backgroundPosition = "50% "+y+"px";

		// Redraw layer
		if(DIRTY_MOUSE){
			drawLayer();
		}

		// Draw recursively
		if(DIRTY_MOUSE || DIRTY_SCROLL){
			var offset = scrollTop*0.5*0.4 - 200;
			ctx.clearRect(0,0,800,350);
			ctx.translate(0,offset);
			for(var depth=10;depth>=0;depth--){
				
				var scale = Math.pow(0.7,depth);
				var x = 400;
				var y = 375 + scrollTop*0.5;

				ctx.save();
				ctx.translate(x,y);
				ctx.scale(scale,scale);
				ctx.drawImage(layerCanvas,-x,-y,800,750);
				ctx.restore();

			}
			ctx.translate(0,-offset);
		}

		// NOT DIRTY NO MORE
		DIRTY_MOUSE = false;
		DIRTY_SCROLL = false;

		// RAF
		if(!STOP_DRAWING) RAF(draw);

	};
	drawLayer();
	draw();


};


// Singleton
var Mouse = {
	x: 400,
	y: 175
};
var container = document.querySelector("#video_container");
var onMouseMove = function(event){
	Mouse.x = event.clientX - container.offsetLeft - container.parentNode.offsetLeft;
	Mouse.y = event.clientY - container.offsetTop - container.parentNode.offsetTop;
	DIRTY_MOUSE = true;
};
window.onmousemove = onMouseMove;

// DIRTY META
var DIRTY_MOUSE = true;
var DIRTY_SCROLL = true;
window.onscroll = function(){
	DIRTY_MOUSE = true;
	DIRTY_SCROLL = true;
};


//////////
// COUNTDOWN
///////////

(function(){

var _second = 1000;
var _minute = _second * 60;
var _hour = _minute * 60;
var _day = _hour * 24;
function toDoubleDigits(num){
var s = "00"+num;
return s.substr(s.length-2);
}

var end = new Date( window.DEADLINE ? window.DEADLINE : '03/12/2014' );
var countdown = document.getElementById("countdown");
function tick(){

var now = new Date();
var distance = end-now;
if(distance<0) distance=0;

var days = Math.floor(distance / _day);
var hours = Math.floor((distance % _day) / _hour);
var minutes = Math.floor((distance % _hour) / _minute);
var seconds = Math.floor((distance % _minute) / _second);

countdown.innerHTML = toDoubleDigits(days)+" days, "+toDoubleDigits(hours)+" hours, "+toDoubleDigits(minutes)+" minutes, "+toDoubleDigits(seconds)+" seconds";

}
setInterval(tick,1000);
tick();

})();