$(document).ready(function(){
    $("#add_row").click(function(){
        var i= parseInt($('#subCategoryCount').val());
        $('#item'+i).html("<td>"+ (i+1) +"</td><td><input name='subcatName"+i+"' type='text' placeholder='Sub Category' class='form-control input-md'  /> </td><td><input  name='subcatContent"+i+"' type='text' placeholder='Model Content'  class='form-control input-md'></td><td><input  name='subcatBtnLink"+i+"' type='text' placeholder='Button Link'  class='form-control input-md'></td>");
        $('#tblSubCategory').append('<tr id="item'+(i+1)+'"></tr>');
        i++; 
        $('#subCategoryCount').val(i);
    });

    $("#delete_row").click(function(){
        var i= parseInt($('#subCategoryCount').val());
        if(i>1){
            $('#deletedSubCategories').val(`${$('#deletedSubCategories').val()}${$(`input[name='subcatId${i-1}']`).val()},`);
            console.log($('#deletedSubCategories').val());
            $("#item"+(i-1)).html('');
            i--;
            $('#subCategoryCount').val(i);
        }
    });
});

$.ajax({
    url: "/data/millery-data-1.json",
    method: "get",
    dataType: "json",
    success: (data) => {
        var dataSet = [];
        data.forEach((d) => {
            let item = [];
            item.push(d['label']);
            item.push(d);
            dataSet.push(item);
        });
        
        $("#tblCategory").dataTable({
            "aaData":dataSet,
            "lengthMenu": [[5, 10, 25, 50, -1], [5, 10, 25, 50, "All"]],
            "aoColumnDefs":[
                {
                    "sTitle":"Category", 
                    "aTargets": [ "th_category" ]
                },
                {
                    "sTitle":"Action", 
                    "aTargets": [ 1 ],
                    "mRender": function (data) {
                        return `
                            <button class="btn btn-info btn-sm" data-toggle="modal" data-target="#categoryModal" onclick="handleClickEdit(${data['id']})" ><i class="fa fa-edit"></i> Edit</button>
                            <button class="btn btn-danger btn-sm" data-target="#deleteModal" data-toggle="modal" onclick="openDeleteModal(${data['id']})" > <i class="fa fa-trash"></i> Delete</button>
                        `
                    }
                },
            ]
        });
    }
});

function handleClickAdd() {
    $('#categoryModalTitle').text("Add New Category");
    $('#categoryName').val("");
    $('#categoryIcon').val("");
    $('#categoryColor').val("");
    $('#categoryId').val("");

    $('#subCategoryWrap').empty();
    $('#subCategoryWrap').append(`
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
    `)
}

function handleClickEdit(categoryId) {
    console.log(categoryId);
    $.ajax({
        url: "/src/edit.php",
        method: 'get',
        dataType: 'json',
        data: {
            edit: "getCategoryDetails",
            id: categoryId
        },
        success: (res) => {
            let data = res.data;
            let subData = res.subData;
            console.log(res);
            $('#categoryModalTitle').text("Edit Category");
            $('#categoryName').val(data.label);
            $('#categoryIcon').val(data.icon);
            $('#categoryColor').val(data.iconColor);
            $('#categoryId').val(data.id);

            $('#subCategoryWrap').empty();
            if (subData.length > 0) {
                for (let i = 0; i < subData.length; i ++) {
                    $('#subCategoryWrap').append(`
                        <tr id='item${i}'>
                            <input type="hidden" id="subcatId${i}" name="subcatId${i}" value="${subData[i].id}" />
                            <td>
                                ${i + 1}
                            </td>
                            <td>
                                <input type="text" name='subcatName${i}'  placeholder='Sub Category' class="form-control" value="${subData[i].label}"/>
                            </td>
                            <td>
                                <input type="text" name='subcatContent${i}' placeholder='Model Content' class="form-control" value="${subData[i].content}"/>
                            </td>
                            <td>
                                <input type="text" name='subcatBtnLink${i}' placeholder='Button Link' class="form-control" value="${subData[i].link}"/>
                            </td>
                        </tr>
                    `);
                }
                $('#subCategoryCount').val(subData.length);
                
                $('#subCategoryWrap').append(`
                    <tr id='item${subData.length}'></tr>
                    `)
            } else {
                $('#subCategoryWrap').append(`
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
                    `)
            }
        },
        error: (error) => {
            console.log(error);
        }
    })
}

function openDeleteModal(categoryId) {
    $('#deleteCategoryId').val(categoryId);
}