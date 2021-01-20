var dataObj;
var width = 1280;
var height = 1080;
var icon;


//jquery
$(document).ready(function() {

    $( ".upload-form-button" ).click(function() {
        var formData = new FormData();
    
        var jsonFilesElement = $('.upload-form-file');
        var jsonFile = jsonFilesElement[0].files[0];

        formData.append("file", jsonFile, jsonFile.name);
        formData.append("name", $( ".upload-form-name" ).val());
        formData.append("distance", $( ".upload-form-distance" ).val());

        $.ajax({
            type: "POST",
            url: "upload-file",
            data: formData,
            timeout: 60000,
            processData: false,
            contentType: false,
            success: function(data) {
                dataObj = data;
                clear();
            },
            error: function (error) {
                alert('Ajax POST fail');
            }
        });
    });

});

function setup() {
    createCanvas(1280, 1080);
}

//Draws points and text
function draw() {
    background(251, 248, 243);

    var ratio;
    var xRatio;
    var yRatio;

    for (let key in dataObj) {
        if(key == "canvasSize"){
            ratio = dataObj[key];
            xRatio = (width/ratio[0])*0.8;
            yRatio = (height/ratio[1])*0.8;
        }
        else if(key == "Mn_Nodes"){
            let mnArray = dataObj[key];
            if(mnArray.length != 0){
                fill(0,255,0);
                for(var i = 0; i < mnArray.length ; i++){
                    textSize(40);
                    textAlign(CENTER);
                    strokeWeight(1);
                    text(mnArray[i].name, (mnArray[i].x)*xRatio, (mnArray[i].y)*yRatio);
                    strokeWeight(8);
                    point((mnArray[i].x)*xRatio, (mnArray[i].y)*yRatio + 10);
                }

            }
            else{
                textSize(40);
                textAlign(CENTER);
                strokeWeight(1);
                text('No Mn nodes to display', 640, 40);
            }
            

        }
        else if(key == "Md_Nodes"){
            let mdArray = dataObj[key];
            
            if(mdArray.length != 0){
                fill(0,0,255);
                for(var j = 0; j < mdArray.length ; j++){
                    textSize(40);
                    textAlign(CENTER);
                    strokeWeight(1);
                    text(mdArray[j].name, (mdArray[j].x)*xRatio, (mdArray[j].y)*yRatio+30);
                    strokeWeight(8);
                    point((mdArray[j].x)*xRatio, (mdArray[j].y)*yRatio + 10);     
                }

            }
            else{
                textSize(40);
                textAlign(CENTER);
                strokeWeight(1);
                text('No Md nodes to display', 640, 80);
            }

        }
        else{
            let mdDiststoMn = dataObj[key];
            if(mdDiststoMn.length != 0){
                fill(0,0,255);
                for(var j = 0; j < mdDiststoMn.length ; j++){
                    textSize(20);
                    textAlign(CENTER);
                    strokeWeight(1);
                    text(mdDiststoMn[j].shortestDistToMnNode, (mdDiststoMn[j].node.x)*xRatio, (mdDiststoMn[j].node.y)*yRatio+50);
                }
            }
        }
    }

}

setup();
