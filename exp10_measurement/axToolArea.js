var p=[];
var pCartographic=[];
var activeShapePoints=[];
var activeShape;
var floatingPoint;
var radiansPerDegree = Math.PI /180.0;
var degreesPerRadian = 180.0/ Math.PI;

function axToolArea(layer){
    drawingMode = "polygon";
	annotations=viewer.scene.primitives.add( new Cesium.LabelCollection());
    viewer.cesiumWidget.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
    //窗口事件句柄
    if(handler==null)
    {
        handler = new Cesium.ScreenSpaceEventHandler(viewer.canvas);
    }
    handler.setInputAction(function (event) {
        const earthPosition = viewer.scene.pickPosition(event.position);//
        pCartographic.push(Cesium.Cartographic.fromCartesian(earthPosition));
        p.push(earthPosition);
        //如果鼠标指针不在地球上，则earthPosition是未定义的
        if (Cesium.defined(earthPosition))
        {
            if (activeShapePoints.length === 0) {
                floatingPoint = drawPointArea(earthPosition);
                activeShapePoints.push(earthPosition);
                const dynamicPositions = new Cesium.CallbackProperty(function () {
                    if (drawingMode === "polygon") {
                        return new Cesium.PolygonHierarchy(activeShapePoints);
                    }
                    return activeShapePoints;
                }, false);//回调函数
                activeShape = drawShapeArea(dynamicPositions);
            }
            activeShapePoints.push(earthPosition);
            drawPointArea(earthPosition);
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
        if(activeShapePoints.length != 0)
        {
            drawShapeArea(activeShapePoints);
        }
        var text = getArea(p);
        addLabel(pCartographic,text);
        viewer.entities.remove(floatingPoint);
        viewer.entities.remove(activeShape);
        floatingPoint=undefined;
        activeShape=undefined;
        activeShapePoints=[];
        p=[];
        pCartographic=[];
    }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);//鼠标右键
}

function getBearing( from, to) {
    var from = Cesium.Cartographic.fromCartesian(from);
    var to= Cesium.Cartographic.fromCartesian(to);
    var lat1= from.latitude * radiansPerDegree;
    var lon1= from.longitude * radiansPerDegree;
    var lat2= to.latitude * radiansPerDegree;
    var lon2= to.longitude * radiansPerDegree;

    var angle= -Math.atan2(Math.sin(lon1-lon2)*Math.cos(lat2),
    Math.cos(lat1)*Math.sin(lat2)-Math.sin(lat1)* Math.cos(lat2)*Math.cos(lon1-lon2));
    if (angle<0){
        angle += Math.PI * 2.0;
    }
    angle = angle *degreesPerRadian;
    return angle;
}

function getAngle(p1,p2,p3){
    var bearing21 = getBearing(p2,p1);
    var gearing23 = getBearing(p2,p3);
    var angle=bearing21 - gearing23;
    if (angle < 0){
        angle += 360;
    }
    return angle;
}

function getDistance(point1,point2){
    var geodesic =new Cesium.EllipsoidGeodesic();
    geodesic.setEndPoints(point1,point2);
    var s= geodesic.surfaceDistance;
    s= Math.sqrt(Math.pow(s,2)+ Math.pow(point2.height -point1.height,2));
    return s;
}

function getArea(points){
    var res= 0;
    for (var i=0; i < points.length-2; i++){
        var j =(i+1) % points.length;
        var k = (i+2) % points.length;
        var totalAngle =getAngle(points[i], points[j],points[k]);
        var totalAngle = totalAngle.toFixed();
        var dis_temp1 =getDistance(pCartographic[i], pCartographic[j]);
        var dis_temp2 = getDistance(pCartographic[j], pCartographic[k]);
        res+= dis_temp1* dis_temp2 * Math.abs(Math.round(Math.sin((totalAngle*Math.PI /180))*1000000)/ 1000000);
        console.log(res);
    }
    return res.toFixed(2);
}

function addLabel (pCartographic, text){
    var position = Cesium.Cartesian3.fromRadians(
        pCartographic[pCartographic.length-1].longitude,
        pCartographic[pCartographic.length-1].latitude,
        pCartographic[pCartographic.length-1].height);
    var label= viewer.entities.add(
        {
            position: position,
            label:{
                text: text + "平方米",
                font: '18px sans-serif',
                fillColor: Cesium.Color.GOLD,
                style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                outlineWidth:2,
                verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                pixelOffset: new Cesium.Cartesian2(20,-20),
                heightReference: Cesium.HeightReference.NONE
            }
        }
    )
}

function drawPointArea(worldPosition) {
    const point = viewer.entities.add({
        position: worldPosition,
        point: {
            color: Cesium.Color.SKYBLUE,
            pixelSize: 5,
            outlineColor: Cesium.Color.YELLOW,
            outlineWidth: 2,
            disableDepthTestDistance: 1000
        },
    });
    return point;
}

function drawShapeArea(positionData) {
    let shape;
    if (drawingMode === "polygon") {
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