<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Testing Task</title>

    <link href="https://fonts.googleapis.com/css?family=Source+Sans+Pro:300,400,400i,500,700" rel="stylesheet"/>
    <link href="https://maxcdn.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css" rel="stylesheet"/>

    <!-- Bootstrap CSS 4.0.0 -->
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css" integrity="sha384-Gn5384xqQ1aoWXA+058RXPxPg6fy4IWvTNh0E263XmFcJlSAwiGgFAW/dAiS6JXm" crossorigin="anonymous">
    <!-- Custom CSS -->
    <link rel="stylesheet" href="assets/css/style.scss">
</head>
<body>
    <?php
        session_start();

        include 'config/dbConnect.php';

        if (isset($_POST['doLogin'])) {
            $username = trim($_POST['username']);
            $password = md5(trim($_POST['password']));
            
            if ($username=="" || $password=="") {
                $error="Username and Password is Required";
            } else {
                $login = $conn->prepare("SELECT username, password, role FROM tbl_users WHERE username=:username");
                $login->bindParam(':username',$username);
                $login->execute();
                
                $data = $login->fetch(PDO::FETCH_ASSOC);
                
                if (COUNT($data) > 1 && $password == $data['password']) {
                    $_SESSION['username'] = $data['username'];
                    $_SESSION['role'] = $data['role'];
                    header("location:dashboard.php");
                }
                else {
                    $error="Username or Password is Incorrect";
                    $username = "";
                    $password = "";              
                    
                    echo ($error);
                }
            }

        }

    ?>
    <nav class="navbar navbar-expand-lg navbar-light bg-white">
        <div class="container px-2">
            <ul class="navbar-nav ml-auto">                
                <?php if (isset($_SESSION['username']) && $_SESSION['username'] != "") { ?>
                    <li class="nav-item mr-3">
                        <a class="nav-link" href="/dashboard.php" >Edit Category</a>
                    </li>
                    <li class="nav-item mr-3">
                        <span><?php echo $_SESSION['username'] ?></span>
                    </li>
                    <li class="nav-item">
                        <a class="btn btn-primary text-white" href="/logout.php">Logout</a>
                    </li>

                <?php } else { ?>
                    <li class="nav-item">
                        <a class="btn btn-danger text-white" href="#" data-toggle="modal" data-target="#loginModal" >Login</a>
                    </li>
                <?php } ?>             
            </ul>
        </div>
    </nav>

    <div class="content-wrapper pt-5">
        <div class="container">
            <div id="millery" class="millery millery-theme-1"></div>
        </div>
    </div>
    
    <!-- jQuery & Bootstrap JS -->
    <script src="https://code.jquery.com/jquery-3.2.1.slim.min.js" integrity="sha384-KJ3o2DKtIkvYIK3UENzmM7KCkRr/rE9/Qpg6aAZGJwFDMVNA/GpGFF93hXpG5KkN" crossorigin="anonymous"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.12.9/umd/popper.min.js" integrity="sha384-ApNbgh9B+Y1QKtv3Rn7W3mgPxhU9K/ScQsAP7hUibX39j7fakFPskvXusvfa0b4Q" crossorigin="anonymous"></script>
    <script src="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/js/bootstrap.min.js" integrity="sha384-JZR6Spejh4U02d8jOt6vLEHfe/JQGiRRSQQxSfFWpi1MquVdAyjUar5+76PVCmYl" crossorigin="anonymous"></script>
    <script type="text/javascript" src="https://ajax.googleapis.com/ajax/libs/jquery/2.1.4/jquery.min.js"></script>
   

    <!-- millery includes -->
    <link href="assets/millery/build/css/millery.min.css" rel="stylesheet"/>
    <!-- <script src="assets/millery/build/js/millery.min.js"></script> -->
    <script src="assets/millery/js/millery.js"></script>
    <!-- end millery includes -->

    <!-- Main JS -->
    <script src="assets/js/script.js"></script>

    <!-- Modal -->
    <div class="modal fade" id="loginModal" tabindex="-1" role="dialog" aria-labelledby="Login Modal" aria-hidden="true">
        <div class="modal-dialog" role="document">
            <div class="modal-content">
                <div class="modal-header">
                <h5 class="modal-title" id="loginModalTitle">Sign in Administrator</h5>
                <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                </button>
                </div>
                <div class="modal-body">
                    <form action="index.php" method="post">
                        <div class="form-group">
                            <label for="userName">User name</label>
                            <input type="text" class="form-control" id="username" name="username" aria-describedby="userName" placeholder="Enter name">
                        </div>
                        <div class="form-group">
                            <label for="userPassword">Password</label>
                            <input type="password" class="form-control" id="password" name="password" placeholder="Password">
                        </div>
                        <button type="submit" name="doLogin" class="btn btn-primary">Login</button>
                    </form>
                </div>
                <div class="modal-footer">
                </div>
            </div>
        </div>
    </div>
</body>
</html>