/* Author: Samuel Brown (@samuelgbrown, samuelgbrown.com) */



//globals used for storing current playlist and also checking api/player status.
var apistatus = 0;
var ytplayerstatus = 0;

var queuedVideos = [];
var started = 0;
var playerstatus;
var autoPlay;

//required global vars for youtube.
var youtube_player;
if (typeof(window.location.hash) === "undefined" || window.location.hash === "") {
	window.location.hash = "clssx";
	var board = "clssx"; //gets overwritten upon changing board using nav.
} else {
	var board = window.location.hash;
}

//YouTube callbacks, player/queue functions.

function onYouTubePlayerAPIReady() {
	apistatus = 1;
}

function onYouTubePlayerPlayerReady() {
	console.log("player ready");
}

function handleError(error) {
	console.log("player error:");
	if (error.data === "150" || error.data === "101") { console.log("video had embedding disabled."); }
	if (error.data === "100") { console.log("video not found (removed?)"); }
	if (error.data === "2") { console.log("video request contained invalid parameter (missing/invalid video id?)"); }
	skipToVideo(currentIndex+1); //skip song
}

function onPlayerStateChange(input) {
	//Possible values are unstarted (-1), ended (0), playing (1), paused (2), buffering (3), video cued (5).
	
	playerstatus = input.data;
	
	if (input.data === 0) { //user finished watching a video
		started = 1;
		playNextVideo();
	}
}

function initiatePlaylist(firstVideo) {
	
	if (apistatus === 0) {
		return;
	}

	//slide up the player bar.
	$('.playlist').animate({bottom: "0px"}, 240, function() {
	
		//clear any existing player
		youtube_player = null;
		$('#playlist_player').empty();
		
		//create player
		youtube_player = new YT.Player('playlist_player', {
			height: '95', width: '200',
			videoId: firstVideo,
			playerVars: {
				'enablejsapi': 1,
				'autoplay': 0,
				'html5': 1,
				'hd': 1,
				'origin': window.location.host
			},
			events: {
				'onStateChange':
						onPlayerStateChange,
				'onError':
						handleError,
				'onReady':
						onReady
			}
		});
		
		//clear loading animation
		setTimeout(function() {
			$('.player_loading').fadeOut();
			autoPlay = 1;
			$('.right').css("margin-bottom","140px");
			ytplayerstatus = 1;
			if (typeof(playerstatus) === "undefined") {
				playerstatus = 5;
			}
		}, 500);
		
	});
	
}

function onReady() {

	if (apistatus === 0) {
		return;
	}

	//since onYouTubePlayerReady isn't firing, using the onReady event seems to work instead.
	if (typeof(autoPlay) !== "undefined" && autoPlay === 1) {
		youtube_player.playVideo();
	}
}

function skipToVideo(i) {

	if (apistatus === 0 || ytplayerstatus === 0) {
		return;
	}

	//when user skips to song, simply move the selected one to queuedVideos[0] and play,
	//therefore the rest of the queue is unaffected.
	
	if (i > 0) {
	
		//perform skip
		var targetVideo = queuedVideos[i];
		queuedVideos.splice(i, 1);
		queuedVideos.unshift(targetVideo);
		
		if (queuedVideos[0]) {

		youtube_player.loadVideoById(queuedVideos[0].url);
		queuedVideos.splice(0,1);

		}
		
		//console.log($('.playlist .thumbnails .strip div:eq('+i+') h4').text());
		
		/* fadeout and remove targeted entry
		$('.playlist .thumbnails .strip div:eq('+i+')').fadeOut("medium", function() {
			$('.playlist .thumbnails .strip div:eq('+i+')').remove();
			
			//clean up
			refreshThumbnailQueue();
		});
		*/
		
		
	} else {
	
		//user only skipped to the next song
		playNextVideo();
	}
}

function playNextVideo() {

	if (apistatus === 0 || ytplayerstatus === 0) {
		return;
	}
	
	if (queuedVideos.length > 0) {
		
		//play video, splice from queuedVideos array
		youtube_player.cueVideoById(queuedVideos[0].url);
		youtube_player.playVideo();
		queuedVideos.splice(0,1);
		
		// fadeout and remove queue entry
		$('.playlist .thumbnails .strip div:eq(0)').fadeOut("medium", function() {
			$('.playlist .thumbnails .strip div:eq(0)').remove();
			
			//clean up
			refreshThumbnailQueue();
		});
		
		
	}
}

function refreshThumbnailQueue() {

		var strip = $('.playlist .thumbnails .strip');
	
		strip.empty();
		strip.width(140*queuedVideos.length);
		
		//loop queuedVideos, get title/smallthumb/url
		for (var i=0; i<queuedVideos.length; i++) {
			
			if (queuedVideos[i]) {

				var title = queuedVideos[i].title;
				var url = queuedVideos[i].url;
				var thumbnail = queuedVideos[i].smallthumb;
			
				var source   = $("#thumbnail-template").html();
				var template = Handlebars.compile(source);
				
				var content = {title: title, thumbnail: thumbnail, url: url};
				var html = template(content);
				strip.append(html);

			}
			
		}
		
		strip.children('.smallthumb').click(function(e) {
			var index = $(this).index();
			skipToVideo(index);
			$(this).fadeOut("medium", function () {
				$(this).remove();
				refreshThumbnailQueue();
			});
		});
		
}

//Load youtube player api asynchronously.
var tag = document.createElement('script');
tag.src = "http://www.youtube.com/player_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag,firstScriptTag);