/* By: VINT64
All code copied from Stack Overflow and
other places keeps its respective licenses.
All original code is unlicensed (more info
https://unlicense.org ) */

const DEFAULT_LAYER_NAME = 'default';
const DEFAULT_IMAGE_NAME = 'default';

var Main = (function(){

	const LEFT_ARROW_KEY = 37;
	const RIGHT_ARROW_KEY = 39;
	const ESCAPE_KEY = 27;
	const DELETE_KEY = 46;

	function logError(error){
		console.log(error.message);
	}
	
	function selectComOver(comOver){
		let commentText = 
			comOver.getText();
		if(commentText === null) 
			commentText = '';
		Page.selectComOver(comOver, commentText);
	}
	
	function addCommentListeners(comOver){
		if(!Page.isInEditorMode())
			return;
		Drawing.addDragAndResize(comOver, selectComOver);
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
		if(i < 0 || i >= LayersNumber){
			console.log('Tried to select layer: ' + i +
				', number of layers: ' + LayersNumber +
				'\nresetting current Layer to 0...');
			Memory.setCurrentLayer(0);
			return;
		}
		if(!Memory.setCurrentLayer(i)){
			console.log('Failed to select layer: ' + i);
			return;
		}
		Page.deselectComOver();
		Page.clearGallery();
		
		let comovers = Memory.getCurrentComOvers(); // i
		comovers.forEach(comOver => {
			Page.addComOver(comOver);
		});
		Page.selectLayer(Memory.getCurrentLayerName(), i);
	}	
	
	const jsonReader = new FileReader();

	jsonReader.onload = manageLoadedJson;
	
	function manageLoadedJson(event){
	
		function addComment(jsonComment, list){
			let comOver = JsonUtil
				.convertToComOver(jsonComment,
					Page.isInEditorMode(),
					addCommentListeners
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
		if(i < 0 || i >= imageNumber){
			console.log('Tried to select image: ' + i +
				', number of images: ' + imageNumber);
			return;
		}
		if(!Memory.setCurrentFile(i)){
			console.log('Failed to select file: ' + i);
			return;
		}
		let currentFile = i;
		let currentImage = Memory.getFullImageName(
			currentFile);
		if(currentImage === null){
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
		
		if(Memory.getCommentFilesNumber() > 0){
			let currentCommentFile = 
				Memory.getFullCommentFileName(currentFile);
			if(currentImage === null){
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
	
	function currentFileLayersListToWrite(){
	
		let layersList = Memory.getLayers();
		if(!Array.isArray(layersList)){
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
				file = JSON.parse(e.target.result);
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
	
	function initOverlay(dr, bool){
		Page.removeDrawing(dr);
		if(!bool) return;
		let coords = Element.parseCoordinates(dr);
		let comOver = new ComOver(coords.x,
			coords.y, coords.w, coords.h,
			 '', true, addCommentListeners);
		Memory.getCurrentComOvers().push(comOver);
		Page.addComOver(comOver);
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
					case LEFT_ARROW_KEY: 
					case RIGHT_ARROW_KEY:
					e.stopPropagation();
					//if propagated, left and right will
					//change the file
					break;
				}
			},
			() => { //onInput
				let comover = Page.getSelectedComOver();
				comover.setText(Page.getCommentInput());
			}
		);			
		Page.initRemoveCommentButton();
		Page.initSizeInputs();
		if(Memory.isClear()){
			addCanvasDefaultFile();
		}
		Page.initLayerInput(
				(e) =>  //onKeyDown
					{e.stopPropagation()},
				() => //onInput
					{renameCurrentLayer(
					Page.getLayerInput());}
		)
		Page.initCanvasDiv(
			(e) => { //onMouseMove
				Drawing.canvasOnMouseMove(
					e, Page.getCanvas(),
					Page.fillCoordinatesInfo)
			},
			(e) => { //onMouseDown
				if (e.button != 0) return null;
				Page.deselectComOver();
				let dr = Drawing
					.canvasOnMouseDown(e, Page.getCanvas(),
						Page.removeDrawing);
				Page.addDrawing(dr);
			},
			(e) => { //onMouseUp
				Drawing.canvasOnMouseUp(e,
					initOverlay);
			},
			(e) => { //onMouseLeave
				Drawing.canvasOnMouseLeave(
				e, initOverlay);}
		)
	}
	
	function bindEvents(root){

		function launchEditor(){
			launch('editor', root);
		}

		function launchViewer(){
			launch('viewer', root);
		}

		function updateLanguage(){
			Language.set(Page.getLanguage(),
				Page.applyLanguage);
		}
		
		function saveArchive(){
			let archive = Memory.getArchive();
			if(!archive) return;	
			FileUtil.save(archive,
				saveCurrentFileToArchive);
		}

		function updateLayer(){ 
			let index = Page.getLayerIndex();
			if(index == -1) return;
			selectLayer(index);
		}
		
		function go(getNext){
			let length = Memory.getImagesNumber();
			if(length == 0) return;
			let currentFile = Memory.getCurrentFile();
			let nextFile = getNext(currentFile, length);
			saveAndSelectFileAndLayer(nextFile, 0);
		}

		function goLeft(){
			go((currentFile, length) =>
				(currentFile - 1 < 0) ?
					length - 1 : currentFile - 1);
		}
		
		function goRight(){
			go((currentFile, length) =>
				(currentFile + 1 >= length) ?
					0 : currentFile + 1);
		}
		
		function clearArchive(){
			if(!confirm(Language.getPhrase(
				'removeArchiveConfirm'))) return;
			Memory.clearArchive();
			Page.clearArchive();
		}	
	
		function saveJson(){
			FileUtil.saveJson(
				currentFileLayersListToWrite(),
				Page.getCanvas());
		}

		function removeCurrentLayer(){
			let layersNumber = Memory.getLayersNumber();
			if(layersNumber == 1){
				alert(Language.getPhrase(
					'lastLayerAlert'));
				return;
			}
			let layerIndex = Page.getLayerIndex();
			if(layerIndex < 0)
				return;
			if(!confirm(Language.getPhrase(
				'removeLayerConfirm')))
				return;
			Memory.removeLayer(layerIndex);
			Page.removeLayer(layerIndex);
			selectLayer(Page.getLayerIndex());
		}

		function clearCurrentLayer(){
			Memory.clearCurrentLayer();
			Page.clearCanvas();
		}
	
		function bindKeys(){
			
			window.onkeydown = (e) => {
				switch(e.keyCode){
					case ESCAPE_KEY: 
						Page.deselectComOver(); break;
					case LEFT_ARROW_KEY: 
						goLeft(); break;
					case RIGHT_ARROW_KEY: 
						goRight(); break;
					case DELETE_KEY: 
						Page.removeSelectedComOver();
						break;
					default: break;
				}
			};
		}

		let events = [
			['viewerButton', 'onclick', launchViewer],
			['editorButton', 'onclick', launchEditor],
			['languageSelect', 'onchange',
				updateLanguage],
			['loadButton', 'onclick',
				Page.triggerFileInput],
			['saveArchiveButton', 'onclick', saveArchive],
			['layerSelect', 'onchange', updateLayer],
			['leftButton', 'onclick', goLeft],
			['rightButton', 'onclick', goRight],
			['clearArchiveButton', 'onclick',
				clearArchive],
			['saveJsonButton', 'onclick', saveJson],
			['addLayerButton', 'onclick',
				addEmptyLayer],
			['removeLayerButton', 'onclick',
				removeCurrentLayer],
			['removeAllCommentsFromLayerButton',
				'onclick', clearCurrentLayer],
			['removeCommentButton', 'onclick',
				Page.removeSelectedComOver()]
		]

		for(event of events){
			let el = Document.getElement(event[0]);
			if (el)
				el[event[1]] = event[2];
		}
		bindKeys();
	}

	function initMode(root){
		Page.bind();
		Page.initImagePanel();
		initCanvas();
		Page.initFileInput((file) => FileUtil.load(
			file,
			() => { 
				Page.clearImage();
				Page.clearGallery();
				removeFileLayers();
			}, 
			() => {Page.disableArchiveButtons(false);
				selectFileAndLayer(0,0);
			}
		));
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
		bindEvents(root);
	}
	
	function launch(mode, root){
		if(!root) return;
		function resetView(){
			Document.clear(root);
			Page.clear();
			//Memory.clear();
		}
		Language.init();
		Memory.removeDefaultLayer();
		resetView();
		let template = Template.get(mode);
		if(template === null)
			return;
		root.appendChild(template);
		initMode(root);
		
	}
	
	return {
		launch: launch
	}
}());

