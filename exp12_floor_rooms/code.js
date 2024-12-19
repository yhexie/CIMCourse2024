var handler=null;
var drawingMode = "undefined";
Cesium.Ion.defaultAccessToken='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJkNGNmNzRjYy0xNmZkLTQxNDEtYjQxMy0yMWI4NWE5ZWQwN2IiLCJpZCI6NTM1ODEsImlhdCI6MTYxOTI1NzU5MH0.Xcl8pPPUlgWmdip2hj90xyCoRz_Ikj7zCW1PgJhK2n8';
var viewer = new Cesium.Viewer('cesiumContainer', {
	timeline:false,
	animation:false,
	vrButton:false,
	sceneModePicker:false,
	infoBox:true,
	scene3DOnly:false,
	terrainProvider: Cesium.createWorldTerrain()
  });
viewer._cesiumWidget._creditContainer.style.display = "none"; 
viewer.camera.flyTo({destination : Cesium.Cartesian3.fromDegrees(120.16,32.71,11500000.0)});
viewer.homeButton.viewModel.command.beforeExecute.addEventListener(function(commandInfo) {
	//飞到瓦片区域
	viewer.camera.flyTo({destination : Cesium.Cartesian3.fromDegrees(120.16,32.71,500000.0)});
	//viewer.camera.lookAt(Cesium.Cartesian3.fromDegrees(120.0, 40.0),new Cesium.Cartesian3(0.0,-10000.0, 3930000.0));
	//viewer.camera.lookAtTransform(Cesium.Matrix4.IDENTITY);
	commandInfo.cancel = true;
});
// 开启地形深度监测
viewer.scene.globe.depthTestAgainstTerrain = true;
tileset = new Cesium.Cesium3DTileset({
	url: "./SeYuan36/tileset.json", 
	 maximumScreenSpaceError : 32,
	 skipLevelOfDetail : true, 
	 immediatelyLoadDesiredLevelOfDetail : true}); 
viewer.scene.primitives.add(tileset); 
//单体信息，楼层信息
tilesetClassify = new Cesium.Cesium3DTileset({
	url: "./buildings/tileset.json",
	classificationType: Cesium.ClassificationType.MODEL,
	modelMatrix: Cesium.Matrix4.fromArray(
	[1,0,0,0,
	0,1,0,0,
	0,0,1,0,
	0,0,0,1]),
	});
tilesetClassify.style= new Cesium.Cesium3DTileStyle({
		color: 'rgba (1,0,0,0.1)'
	});
viewer.scene.primitives.add(tilesetClassify);

viewer.zoomTo(tilesetClassify);