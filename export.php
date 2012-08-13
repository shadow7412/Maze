<?php
if(isset($_COOKIE['mazelevel'])){
	header('Content-Disposition: attachment; filename="maze.txt"');
	echo str_replace("|","\n",$_COOKIE['mazelevel']);
} else {
	
}
?>