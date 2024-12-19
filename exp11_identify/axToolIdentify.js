
function axToolIdentify(layer){
    drawingMode = "identify";
	if(annotations==null)
    {
		annotations=viewer.scene.primitives.add( new Cesium.LabelCollection());
	}
    viewer.cesiumWidget.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
	viewer.cesiumWidget.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
	viewer.cesiumWidget.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
	viewer.cesiumWidget.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.RIGHT_CLICK);
	viewer.cesiumWidget.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    //窗口事件句柄
    if(handler==null)
    {
        handler = new Cesium.ScreenSpaceEventHandler(viewer.canvas);
    }
    var highlightFace = null;
	viewer.screenSpaceEventHandler.setInputAction(function onLeftClick(movement) {
		if(drawingMode === "identify"){
			 var pickedFeature = viewer.scene.pick(movement.position);
			 console.log('pickedFeature',pickedFeature);
			 if(pickedFeature){
				 //判断之前是否有高亮面存在
				 if (highlightFace) {
					 highlightFace.material = highlightFace.material0;
				 }
				 if(pickedFeature.id.polygon.material){
					 pickedFeature.id.polygon.material0 = pickedFeature.id.polygon.material;
					 pickedFeature.id.polygon.material = Cesium.Color.DEEPSKYBLUE.withAlpha(0.8);
					 highlightFace = pickedFeature.id.polygon;
					 console.log('properties',pickedFeature.id.properties);
					//气泡窗口显示
					var content =
						"<div>"+
						"<span>建筑编号:</span><span>"+pickedFeature.id.properties.id+"</span></br>"+
						"<span>类别::</span><span>"+pickedFeature.id.properties.fclass+"</span></br>"+
						"<span>信息描述::</span><span>"+pickedFeature.id.properties.name+"</span></br>"+
						"</div>";
					$("#infowindow").show();
					$("#infowindow").empty();
					$("#infowindow").append(content);
				 }
			 }
			 else{
				if (highlightFace) {
					 highlightFace.material = highlightFace.material0;
				}
				$("#infowindow").hide();
			 }
		}
     }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
}


