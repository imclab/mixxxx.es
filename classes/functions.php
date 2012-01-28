<?php
		
		require('db.php');
		require('video.php');
		require('boardVideo.php');
		require('boards.php');
		require('videoThumbs.php');

 		function getVideoByUrl($url) {
       	
   			$result = mysql_query("SELECT * FROM `videos` WHERE `url` = '".$url."'") or die("Query failed with error: ".mysql_error());
			while ($row = mysql_fetch_array($result)) {
				$video = new Video ($row['id'],$row['title'],$row['url'],$row['description']);
			}
			
			if (isset($video)) {
				return $video;
			} else {
				return null;
			}
       }

       function getVideoById($id) {
       	
   			$result = mysql_query("SELECT * FROM `videos` WHERE `id` = ".$id) or die("Query failed with error: ".mysql_error());
			while ($row = mysql_fetch_array($result)) {
				$video = new Video ($row['id'],$row['title'],$row['url'],$row['description']);
			}
			
			if (isset($video)) {
				return $video;
			} else {
				return null;
			}
       }


       function getBoardVideos($boardid) {

			$result = mysql_query("SELECT * FROM `boardvideos` WHERE `boardid` =".$boardid) or die("Query failed with error: ".mysql_error());
			
			while ($row = mysql_fetch_array($result)) {
				$video = array($row['id'],$row['boardid'],$row['videoid'],$row['uploaderid']);
				$vids[] = $video;
			}
			
			$videos = array_reverse($vids);
			
			foreach ($videos as $video) {
				$r_videos[] = new BoardVideo($video[0],$video[1],$video[2],$video[3]);
			}
			
			return $r_videos;

		}

		function getBoardVideosAt($boardid, $pageno) {

			$result = mysql_query("SELECT * FROM `boardvideos` WHERE `boardid` =".$boardid) or die("Query failed with error: ".mysql_error());
			
			while ($row = mysql_fetch_array($result)) {
				$video = array($row['id'],$row['title'],$row['url'],$row['description']);
				$vids[] = $video;
			}
			
			$videos = array_reverse($vids);
			
			foreach ($videos as $video) {
				$r_videos[] = new Video($row['id'],$row['title'],$row['url'],$row['description']);
			}
			
			$perpage = 8; //8 per page.
			$startpos = (($pageno-1)*$perpage); 
			
			$this_page = array_slice($r_videos, $startpos, 8);		
			
			return $this_page;

		}


		function countBoardVideos($boardid) {

			$result = mysql_query("SELECT * FROM `boardvideos` WHERE `boardid` =".$boardid) or die("Query failed with error: ".mysql_error());
			
			while ($row = mysql_fetch_array($result)) {
				$vids[] = $row['id'];
			}
			
			return count($vids);

		}


		function getAllBoards() {
       
   			$result = mysql_query("SELECT * FROM `boards`") or die("Query failed with error: ".mysql_error());
			while ($row = mysql_fetch_array($result)) {
				$board = new Board($row['id'],$row['name']);
				$boards[] = $board;
			}
			
			return $boards;

       }
       
       function getAllBoardsInJson() {
       
       	   	$result = mysql_query("SELECT * FROM `boards`") or die("Query failed with error: ".mysql_error());
       	   	
			while ($row = mysql_fetch_array($result)) {
				$board = array("id" => $row['id'],"name" =>$row['name']);
				$boards[] = $board;
			}
			
			return json_encode($boards);
       
       }
       
       function getBoardByName($name) {
       	
   			$result = mysql_query("SELECT * FROM `boards` WHERE `name` = '".$name."'") or die("getBoardByName failed with error: ".mysql_error());
			while ($row = mysql_fetch_array($result)) {
				$board = new Board ($row['id'],$row['name']);
			}
			
			if (isset($board)) {
				return $board;
			} else {
				return null;
			}
       }
	   
	    function getBoardByID($id) {
       	
   			$result = mysql_query("SELECT * FROM `boards` WHERE `id` = '".$id."'") or die("Query failed with error: ".mysql_error());
			while ($row = mysql_fetch_array($result)) {
				$board = new Board ($row['id'],$row['name']);
			}
			
			if (isset($board)) {
				return $board;
			} else {
				return null;
			}
       }


?>