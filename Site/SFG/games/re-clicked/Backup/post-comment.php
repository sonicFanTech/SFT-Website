<?php
session_start();
include("db_connect.php"); // Connect to MySQL

if (!isset($_SESSION['username'])) {
    echo json_encode(["success" => false, "message" => "You must be logged in!"]);
    exit();
}

$username = $_SESSION['username'];
$comment = $_POST['comment'];

if (!empty($comment)) {
    $stmt = $conn->prepare("INSERT INTO comments (username, comment) VALUES (?, ?)");
    $stmt->bind_param("ss", $username, $comment);
    $stmt->execute();
    echo json_encode(["success" => true, "message" => "Comment posted!"]);
} else {
    echo json_encode(["success" => false, "message" => "Comment cannot be empty!"]);
}
?>
