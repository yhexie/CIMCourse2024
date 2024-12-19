var p=[];
var pCartographic=[];
var activeShapePoints=[];
var activeShape;
var floatingPoint;
var radiansPerDegree = Math.PI /180.0;
var degreesPerRadian = 180.0/ Math.PI;
var geoserverUrl = 'http://127.0.0.1:8180/geoserver/CJZTown';
//绘制geojson图层样式
var geoJsonStyle = {
	stroke: Cesium.Color.BLUE,
	strokeWidth: 3,
	fill: Cesium.Color.BLUE.withAlpha(0.9),
	clampToGround: true
  };
function axToolSelection(layer){
    drawingMode = "rectangle";
	if(annotations==null)
    {
		annotations=viewer.scene.primitives.add( new Cesium.LabelCollection());
	}
    viewer.cesiumWidget.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
	viewer.cesiumWidget.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
	viewer.cesiumWidget.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.RIGHT_CLICK);
	viewer.cesiumWidget.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
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
                floatingPoint = drawPointRect(earthPosition);
                activeShapePoints.push(earthPosition);
                const dynamicPositions = new Cesium.CallbackProperty(function () {
                    if (drawingMode === "rectangle") {
                        return new Cesium.PolygonHierarchy(activeShapePoints);
                    }
                    return activeShapePoints;
                }, false);//回调函数
                activeShape = drawShapeRect(dynamicPositions);
            }
            activeShapePoints.push(earthPosition);
            //drawPointRect(earthPosition);
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
		var polygon =null;
        if(activeShapePoints.length != 0)
        {
            polygon =drawShapeRect(activeShapePoints);
        }
		var extent =getExtentByCartesian3(activeShapePoints);  
		viewer.entities.remove(polygon);
        viewer.entities.remove(floatingPoint);
        viewer.entities.remove(activeShape);
        floatingPoint=undefined;
        activeShape=undefined;
        activeShapePoints=[];
        p=[];
        pCartographic=[];
		drawingMode = "rectangle";
		if(extent && extent.length>0){
			 //构造polygon 
			 polygon = '';
			 polygon += extent[0] + ',' + extent[1] + ' ' ;
			 polygon += extent[2] + ',' + extent[1] + ' ' ;
			 polygon += extent[2] + ',' + extent[3] + ' ' ;
			 polygon += extent[0] + ',' + extent[3] + ' ' ;
			 polygon += extent[0] + ',' + extent[1] + ' ' ;
	   }
	   console.log('polygon',polygon);
	   if(polygon){
		   queryByPolygon(polygon,'CJZTown:cjz_buildings',callbackLastQueryWFSService);
		}
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
    if (angle < 0){
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


 /*空间查询图层
*@method queryByPolygon
*@param polygon 空间范围
*@param typeName 图层名称
*@return null
*/
function queryByPolygon(polygon, typeName, callback){
	var filter =
	'<Filter xmlns="http://www.opengis.net/ogc" xmlns:gml="http://www.opengis.net/gml">';
	/*filter += '<And>';*/
	filter += '<Intersects>';
	filter += '<PropertyName>the_geom</PropertyName>';
	filter += '<gml:Polygon>';
	filter += '<gml:outerBoundaryIs>';
	filter += '<gml:LinearRing>';
	filter += '<gml:coordinates>' + polygon + '</gml:coordinates>';
	filter += '</gml:LinearRing>';
	filter += '</gml:outerBoundaryIs>';
	filter += '</gml:Polygon>';
	filter += '</Intersects>';
	/*filter += '<PropertyIsLike wildCard="*" singleChar="#" escapeChar="!">';
	filter += '<PropertyName>map_num</PropertyName>';
	filter += '<Literal>*201911_440114*</Literal>';
	filter += '</PropertyIsLike>'; */
	/*filter += '</And>';*/
	filter += '</Filter>';
	var urlString = geoserverUrl + '/ows';
	var param = {
	service: 'WFS',
	version: '1.0.0',
	request: 'GetFeature',
	typeName: typeName,
	outputFormat: 'application/json',
	filter: filter
	};
	var geojsonUrl = urlString + getParamString(param, urlString);
	$.ajax({
		url: geojsonUrl,
		async: true,
		type:'GET',
		dataType: 'json',
		success(result) {
			callback(result);
		},
		error(err) {
			console.log(err);
		}
	})
}

function getParamString(obj, existingUrl, uppercase){
	var params = [];
	for (var i in obj) {
		params.push(encodeURIComponent(uppercase ? i.toUpperCase() : i) + '=' + encodeURIComponent(obj[i]));
	}
	return ((!existingUrl || existingUrl.indexOf('?') === -1) ? '?' : '&') + params.join('&');    
}
/*
* 图层空间查询回调函数
*/
function callbackLastQueryWFSService(data){
	console.log('data',data);
	if(data && data.features.length>0){
		clearGeojsonLayer();
		loadGeojsonLayer(data);
	}
}

function getExtentByPoints(points) {
	if (points) {
		// 指定世界范围
		let lonMin = 180;
		let lonMax = -180;
		let latMin = 90;
		let latMax = -180;
		points.forEach(function (point) {
			const longitude = point[0];
			const latitude = point[1];
			// 计算边界
			lonMin = longitude < lonMin ? longitude : lonMin;
			latMin = latitude < latMin ? latitude : latMin;
			lonMax = longitude > lonMax ? longitude : lonMax;
			latMax = latitude > latMax ? latitude : latMax;
		});
		const xRange = lonMax - lonMin ? lonMax - lonMin : 1;
		const yRange = latMax - latMin ? latMax - latMin : 1;
		// 返回数据
		return [lonMin - xRange / 10, latMin - yRange / 10, lonMax + xRange / 10, latMax + yRange / 10];
	}
	return [-180,-90,180,90];
}
/**
 * @todo 弧度坐标转经纬度坐标
 * @param {Cartographic} cartographic - 弧度坐标
 * @return {Object} - {longitude: x, latitude: y, height: h} - 返回经纬度
 */
function cartographicToDegrees(cartographic) {
	const result = {};
	result.longitude = Cesium.Math.toDegrees(cartographic.longitude);
	result.latitude = Cesium.Math.toDegrees(cartographic.latitude);
	if (cartographic.height > 0) {
		result.height = cartographic.height;
	}
	return result;
}
/**
 * @todo 获取 Cartesian3 四至范围
 * @param {Cartesian3} cartesian3s - 世界坐标对象
 * @return {*[]}
 */
function getExtentByCartesian3(cartesian3s) {

	if(cartesian3s instanceof Array && cartesian3s.length>0){
		const points = [];
		for (let i = 0; i < cartesian3s.length; i++) {
			const cartesian3 = cartesian3s[i];
			// 将 cartesian3 转为经纬度数组
			
		const cartographic = Cesium.Cartographic.fromCartesian(cartesian3);
		const point = cartographicToDegrees(cartographic);
			points.push([point.longitude,point.latitude]);
		}
		return getExtentByPoints(points);
	}
}

/*
* 绘制图形函数
*/
function loadGeojsonLayer(geojson){
	var promise = Cesium.GeoJsonDataSource.load(geojson,geoJsonStyle);
	promise.then(function(dataSource) {
		viewer.dataSources.add(dataSource);
		viewer.zoomTo(dataSource);
	}).otherwise(function(error){
		//Display any errrors encountered while loading.
		window.alert(error);
	});
}
/*
* 清空绘制图形函数
*/
function clearGeojsonLayer(){
	viewer.dataSources.removeAll();
}

function drawPointRect(worldPosition) {
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

function drawShapeRect(positionData) {
    let shape;
    if (drawingMode === "rectangle") {
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