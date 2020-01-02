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
	
	function addCommentListeners(comOver){
		if(!Page.isInEditorMode())
			return;
		Drawing.addDragAndResize(comOver,
			Page.selectComOver);
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
	
	function selectLayer(i, focus){
		let LayersNumber = Memory.getLayersNumber();
		if(i < 0 || i >= LayersNumber){
			console.log('Tried to select layer: ' + i +
				', number of layers: ' + LayersNumber +
				'\nresetting current Layer to 0...');
			Memory.setCurrentLayerIndex(0);
			return;
		}
		if(!Memory.setCurrentLayerIndex(i)){
			console.log('Failed to select layer: ' + i);
			return;
		}
		Page.deselectComOver();
		Page.clearGallery();
		
		let comovers = Memory.getCurrentComOvers(); // i
		comovers.forEach(comOver => {
			Page.addComOver(comOver);
		});
		Page.selectLayer(i, focus);
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
		selectLayer(Memory.getNextLayer(), false);
		Memory.setNextLayer(0);
	}

	function selectFile(i){ 
	
		function useJSONReader(blob){
			jsonReader.readAsText(blob);
		}
		
		let imageNumber = Memory.getImagesNumber();
		if(i < 0 || i >= imageNumber){
			console.log('Tried to select image: ' + i +
				', number of images: ' + imageNumber);
			return;
		}
		if(!Memory.setCurrentFileIndex(i)){
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
				Memory.getFullCurrentCommentFileName();
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
	
	function saveAndSelectFileAndLayer(index, layer){
		FileUtil.saveJsonToArchive(logError).then(() =>
			selectFileAndLayer(index, layer));
	}
	
	function bindEvents(root){

		function launchEditor(){
			launch('editor', root);
		}

		function launchViewer(){
			launch('viewer', root);
		}

		function updateLanguage(){
			Page.updateLanguage(Language.set);
		}
		
		function saveArchive(){
			if(!Memory.getArchive()) return;	
			FileUtil.save(logError);
		}

		function updateLayer(){ 
			let index = Page.getLayerIndex();
			if(index == -1) return;
			selectLayer(index, true);
		}
		
		function go(getNext){
			let length = Memory.getImagesNumber();
			if(length == 0) return;
			let currentFile = Memory.getCurrentFileIndex();
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
			let size = Page.getCanvasSize();
			if(!size){
				console.log('SaveJson panic!');
				return;
			}
			FileUtil.saveJson(size.w, size.h);
		}

		function removeCurrentLayer(){
			if(Memory.getLayersNumber() == 1){
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
			updateLayer();
		}

		function clearCurrentLayer(){
			Memory.clearCurrentLayer();
			Page.clearCanvas();
		}

		function removeSelectedComOver(){
			Page.removeSelectedComOver(
				Memory.removeComOver);
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
						removeSelectedComOver();
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
				removeSelectedComOver]
		]

		for(event of events){
			let el = Document.getElement(event[0]);
			if (el)
				el[event[1]] = event[2];
		}
		bindKeys();
	}

	function initMode(root){

		function addCanvasDefaultFile(){
			if(!Memory.isClear()) return;
			addEmptyLayer();
			selectLayer(0, false);
		}
		
		let file = {
			loadFun: FileUtil.load,
			removeFileLayers,
			onLoadFun: () => selectFileAndLayer(0,0)
		}

		let lang = {
			list: Language.getList(),
			apply: Language.applyCurrent
		}

		let editor = {
			noPropagate: [LEFT_ARROW_KEY,
				RIGHT_ARROW_KEY],
			renameCurrentLayer: (name, pageRename) => {
				let currentLayerIndex = 
					Memory.getCurrentLayerIndex();
				pageRename(currentLayerIndex, name);
				Memory.setLayerName(
					currentLayerIndex, name);
			}
		}

		let canvasEvents = {
			onMouseMove: Drawing.canvasOnMouseMove,
			onMouseDown: Drawing.canvasOnMouseDown,
			onMouseUp: Drawing.canvasOnMouseUp,
			onMouseLeave: Drawing.canvasOnMouseLeave,
			push: Memory.addToCurrentComOvers,
			addCommentListeners: addCommentListeners
		}

		let archivePresent = Memory.getArchive();

		Page.init(file, lang, editor, canvasEvents,
			archivePresent);
		addCanvasDefaultFile();
		if(archivePresent){
			saveAndSelectFileAndLayer(
				Memory.getCurrentFileIndex(),
				Memory.getCurrentLayerIndex());
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
	
	return {launch};
}());

