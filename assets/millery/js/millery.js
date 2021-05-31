/**
 *
               ___    ___
           __ /\_ \  /\_ \
  ___ ___ /\_\\//\ \ \//\ \      __   _ __   __  __
/' __` __`\/\ \ \ \ \  \ \ \   /'__`\/\`'__\/\ \/\ \
/\ \/\ \/\ \ \ \ \_\ \_ \_\ \_/\  __/\ \ \/ \ \ \_\ \
\ \_\ \_\ \_\ \_\/\____\/\____\ \____\\ \_\  \/`____ \
 \/_/\/_/\/_/\/_/\/____/\/____/\/____/ \/_/   `/___/> \
                                                 /\___/
                                                 \/__/
 *
 * @name: millery - responsive jquery miller columns
 * @description: A jQuery Miller Columns implementation
 * @version: 1.0.2
 * @author: Taha PAKSU <tpaksu@gmail.com>
 *
 * changelog
 * =========
 *
 * v1.0.0
 * ------
 * - created first prototype
 * - added back button
 * - added panel types (overlay, always, modal)
 * - added search capability
 * - added column search
 * - added local storage state saving
 * - added keyboard navigation
 *
 * v1.0.1
 * ------
 * - fixed CSS issues for IE11 and IE10
 *
 * v1.0.2
 * ------
 * - added reference to original LI element from the instance node, accessed with node.data("original")
 * - added title support for initialization from UL
 * - added some examples to documentation
 * - fixed nightwatch tests
 *
 *
 * Usage:
 * ------
 * $(".selector").millery({options});
 */
;
(function($, window, document, undefined) {
    /**
     *  The main millery class
     *  @class millery
     */
    var millery = function(elem, options) {
        this.elem = elem;
        this.$elem = $(elem);
        this.options = options;
        this.metadata = this.$elem.data("plugin-options");
    };
    /**
     * Prototype of millery plugin
     * @prototype millery
     */
    millery.prototype = {
        /////////////////////////////////////////////////////////////////////
        // public properties that can be set through plugin initialization //
        /////////////////////////////////////////////////////////////////////
        public: function() {
            return {
                source: null, // the source UL element to be converted to miller columns
                visibleColumns: 3, // visible columns on the table
                panelWidth: "75%", // the width of the panel (overlay modal)
                panelType: null, // "overlay", "always", "modal" or null/invalid input, defines the details view type
                transitionDuration: 100, // the animation duration when opening the modal, transitioning between columns etc.
                showHeaders: true, // show or hide the column headers
                searchable: false, // enables the search function for the whole display
                columnSearch: true, // enables the search function for the single columns
                keepState: false, // saves the state to the localstorage to have the same selections when you refresh the page
                stateSaveId: null, // an unique id to state saving mechanism, used for multiple instance state saving
                enableKeyboard: true, // enables the keyboard navigation on columns
                searchLabel: "Search...", // the label for the search input placeholder
                backButtonLabel: "Back", // the label for the back button
                closeButtonLabel: "Close", // the label for the close panel button
                onbeforeinit: function(instance) {}, // event which fires before initialization occurs
                oninit: function(instance) {}, // event which fires after initialization
                onnodeclick: function(instance, node) { return true; }, // event which fires on node click
                onbeforeappend: function(instance, column, data) { return true; }, // event which fires before new column is appended, can be prevented
                onafterappend: function(instance, column, data) {}, // event which fires after the column is appended
                onbeforepanelclose: function(instance, panel) { return true; }, // event which fires before the panel closes, can be prevented
                onafterpanelclose: function(instance, panel) {}, // event which fires after the panel is closed
                onbeforepanelopen: function(instance, panel) { return true; }, // event which fires before the panel opens, can be prevented
                onafterpanelopen: function(instance, panel) {}, // event which fires after the panel is opened
                onbeforeremove: function(instance, columns) { return true; }, // event which fires before the column is removed (for layout change), can be prevented
                onafterremove: function(instance) {}, // event which fires after the column is removed
                onbackbutton: function(instance) { return true; }, // event which fires before back button action is executed, can be prevented
                onbreadcrumb: function(instance, breadcrumb) { return true; }, // event which fires after the breadcrumb link is clicked
                columns: [],
                /**
                 * Column Definition:
                 *
                 *  {
                        header: string or string returning function with the parent/opener node as parameter
                        sourceType: "json", // (ajax and static json files)
                        source: // url template with placeholder replacement (ex. "/ajax/parents/%id%/children", id will be replaced in formatUrl method)
                        dontCheckParent: true, // when using a json file, a parent id check is needed, but when using ajax you won't need this
                        loopPath: "results", // if the results are in a different node than the root node, this is the dot notated path
                        idField: "id", // the member name to use as a identifier
                        paginated: false, // whether to use pagination in the column
                        pageCount: 10, // when pagination is active, items in one page
                        labelField: "terminal_id", // the member name to use as label
                        searchParam: "query", // the request parameter name to make a search query
                        childrenCountField: // the field name or a string returning function(obj) to get the children count, if 0 it is not a parent node, if more than 0, it's a parent
                        parentIdField: // the field name of the parent ID container, used with dontCheckParent: false on json file type data
                        format: // function (value, obj) // node output content formatter
                        formatUrl: function(url, obj) // url formatter, used to replace the %id% placeholder,
                    }
                 */
                debug: false,
            };
        },
        //////////////////////////////////////////
        // private variables for internal usage //
        //////////////////////////////////////////
        private: function() {
            return {
                panelTypes: ["always", "modal", "overlay"],
                scrollHandler: null,
                ajaxHandler: null,
                ajaxTimeout: null,
                currentIndex: 0,
                walkFinished: false,
                globalLoadPromise: null,
                storageData: null,
                keyboardSelectedNode: null,
                clickEventFinished: null
            };
        },
        /**
         * initialize the plugin
         * @return millery object
         */
        init: function() {
            this.config = $.extend(true, {}, this.public(), this.options, this.metadata);
            this.globals = $.extend(true, {}, this.private());
            if (this.config.debug) console.time("init " + this.elem.id);
            this.fixColumnsConfig();
            if (this.config.stateSaveId === null) this.config.stateSaveId = this.elem.id;
            $("body").addClass(this.checkTouch() ? "millery-touch" : "millery-notouch");
            if (this.config.panelType == "always") this.config.visibleColumns = 1;
            this.config.onbeforeinit(this);
            this.drawUserInterface();
            this.attachEvents();
            this.initStorage(this.config.stateSaveId);
            this.loadData(0, null, null).then($.proxy(function() {
                this.addKeyboardNavigation();
            }, this));
            this.container.data("millery", this);
            this.config.oninit(this);
            this.elem.millery = this;
            if (this.config.debug) console.timeEnd("init " + this.elem.id);
            return this;
        },
        fixColumnsConfig: function() {
            var columnDefaults = {
                header: "[Not Defined]",
                sourceType: "json",
                source: null,
                idField: null,
                paginated: false,
                pageCount: null,
                labelField: null,
                format: function(value, obj) { return value; }
            };

            for (var i = 0, len = this.config.columns.length; i < len; i++) {
                for (var key in columnDefaults) {
                    if (this.config.columns[i].hasOwnProperty(key) == false) this.config.columns[i][key] = columnDefaults[key];
                }
            }

        },
        /**
         * Draws the plugin interface
         * @return void
         */
        drawUserInterface: function() {
            this.container = $([
                "<div class='millery-container",
                this.config.panel == "always" ? " millery-panel-open" : "",
                "' tabindex='-1'>",
                "<div class='millery-top'>",
                "<button type='button' class='millery-back-button' disabled='disabled'><i class='fa fa-chevron-left' style='margin-right: 10px'></i>" + this.config.backButtonLabel + "</button>",
                "<button type='button' class='millery-close-button' style='display: none'><i class='fa fa-times' style='margin-right: 10px'></i>" + this.config.closeButtonLabel + "</button>",
                "<div class='millery-breadcrumbs'></div>",
                this.config.searchable == true ? "<div class='millery-search'><span class='icon'><i class='fa fa-search'></i></span><input type='search' name='millery-search-input' placeholder='" + this.config.searchLabel + "'></div>" : "",
                "</div>",
                "<div class='millery-bottom'>",
                "<div class='millery-columns' style='flex: 1;'></div>",
                "<div class='millery-panel'>&nbsp;</div>",
                "</div>",
                "</div>"
            ].join("")).appendTo(this.$elem);
            this.columnscontainer = this.container.find(".millery-columns");
            this.toppart = this.container.find(".millery-top");
            this.backbutton = this.toppart.find(".millery-back-button");
            this.closebutton = this.toppart.find(".millery-close-button");
            this.breadcrumbs = this.toppart.find(".millery-breadcrumbs");
            this.panel = this.container.find(".millery-panel");
            this.searchInput = this.config.searchable ? this.container.find("input[name='millery-search-input']") : null;

            if (this.globals.panelTypes.indexOf(this.config.panelType) == -1) {
                this.config.panelType = null;
            }

            switch (this.config.panelType) {
                case "overlay":
                    this.panel.css("width", this.config.panelWidth).addClass("millery-panel-overlay");
                    break;
                case "modal":
                    this.panel.css("width", this.config.panelWidth).addClass("millery-panel-modal");
                    break;
                case "always":
                    this.panel.css("flex", "0 0 " + this.config.panelWidth).addClass("millery-panel-always");
                    break;
                default:
                    this.panel.hide();
                    break;
            }
        },
        /**
         * Appends a column to the container
         * @return {object} appended column's content section
         */
        appendColumnUL: function(rootNode) {
            var dfd = $.Deferred();

            // var text = $(this).find(".millery-node-active").first().text();

            var i = this.columnscontainer.find(".millery-column").length,
                columnElement = $([
                    "<div class='millery-column' data-index='", i, "' style='z-index: ",
                    (100 - i), ";",
                    "flex-basis: calc(100% /",
                    this.config.visibleColumns,
                    "); left: calc(-100% /",
                    this.config.visibleColumns,
                    ");'><div class='millery-column-wrapper'>",
                    (this.config.showHeaders && rootNode[0].hasAttribute("data-title") ?
                        "<div class='millery-column-header'>" +
                        rootNode[0].getAttribute("data-title") +
                        "</div>" : ""),
                    (this.config.columnSearch ? "<div class='millery-column-search'><span class='icon'><i class='fa fa-search'></i></span><input type='search' placeholder='" + this.config.searchLabel + "'></div>" : ""),
                    "<div class='millery-column-content'></div></div></div>"
                ].join(""));

            if (this.config.onbeforeappend(this, columnElement, null) == true) {
                columnElement.appendTo(this.columnscontainer).animate({
                    left: "0"
                }, {
                    duration: this.globals.walkFinished == false ? 0 : this.config.transitionDuration,
                    complete: $.proxy(function() {
                        dfd.resolve();
                        this.setBackButtonStatus();
                        this.config.onafterappend(this, columnElement, null);
                    }, this)
                });
                return [dfd, columnElement.find(".millery-column-content")];
            } else {
                dfd.resolve();
                return [dfd, null];
            }
        },
        /**
         * Appends a column to the container
         * @return {object} appended column's content section
         */
        appendColumn: function(columnDef) {
            var dfd = $.Deferred();
            var i = this.columnscontainer.find(".millery-column").length,
                columnElement = $([
                    "<div class='millery-column' data-index='", i, "' style='z-index: ",
                    (100 - i), ";",
                    "flex-basis: calc(100% /",
                    this.config.visibleColumns,
                    "); left: calc(-100% /",
                    this.config.visibleColumns,
                    ");'><div class='millery-column-wrapper'>",
                    (this.config.showHeaders ? "<div class='millery-column-header'>" + (
                        typeof(columnDef.header) == "function" ?
                        columnDef.header(this.columnscontainer.find(".millery-node-active").last().data("millery-data")) :
                        columnDef.header) + "</div>" : ""),
                    (this.config.columnSearch ? "<div class='millery-column-search'><span class='icon'><i class='fa fa-search'></i></span><input type='search' placeholder='" + this.config.searchLabel + "'></div>" : ""),
                    "<div class='millery-column-content'></div></div></div>"
                ].join(""));

            if (this.config.onbeforeappend(this, columnElement, columnDef) == true) {
                columnElement.appendTo(this.columnscontainer).animate({
                    left: "0"
                }, {
                    duration: this.globals.walkFinished == false ? 0 : this.config.transitionDuration,
                    complete: $.proxy(function() {
                        dfd.resolve();
                        this.setBackButtonStatus();
                        this.config.onafterappend(this, columnElement, columnDef);
                    }, this)
                });
                return [dfd, columnElement.find(".millery-column-content")];
            } else {
                dfd.resolve();
                return [dfd, null];
            }
        },
        /**
         * Removes the columns after the defined index
         * @return void
         */
        removeColumn: function(i) {
            var dfd = $.Deferred();
            var columnsToRemove = this.columnscontainer.find(".millery-column").eq(i - 1).nextAll(".millery-column");
            if (columnsToRemove.length > 0) {
                totalWidths = 0;
                columnsToRemove.map(function() {
                    totalWidths += $(this).outerWidth();
                });
                if (this.config.onbeforeremove(this, columnsToRemove) == true) {
                    columnsToRemove.animate({
                        marginLeft: (-99.99999 / this.config.visibleColumns) + "%",
                    }, {
                        duration: this.globals.walkFinished == false ? 0 : this.config.transitionDuration,
                        complete: function() {
                            columnsToRemove.remove();
                            dfd.resolve();
                        }
                    });
                    this.config.onafterremove(this);
                } else {
                    dfd.resolve();
                }
                return dfd;
            }
            return dfd.resolve();
        },
        clearColumns: function() {
            this.columnscontainer.empty();
            this.globals.currentIndex = -1;
        },
        /**
         * According to the column count, enables or disables the back button.
         * @return void
         */
        setBackButtonStatus: function() {
            if (this.columnscontainer.find(".millery-column").length == 1) {
                this.backbutton.attr("disabled", "disabled");
            } else {
                this.backbutton.removeAttr("disabled");
            }
        },
        setPanelData: function(data) {
            this.panel.html(data);
        },
        setBreadcrumbs: function() {
            var that = this;
            this.breadcrumbs.empty();
            this.columnscontainer.find(".millery-column").each(function() {
                var text = $(this).find(".millery-node-active").first().text();
                that.breadcrumbs.append("<div class='millery-breadcrumb'>" + text + "</div>");
                if ($(this).find(".millery-node-active").hasClass('millery-node-parent')) {
                    var iconName = $('.millery-node-active').find('.millery-icon').attr('data-icon');
                    var color = $('.millery-node-active').find('.millery-icon').attr('data-color');
                    var iconColor = $('.millery-node-active').find('.millery-icon').attr('data-icon-color');
                    that.rootIconName = iconName;
                    that.rootColor = color;
                    that.rootIconColor = iconColor;
                }
                if ($('.millery-column-content.root-content').hasClass('child-content')) {
                    $('.millery-column-content.root-content').removeClass('child-content');
                }
                if ($('.millery-column-content').length == 1) {
                    $('.millery-column-header').text(that.config.columns[0]?.header);
                }
            });
        },
        openPanel: function() {
            if (this.config.panelType !== null && this.config.panelType !== "always") {
                if (this.config.onbeforepanelopen(this, this.panel) == true) {
                    this.container.addClass("millery-panel-open");
                    this.closebutton.show();
                    this.backbutton.hide();
                    this.config.onafterpanelopen(this);
                }
            }
        },
        closePanel: function() {
            if (this.config.panelType !== null && this.config.panelType !== "always") {
                if (this.config.onbeforepanelclose(this, this.panel) == true) {
                    this.container.removeClass("millery-panel-open");
                    this.closebutton.hide();
                    this.backbutton.show();
                    this.config.onafterpanelclose(this, this.panel);
                }
            }
        },
        /**
         * Attaches the related events on the elements after render/update
         * @return void
         */
        attachEvents: function() {
            $(document).off("click.millery").on("click.millery", ".millery-node", function(e) {

                var $this = $(this);
                // get millery instance
                var instance = $this.parents(".millery-container").first().data("millery");
                // get the clicked node's column
                var currentColumn = $this.parents(".millery-column").first();
                // get instance columns
                var allColumns = $this.parents(".millery-columns").find(".millery-column");
                // get the index of clicked column
                var currentColumnIndex = allColumns.index(currentColumn);

                instance.globals.clickEventFinished = new $.Deferred();

                if (instance.config.keepState && instance.globals.walkFinished) instance.setStorage(currentColumnIndex, $this.data("id"));

                // if the last clicked node is active and this is not the last column
                if ($(this).hasClass("millery-node-active") && $(this).hasClass("millery-node-link") == false && allColumns.length > currentColumnIndex + 1) {
                    instance.globals.clickEventFinished.resolve();
                    return false;
                }

                // set the current column index
                instance.globals.currentIndex = currentColumnIndex;

                // set current node as active
                currentColumn.find(".millery-node").removeClass("millery-node-active");
                $this.addClass("millery-node-active");

                instance.removeColumn(currentColumnIndex + 1).done(function() {
                    // load data if is expandable
                    if (instance.config.onnodeclick(instance, $this, $this.data("millery-data"), e) == true) {
                        if ($this.hasClass("millery-node-parent")) {
                            // delete the next columns
                            instance.loadData(currentColumnIndex + 1, $this.data("id"), $this.data("millery-data"));
                        } else {
                            instance.openPanel();
                            instance.globals.clickEventFinished.resolve();
                            instance.setBackButtonStatus();
                            instance.setBreadcrumbs();
                        }
                    }
                });
                return false;
            });

            this.backbutton.on("click.millery", function() {
                var instance = $(this).parents(".millery-container").first().data("millery");
                var currentIndex = instance.globals.currentIndex;
                if (currentIndex > 0 && instance.config.onbackbutton(this) == true) {
                    instance.removeColumn(currentIndex).then(function() {
                        instance.setBreadcrumbs();
                        instance.popStorage();
                        instance.setBackButtonStatus();
                        instance.scrollToIndex(currentIndex - 1);
                    });
                }
                return false;
            });

            $(window).off("resize.millery").on("resize.millery", function() {
                if (window.milleryResizeTimeout) clearTimeout(window.milleryResizeTimeout);
                window.milleryResizeTimeout = setTimeout(function() {
                    $(".millery-container").each(function() {
                        $(this).addClass("millery-no-transition");
                        var instance = $(this).data("millery");
                        var buffer = instance.config.transitionDuration;
                        instance.config.transitionDuration = 0;
                        instance.scrollToIndex(instance.globals.currentIndex);
                        $(this).removeClass("millery-no-transition");
                        instance.config.transitionDuration = buffer;
                    });
                }, 50);
                return false;
            });

            $(document).off("click.millerybreadcrumb").on("click.millerybreadcrumb", ".millery-breadcrumb", function() {
                var $this = $(this);
                var instance = $this.parents(".millery-container").first().data("millery");
                var allColumns = $this.parents(".millery-breadcrumbs").find(".millery-breadcrumb");
                var currentColumnIndex = allColumns.index($this);
                if (currentColumnIndex == allColumns.length - 1) return false;
                if (instance.container.hasClass("millery-panel-open")) instance.closePanel();
                if (instance.config.onbreadcrumb(instance, $this) == true) {
                    instance.removeColumn(currentColumnIndex + 1).then(function() {
                        instance.setBreadcrumbs();
                        instance.scrollToIndex(currentColumnIndex);
                    });
                }
            });

            $(document).on("input.millery", ".millery-column-search input", function() {
                var $this = $(this);
                var regex = new RegExp($this.val(), "i");
                var nodes = $this.parent(".millery-column-search").next(".millery-column-content").find(".millery-node");
                nodes.each(function() {
                    var $node = $(this);
                    if (!regex.test($node.text()) && $node.hasClass("millery-node-active") == false) {
                        $node.hide();
                    } else {
                        $node.show();
                    }
                });
            });

            if (this.config.searchable == true) {
                this.searchInput.on("input.millery", function() {
                    var $this = $(this);
                    var instance = $this.parents(".millery-container").first().data("millery");
                    if (instance.globals.ajaxTimeout) clearTimeout(instance.globals.ajaxTimeout);
                    instance.globals.ajaxTimeout = setTimeout($.proxy(function() {
                        this.clearColumns();
                        this.loadData(0, null, null);
                    }, instance), 500);
                });
            }

            this.closebutton.on("click", $.proxy(this.closePanel, this));

        },
        /**
         *
         * @param {*} url
         * @param {*} param
         * @param {*} data
         */
        appendQuery: function(url, param, data) {
            return url + (url.indexOf("?") > 0 ? "&" : "?") + param + "=" + data;
        },
        /**
         *
         * @param {*} index
         * @param {*} id
         * @param {*} obj
         * @param {*} query
         */
        loadData: function(index, id, obj) {
            var query = this.config.searchable ? this.searchInput.val() : "";

            if (this.config.source != null) {
                $(this.config.source).hide();
                var items = null;
                if (index == 0) {
                    items = this.config.source;
                } else {
                    items = this.config.source;
                    var columns = this.columnscontainer.find(".millery-column");
                    var columnLength = columns.length;
                    for (var i = 0; i < columnLength; i++) {
                        var column = $(columns[i]);
                        var selectedNode = column.find(".millery-node-active").first();
                        var ix = column.find(".millery-node").index(selectedNode);
                        if (ix == -1) ix = index;
                        items = items.children("li").eq(ix).children("ul").first();
                    }
                }
                this.appendDataUL(items, index);
                return new $.Deferred().resolve();
            } else {
                if (this.config.columns[index]) {
                    var columnDef = this.config.columns[index],
                        sourceUrl = columnDef.hasOwnProperty("formatUrl") && typeof(columnDef.formatUrl) == "function" ? columnDef.formatUrl(columnDef.source, obj) : columnDef.source;
                    if (this.config.searchable && query.trim() !== "") {
                        if (columnDef.hasOwnProperty("searchUrl")) {
                            sourceUrl = columnDef.hasOwnProperty("formatUrl") && typeof(columnDef.formatUrl) == "function" ? columnDef.formatUrl(columnDef.searchUrl, obj) : columnDef.searchUrl;
                        }
                        sourceUrl = this.appendQuery(sourceUrl, columnDef.searchParam, query);
                    }
                    return $.ajax({
                        url: sourceUrl,
                        type: 'GET',
                        dataType: 'json',
                        crossDomain: true,
                        success: $.proxy(
                            function(data) {
                                this.appendData(id, index, data, columnDef);
                            }, this)
                    });
                }
            }
        },
        appendData: function(id, index, data, columnDef) {
            this.setBreadcrumbs();
            var buffer = this.appendColumn(columnDef),
                column = buffer[1],
                dfd = buffer[0];

            $.when(dfd).then($.proxy(function() {
                if (columnDef.hasOwnProperty("loopPath") && columnDef.loopPath != false) {
                    data = this.getPath(data, columnDef.loopPath);
                }
                for (var i = 0; i < data.length; i++) {
                    var childrenCount = (columnDef.hasOwnProperty("childrenCountField") ?
                        (
                            typeof(columnDef.childrenCountField) == "function" ?
                            columnDef.childrenCountField(data[i]) :
                            data[i][columnDef.childrenCountField]
                        ) : 0);

                    /**
                     * check the first column state
                     * ----------------------------
                     * - Id needs to be null for the first column
                     * - parent ID field may not exist
                     * - parent ID field may exist and defined as null
                     * - parent ID field may exist and filled, but the value must be null
                     * - parent ID field may exist and filled, but the value may not exist
                     **/
                    var rootChecks = id == null &&
                        (
                            typeof columnDef.parentIdField == "undefined" ||
                            columnDef.parentIdField == null ||
                            (
                                data[i][columnDef.parentIdField] == null ||
                                typeof data[i][columnDef.parentIdField] == "undefined"
                            )
                        );

                    /**
                     * check the next column states
                     * ----------------------------
                     * - id variable must be set
                     * - parent ID field must be existing and filled
                     * - parent ID field must be equal to id
                     */
                    var leafChecks = columnDef.parentIdField != undefined &&
                        columnDef.parentIdField != null &&
                        data[i][columnDef.parentIdField] == id &&
                        id != null;

                    /**
                     * honor the "skip the parent checks" flag
                     */
                    var skipChecks = columnDef.hasOwnProperty("dontCheckParent") && columnDef.dontCheckParent === true;

                    if (rootChecks || leafChecks || skipChecks) {
                        // column.append("<div class='millery-node" +
                        //     ((childrenCount > 0) ? " millery-node-parent" : "") +
                        //     "' data-column='" + index + "' data-id='" +
                        //     data[i][columnDef.idField] + "'><div class='millery-text'><div class='millery-icon'><i class='fa "+ data[i]["icon"] +"' aria-hidden='true'></i></div>"+ columnDef.format(data[i][columnDef.labelField], data[i]) +"</div>" +
                        //     ((childrenCount > 0) ? "<div class='millery-node-more'><i class='fa fa-chevron-right'></i></div>" : "") +
                        //     "</div>");

                        let iconBackgroundColorPrimary = data[i]["iconColor"];
                        let iconBackgroundColorSecondary = "white";

                        if (iconBackgroundColorPrimary) {
                            var hex = iconBackgroundColorPrimary.replace('#', '');

                            if (hex.length === 3) {
                                hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
                            }

                            var r = parseInt(hex.substring(0, 2), 16),
                                g = parseInt(hex.substring(2, 4), 16),
                                b = parseInt(hex.substring(4, 6), 16);

                            iconBackgroundColorSecondary = 'rgba(' + r + ',' + g + ',' + b + ',' + 60 / 100 + ')';
                        } else {
                            iconBackgroundColorPrimary = "#aaa";
                        }

                        if (rootChecks) {
                            $('.millery-column-content').addClass('root-content')
                            column.append(
                                `<div class='millery-node ${((childrenCount > 0) ? "millery-node-parent" : "")}' data-column='${index}' data-id='${data[i][columnDef.idField]}'>
                                    <div class='millery-text'>
                                        <div class='millery-icon' data-icon="${data[i]["icon"]}" data-color="radial-gradient(90% 50%, ${iconBackgroundColorSecondary} 0%, ${iconBackgroundColorPrimary} 100%)" data-icon-color="${iconBackgroundColorPrimary}" style="background: radial-gradient(50% 80%, ${iconBackgroundColorSecondary} 0%, ${iconBackgroundColorPrimary} 100%); border: solid 2px ${iconBackgroundColorPrimary}">
                                            <i class='fa ${data[i]["icon"]}' aria-hidden='true' style='color: #FFF'></i>
                                        </div>
                                        ${columnDef.format(data[i][columnDef.labelField], data[i])}
                                    </div>
                                </div>`
                            );
                        } else {
                            $('.millery-column-content').addClass('child-content');
                            column.append(
                                `<div class='millery-node ${((childrenCount > 0) ? "millery-node-parent" : "")}' data-column='${index}' data-id='${data[i][columnDef.idField]}' style="background: ${this.rootColor}">
                                    <div class='millery-text'>
                                        <div class='millery-icon'>
                                            <i class='fa ${this.rootIconName}' aria-hidden='true' style='color: ${this.rootIconColor}'></i>
                                        </div>
                                        ${columnDef.format(data[i][columnDef.labelField], data[i])}
                                    </div>
                                </div>`
                            );
                        }
                        var lastNode = column.find(".millery-node").last();
                        lastNode.data("millery-data", data[i]);
                        if (this.config.keepState && this.globals.walkFinished == false && this.globals.storageData[index] !== undefined && data[i][columnDef.idField] == this.globals.storageData[index]) lastNode.click();
                    }
                }
                if (index >= this.globals.storageData.length - 1) this.globals.walkFinished = true;
                if (this.globals.walkFinished && this.globals.clickEventFinished != null) {
                    this.globals.clickEventFinished.resolve();
                }
                this.scrollToIndex(index);
                var text = $(".millery-breadcrumb").text();
                if (text) {
                    $('.millery-column-header').text(text);
                }
            }, this));
        },
        appendDataUL: function(root, index) {
            var buffer = this.appendColumnUL(root),
                column = buffer[1],
                dfd = buffer[0];
            $.when(dfd).then($.proxy(function() {
                for (var i = 0; i < root.children("li").length; i++) {
                    var node = root.children("li:eq(" + i + ")");
                    var childrenCount = node.children("ul").length;
                    column.append("<div class='millery-node" +
                        ((childrenCount > 0) ? " millery-node-parent" : "") +
                        "' data-column='" + i + "' data-id='" +
                        i + "'>" + (node.children("a").length > 0 ? node.children("a").first().text() : this.getText(node)) +
                        ((childrenCount > 0) ? "<div class='millery-node-more'><i class='fa fa-chevron-right'></i></div>" : "") +
                        "</div>");
                    var lastNode = column.find(".millery-node").last();
                    lastNode.data("original", node);
                    if (this.config.keepState && this.globals.walkFinished == false && this.globals.storageData[index] !== undefined && i == this.globals.storageData[index]) lastNode.click();
                }
                if (index >= this.globals.storageData.length - 1) this.globals.walkFinished = true;
                if (this.globals.walkFinished && this.globals.clickEventFinished != null) {
                    this.globals.clickEventFinished.resolve();
                }
                this.setBreadcrumbs();
                this.scrollToIndex(index);
            }, this));
        },
        getText: function(node) {
            return node.clone().children().remove().end().text();
        },
        addKeyboardNavigation: function() {
            if (this.config.enableKeyboard) {
                var keyDownEvent = $.proxy(function(event) {

                    if ($(document.activeElement).prop("name") === "millery-search-input") return true;

                    var keycode = (event.which) ? event.which : event.keyCode;
                    if (this.globals.keyboardSelectedNode === null) {
                        this.globals.keyboardSelectedNode = this.columnscontainer.find(".millery-node-active").last();
                        if (this.globals.keyboardSelectedNode.length == 0) {
                            this.globals.keyboardSelectedNode = this.columnscontainer.find(".millery-node").first();
                            this.globals.keyboardSelectedNode.addClass("millery-node-hover");
                            return false;
                        }
                        this.globals.keyboardSelectedNode.addClass("millery-node-hover");
                    } else {
                        if (this.globals.keyboardSelectedNode.closest("body").length == 0) {
                            this.globals.keyboardSelectedNode = this.columnscontainer.find(".millery-node-active").last();
                            if (this.globals.keyboardSelectedNode.length == 0) {
                                this.globals.keyboardSelectedNode = this.columnscontainer.find(".millery-node").first();
                                this.globals.keyboardSelectedNode.addClass("millery-node-hover");
                                return false;
                            }
                        }
                    }
                    var newnode = null;
                    switch (keycode) {
                        case 37: // left
                            this.backbutton.click();
                            this.container.focus();
                            break;
                        case 38: // top
                            if (this.globals.keyboardSelectedNode.prev(".millery-node").length > 0) {
                                newnode = this.globals.keyboardSelectedNode.prev(".millery-node");
                                this.globals.keyboardSelectedNode = newnode;
                                this.columnscontainer.find(".millery-node-hover").removeClass("millery-node-hover");
                                newnode.addClass("millery-node-hover");
                                return false;
                            }
                            break;
                        case 39: // right
                            if (this.globals.keyboardSelectedNode.hasClass("millery-node-parent")) {
                                this.globals.keyboardSelectedNode.click();
                                this.globals.clickEventFinished.then($.proxy(function() {
                                    var newColumn = this.columnscontainer.find(".millery-column").last();
                                    newnode = newColumn.find(".millery-node").first();
                                    this.globals.keyboardSelectedNode = newnode;
                                    this.columnscontainer.find(".millery-node-hover").removeClass("millery-node-hover");
                                    newnode.addClass("millery-node-hover");
                                }, this));
                                return false;
                            }
                            break;
                        case 40: // bottom
                            if (this.globals.keyboardSelectedNode.next(".millery-node").length > 0) {
                                newnode = this.globals.keyboardSelectedNode.next(".millery-node");
                                this.globals.keyboardSelectedNode = newnode;
                                this.columnscontainer.find(".millery-node-hover").removeClass("millery-node-hover");
                                newnode.addClass("millery-node-hover");
                                return false;
                            }
                            break;
                        case 13: // enter
                            if (this.globals.keyboardSelectedNode) this.globals.keyboardSelectedNode.click();
                            return false;
                        case 27: // esc
                            if (this.closebutton.is(":visible")) this.closebutton.click();
                            else this.backbutton.click();
                            this.container.focus();
                            return false;
                        case 70:
                            if (event.ctrlKey) {
                                this.searchInput.focus();
                                return false;
                            }
                            break;
                    }
                }, this);
                this.$elem.off("keydown.millery").on("keydown.millery", keyDownEvent);
                this.container.off("keydown.millery").on("keydown.millery", keyDownEvent);
            }
        },
        scrollToIndex: function(index) {
            this.requestAnimFrame($.proxy(function() {
                var container = this.columnscontainer;
                var columns = container.find(".millery-column");
                var element = columns.eq(index - 1);
                if (element.length > 0) {
                    container.animate({
                        scrollLeft: element.offset().left + element.outerWidth() - container.offset().left + container.scrollLeft() + 1
                    }, {
                        duration: this.globals.walkFinished == false ? 0 : this.config.transitionDuration,
                        easing: 'swing',
                        complete: $.proxy(function() {
                            this.globals.currentIndex = index;
                        }, this)
                    });
                }
            }, this));
        },
        initStorage: function(stateId) {
            this.globals.storageData = JSON.parse(window.localStorage.getItem(this.config.stateSaveId));
            if (this.globals.storageData === null) this.globals.storageData = [];
        },
        setStorage: function(level, value) {
            var newData = [];
            for (var i = 0; i < level; i++) {
                newData[i] = this.globals.storageData[i];
            }
            newData[level] = value;
            this.globals.storageData = newData;
            window.localStorage.setItem(this.config.stateSaveId, JSON.stringify(this.globals.storageData));
        },
        popStorage: function() {
            var p = this.globals.storageData.pop();
            window.localStorage.setItem(this.config.stateSaveId, JSON.stringify(this.globals.storageData));
            return p;
        },
        getBrowserAnimationEvent: function() {
            var t, el = document.createElement("fakeelement");
            var animations = {
                "animation": "animationend",
                "OAnimation": "oAnimationEnd",
                "MozAnimation": "animationend",
                "WebkitAnimation": "webkitAnimationEnd"
            };
            for (t in animations) {
                if (el.style[t] !== undefined) {
                    return animations[t];
                }
            }
        },
        getPath: function(scope, str) {
            var obj = scope,
                arr;
            try {
                arr = str.split(/[\[\]\.]/).filter(function(el) { return el; }).map(function(el) { return el.replace(/^['"]+|['"]+$/g, ''); });
                arr.forEach(function(el) { obj = obj[el]; });
            } catch (e) {
                obj = undefined;
            }
            return obj;
        },
        /**
         * javascript rAF implementation for cross browser compatibility
         */
        requestAnimFrame: function(callback) {
            if (typeof window.requestAnimationFrame === "function") return requestAnimationFrame(callback);
            if (typeof window.webkitRequestAnimationFrame === "function") return webkitRequestAnimationFrame(callback);
            if (typeof window.mozRequestAnimationFrame === "function") return mozRequestAnimationFrame(callback);
            return setTimeout(callback, 100 / 6);
        },
        /**
         * javascript cAF implementation for cross browser compatibility
         */
        cancelAnimFrame: function(id) {
            if (typeof window.cancelAnimationFrame === "function") return cancelAnimationFrame(id);
            if (typeof window.webkitCancelAnimationFrame === "function") return webkitCancelAnimationFrame(id);
            if (typeof window.mozCancelAnimationFrame === "function") return mozCancelAnimationFrame(id);
            return clearTimeout(id);
        },
        /**
         * Destroys the instance
         */
        destroy: function() {

        },
        checkTouch: function() {
            var prefixes = ' -webkit- -moz- -o- -ms- '.split(' ');
            var mq = function(query) {
                return window.matchMedia(query).matches;
            };

            if (('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch) {
                return true;
            }

            // include the 'heartz' as a way to have a non matching MQ to help terminate the join
            // https://git.io/vznFH
            var query = ['(', prefixes.join('touch-enabled),('), 'heartz', ')'].join('');
            return mq(query);
        }
    };

    /**
     * The main handler of millery plugin
     * @param   {object}    options javascript object which contains element specific or range specific options
     * @return  {millery}   plugin reference
     */
    $.fn.millery = function(options) {
        return this.each(function() {
            new millery(this, options).init();
        });
    };

})(jQuery, window, document);