Cesium.Ion.defaultAccessToken='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJkNGNmNzRjYy0xNmZkLTQxNDEtYjQxMy0yMWI4NWE5ZWQwN2IiLCJpZCI6NTM1ODEsImlhdCI6MTYxOTI1NzU5MH0.Xcl8pPPUlgWmdip2hj90xyCoRz_Ikj7zCW1PgJhK2n8';
//增加视图区
const viewer = new Cesium.Viewer("cesiumContainer", {
selectionIndicator: false,
infoBox: false,
terrainProvider: Cesium.createWorldTerrain(),
imageryProvider: new Cesium.WebMapTileServiceImageryProvider({
			url: "http://t0.tianditu.gov.cn/vec_w/wmts?tk=ec5a2a0e05d6e7be9aabdcfa8a8812a9" ,
			layer: "vec",
			style: "default",
			tileMatrixSetID: "w",
			format: "tiles",
			maximumLevel: 18,
		}),
});

viewer.cesiumWidget.screenSpaceEventHandler.removeInputAction(
	Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK
);
function createPoint(worldPosition) {
	const point = viewer.entities.add({
		position: worldPosition,
		point: {
		color: Cesium.Color.RED,
		pixelSize: 5,
		heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
		},
	});
	return point;
}
let drawingMode = "line";
function drawShape(positionData) {
	let shape;
	if (drawingMode === "line") {
		shape = viewer.entities.add({
		polyline: {
			positions: positionData,
			clampToGround: true,
			material: Cesium.Color.RED,
			width: 3,
		},
		});
	} else if (drawingMode === "polygon") {
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
let activeShapePoints = [];
let activeShape;
let floatingPoint;
//窗口事件句柄
const handler = new Cesium.ScreenSpaceEventHandler(viewer.canvas);
handler.setInputAction(function (event) {
	const ray = viewer.camera.getPickRay(event.position);//根据鼠标点击坐标和相机坐标构建射线
	const earthPosition = viewer.scene.globe.pick(ray, viewer.scene);//射线与球面求交，在地面的交点
	// `earthPosition` will be undefined if our mouse is not over the globe.
	if (Cesium.defined(earthPosition)) //鼠标点击在地球范围内
	{
		if(drawingMode === "point"){
			createPoint(earthPosition);
		}
		else{
			if (activeShapePoints.length === 0) {
			floatingPoint = createPoint(earthPosition);
			activeShapePoints.push(earthPosition);
			const dynamicPositions = new Cesium.CallbackProperty(function () {
				if (drawingMode === "polygon") {
					return new Cesium.PolygonHierarchy(activeShapePoints);
				}
				return activeShapePoints;
			}, false);//回调函数
			activeShape = drawShape(dynamicPositions);
			}
			activeShapePoints.push(earthPosition);
			createPoint(earthPosition);
		}
	}
}, Cesium.ScreenSpaceEventType.LEFT_CLICK);//鼠标左键

handler.setInputAction(function (event) {
	if (Cesium.defined(floatingPoint)) {
		const ray = viewer.camera.getPickRay(event.endPosition);
		const newPosition = viewer.scene.globe.pick(ray, viewer.scene);
		if (Cesium.defined(newPosition)) {
		floatingPoint.position.setValue(newPosition);
		activeShapePoints.pop();
		activeShapePoints.push(newPosition);
		}
	}
}, Cesium.ScreenSpaceEventType.MOUSE_MOVE);//鼠标移动
//移除临时绘制图像.
function terminateShape() {
	activeShapePoints.pop();
	drawShape(activeShapePoints);
	viewer.entities.remove(floatingPoint);
	viewer.entities.remove(activeShape);
	floatingPoint = undefined;
	activeShape = undefined;
	activeShapePoints = [];
}
handler.setInputAction(function (event) {
	terminateShape();
}, Cesium.ScreenSpaceEventType.RIGHT_CLICK);//鼠标右键


function DrawPoint()
{
	terminateShape();
	var selectEl = document.getElementById("drawtype");
	drawingMode= selectEl.value;
	//缩放至点
	viewer.camera.lookAt(
		Cesium.Cartesian3.fromDegrees(-122.2058, 46.1955, 1000.0),
		new Cesium.Cartesian3(5000.0, 5000.0, 5000.0)
	);
	viewer.camera.lookAtTransform(Cesium.Matrix4.IDENTITY);
}

if (typeof Cesium !== 'undefined') {
    window.startupCalled = true;
    window.startup(Cesium).catch((error) => {
      "use strict";
      console.error(error);
    });
}