<?php
if(!isset($_SESSION)) 
{ 
session_start(); 
}

if( !defined( __DIR__ ) )define( __DIR__, dirname(__FILE__) );
require(__DIR__.'../../classes/db.php');


//PROCESS LOGINS
if (isset($_POST['user']) && isset($_POST['pass'])) {
	if ($_POST['user'] != null && $_POST['pass'] != null) {
		//	echo 'lol';
		function checkUserPass($user, $pass) {
       
   			$result = mysql_query("SELECT * FROM `users` WHERE user = '".$user."'") or die("Query failed with error: ".mysql_error());
			while ($row = mysql_fetch_array($result)) {
				$the_user = array("user" => $row['user'],"pass" => $row['pass']);
			}
			
			if ($pass == $the_user["pass"]) {
			 	return true;
			} else {
				return false;
			}
		}

		function getUserId($user) {
			$result = mysql_query("SELECT * FROM `users` WHERE user = '".$user."'") or die("Query failed with error: ".mysql_error());
			while ($row = mysql_fetch_array($result)) {
				$id = $row['ID'];
			}

			return $id;
		}
		
		$success = checkUserPass($_POST['user'], md5($_POST['pass']));
		
		if ($success == true) {
			$_SESSION['bro'] = 'truetrue';
			$_SESSION['userid'] = getUserId($_POST['user']);
			header('HTTP/1.1 200 OK');
			echo json_encode(array("success" => true));
		} else {
			header('HTTP/1.1 403 Forbidden');
			echo json_encode(array("success" => false));
		}
	}
}

//PROCESS LOGOUT
if (isset($_GET['q'])) {
	session_destroy();
	header('HTTP/1.1 200 OK');
	echo json_encode(array("success" => true));
}

?>