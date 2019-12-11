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
		Language.set(Page.getLanguage());
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
		el.onmousedown = (e) => {
			e.stopPropagation();
		};
		el.onmouseup = (e) => {
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
		comovers.forEach((comOver, n, a) => {
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
					overlay.classList
						.add('commentOverlayDiv');
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
		layers.forEach((jsonLayer, i, a) => {
			let comovers = [];
			JsonUtil.getLayerCommentsList(jsonLayer)
				.forEach((json, j, ar) => {
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

	function initCanvas() {
	
		let mouse = { x: 0, y: 0, startX: 0,
			startY: 0, offsetX: 0, offsetY: 0};
		let drawing = null;
		
		function updateMouseOffset(){
			mouse.offsetX = 0;
			mouse.offsetY = 0;
			let el = Page.getCanvas();
			while (el) {
				mouse.offsetX += (el.offsetLeft -
					el.scrollLeft +	el.clientLeft);
				mouse.offsetY += (el.offsetTop -
					el.scrollTop + el.clientTop);
				el = el.offsetParent;
			}
		}
		
		function setMousePosition(e) { 
			// Stack Overflow code
			let ev = e || window.event; //Moz || IE
			if (ev.pageX) { //Moz
				mouse.x = ev.pageX - mouse.offsetX;
				mouse.y = ev.pageY - mouse.offsetY;
			} else if (ev.clientX) { //IE
				mouse.x = ev.clientX +
					document.body.scrollLeft;
				mouse.y = ev.clientY +
					document.body.scrollTop;
			}
			//canvas border correction
			let canvas = Page.getCanvas();
			if (mouse.x < 0)
				mouse.x = 0;
			else if (mouse.x > canvas.clientWidth)
				mouse.x = canvas.clientWidth;
			if (mouse.y < 0)
				mouse.y = 0;
			else if (mouse.y > canvas.clientHeight)
				mouse.y = canvas.clientHeight;
			
		};
	
		function completeDrawing(el){
			if (el.style.width == '0px' ||
				el.style.height == '0px' ||
				el.style.width == ''){
				Page.removeCanvasElement(el);
				return;
			}
			let com = Element.newComment(
				parseInt(el.style.left) + 
				//parseInt(el.style.width) +
				COMMENT_HORIZONTAL_OFFSET,
				parseInt(el.style.top) + 
				parseInt(el.style.height) +
				COMMENT_VERTICAL_OFFSET, '', el);
			Page.addCanvasElement(com);
			addSelectCommentListener(el);
			let comovers = Memory.getCurrentComOvers();
			comovers.push(new ComOver(com, el));
		}
		
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
			(e) => { //keydown
				switch(e.keyCode){
					case 37: 
					case 39:
					e.stopPropagation();
					//if propagated, left and right will
					//change the file
					break;
				}
			},
			() => { //input
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
			(e) => { //onMouseMove
				updateMouseOffset();
				setMousePosition(e);
				let x = e.pageX - mouse.offsetX;
				let y = e.pageY - mouse.offsetY;
				Page.fillCoordinatesInfo(
					'X : ' + mouse.x + ', Y : ' + mouse.y +
					' (' + e.pageX + ':' + e.pageY + ')');
				if (drawing === null)
					return;
				drawing.style.width = 
					Math.abs(mouse.x - mouse.startX) + 'px';
				drawing.style.height = 
					Math.abs(mouse.y - mouse.startY) + 'px';
				drawing.style.left = 
					(mouse.x - mouse.startX < 0) ?
					mouse.x + 'px' : mouse.startX + 'px';
				drawing.style.top =
					(mouse.y - mouse.startY < 0) ?
					mouse.y + 'px' : mouse.startY + 'px';
			},
			(e) => { //onMouseDown
				Page.deselectComment();
				mouse.startX = mouse.x;
				mouse.startY = mouse.y;
				
				if (drawing !== null)
					completeDrawing(drawing);
				drawing = Document.newElement('div');
				drawing.classList.add('commentOverlayDiv',
					'canvasOverlayDiv');
				drawing.style.left = mouse.x + 'px';
				drawing.style.top = mouse.y + 'px';
				Page.addCanvasElement(drawing);
			},
			(e) => { //onMouseUp
				if (drawing !== null){ 
					completeDrawing(drawing);
					drawing = null;
				}
			}
		)
	}
	
	function initMode(){
		Page.bind();
		Page.initImagePanel();
		initCanvas();
		Page.initFileInput(FileUtil.load);
		Page.fillLanguageSelect(Language.addOptions);
		Language.update();	
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
		Document.setPage(template.content.firstChild);
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



