<?php
    session_start();
    if (isset($_SESSION['username'])) {
        unset($_SESSION['username']);
    }
    if (isset($_SESSION['role'])) {
        unset($_SESSION['role']);
    }
    if (isset($_POST['doLogin'])) {
        unset($_POST['doLogin']);
    }

    header("Location:index.php");