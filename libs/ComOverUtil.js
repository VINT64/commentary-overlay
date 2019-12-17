/* By: VINT64
All code copied from Stack Overflow and
other places keeps its respective licenses.
All original code is unlicensed (more info
https://unlicense.org ) */

const DEFAULT_LAYER_NAME = 'default';
const DEFAULT_IMAGE_NAME = 'default';

var Main = (function(){

	function logError(error){
		console.log(error.message);
	}
	
	function updateLanguage(){
		Language.set(Page.getLanguage(),
			Page.applyLanguage);
	}	

	function selectComment(el){
		if (!el)
			return;
		Page.deselectComment();
		let comOver = Memory.getComOverByOverlay(el);
		if(!comOver)
			return;
		let commentText = comOver.getText();
		if (commentText === null) 
			commentText = '';
		Page.selectComment(el, commentText);
	}
	
	function removeSelectedComment(){

		function removeComment(el){
			if (!el) 
				return;
			let comOver = Memory.removeComOverByOverlay(el);
			Page.removeComOver(comOver);
			Page.deselectComment();
		}	
	
		removeComment(Page.getSelectedComment());
	}
	
	function addSelectCommentListener(el){
		// el.onmousedown = (e) => {
		// 	//prevents canvas from starting drawing new overlay
		// 	e.stopPropagation(); 
		// };
		Drawing.dragElement(el);
		el.onclick = (e) => {
			selectComment(el);
		};
	}
	
	function removeFileLayers(){
		Memory.clearLayers();
		Page.clearLayersSelect();
	}	
	
	function addLayer(name, comovers){
		Memory.addLayer(name, comovers);
		Page.addLayer(name);
	}
	
	function addEmptyLayer(){
		addLayer(DEFAULT_LAYER_NAME, []);
	}
	
	function selectLayer(i){
		let LayersNumber = Memory.getLayersNumber();
		if (i < 0 || i >= LayersNumber){
			console.log('Tried to select layer: ' + i +
				', number of layers: ' + LayersNumber +
				'\nresetting current Layer to 0...');
			Memory.setCurrentLayer(0);
			return;
		}
		if (!Memory.setCurrentLayer(i)){
			console.log('Failed to select layer: ' + i);
			return;
		}
		Page.deselectComment();
		Page.clearComments();
		
		let comovers = Memory.getCurrentComOvers(); // i
		comovers.forEach(comOver => {
			Page.addComOver(comOver);
		});
		Page.selectLayer(Memory.getCurrentLayerName(), i);
	}	
	
	function clearCurrentLayer(){
		Memory.clearCurrentLayer();
		Page.clearCanvas();
	}

	function removeCurrentLayer(){
		let layersNumber = Memory.getLayersNumber();
		if (layersNumber == 1){
			alert(Language.getPhrase('lastLayerAlert'));
			return;
		}
		let layerIndex = Page.getLayerIndex();
		if (layerIndex < 0)
			return;
		if (!confirm(Language.getPhrase('removeLayerConfirm')))
			return;
		Memory.removeLayer(layerIndex);
		Page.removeLayer(layerIndex);
		selectLayer(Page.getLayerIndex());
	}
	
	function updateLayer(){ 
		let index = Page.getLayerIndex();
		if (index == -1) return;
		selectLayer(index);
	}
	
	const jsonReader = new FileReader();

	jsonReader.onload = manageLoadedJson;
	
	function manageLoadedJson(event){
	
		function addComment(jsonComment, list){
			let comOver = JsonUtil
				.convertToComOver(jsonComment,
				(overlay) => {
					if (Page.isInEditorMode()){
						overlay.classList
							.add('canvasOverlayDiv');
						addSelectCommentListener(
							overlay);
					} 
				}
			);
			list.push(comOver);
		}
		
		removeFileLayers();
		
	
		let json = JSON.parse(event.target.result);
		let layers = JsonUtil.getFileLayersList(json);
		layers.forEach(jsonLayer => {
			let comovers = [];
			JsonUtil.getLayerCommentsList(jsonLayer)
				.forEach(json => {
					addComment(json, comovers);
				}
			);
			addLayer(JsonUtil.getLayerName(jsonLayer),
				comovers);
		});
		selectLayer(Memory.getNextLayer());
		Memory.setNextLayer(0);
	}

	function selectFile(i){ 
	
		function useJSONReader(blob){
			jsonReader.readAsText(blob);
		}
		
		let imageNumber = Memory.getImagesNumber()
		if (i < 0 || i >= imageNumber){
			console.log('Tried to select image: ' + i +
				', number of images: ' + imageNumber);
			return;
		}
		if (!Memory.setCurrentFile(i)){
			console.log('Failed to select file: ' + i);
			return;
		}
		let currentFile = i;
		let currentImage = Memory.getFullImageName(
			currentFile);
		if (currentImage === null){
			console.log('selectFile panic, ' +
				'current image name is null');
			return;
		}
		Page.fillFileInfo(currentImage +	' ' + (currentFile + 1)
			+ '/' + imageNumber + ' ');
	
		let archive = Memory.getArchive();
		archive.file(currentImage)
			.async('blob').then(Page.manageImage,
			logError
			);	
		
		if (Memory.getCommentFilesNumber() > 0){
			let currentCommentFile = 
				Memory.getFullCommentFileName(currentFile);
			if (currentImage === null){
				console.log('selectFile panic, ' +
					'current comment file name is null');
				return;
			}
			archive.file(currentCommentFile)
				.async('blob').then(useJSONReader,
					logError
				);
		}
	}
	
	function selectFileAndLayer(f, l){
		Memory.setNextLayer(l);
		selectFile(f);
	}
	
	function selectAfterLoading(){
		selectFileAndLayer(0,0);
	}
	
	function currentFileLayersListToWrite(){
	
		let layersList = Memory.getLayers();
		if (!Array.isArray(layersList)){
			console.log('currentFileLayersListToWrite ' +
			'panic, not an array: ' + i);
				return [];
		}
		return JsonUtil.convertLayersList(layersList);
	}
		
	function saveCurrentFileToArchive(){
		return new Promise((resolve, reject) => {
			let f = new FileReader();
			let filename = 
				Memory.getFullCurrentCommentFileName();
			let archive = Memory.getArchive();
			f.onload = (e) => {
				file = JSON.parse(event.target.result);
				file.layers = 
					currentFileLayersListToWrite();
				archive.file(filename,
					JSON.stringify(file));
				resolve();
			};
			archive.file(filename).async('blob')
				.then((blob) => {
					f.readAsText(blob);
				},
				logError
			);
			
		});
	}	

	function saveAndSelectFileAndLayer(index, layer){
		saveCurrentFileToArchive().then(() =>
			selectFileAndLayer(index, layer));
	}
	
	function goLeft(){
		let length = Memory.getImagesNumber();
		if (length == 0) return;
		let currentFile = Memory.getCurrentFile();
		(currentFile - 1 < 0) ?
			saveAndSelectFileAndLayer(length - 1, 0) :
			saveAndSelectFileAndLayer(currentFile - 1, 0);
	}
	
	function goRight(){
		let length = Memory.getImagesNumber();
		if (length == 0) return;
		let currentFile = Memory.getCurrentFile();
		(currentFile + 1 >= length) ?
				saveAndSelectFileAndLayer(0, 0) :
				saveAndSelectFileAndLayer(currentFile + 1, 0);
	}
	
	function clearArchive(){
		if (!confirm(Language.getPhrase(
			'removeArchiveConfirm'))) return;
		Memory.clearArchive();
		Page.clearArchive();
	}	

	function initOverlay(el){
		if (el.style.width == '0px' ||
			el.style.height == '0px' ||
			el.style.width == ''){
			Page.removeCanvasElement(el);
			return;
		}
		el.classList.add('canvasOverlayDiv');
		//el.style.resize = 'both';
		//el.style.overflow = 'hidden';
		let com = Element.newComment(
			parseInt(el.style.left, 10) + 
			//parseInt(el.style.width, 10) +
			COMMENT_HORIZONTAL_OFFSET,
			parseInt(el.style.top, 10) + 
			parseInt(el.style.height, 10) +
			COMMENT_VERTICAL_OFFSET, '', el);
		Page.addCanvasElement(com);
		addSelectCommentListener(el);
		let comovers = Memory.getCurrentComOvers();
		comovers.push(new ComOver(com, el));
	}

	function initCanvas() {
		
		function addCanvasDefaultFile(){
			addEmptyLayer();
			selectLayer(0);
		}
		
		function renameCurrentLayer(name){
			let currentLayerIndex = 
				Memory.getCurrentLayer();
			Page.setLayerName(currentLayerIndex, name);
			Memory.setLayerName(currentLayerIndex, name);
		}
			
		if(!Page.isInEditorMode()) 
			return;		
		Page.initImagePadding();		
		Page.initCommentInput(
			(e) => { //onKeydown
				switch(e.keyCode){
					case 37: 
					case 39:
					e.stopPropagation();
					//if propagated, left and right will
					//change the file
					break;
				}
			},
			() => { //onInput
				let comover = Memory.getComOverByOverlay(
					Page.getSelectedComment());
				if (comover.notComplete()) return;
				comover.setText(Page.getCommentInput());
			}
		);			
		Page.initRemoveCommentButton();
		Page.initSizeInputs();		
		if (Memory.isClear()){
			addCanvasDefaultFile();
		}
		Page.initLayerInput(
				(e) => {e.stopPropagation()},
				() => {renameCurrentLayer(
					Page.getLayerInput());}
		)
		Page.initCanvasDiv(
			(e) => {
				Drawing.canvasOnMouseMove(
					e, Page.getCanvas(),
					Page.fillCoordinatesInfo)
			},
			(e) => {
				Page.deselectComment();
				let newDiv = Drawing
					.canvasOnMouseDown(e, initOverlay);
				Page.addCanvasElement(newDiv);
			},
			(e) => {
				Drawing.canvasOnMouseUp(e,
					initOverlay);
			}
		)
	}
	
	function initMode(){
		Page.bind();
		Page.initImagePanel();
		initCanvas();
		Page.initFileInput(FileUtil.load);
		Page.fillLanguageSelect(Language.getList());
		Language.applyCurrent(Page.applyLanguage);
		if(Memory.getArchive()){
			saveAndSelectFileAndLayer(
				Memory.getCurrentFile(),
				Memory.getCurrentLayer());
		}
		else {
			Page.disableArchiveButtons(true);
		}
	}
	
	function launch(mode){
	
		function resetView(){
			Document.clear();
			Page.clear();
			//Memory.clear();
		}
		Language.init();
		Memory.removeDefaultLayer();
		resetView();
		let template = Template.get(mode);
		if (template === null)
			return;
		Document.setPage(template);
		initMode();
		
	}
	

	return {
		updateLanguage: updateLanguage,
		removeSelectedComment: removeSelectedComment,
		removeFileLayers: removeFileLayers,
		addEmptyLayer: addEmptyLayer,
		clearCurrentLayer: clearCurrentLayer,
		removeCurrentLayer: removeCurrentLayer,
		updateLayer: updateLayer,
		selectFileAndLayer: selectFileAndLayer,
		selectAfterLoading: selectAfterLoading,
		saveCurrentFileToArchive: 
			saveCurrentFileToArchive,
		currentFileLayersListToWrite:
			currentFileLayersListToWrite,
		goLeft: goLeft,
		goRight: goRight,
		clearArchive: clearArchive,
		launch: launch
	}
}());

window.addEventListener('keydown', (e) => {
	switch(e.keyCode){
		case 27: Page.deselectComment(); break;
		case 37: Main.goLeft(); break;
		case 39: Main.goRight(); break;
		case 46: 
			if (Page.isInEditorMode())
				Main.removeSelectedComment();
			break;
		default: break;
	}
});



