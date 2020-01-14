
function log (message) {
    $('#logOutput').append(message+"<br/>");
}
function dump(obj) {
    var out = obj + "\n";
    for (var i in obj) {
        out += i + ": " + obj[i] + "\n";
    }
    log(out);
}

var DomUtil = {
    
    insertAtIndex : function (parentElement, newElement, index) {
        var allChildNodes = parentElement.childNodes;
        var childNodes = [];
        for (var i=0; i<allChildNodes.length; i++) {
            if (allChildNodes[i].nodeName.indexOf("#") === 0) {
                continue;
            }
            childNodes.push(allChildNodes[i]);
        }
        if (childNodes.length <= index) {
            parentElement.appendChild(newElement);
        } else {
            parentElement.insertBefore(newElement, childNodes[index]);
        }
    },
    
    getSuffixFromClassName : function (element, prefix) {
        var suffix = null;
        var classes = element.className.split(" ");
        for (var i=0; i<classes.length; i++) {
            if (classes[i].indexOf(prefix) === 0) {
                suffix = classes[i].substring(prefix.length,classes[i].length);
            }
        }
        return suffix;
    },
    
    hasClass : function (element, className) {
        var classes = element.className.split(" ");
        for (var i=0; i<classes.length; i++) {
            if (classes[i] === className) {
                return true;
            }
        }
        return false;
    },
    
    getParentByClass : function (element, className) {
        do {
            var parent = element.parentNode;
            if (this.hasClass(parent, className)) {
                return parent;
            }
        } while (parent.parentNode)
        return null;
    },
    
    getElementsByClass : function (className) {
        
    }
};

var sddwdu = {
    
    selectedItem : null,
    selectedArea : null,
    selectedObject : null,
    hoverObject : null,
    dragPlaceholder : null,
    dropPlaceholder : null,
    
    className_item : "sddwdu_item",
    className_itemType : "sddwdu_item_",
    className_area : "sddwdu_area",
    className_areaName : "sddwdu_area_",
    className_object : "sddwdu_object",
    className_objectId : "sddwdu_object_",
    className_objectType : "sddwdu_object_type_",
    
    className_dragPlaceholder : "sddwdu_drag_placeholder",
    className_dropPlaceholder : "sddwdu_drop_placeholder",
    
    dropItemOnAreaListener : null,
    dropObjectOnAreaListener : null,
    
    attach : function (args) {
        if (args.items) {
            this.className_item = args.items;
        }
        if (args.areas) {
            this.className_area = args.areas;
        }
        if (args.objects) {
            this.className_object = args.objects;
        }
        if (args.drop) {
            this.dropItemOnAreaListener = args.drop;
        }
        if (args.sort) {
            this.dropObjectOnAreaListener = args.sort;
        }
        this.attachEventListeners();
    },
    
    attachEventListeners : function () {
        var thisObject = this;
        // dragables
        var items = document.getElementsByClassName(this.className_item);
        for (var i=0; i<items.length; i++) {
            this.addItemEventListeners(items[i]);
        }
        // dropable areas
        var areas = document.getElementsByClassName(this.className_area);
        for (var i=0; i<areas.length; i++) {
            this.addAreaEventListeners(areas[i]);
        }
        // area objects
        var areaObjects = document.getElementsByClassName(this.className_object);
        for (var i=0; i<areaObjects.length; i++) {
            this.addObjectEventListeners(areaObjects[i]);
        }
        // mouse
        document.addEventListener("mousemove", function(e){
            thisObject.onMouseMove(e);
        });
    },
    
    addItemEventListeners : function (item) {
        var thisObject = this;
        item.addEventListener("mousedown", function(e){
            thisObject.onMouseDownOnItem(e);
            e.preventDefault();
        });
        item.addEventListener("mouseup", function(e){
            thisObject.onMouseUp(e);
        });
    },
    
    addAreaEventListeners : function (area) {
        var thisObject = this;
        area.addEventListener("mouseenter", function(e){
            thisObject.onMouseOverArea(e);
        });
        area.addEventListener("mouseleave", function(e){
            thisObject.onMouseOutArea(e);
        });
    },
    
    addObjectEventListeners : function (object) {
        var thisObject = this;
        object.addEventListener("mouseover", function(e){
            thisObject.onMouseOverObject(e);
        });
        object.addEventListener("mouseout", function(e){
            thisObject.onMouseOutObject(e);
        });
        object.addEventListener("mousedown", function(e){
            thisObject.onMouseDownOnObject(e);
            e.preventDefault();
        });
        object.addEventListener("mouseup", function(e){
            thisObject.onMouseUp(e);
        });
    },
    
    positionDragPlaceholder : function (x,y) {
        this.dragPlaceholder.style.left = x + 5 + "px";
        this.dragPlaceholder.style.top = y + 5 + "px";
    },
    
    addDragPlaceholder : function (el) {
        if (this.dragPlaceholder === null) {
            var thisObject = this;
            this.dragPlaceholder = el.cloneNode(true);
            this.dragPlaceholder.className = this.className_dragPlaceholder;
            this.dragPlaceholder.style.position = "absolute";
            this.dragPlaceholder.style.zindex = "10";
            document.addEventListener("mouseup", function(e){
                thisObject.onMouseUp(e);
            });
            document.body.appendChild(this.dragPlaceholder);
        }
    },
    
    removeDragPlaceholder : function () {
        document.body.removeChild(this.dragPlaceholder);
        this.dragPlaceholder = null;
    },
    
    addDropPlaceholder : function (nextObject) {
        
        if (this.dropPlaceholder === null) {
            this.dropPlaceholder = document.createElement("div");
            this.dropPlaceholder.className = this.className_dropPlaceholder; 
            if (typeof(nextObject) !== "undefined") {
                this.selectedArea.insertBefore(this.dropPlaceholder, nextObject);
            } else {
                this.selectedArea.appendChild(this.dropPlaceholder);
            }
        }
    },
    
    orderDropPlaceholder : function (e) {
        if (this.hoverObject !== null) {
            this.removeDropPlaceholder();
            if (e.offsetY < this.hoverObject.offsetHeight / 2) {
                this.addDropPlaceholder(this.hoverObject);
            } else if (this.hoverObject.nextSibling !== null) {
                this.addDropPlaceholder(this.hoverObject.nextSibling);
            } else {
                this.addDropPlaceholder();
            }
        } else {
            this.addDropPlaceholder();
        }
    },
    
    removeDropPlaceholder : function () {
        if (this.dropPlaceholder !== null) {
            this.selectedArea.removeChild(this.dropPlaceholder);
            this.dropPlaceholder = null;
        }
    },
    
    onMouseMove : function (e) {
        if (this.selectedItem !== null || this.selectedObject !== null) {
            this.positionDragPlaceholder(e.pageX,e.pageY);
            if (this.selectedArea !== null) {
                this.orderDropPlaceholder(e);
            }
        }
    },
    
    onMouseDownOnItem : function (e) {
        this.selectedItem = e.target;
        this.addDragPlaceholder(this.selectedItem);
        this.positionDragPlaceholder(e.pageX,e.pageY);
    },
    
    onMouseDownOnObject : function (e) {
        this.selectedObject = e.target;
        this.addDragPlaceholder(this.selectedObject);
        this.positionDragPlaceholder(e.pageX,e.pageY);
    },
    
    onMouseUp : function (e) {
        if (this.selectedItem !== null || this.selectedObject !== null) {
            if (this.selectedArea !== null && this.dropPlaceholder !== null) {
                var areaName = DomUtil.getSuffixFromClassName(this.selectedArea, this.className_areaName);
                var position = null;
                var skip = 0;
                for (var i=0; i<this.selectedArea.childNodes.length; i++) {
                    if (this.selectedArea.childNodes[i].nodeName.indexOf("#") === 0) {
                        skip++;
                    }
                    if (this.selectedArea.childNodes[i].className === this.className_dropPlaceholder) {
                        position = i - skip;
                        break;
                    }
                }
                if (this.selectedItem !== null) {
                    var type = DomUtil.getSuffixFromClassName(this.selectedItem, this.className_itemType);
                    if (this.dropItemOnAreaListener !== null) {
                        this.dropItemOnAreaListener(type,areaName,position);
                    }
                }
                if (this.selectedObject !== null) {
                    var objectId = DomUtil.getSuffixFromClassName(this.selectedObject, this.className_objectId);
                    if (this.dropObjectOnAreaListener !== null) {
                        this.dropObjectOnAreaListener(objectId,areaName,position);
                    }
                }
            }
            this.removeDragPlaceholder();
            this.removeDropPlaceholder();
            this.selectedItem = null;
            this.selectedObject = null;
        }
    },
    
    onMouseOverArea : function (e) {
        this.selectedArea = e.target;
    },
    
    onMouseOutArea : function (e) {
        this.removeDropPlaceholder();
        this.selectedArea = null;
    },
    
    onMouseOverObject : function (e) {
        this.hoverObject = e.target;
        this.selectedArea = DomUtil.getParentByClass(this.hoverObject, this.className_area);
    },
    
    onMouseOutObject : function (e) {
        this.hoverObject = null;
    },
    
    /*
     * 
     */
    
    createObjectInArea : function (id, type, html, areaName, position) {
        var el_area = document.getElementsByClassName(this.className_areaName+areaName)[0];
        var el_temp = document.createElement("div");
        el_temp.innerHTML = html;
        var el_object = el_temp.firstChild;
        DomUtil.insertAtIndex(el_area, el_object, position);
        this.addObjectEventListeners(el_object);
    },
    
    /*
     * Default responses to event listeners
     */
    
    dropItemToObject : function (type,areaName,position) {
        var id = Math.random();
        var el_object = document.createElement("div");
        el_object.className = this.className_object+" "+this.className_objectId+id+" "+this.className_objectType+type;
        el_area = document.getElementsByClassName(this.className_areaName+areaName)[0];
        DomUtil.insertAtIndex(el_area, el_object, position);
        this.addObjectEventListeners(el_object);
    },
    
    moveObjectToArea : function (objectId,areaName,position) {
        var el_object = document.getElementsByClassName(this.className_objectId+objectId)[0];
        var el_area = document.getElementsByClassName(this.className_areaName+areaName)[0];
        el_object.parentNode.removeChild(el_object);
        DomUtil.insertAtIndex(el_area, el_object, position);
    }
    
};
