Cesium.Ion.defaultAccessToken='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJkNGNmNzRjYy0xNmZkLTQxNDEtYjQxMy0yMWI4NWE5ZWQwN2IiLCJpZCI6NTM1ODEsImlhdCI6MTYxOTI1NzU5MH0.Xcl8pPPUlgWmdip2hj90xyCoRz_Ikj7zCW1PgJhK2n8';
//增加视图区
const viewer = new Cesium.Viewer("cesiumContainer", {
	geocoder: false,
	homeButton: true,
	sceneModePicker: false,
	fullscreenButton: false,
	vrButton: false,
	baseLayerPicker: true,
	infoBox: false,
	selectionIndicator: false,
	animation: false,
	timeline: false,
	shouldAnimate: true,
	navigationHelpButton: false,
	navigationInstructionsInitiallyVisible: false,
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

var imageryProvider = new Cesium.WebMapServiceImageryProvider({
    url : 'http://127.0.0.1:8180/geoserver/CJZTown/wms?',
    layers : 'CJZTown:cjzALL', // WMS图层名称
    parameters : {
        transparent : true, // 设置为透明背景
        format: "image/png",
        srs: "EPSG:4326",
       }
    });

// 创建一个ImageryLayer实例，将ImageryProvider添加到场景中
var imageryLayer = new Cesium.ImageryLayer(imageryProvider);
viewer.imageryLayers.add(imageryLayer);
viewer.homeButton.viewModel.command.beforeExecute.addEventListener(function(commandInfo) {
	// Fly to tileset
	viewer.camera.flyTo({destination: Cesium.Cartesian3.fromDegrees(120.59632804078015,32.07825024075017,6000)});
	// Tell the home button not to do anything
	commandInfo.cancel = true;
});
var position = Cesium.Cartesian3.fromDegrees(120.59632804078015,32.07825024075017,6000);//定义飞行终点的坐标
viewer.camera.flyTo({destination:position});
viewer.cesiumWidget.screenSpaceEventHandler.removeInputAction(
	Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK
);
var handler=null;
var annotations=null;