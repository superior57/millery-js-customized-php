$(document).ready(function() {
    console.log("ready");

    $("#millery").millery({
        panelType: "modal",
        visibleColumns: 1,
        onnodeclick: function (instance, node, data) {
            instance.setPanelData(`
                ${data.content}
                <br>
                <a href="${data.link}" target="_blank" class="btn btn-primary mt-2" >Button Link</a>            
            `);
            return true;
        },
        columns: [{
            header: "NETWORKS",
            sourceType: "json",
            source: "/data/millery-data-1.json",
            idField: "id",
            parentIdField: null,
            labelField: "label",
            searchParam: "query",
            childrenCountField: "children",
            format: function (value, obj) {
                return value;
            }
        },
        {
            header: "Second Column",
            sourceType: "json",
            source: "/data/millery-data-2.json",
            idField: "id",
            parentIdField: "parent",
            childrenCountField: "children",
            labelField: "label",
            searchParam: "query",
            format: function (value, obj) {
                return value;
            }
        },
        {
            header: "Third Column",
            sourceType: "json",
            source: "/data/millery-data-3.json",
            idField: "id",
            parentIdField: "parent",
            childrenCountField: "children",
            labelField: "label",
            searchParam: "query",
            format: function (value, obj) {
                return value;
            }
        }]
    });
})