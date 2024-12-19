
function axToolCoordinate(layer) {
    if(handler==null){
        handler=new  Cesium.ScreenSpaceEventHandler(viewer.canvas);
    }
    
    annotations=viewer.scene.primitives.add( new Cesium.LabelCollection());
    handler.setInputAction(function (evt){
        var pickedObject=viewer.scene.pick(evt.position);
        if(viewer.scene.pickPositionSupported && Cesium.defined(pickedObject)){
            var cartesian=viewer.scene.pickPosition(evt.position);
            if(Cesium.defined(cartesian))
            {
                var cartographic=Cesium.Cartographic.fromCartesian(cartesian);
                var lng=Cesium.Math.toDegrees(cartographic.longitude);
                var lat=Cesium.Math.toDegrees(cartographic.latitude);
                var height=cartographic.height;
                annotate(cartesian,lng,lat,height);
            }
        }
        else{
            var ray=viewer.camera.getPickRay(evt.position);
            var cartesian=viewer.scene.globe.pick(ray,viewer.scene);
            if(Cesium.defined(cartesian)){
                var cartographic=Cesium.Cartographic.fromCartesian(cartesian);
                var lng=Cesium.Math.toDegrees(cartographic.longitude);
                var lat=Cesium.Math.toDegrees(cartographic.latitude);
                var height=cartographic.height;
                annotate(cartesian,lng,lat,height);
            }
        }
    },Cesium.ScreenSpaceEventType.LEFT_CLICK);

    handler.setInputAction(function (){
        viewer.entities.removeAll();
        annotations.removeAll();
    },Cesium.ScreenSpaceEventType.RIGHT_CLICK);
}

function createPoint(worldPostion){
    var point = viewer.entities.add({
        position:worldPostion,
        point:{
            color:Cesium.Color.CRIMSON,
            pixelSize:9,
            outlineColor:Cesium.Color.ALICEBLUE,
            outlineWidth:2,
            disableDepthTestDistance:1000
        }
    });
}

function annotate(cartesian,lng,lat, height){
    createPoint (cartesian);
    annotations.add({
        position:cartesian,
        text:
        'Lon:'+lng.toFixed(5)+'\u00B0'+
        '\nLat:'+lat.toFixed(5)+'\u00B0'+
        '\nHeight:'+height.toFixed(2)+'m',
        showBackground:true,
        font:'22px monospace',
        horizontalOrigin: Cesium.HorizontalOrigin.LEFT,
        verticalOrigin: Cesium.VerticalOrigin.Bottom,
        disableDepthTestDiatane:Number.POSITIVE_INFINITY
    });
}