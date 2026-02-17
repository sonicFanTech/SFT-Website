<?php
include("db_connect.php"); // Connect to MySQL

$result = $conn->query("SELECT username, comment, timestamp FROM comments ORDER BY timestamp DESC");

$comments = [];
while ($row = $result->fetch_assoc()) {
    $comments[] = $row;
}

echo json_encode($comments);
?>