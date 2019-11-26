/* By: VINT64
All code copied from Stack Overflow and
other places keeps its respective licenses.
All original code is unlicensed (more info
https://unlicense.org ) */

const DEFAULT_LAYER_NAME = 'default';
const DEFAULT_IMAGE_NAME = 'default';
const jsonReader = new FileReader();

jsonReader.onload = manageLoadedJson;

window.addEventListener('keydown', (e) => {
	switch(e.keyCode){
		case 27: selectComment(null); break;
		case 37: goLeft(); break;
		case 39: goRight(); break;
		case 46: 
			if (isPageInEditorMode())
				removeSelectedComment();
			break;
		default: break;
	}
});

function logError(error){
	console.log(error.message);
}

function removeComment(el){
	if (!el) 
		return;
	let comment = null
	let comOver = removeMemoryCommentPair(el);
	if (comOver && comOver.commentDiv) 
		comment = comOver.commentDiv;
	removePageCommentPair(comment, el);
}

function removeSelectedComment(){
	removeComment(getPageSelectedComment());
	deselectPageComment();
}

function selectComment(el){
	deselectPageComment();
	if (!el)
		return;
	let commentText = '';
	let comOver = getMemoryComOverPair(el);
	if (comOver && comOver.commentDiv)
		commentText = comOver.commentDiv.textContent;
	selectPageComment(el, commentText);
}

function goLeft(){
	let length = getMemoryImageListLength();
	if (length == 0) return;
	let currentFile = getMemoryCurrentFile();
	(currentFile - 1 < 0) ?
		saveAndSelectFileAndLayer(length - 1, 0) :
		saveAndSelectFileAndLayer(currentFile - 1, 0);
}

function goRight(){
	let length = getMemoryImageListLength();
	if (length == 0) return;
	let currentFile = getMemoryCurrentFile();
	(currentFile + 1 >= length) ?
			saveAndSelectFileAndLayer(0, 0) :
			saveAndSelectFileAndLayer(currentFile + 1, 0);
}

function selectFile(i){ 
	
	function useJSONReader(blob){
		jsonReader.readAsText(blob);
	}
	
	let imageListLength = getMemoryImageListLength()
	if (i < 0 || i >= imageListLength){
		console.log('Tried to select image: ' + i +
			', number of images: ' + imageListLength);
		return;
	}
	if (!setMemoryCurrentFile(i)){
		console.log('Failed to select file: ' + i);
		return;
	}
	let currentFile = i;
	let currentImage = getMemoryImageNameWithPath(
		currentFile);
	if (currentImage === null){
		console.log('selectFile panic, ' +
			'current image name is null');
		return;
	}
	fillPageFileInfo(currentImage +	' ' + (currentFile + 1)
		+ '/' + imageListLength + ' ');

	let archive = getMemoryArchive();
	archive.file(currentImage)
		.async('blob').then(managePageImage,
		logError
		);	
	
	if (getMemoryCommentFileListLength() > 0){
		let currentCommentFile = 
			getMemoryCommentFileName(currentFile);
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
	setMemoryNextLayer(l);
	selectFile(f);
}

function currentFileLayersListToWrite(){
	
	let layersList = getMemoryLayersList();
	if (!Array.isArray(layersList)){
		console.log('currentFileLayersListToWrite panic, ' +
			'not an array: ' + i);
			return [];
	}
	
	return convertLayersListToJsonData(layersList);
}

function saveCurrentFileToArchive(){
	return new Promise((resolve, reject) => {
		let f = new FileReader();
		let filename = getMemoryCurrentCommentFileName();
		let archive = getMemoryArchive();
		f.onload = (e) => {
			file = JSON.parse(event.target.result);
			file.layers = currentFileLayersListToWrite();
			archive.file(filename, JSON.stringify(file));
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

function clearCanvas(){
	if (!isPageInEditorMode() ||
		!confirm(getLanguagePhrase(
		'removeAllCommentsConfirm'))) return;
	clearPageFromAllComments();
}

function clearArchive(){
	if (!confirm(getLanguagePhrase(
		'removeArchiveConfirm'))) return;
	clearMemoryArchive();
	clearPageArchive();
}
	
function removeFileLayers(){
	clearMemoryLayers();
	clearPageLayersSelect();
}

function selectLayer(i){
	let LayersListLength = getMemoryLayersListLength();
	if (i < 0 || i >= LayersListLength){
		console.log('Tried to select layer: ' + i +
			', number of layers: ' + LayersListLength +
			'\nresetting current Layer to 0...');
		setMemoryCurrentLayer(0);
		return;
	}
	if (!setMemoryCurrentLayer(i)){
		console.log('Failed to select layer: ' + i);
		return;
	}
	deselectPageComment();
	clearPageFromAllComments();
	
	let comments = getMemoryCurrentComments(); // i
	comments.forEach((com, n, a) => {
		addPageCommentPair(com.commentDiv,
			com.commentOverlayDiv);
	});
	selectPageLayer(getMemoryCurrentLayerName(), i);
}

function updateLanguage(){
	setLanguage(getPageLanguage());
}

function addLayer(name, comments){
	addMemoryLayerToCurrentFile(name, comments);
	addPageLayer(name);
}

function addEmptyLayer(){
	addLayer(DEFAULT_LAYER_NAME, []);
}

function removeCurrentLayer(){
	let layersNumber = getMemoryLayersListLength();
	if (layersNumber == 1){
		alert(getLanguagePhrase('lastLayerAlert'));
		return;
	}
	let layerIndex = getPageLayerIndex();
	if (layerIndex < 0)
		return;
	if (!confirm(getLanguagePhrase('removeLayerConfirm')))
		return;
	removeMemoryLayerFromCurrentFile(layerIndex);
	removePageLayer(layerIndex);
	selectLayer(getPageLayerIndex());
}

function renameCurrentLayer(name){
	let currentLayer = getMemoryCurrentLayer();
	setPageLayerName(currentLayer, name);
	setMemoryLayerName(currentLayer, name);
}

function updateLayer(){ 
	let index = getPageLayerIndex();
	if (index == -1) return;
	selectLayer(index);
}

function addSelectCommentListener(el){
	el.onmousedown = (e) => {
		e.stopPropagation();
	};
	el.onmouseup = (e) => {
		selectComment(el);
	};
}

function manageLoadedJson(event){
	
	function addComment(jsonComment, list){
		let comOver = convertJsonToNewComOver(jsonComment,
			(overlay) => {
				overlay.classList.add('commentOverlayDiv');
				if (isPageInEditorMode()){
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
	getJsonLayers(json).forEach((jsonLayer, i, a) => {
		let comments = [];
		getJsonLayerComments(jsonLayer).forEach(
			(json, j, ar) => {
			addComment(json, comments);
		});
		addLayer(getJsonLayerName(jsonLayer), comments);
	});
	selectLayer(getMemoryNextLayer());
	setMemoryNextLayer(0);
}

function initCanvas() {
	
	let mouse = { x: 0, y: 0, startX: 0,
		startY: 0, offsetX: 0, offsetY: 0};
	let drawing = null;
	
	function updateMouseOffset(){
		mouse.offsetX = 0;
		mouse.offsetY = 0;
		let el = getPageCanvas();
		while (el) {
			mouse.offsetX += (el.offsetLeft -
				el.scrollLeft +	el.clientLeft);
			mouse.offsetY += (el.offsetTop -
				el.scrollTop + el.clientTop);
			el = el.offsetParent;
		}
	}
	
	function setMousePosition(e) { // Stack Overflow code
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
		let canvas = getPageCanvas();
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
			removePageCanvasElement(el);
			return;
		}
		let com = newCommentElement(
			parseInt(el.style.left),
			parseInt(el.style.top) + 
			parseInt(el.style.height) +
			COMMENT_VERTICAL_OFFSET, '', el);
		addPageCanvasElement(com);
		addSelectCommentListener(el);
		let container = {commentDiv: com, 
			commentOverlayDiv: el};
		let comments = getMemoryCurrentComments();
		comments.push(container);
	}
	
	function addCanvasDefaultFile(){
		addLayer(DEFAULT_LAYER_NAME, []);
		selectLayer(0);
	}
	
	if(!isPageInEditorMode()) 
		return;
	
	initPageImagePadding();
	
	initPageCommentInput(
		(e) => { 
			switch(e.keyCode){
				case 37: 
				case 39:
				e.stopPropagation();
				break;
			}
		},
		() => {
			let com = getMemoryComOverPair(
				getPageSelectedComment());
			if (!com || !com.commentDiv) return;
			com.commentDiv.textContent = 
				getPageCommentInput();
		}
	);	
	
	initPageRemoveCommentButton();
	initPageSizeInputs();
	
	
	if (checkMemoryClear()){
		addCanvasDefaultFile();
	}
	initPageLayerInput(
			(e) => {e.stopPropagation()},
			() => {renameCurrentLayer(getPageLayerInput());}
	)
	initPageCanvasDiv(
		(e) => {
			updateMouseOffset();
			setMousePosition(e);
			let x = e.pageX - mouse.offsetX;
			let y = e.pageY - mouse.offsetY;
			fillPageCoordinatesInfo(
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
		(e) => {
			selectComment(null);
			mouse.startX = mouse.x;
			mouse.startY = mouse.y;
			
			if (drawing !== null)
				completeDrawing(drawing);
			drawing = newDocumentElement('div');
			drawing.classList.add('commentOverlayDiv',
				'canvasOverlayDiv');
			drawing.style.left = mouse.x + 'px';
			drawing.style.top = mouse.y + 'px';
			addPageCanvasElement(drawing);
		},
		(e) => {
			if (drawing !== null){ 
				completeDrawing(drawing);
				drawing = null;
			}
		}
	)
}

function initMode(){
	initPage();
	initPageImagePanel();
	initCanvas();
	initPageFileInput(loadFile);
	fillPageLanguageSelect(addLangOptionsToSelect);
	setCurrentLanguage();	
	if(getMemoryArchive()){
		saveAndSelectFileAndLayer(getMemoryCurrentFile(),
			getMemoryCurrentLayer());
	}
	else {
		disablePageArchiveButtons(true);
	}
}

function launch(mode){
	
	function resetView(){
		clearDocument();
		clearPage();
		//clearMemory();
	}
	setDefaultLanguageIfEmpty();
	removeMemoryDefaultLayerIfPresent();
	resetView();
	let template = newTemplate(mode);
	if (template === null)
		return;
	document.body.appendChild(template.content.firstChild);
	initMode();
	
}
