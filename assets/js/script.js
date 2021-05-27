
var state = {
    categories: [],
    subCategories: []
};
// var serverURL = "http://localhost:8002";
var serverURL = "https://quiet-badlands-43803.herokuapp.com/";
$(document).ready(function() {    
    // initMillery();
});


setInterval(() => {
    var tempState = {
        categories: '',
        subCategories: ''
    };
    $.get('/data/millery-data-1.json', (categories) => {
        tempState.categories = categories;   
        $.get('/data/millery-data-2.json', (subCategories) => {
            tempState.subCategories = subCategories;          
            let is_updated_cat = false, is_updated_subcat = false;
            // Detect Category updates
            tempState.categories.forEach((cat, c_i) => {
                if (is_updated_cat) return;
                let keys = Object.keys(cat);
                keys.forEach(key => {
                    if (!state.categories[c_i]) {
                        is_updated_cat = true;
                        return;
                    }
                    if (cat[key] != state.categories[c_i][key]) {
                        is_updated_cat = true;
                        return;
                    }
                })
            });
            if (!is_updated_cat) {
                // Detect Sub Category updates
                tempState.subCategories.forEach((cat, c_i) => {
                    if (is_updated_subcat) return;
                    let keys = Object.keys(cat);
                    keys.forEach(key => {
                        if (!state.subCategories[c_i]) {
                            is_updated_subcat = true;
                            return;
                        }
                        if (cat[key] != state.subCategories[c_i][key]) {
                            is_updated_subcat = true;
                            return;
                        }
                    })
                });
            }            
            if ( is_updated_cat || is_updated_subcat ) {
                state = {...tempState};
                initMillery();
            }               
        });
    });
}, 1000);

function initMillery() {
    $("#millery").empty();
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
                            onclick="popupApps('${data.link}')"
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
                ${data.content?.replaceAll("\n", "<br>")}
                <br> ${buttonUI}          
            `);
            return true;
        },
        columns: [{
            header: "NETWORKS",
            sourceType: "json",
            source: serverURL + "/data/millery-data-1.json",
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
            source: serverURL + "/data/millery-data-2.json",
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
}

function popupApps(link) {
    // window.open('${data.link}', 'popup', 'width=600, height=600'); return false;

    var popup = window.open(link, "popup", "fullscreen");
    if (popup.outerWidth < screen.availWidth || popup.outerHeight < screen.availHeight)
    {
        popup.moveTo(0,0);
        popup.resizeTo(screen.availWidth, screen.availHeight);
    }
    if (navigator.userAgent.match(/Edge\/\d+/g))
    {
        return window.open(link, "popup", "width=" + screen.width + ",height=" + screen.height);
    }
}