/* Author: Samuel Brown (@samuelgbrown, samuelgbrown.com) */

var Mixxxxes = (function() {

	var board;
	var videosArr = [];

	return {

		board: this.board,
		videosArr: this.videosArr,
		templates: this.templates,
		pageno: this.pageno,

		init: function() {

			var self = this;

			self.bindInitialEvents();
			self.gatherTemplates();
			self.bindAdminEvents();
		},

		gatherTemplates: function() {
			//pick up all handlebars templates, store them & remove from DOM.
			var self = this;

			var elements = {
				"video_element" : $("#video-template"),
				"authed_element": $("#authed-template"),
				"login_form_element": $('#login-form-template'),
				"login_state_element": $('#login-state-template'),
				"add_video_element": $('#add-video-template'),
				"board_element": $('#board-template')
			};

			self.templates = {
				"video_template" : elements.video_element.html(),
				"authed_template": elements.authed_element.html(),
				"login_state_template": elements.login_state_element.html(),
				"login_form_template": elements.login_form_element.html(),
				"add_video_template": elements.add_video_element.html(),
				"board_template": elements.board_element.html()
			};

			for (var key in elements) {
				var obj = elements[key];
				obj.remove();
			}

		},

		bindInitialEvents: function() {

			var self = this;
			
			/*$('#fg_link').click(function(e) {
				e.preventDefault();
				window.location.hash = "futureg";
				self.fetchFutureGarage();
			});*/
			
			
			$('.board_link').click(function(e) {
				e.preventDefault();
				
				//board ajax actions
				var boardname = $(this).attr("data-rel");
				window.location.hash = boardname;
				self.fetchBoard(boardname);
				self.board = boardname;
			});

		},

		bindBoardEvents: function() {
			$('.videos_area .video').click(function(e) {

				//Prevent play from occuring when user clicked 'del' button.
				if (!$(e.target).hasClass("closebtn")) {

					var url = $(this).attr("data-url");
					var title = $(this).attr("data-title");
					var smallthumb = $(this).attr("data-smallthumb");
					
					var this_video = {"title": title, "url": url, "smallthumb": smallthumb};
					
					playlist.push(this_video);
					
					if (typeof(playerstatus) === "undefined") {
						initiatePlaylist(this_video.url);
					} else {
						addThumbnailToQueue(playlist[playlist.length-1]);
					}

				}
			});

			
			$('.videos_area .notice .dismiss').click(function() {
				var parent = $(this).parent().parent();
				parent.fadeOut("medium",function() {
					parent.remove();
				});
			});
			
			//actions binded if there is a notice (e.g. videos taken down from youtube).
			if ($('.videos_area .notice').length) {
			
				$('.videos_area .notice .notice_delete').click(function() {
					
					var parent = $(this).parent().parent();
					var urlToDelete = parent.attr("data-url");
					
					if (typeof(urlToDelete) !== "undefined" && urlToDelete !== null && urlToDelete !== "") {
						$.ajax({
							url: "api/delete.php",
							method: "GET",
							data: {"url":urlToDelete},
							success: function(res) {
								parent.addClass("success");
								parent.removeClass("notice");
								parent.text("Successfully removed.");
								parent.fadeOut(1300,function() {
									parent.remove();
								});
							},
							error: function(err) {
								parent.text("Error deleting video "+urlToDelete+" :(");
							}
						});
					} else {
						parent.text("Error deleting video URL '"+urlToDelete+"'.");
					}
				});
			
			}

			$('.videos_area .video .closebtn').click(function(e) {

				var urlToDelete = $(this).parent().attr("data-url");
				var entry = $(this).parent();
				$('.right').prepend('<h4 class="success">Successfully deleted.</h4>');
				var notice = $('.right .success');

				if (typeof(urlToDelete) !== "undefined" && urlToDelete !== null && urlToDelete !== "") {
					$.ajax({
						url: "api/delete.php",
						method: "GET",
						data: {"url":urlToDelete},
						success: function(res) {

							entry.fadeOut(700,function() {
								entry.remove();
							});

							notice.fadeOut(700,function() {
								notice.remove();
								self.fetchBoard(self.board, self.pageno);
							});
						},
						error: function(err) {
							notice.text("Error deleting video "+urlToDelete+" :(");
						}
					});
				} else {
					notice.text("Error deleting video URL '"+urlToDelete+"'.");
				}
			});
		},

		bindAdminEvents: function() {
			
			var self = this;
			var admin_area = $('.admins');

			$('.login_link').click(function() {
				$('.login_link').hide();
				$('#login_form').fadeIn();
			});

			$('#login_form').submit(function(e) {
				e.preventDefault();

				var user = $(this.user).val();
				var pass = $(this.pass).val();
				
				$.ajax({
					url: 'processing/logins.php',
					type: "POST",
					dataType: "json",
					data: {"user": user, "pass": pass},
					success: function(res) {

						add_video_html = self.handlebarsRender(self.templates.add_video_template, {});
						$('.right').prepend(add_video_html);

						admin_area.fadeOut(function(){
							admin_area.empty();

							var authed_html = self.handlebarsRender(self.templates.authed_template, {});
							admin_area.append(authed_html);

							var logout_html = self.handlebarsRender(self.templates.login_state_template, {"state":"logout","message":"logout"});
							admin_area.append(logout_html);

							self.bindAdminEvents();
						}).fadeIn();

						$('#submit_form').fadeIn();
					},
					error: function(res) {
						admin_area.parepend('<h3 class="error">Login failed.</h3>');
					}
				});
			});

			$('#submit_form').submit(function(e) {

				e.preventDefault();
				$('.right .notice').fadeOut();

				$.ajax({
					url: "processing/videos.php",
					type: "POST",
					data: {"board_id": $(this).children('#current_board_id').val(), "vid": $(this).children('#vid_field').val()},
					success: function(res) {
						var success_notice = '<h4 class="success added">Tune successfully added!</h4>';
						$('.right').prepend(success_notice);

						self.fetchBoard(self.board, 0);
						$('.right .added').fadeOut(1450,function() {
							$('.right .added').remove();
						});
					
					},
					error: function(err) {
						$('.right .notice').remove();
						$('.right').prepend('<h4 class="notice" style="display:none">Error: There was a problem adding that tune! Remember to use a <strong>youtube.com</strong> URL.</h4>');
						$('.right .notice').fadeIn();

						$('.right .notice').click(function(e) {
							$(this).fadeOut("fast", function() {
								$(this).remove();
							});
						});
					}
				});
			});

			$('#submit_board').submit(function(e) {
				e.preventDefault();
				var new_board_name = $(this).children('.board_name').val();
				$.ajax({
					url: "processing/boards.php",
					type: "POST",
					data: {"board_name" : new_board_name, "add_board": true},
					success: function(res){
						var new_board_html = self.handlebarsRender(self.templates.board_template, {"name": new_board_name});
						$('.links').append(new_board_html);
						self.bindInitialEvents();
						//self.bindAdminEvents();
					},
					error: function(err) {
						console.log("error adding board!");
						console.log(err);
					}
				});
			});

			$('.links li .actions .edit').click(function(e) {
				e.preventDefault();
				var li = $(this).parent().parent();
				var save = $(this).parent().children('.save');
				var cancel = $(this).parent().children('.save').children('.cancel');

				li.children('a').fadeOut(200);
				li.children('.actions').children('.edit').fadeOut(200);
				li.children('.actions').children('.remove').fadeOut(200, function() {
					save.fadeIn();
					save.children('.new_name').val($(this).attr("data-board"));
					save.children('.new_name').focus();
				});
				

				save.submit(function(e) {
					e.preventDefault();
					var new_name = $(this).children('.new_name').val();
					var board_name = $(this).attr("data-board");

					$.ajax({
						url: "processing/boards.php",
						type: "POST",
						data: {"board_name" : board_name, "edit_board": true, "new_name": new_name},
						success: function(res){
							//update data tags and text
							$('.links li:eq(0) a').attr("href", "#lololol");
							li.children('a').attr("href", "#"+new_name);
							li.children('a').text(new_name);
							li.children('a').attr("data-rel", new_name);
							li.children('.actions').children('.edit').attr("data-board", new_name);
							li.children('.actions').children('.remove').attr("data-board", new_name);
							save.attr("data-board", new_name);

							save.fadeOut(200, function() {
								li.children('a').fadeIn(200);
								li.children('.actions').children('.edit').fadeIn(200);
								li.children('.actions').children('.remove').fadeIn(200);
							});
							
						},
						error: function(err) {
							console.log("error updating that board!");
							console.log(err);
						}
					});
				});

				cancel.click(function(e) {
					e.preventDefault();
					save.fadeOut(200, function() {
						li.children('a').fadeIn(200);
						li.children('.actions').children('.edit').fadeIn(200);
						li.children('.actions').children('.remove').fadeIn(200);
					});
				});

			});

			$('.links li .actions .remove').click(function(e) {
				e.preventDefault();
				var board_name = $(this).attr('data-board');
				var li = $(this).parent().parent();
				$.ajax({
					url: "processing/boards.php",
					type: "POST",
					data: {"board_name" : board_name, "delete_board": true},
					success: function(res){
						li.fadeOut(320, function() {
							li.remove();
						});
					},
					error: function(err) {
						console.log("error deleting that board!");
						console.log(err);
					}
				});
			});


			$('.logout_link').click(function(e) {
				e.preventDefault();
				$.ajax({
					url: 'processing/logins.php',
					type: 'GET',
					data: {"q": true},
					success: function(res) {

						$('#submit_form').fadeOut();

						admin_area.fadeOut(function(){

							admin_area.empty();

							var login_form_html = self.handlebarsRender(self.templates.login_form_template, {});
							admin_area.append(login_form_html);

							var login_html = self.handlebarsRender(self.templates.login_state_template, {"state":"login","message":"submit"});
							admin_area.append(login_html);

							self.bindAdminEvents();

						}).fadeIn();
					},
					error: function(res) {
						admin_area.prepend('<h3>Error logging out.</h3>');
					}
				});
			});
		},

		fetchBoard: function(board, pageno) {

			var self = this;

			$('.right .pagination').remove();

			if (typeof(board) === "undefined" || board === null || board === "") {
				return;
			}
			
			if (typeof(pageno) === "undefined" || typeof(pageno) !== "number") {
				pageno = 0;
			}
			
			//request videos JSON from api.
			
			$.ajax({
				url: "api/videos.php",
				type: "GET",
				data: {board_name: board, page: pageno},
				success: function(res){
					
					$('.right_container .board_name').text(board);
					$('.videos_area').empty();
					var videocount;
					
					if (res && res.videos && res.videos.length > 0) {
			
						$('#current_board_id').val(res.videos[0].boardid);
						videocount = res.videocount;
					
						//Videos were returned - now process them.
						for (var video in res.videos) {

							var url = res.videos[video].video.url;
							var title = res.videos[video].video.title;
							var description = res.videos[video].video.description;
							var uploader = res.videos[video].uploader;
							var thumbnails = [];
							
							//check thumbnails - if they are null, the video has likely been removed from youtube.
							if (res.videos[video].thumbnails !== null) {
							
								thumbnails = res.videos[video].thumbnails;
								
								var video_html = self.handlebarsRender(self.templates.video_template, {
									url: url,
									title: title,
									thumbnail: thumbnails[0].url,
									smallthumb: thumbnails[1].url
								});

								$('.videos_area').append(video_html);
								
							} else {
								//Video likely removed from youtube - provide notice (with dismiss/delete from mixxxxes shortcuts).
								//Other scenario is that this tune was added before mixxxxes backend structure was updated (no thumbs grabbed)
								$('.videos_area').prepend('<h3 class="notice" data-url="'+url+'">Notice: Thumbnails missing for '+title+' ('+url+'). May have been deleted from YouTube.<span class="shortcuts"><a class="notice_delete">Delete video from mixxxx.es</a><a class="dismiss">Dismiss</a></span></h3>');
							}
							
						}
						
						//Finished processing videos, now generate pagination html based on videocount
						if (typeof(videocount) === "number" && videocount > 16) {

							
							//calculate page count, generate html and insert into DOM.
							var pagecount = Math.ceil(videocount/16); //16 videos per page
							
							var links = "";
							
							for (var i = 1; i<pagecount+1; i++) {
								links += '<a class="pagination_link" href="#" data-pageno="'+i+'">'+i+'</a>';
							}
							
							var paginationhtml = '<div class="pagination">'+links+'</div>';
							if ($('.right .pagination')) {
								$('.right .pagination').remove();
							}
							$('.right').append(paginationhtml);
							
							if ($('.right .pagination')) {
								if (pageno) {
									$('.right .pagination a:eq('+(pageno-1)+')').addClass("active");
								} else {
									$('.right .pagination a:eq(0)').addClass("active");
								}
							}
							
							$('.right .pagination .pagination_link').click(function(e) {
								e.preventDefault();
								var pagenum = parseInt($(this).attr("data-pageno"), 10);
								if (typeof(self.board) === "string") {
									self.fetchBoard(self.board, pagenum);
								}
							});
						}

						
					} else {
						$('#current_board_id').val(res.boardid);
						$('.videos_area').empty().append("No videos found.");
					}
					
					self.board = board;
					self.pageno = pageno;
					self.bindBoardEvents();

				},
				error: function(err) {
					$('.right_container .board_name').text(board);
					if (err.responseText !== null && err.responseText !== "") {
						$('.videos_area').empty().append(err.responseText);
					} else {
						$('.videos_area').empty().append("No videos found.");
					}

					self.bindBoardEvents();
				}
			});
		},

		handlebarsRender: function(template, content) {

			var self = this;

			//Pick up handlebars.js template
			var source  = template;

			//Compile
			var compiled = Handlebars.compile(source);
			
			//Push content into template
			var values = content;

			//Return html
			return compiled(values);
		}
	};
	
})();

$(document).ready(function() {

	Mixxxxes.init();

	if (window.location.hash !== "" && window.location.hash != "#futureg") {
		Mixxxxes.board = window.location.hash.replace('#', '');
		Mixxxxes.fetchBoard(Mixxxxes.board);
	} /*else if (window.location.hash == "#futureg") {
		window.location.hash = "futureg";
		fetchFutureGarage();
	}*/ else {
		window.location.hash = "clssx";
		Mixxxxes.board = window.location.hash.replace('#', '');
		Mixxxxes.fetchBoard(Mixxxxes.board);
	}
	
	/*function fetchFutureGarage() {
	
		$('.right_container .board_name').text("futureg");
		
		$.ajax({
			url: 'reddit.php',
			type: "GET",
			success: function(res){
				//$('.right').html(res);
				bindBoardEvents();
			}
		});
	}*/
	
});