<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Testing Task</title>

    <link href="https://fonts.googleapis.com/css?family=Source+Sans+Pro:300,400,400i,500,700" rel="stylesheet"/>
    <link href="http://maxcdn.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css" rel="stylesheet"/>
    <link rel="stylesheet" type="text/css" href="https://cdn.datatables.net/v/dt/dt-1.10.24/datatables.min.css">

    <!-- Bootstrap CSS 4.0.0 -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@4.6.0/dist/css/bootstrap.min.css" integrity="sha384-B0vP5xmATw1+K9KRQjQERJvTumQW0nPEzvF6L/Z6nronJ3oUOFUFpCjEUQouq2+l" crossorigin="anonymous">
    <!-- Custom CSS -->
    <link rel="stylesheet" href="assets/css/style.scss">
</head>
<body>
    <?php
        session_start();
        if (isset($_SESSION['username']) && $_SESSION['username'] != "") {

            if (isset($_GET['name']) && $_GET['name'] == "getCategoryDetails") {
                $categoryId = $_GET['id'];
                $data = file_get_contents('data/millery-data-1.json');
                $data_arr = json_decode($data, true);
                $key = array_search($categoryId, array_column($data_arr, 'id'));

                echo (json_encode($data_arr[$key])); exit();
            }

        } else {
            header('Location: index.php');
        }

    ?>
    <nav class="navbar navbar-expand-lg navbar-light bg-white">
        <div class="container px-2">
            <ul class="navbar-nav ml-auto">                
                <?php if (isset($_SESSION['username']) && $_SESSION['username'] != "") { ?>
                    <li class="nav-item mr-3">
                        <a class="nav-link" href="/index.php" >Home</a>
                    </li>
                    <li class="nav-item mr-3">
                        <span><?php echo $_SESSION['username'] ?></span>
                    </li>
                    <li class="nav-item">
                        <a class="btn btn-primary text-white" href="/logout.php">Logout</a>
                    </li>
                <?php } else { ?>
                    <li class="nav-item">
                        <a class="btn btn-danger text-white" href="#" data-toggle="modal" data-target="#exampleModal" >Login</a>
                    </li>
                <?php } ?>             
            </ul>
        </div>
    </nav>

    <div class="content-wrapper pt-5">
        <div class="container">
            <div class="row clearfix">
                <div class="category-background col-md-12 p-1 rounded-lg">
                    <div class="category-table-header d-flex justify-content-between py-3 px-4">
                        <h5>Categories</h5>
                        <button class="btn btn-primary" data-toggle="modal" data-target="#categoryModal" onclick="handleClickAdd()">Add Category</button>
                    </div>
                    <div class="category-table-body px-4 py-3">
                        <table id="tblCategory">
                            <thead>
                                <tr>
                                    <th class="th_category">Category</th>
                                    <th class="th_action">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Modal -->
    <div class="modal fade" id="categoryModal" tabindex="-1" role="dialog" aria-labelledby="Category Modal" aria-hidden="true">
        <div class="modal-dialog modal-xl" role="document">
            <div class="modal-content">
                <div class="modal-header">
                <h5 class="modal-title" id="categoryModalTitle" >Add New Category</h5>
                <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                </button>
                </div>
                <form action="/src/edit.php" method="post">
                    <input type="hidden" id="categoryId" name="categoryId" value="">
                    <input type="hidden" id="subCategoryCount" name="subCategoryCount" value="1">
                    <input type="hidden" id="deletedSubCategories" name="deletedSubCategories" value="">
                    <div class="modal-body">
                        <div class="form-group row justify-content-between">
                            <label for="categoryName" class="col-sm-2 col-form-label">Category</label>
                            <div class="col-sm-8">
                                <input type="text" class="form-control" id="categoryName" name="categoryName"  placeholder="Category Name Here" value="">
                            </div>
                        </div>
                        <div class="form-group row justify-content-between">
                            <label for="categoryIcon" class="col-sm-2 col-form-label">Icon</label>
                            <div class="col-sm-8">
                                <input type="text" class="form-control" id="categoryIcon" name="categoryIcon" placeholder="Icon" value="">
                            </div>
                        </div>
                        <div class="form-group row justify-content-between">
                            <label for="categoryColor" class="col-sm-2 col-form-label">Color</label>
                            <div class="col-sm-8">
                                <input type="text" class="form-control" id="categoryColor" name="categoryColor" placeholder="Color" value="">
                            </div>
                        </div>

                        <div class="clearfix">
                            <div class="row clearfix">
                                <div class="col-md-12 column">
                                    <table class="table table-bordered table-hover" id="tblSubCategory">
                                        <thead>
                                            <tr >
                                                <th class="text-center">
                                                    #
                                                </th>
                                                <th class="text-center">
                                                    Sub Category
                                                </th>
                                                <th class="text-center">
                                                    Content
                                                </th>
                                                <th class="text-center">
                                                    Button Link
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody id="subCategoryWrap">
                                            <tr id='item0'>
                                                <td>
                                                    1
                                                </td>
                                                <td>
                                                    <input type="text" name='subcatName0'  placeholder='Sub Category' class="form-control"/>
                                                </td>
                                                <td>
                                                    <input type="text" name='subcatContent0' placeholder='Model Content' class="form-control"/>
                                                </td>
                                                <td>
                                                    <input type="text" name='subcatBtnLink0' placeholder='Button Link' class="form-control"/>
                                                </td>
                                            </tr>
                                            <tr id='item1'></tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            <a id="add_row" class="btn btn-default pull-left">Add Row</a><a id='delete_row' class="pull-right btn btn-default">Delete Row</a>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>
                        <button type="submit" class="btn btn-primary" name="save" >Save changes</button>
                    </div>
                </form>
            </div>
        </div>
    </div>

    <!-- Modal -->
    <div class="modal fade" id="deleteModal" tabindex="-1" role="dialog" aria-labelledby="Delete Modal" aria-hidden="true">
        <div class="modal-dialog" role="document">
            <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title">Are you sure to delete this item?</h5>
                <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                <span aria-hidden="true">&times;</span>
                </button>
            </div>
                <form action="/src/edit.php" method="post">
                    <input type="hidden" name="deleteCategoryId" id="deleteCategoryId" value="1">
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-dismiss="modal">Cancel</button>
                        <button type="submit" name="delete" class="btn btn-primary">Delete</button>
                    </div>
                </form>
            </div>
        </div>
    </div>
    
    <!-- jQuery & Bootstrap JS -->
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js"></script>
    <script src="https://code.jquery.com/jquery-3.5.1.slim.min.js" integrity="sha384-DfXdz2htPH0lsSSs5nCTpuj/zy4C+OGpamoFVy38MVBnE+IbbVYUew+OrCXaRkfj" crossorigin="anonymous"></script>
    <script src="https://cdn.jsdelivr.net/npm/popper.js@1.16.1/dist/umd/popper.min.js" integrity="sha384-9/reFTGAW83EW2RDu2S0VKaIzap3H66lZH81PoYlFhbGU+6BZp6G7niu735Sk7lN" crossorigin="anonymous"></script>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@4.6.0/dist/js/bootstrap.min.js" integrity="sha384-+YQ4JLhjyBLPDQt//I+STsc9iw4uQqACwlvpslubQzn4u2UU2UFM80nGisd026JF" crossorigin="anonymous"></script>
    <script type="text/javascript" src="http://ajax.googleapis.com/ajax/libs/jquery/2.1.4/jquery.min.js"></script>
    <script type="text/javascript" charset="utf8" src="https://cdn.datatables.net/v/dt/dt-1.10.24/datatables.min.js"></script>

    <script src="assets/js/dashboard.js"></script>

</body>
</html>