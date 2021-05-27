<?php
        session_start();

        // Load data from Json file.            
        $data = file_get_contents('../data/millery-data-1.json');
        $data_arr = json_decode($data, true);
        $subData = file_get_contents('../data/millery-data-2.json');
        $subData_arr = json_decode($subData, true);

        // Get Category details in Edit dialog.
        if (isset($_GET['edit'])) {
            $categoryId = $_GET['id'];
            $key = array_search($categoryId, array_column($data_arr, 'id'));
            $subCategories = [];
            foreach ($subData_arr as $k => $subValue) {
                if ($subValue['parent'] == $categoryId) {
                    $subCategories[] = $subValue;
                }
            }                
            echo (json_encode(array(
                "data" => $data_arr[$key],
                "subData" => $subCategories
            )));  exit;
        }

        // Save Category & Sub Category data
        if (isset($_POST['save'])) {
            $categoryId = $_POST['categoryId'];
            $name = $_POST['categoryName'];
            $icon = $_POST['categoryIcon'];
            $color = $_POST['categoryColor'];

            $subCategoryCount = $_POST['subCategoryCount'];

            // Update Category & Sub Category data
            if ($categoryId != "") {  
                $key = array_search($categoryId, array_column($data_arr, 'id'));

                // Update Category data
                $data_arr[$key]['label'] = $name;
                $data_arr[$key]['icon'] = $icon;
                $data_arr[$key]['iconColor'] = $color;
                
                // Delete Sub Categories
                $deletedSubCategories = $_POST['deletedSubCategories'];
                $deletedSubCategories_arr = explode(",", $deletedSubCategories);
                foreach ($deletedSubCategories_arr as $k_ds => $ds_id) {
                    if ($ds_id != "" && $ds_id != "undefined") {
                        $ds_sub_key = array_search($ds_id, array_column($subData_arr, 'id'));                        
                        $new_subData_arr = [];
                        foreach($subData_arr as $i_key => $val) {
                            if ($ds_sub_key != $i_key)
                                $new_subData_arr[] = $val;
                        }                       
                        $subData_arr = $new_subData_arr;
                    }
                }
                                    
                // Update Sub Category Data
                for ($i = 0; $i <= $subCategoryCount; $i ++) {                        
                    if (isset($_POST['subcatName'.$i]) && $_POST['subcatName'.$i] != "") {
                        $subcatName = $_POST['subcatName'.$i];
                        $subcatContent = $_POST['subcatContent'.$i];
                        $subcatBtnLink = $_POST['subcatBtnLink'.$i];
                        $subcatBtnLinkTarget = $_POST['subcatBtnLinkTarget'.$i];
                        $subcatFrameName = $_POST['subcatFrameName'.$i];

                        if (isset($_POST['subcatId'.$i]) && $_POST['subcatId'.$i] != "") {
                            $subcatId = $_POST['subcatId'.$i];
                            $subKey = array_search($subcatId, array_column($subData_arr, 'id'));
                            $subData_arr[$subKey]['label'] = $subcatName;
                            $subData_arr[$subKey]['content'] = $subcatContent;
                            $subData_arr[$subKey]['link'] = $subcatBtnLink;
                            $subData_arr[$subKey]['target'] = $subcatBtnLinkTarget;
                            $subData_arr[$subKey]['frameName'] = $subcatFrameName;

                        } else {
                            $subData_arr[] = array(
                                "id" => intval($subData_arr[count($subData_arr) - 1]['id'], 10) + 1,
                                "label" => $subcatName,
                                "children" => 0,
                                "parent" => $categoryId,
                                "content" => $subcatContent,
                                "link" => $subcatBtnLink,
                                "target" => $subcatBtnLinkTarget,
                                "frameName" => $subcatFrameName
                            );
                        }
                    }
                }

                // Write Sub Category to Json file
                file_put_contents('../data/millery-data-2.json', json_encode($subData_arr));
            } else {  // Add New Category & Sub Category data
                $newCatId = intval($data_arr[count($data_arr) - 1]['id'], 10) + 1; 
                $i_subcatcnt = 0;    
                
                // Add New Sub Category data
                for ($i = 0; $i <= $subCategoryCount; $i ++) {                        
                    if (isset($_POST['subcatName'.$i]) && $_POST['subcatName'.$i] != "") {
                        $subcatName = $_POST['subcatName'.$i];
                        $subcatContent = $_POST['subcatContent'.$i];
                        $subcatBtnLink = $_POST['subcatBtnLink'.$i];
                        $subcatBtnLinkTarget = $_POST['subcatBtnLinkTarget'.$i];
                        $subcatFrameName = $_POST['subcatFrameName'.$i];

                        $subData_arr[] = array(
                            "id" => intval($subData_arr[count($subData_arr) - 1]['id'], 10) + 1,
                            "label" => $subcatName,
                            "children" => 0,
                            "parent" => $newCatId,
                            "content" => $subcatContent,
                            "link" => $subcatBtnLink,
                            "target" => $subcatBtnLinkTarget,
                            "frameName" => $subcatFrameName
                        );
                        $i_subcatcnt ++;
                    }
                }

                // Add New Category data
                $data_arr[] = array (
                    'id' => $newCatId,
                    'label' => $name,
                    'children' => $i_subcatcnt,
                    'parent' => null,
                    'icon' => $icon,
                    'iconColor' => $color
                );

                // Write Sub Category to Json file
                file_put_contents('../data/millery-data-2.json', json_encode($subData_arr));
            }

            // Write Category to Json file
            file_put_contents('../data/millery-data-1.json', json_encode($data_arr));

            header('Location: ../admin.php');
        }

        // Delete Category Data
        if (isset($_POST['delete'])) {            
            $categoryId = $_POST['deleteCategoryId'];
            $key = array_search($categoryId, array_column($data_arr, 'id'));

            $new_data_arr = [];
            foreach($data_arr as $i_key => $val) {
                if ($key != $i_key)
                    $new_data_arr[] = $val;
            }
            
            file_put_contents('../data/millery-data-1.json', json_encode($new_data_arr));
            header("Location: ../admin.php");
        }

?>