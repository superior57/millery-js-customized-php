$(document).ready(function() {
    console.log("ready");

    $("#millery").millery({
        panelType: "modal",
        visibleColumns: 1,
        onnodeclick: function (instance, node, data) {
            const { target } = data;
            let buttonUI = "";
            switch (target) {
                case "popup": 
                    buttonUI = `
                        <a 
                            href="${data.link}" 
                            target="${data.target}" 
                            class="btn btn-primary mt-2"  
                            onclick="window.open('${data.link}', 'popup', 'width=600, height=600'); return false;"
                        >Button Link</a>  
                        `; break;                    
                case "frame":
                    buttonUI = `
                        <a 
                            href="${data.link}" 
                            target="${data.frameName}" 
                            class="btn btn-primary mt-2"  
                        >Button Link</a>  
                        `; break;
                default:
                    buttonUI = `
                        <a 
                            href="${data.link}" 
                            target="${data.target}" 
                            class="btn btn-primary mt-2"
                        >Button Link</a>  
                        `;
            }
            instance.setPanelData(`
                ${data.content}
                <br> ${buttonUI}          
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