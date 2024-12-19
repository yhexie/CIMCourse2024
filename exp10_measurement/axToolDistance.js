var positions=[];
var activeShapePoints=[];
var floatingPoint;

function axToolDistance(layer){
    drawingMode = "polyline";
    viewer.cesiumWidget.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
    //窗口事件句柄
    if(handler==null)
    {
        handler = new Cesium.ScreenSpaceEventHandler(viewer.canvas);
    }
    handler.setInputAction(function (event) {
        const earthPosition = viewer.scene.pickPosition(event.position);//在地面的交点
        positions.push(earthPosition);
        var distance=getSpaceDistance(positions);
        if (Cesium.defined(earthPosition)) //鼠标点击在地球范围内
        {
            if (activeShapePoints.length === 0) {
                //floatingPoint = drawPoint(earthPosition,null);
                activeShapePoints.push(earthPosition);
                const dynamicPositions = new Cesium.CallbackProperty(function () {
                    if (drawingMode === "polyline") {
                        return activeShapePoints;
                    }
                }, false);//回调函数
                activeShape = drawShape2(dynamicPositions);
            }
            activeShapePoints.push(earthPosition);
            floatingPoint =drawPoint(earthPosition, distance);
        }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);//鼠标左键

    handler.setInputAction(function (event) {
        if (Cesium.defined(floatingPoint)) {
            const newPosition = viewer.scene.pickPosition(event.endPosition);
            if (Cesium.defined(newPosition)) {
                activeShapePoints.pop();
                activeShapePoints.push(newPosition);
            }
        }
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);//鼠标移动

    handler.setInputAction(function (event) {    
        activeShapePoints.pop();
        if(activeShapePoints.length){
            drawShape2(activeShapePoints);
        }
        viewer.entities.remove(activeShape);
        floatingPoint=undefined;
        activeShape=undefined;
        activeShapePoints=[];
        positions=[];
    }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);//鼠标右键
}

function getSpaceDistance(positions){
    var distance=0;
    for (var i = 0; i< positions.length-1; i++){
        distance += Cesium.Cartesian3.distance(positions[i],positions[i+1]);
        var point1Cartographic= Cesium.Cartographic.fromCartesian(positions[i]);
        var point2Cartographic= Cesium.Cartographic.fromCartesian(positions[i+1]);
        var geodesic= new Cesium.EllipsoidGeodesic();
        geodesic.setEndPoints(point1Cartographic,point2Cartographic);
        var s = geodesic.surfaceDistance;
        s = Math.sqrt(Math.pow(s,2)+Math.pow(point2Cartographic.height-point1Cartographic.height,2));
        distance=distance+s;
    }
    return distance.toFixed(2);
}

function drawPoint(position,textDistance) {
    const pointGeometry = viewer.entities.add({
        name: "pointG",
        position: position,
        point: {
            color: Cesium.Color.SKYBLUE,
            pixelSize: 5,
            outlineColor: Cesium.Color.YELLOW,
            outlineWidth: 2,
            disableDepthTestDistance : 1000
        },
        label: {
            text :textDistance + "米",
            font: '18px sans-serif',
            fillColor: Cesium.Color.GOLD, 
            style: Cesium.LabelStyle.FILL_AND_OUTLINE,
            outlineWidth: 2,
            verticalOrigin:Cesium.VerticalOrigin.BOTTOM,
            pixelOffset: new Cesium.Cartesian2(20,-20),
            heightReference:Cesium.HeightReference.NONE
        }
    });
    return pointGeometry;
}

function drawShape2(positionData) {
    let shape;
    if (drawingMode === "rectangle") 
    {
       
    } 
    else if (drawingMode === "polyline") 
    {
        shape = viewer.entities.add({
            polyline: {
                positions: positionData,
                width: 5.0,
                material: new Cesium.PolylineGlowMaterialProperty(
                    {
                        color: Cesium.Color.GOLD,
                    }),
            }
        }); 
    }
    else if (drawingMode === "polygon") 
    {
        shape = viewer.entities.add({
        polygon: {
            hierarchy: positionData,
            material: new Cesium.ColorMaterialProperty(
            Cesium.Color.RED.withAlpha(0.7)
            ),
            },
        }); 
    }
    return shape;
}

function destroy()
{
    viewer.entities.removeAll();
    if (handler) {
        handler.destroy();
        handler = null;
    }
    viewer.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
    viewer.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
    viewer.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.RIGHT_CLICK);
    viewer.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
}