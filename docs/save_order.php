<?php
header("Content-Type: application/json");

$data = json_decode(file_get_contents("php://input"), true);

$file = "orders.json";

if (!file_exists($file)) {
    file_put_contents($file, json_encode([]));
}

$orders = json_decode(file_get_contents($file), true);
$orders[] = $data;

file_put_contents($file, json_encode($orders));

echo json_encode(["status" => "success"]);
?>