var highlighted={
    feature: undefined,
    originalColor: new Cesium.Color(),
};
function axToolFloorAndRoom(layer) {
    if(handler==null){
        handler=new  Cesium.ScreenSpaceEventHandler(viewer.canvas);
    }
    
    handler.setInputAction(function (evt){
        if(Cesium.defined(highlighted.feature))
        {
            highlighted.feature.color=highlighted.originalColor;
            highlighted.feature=undefined;
        }
        var pickedObject=viewer.scene.pick(evt.endPosition);
        if(! Cesium.defined(pickedObject)){
           return;
        }
        highlighted.feature=pickedObject;
        Cesium.Color.clone(pickedObject.color,highlighted.originalColor);
        pickedObject.color=Cesium.Color.LIME.withAlpha(0.5);

    },Cesium.ScreenSpaceEventType.MOUSE_MOVE);

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