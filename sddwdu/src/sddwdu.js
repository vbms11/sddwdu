
function showModuleMenu () {
    $(".moduleMenuPanel").slideDown();
}

var ModuleMenu = {
    
    openModuleMenu : null,
    openCloseTimer : null,
    
    onMouseOut : function () {
        var that = this;
        this.openCloseTimer = window.setTimeout(function(){
            that.openModuleMenu.hide();
            that.openModuleMenu = that.openCloseTimer = null;
        },2000);
    },
    
    onMouseOver : function () {
        window.clearTimeout(this.openCloseTimer);
    }
};

$(document).ready(function(){
    $(".moduleMenuCategory").each(function(index,object){
        $(object).mouseover(function () {
            $(".moduleMenuGroup").hide();
            ModuleMenu.openModuleMenu = $(this).next().css({
                "left" : $(".moduleMenuPanel").width()+"px"
            }).show().mouseout(function(){
                ModuleMenu.onMouseOut();
            }).find("div").mouseover(function(){
                ModuleMenu.onMouseOver();
            }).end();
        });
    });    
});

var vcmsArea = $(".vcms_area");

$.each(vcmsArea,function (index,object) {
    $(".menuModule").sortable({
        connectWith: ".vcms_area",
        cancel: ".toolButtonDiv, vcms_module:not(#vcms_module_"+moduleId+")",
        update: function(event, ui) {
            var areaId = $(object).attr("id").substr(10);
            var moduleId = ui.item.attr("id").substr(12);
            alert("dropped area:"+areaId+" module: "+moduleId);
            $("#vcms_area_"+areaId+" #vcms_module_"+moduleId).each(function (index,o) {
                $(object).find(".vcms_module").each(function (i,child) {
                    if (moduleId === $(child).attr("id").substr(12)) {
                         ajaxRequest(sortLink,function(data){},{"id":moduleId,"area":areaId,"pos":i});
                    }
                });
            });
        }
    });
});

