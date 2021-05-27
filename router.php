<?php
    $request = $_SERVER['REQUEST_URI'];

    switch ($request) {
        case '/': header("Location: index.php"); break;
        case '': header("Location: index.php"); break;
        case '/admin': header("Location: admin.php");break;
    }