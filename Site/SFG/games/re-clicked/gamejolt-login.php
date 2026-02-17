<?php
session_start(); // Start session for storing login info

// Game Jolt API Details
$game_id = "936494";  // Replace with your Game Jolt Game ID
$private_key = "5f5f263648dcca3df1af8920d5654adb";  // Replace with your Private Key

if (isset($_GET['username']) && isset($_GET['token'])) {
    $username = $_GET['username'];
    $token = $_GET['token'];

    // Generate signature for authentication
    $signature = md5($username . $token . $private_key);
    
    // Game Jolt API URL to verify login
    $api_url = "https://api.gamejolt.com/api/game/v1_2/users/auth/?game_id=$game_id&username=$username&user_token=$token&signature=$signature";
    
    $response = file_get_contents($api_url);
    $data = json_decode($response, true);

    if ($data['response']['success']) {
        $_SESSION['username'] = $username; // Store username in session
        echo json_encode(["success" => true, "username" => $username]);
    } else {
        echo json_encode(["success" => false, "message" => "Login failed!"]);
    }
} else {
    echo json_encode(["success" => false, "message" => "Invalid request!"]);
}
?>
