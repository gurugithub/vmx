//GS IOT


var SERVER = "http://localhost:3000/";
//var myModelUuid = '9b126634-820f-4335-8898-6170ae04a0c0'; 
var myModelUuid =  '88cd4d05-78fd-4308-85dc-736d1fedfd1a'; 
// f5a03904-59a7-49f6-86b4-e537e5512dee tall tree
// 23e9bf3f-4854-48bd-ac9c-e1ece795adcf
var modelName = "sapphire2";

var oHttpRequest = new XMLHttpRequest();
//


function getBase64Image(img) {
    // Create an empty canvas element
    var canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;
 
    // Copy the image contents to the canvas
    var ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);
 
    // Get the data-URL formatted image
    // Firefox supports PNG and JPEG. You could check img.src to guess the
    // original format, but be aware the using "image/jpg" will re-encode the image.
    var dataURL = canvas.toDataURL("image/png");
 
    return dataURL.replace(/^data:image\/(png|jpg);base64,/, "");
}

$vmx.init = function () {

    var start = function (connectionUuid) {
        //We can have any number of running detectors, but for simplicity we have a default
        $vmx.defaultDetector.set_connection({
            id: connectionUuid
        });

        //Maybe superfluous explicit starting of the detector.
        $vmx.defaultDetector.start();

        // We refer to our detectors by name, as we might get new, improved models
        vmxApi(modelName).onEnter(dosomething, {
            some: {
                arbitrary: "data"
            }
        }, {
            minTime: 3000,
            minScore: 0.7
        });

    }

    var dosomething = function (data) {
        console.log("Found Detection, ", data);
        var img = new Image();
        img.src = $vmx.getSnapshot();
        $('#output').prepend(img);
        $('#img').attr("src", $vmx.getSnapshot());
        
        
        // 
        oHttpRequest.open("POST", "https://c4cdkom-demo.cf3.hybris.com/defects", true);
        oHttpRequest.setRequestHeader("hybris-roles", "Test");
        oHttpRequest.setRequestHeader("hybris-tenant", "Test");
        oHttpRequest.setRequestHeader("hybris-user", "Test");
        oHttpRequest.setRequestHeader("hybris-app", "Test");
        oHttpRequest.setRequestHeader("Content-Type", "application/json");
        oHttpRequest.onreadystatechange = function () {
            if (oHttpRequest.readyState < 4) {
                return;
            }


           // alert(oHttpRequest.responseText);

        };
        var imgBase64 = getBase64Image(img);
        var postBody = '{"id": "t1","timestamp": 1424815830730,"category": "Drone Ticket: ' + new Date() + '","geoCode": "37.3956647, 37.3989862","waypointId": "wp1","score": 93,"droneId": "d1","image":"'+imgBase64+'"}';
        oHttpRequest.send(postBody);
        

    }


    $vmx
        .connections
        .update()
        .then(function (runningDetectors) {
            // This is the UUID for the model I created which I called "tree"
            var myModelUuid = '88cd4d05-78fd-4308-85dc-736d1fedfd1a';
            // Check all the running detectors for the model we are interested in
            for (var conn in runningDetectors) {
                console.log("checking..");
                if (runningDetectors[conn].model.uuid == myModelUuid) {
                    // When one's found, start our thingy with existing connectionId
                    console.log("usingo ne..");
                    start(runningDetectors[conn].id);
                    return;
                }
            }

            // If we get here, we don't have an existing running detector for our model
            // So we make one, which happens asynchronously
            console.log("makingo ne..");
            $vmx.connections.create(myModelUuid).then(function (connectionId) {
                //Then we start our thingy with the new connectionId
                console.log('New connection created:', connectionId);
                start(connectionId);
            });

        });
}
