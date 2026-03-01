<?php
header("Content-Type: application/json");

$file = "orders.json";

if (!file_exists($file)) {
    echo json_encode([]);
    exit;
}

echo file_get_contents($file);
?>