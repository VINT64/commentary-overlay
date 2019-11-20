/* By: VINT64
All code copied from Stack Overflow and
other places keeps its respective licenses.
All original code is unlicensed (more info
https://unlicense.org ) */

const DEFAULT_LAYER_NAME = 'default';
const DEFAULT_IMAGE_NAME = 'default';
const COMMENT_VERTICAL_OFFSET = 5;

const reader = {
	image: new FileReader(),
	json: new FileReader(),
	singleImage: new FileReader()
};

reader.image.onload = managePageImage;

reader.json.onload = manageLoadedJson;

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
	let currentFile = getMemoryCurrentFile();
	if (length == 0) return;
	(currentFile - 1 < 0) ?
		saveAndSelectFileAndLayer(length - 1, 0) :
		saveAndSelectFileAndLayer(currentFile - 1, 0);
}

function goRight(){
	let length = getMemoryImageListLength();
	let currentFile = getMemoryCurrentFile();
	if (length == 0) return;
	(currentFile + 1 >= length) ?
			saveAndSelectFileAndLayer(0, 0) :
			saveAndSelectFileAndLayer(currentFile + 1, 0);
}

function selectFile(i){ 
	
	function useImageReader(blob){
		reader.image.readAsDataURL(blob);
	}
	
	function useJSONReader(blob){
		reader.json.readAsText(blob);
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
		.async('blob').then(useImageReader,
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

function layersToJson(){
	
	function commentsToJson(comments){
		let coms = [];
		for(let i = comments.length - 1; i >= 0; i--){
			let com = comments[i];
			if (!com.commentOverlayDiv || !com.commentDiv)
				continue;
			let ov = com.commentOverlayDiv;
			let x = parseInt(ov.style.left);
			let y = parseInt(ov.style.top);
			let w = parseInt(ov.style.width);
			let h = parseInt(ov.style.height);
			coms.push({x1: x, y1: y, x2: x + w, y2: y + h,
				text: com.commentDiv.textContent});
		}
		return coms;
	}
	
	let layers = [];
	let length = getMemoryLayersListLength();
	for (let i = 0; i < length; i++){
		let l = getMemoryLayer(i);
		if (l === null){
			console.log('layersToJson panic, ' +
			'layer corruption at ' + i);
			layers.push({layer_name: '', comments: []});
			continue;
		}
		let coms = commentsToJson(l.comments);
		layers.push({layer_name: l.name,
			comments: coms});
	}
	return layers;
}

function saveCurrentFileToArchive(){
	return new Promise((resolve, reject) => {
		let f = new FileReader();
		let filename = getMemoryCurrentCommentFileName();
		let archive = getMemoryArchive();
		f.onload = (e) => {
			file = JSON.parse(event.target.result);
			file.layers = layersToJson();
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
	if (!isPageInEditorMode())
		return;
	if (!confirm(getLanguagePhrase(
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
		let commentOverlay = newDocumentElement('div');
		commentOverlay.classList.add('commentOverlayDiv');
		commentOverlay.style.left = jsonComment.x1 + 'px';
		commentOverlay.style.top = jsonComment.y1 + 'px';
		commentOverlay.style.width = (jsonComment.x2 -
			jsonComment.x1) + 'px';
		commentOverlay.style.height = (jsonComment.y2 -
			jsonComment.y1) + 'px';
		if (isPageInEditorMode()){
			commentOverlay.classList
				.add('canvasOverlayDiv');
			addSelectCommentListener(commentOverlay);
		}
		let comment = newCommentElement(jsonComment.x1,
			jsonComment.y2 + COMMENT_VERTICAL_OFFSET,
			jsonComment.text, commentOverlay);
		let container = newMemoryCommentContainer(comment,
			commentOverlay);
		list.push(container);
	}
	
	removeFileLayers();
	
	let json = JSON.parse(event.target.result);
	json.layers.forEach((jsonLayer, i, a) => {
		let comments = [];
		jsonLayer.comments.forEach((json, j, ar) => {
			addComment(json, comments);
		});
		addLayer(jsonLayer.layer_name, comments);
	});
	selectLayer(getMemoryNextLayer());
	setMemoryNextLayer(0);
}

function newJsonCommentAsString(version, imageName,
	imageWidth, imageHeight, layers){
	return JSON.stringify({version: version, 
		image_name: imageName,
		image_width: imageWidth,
		image_height: imageHeight,
		layers: layers
	});
}

async function addDefaultJsonToArchive(index){
	let size = await getImageSize(index);
	let imageName = getMemoryImageNameNoPath(index);
	let defaultLayer = {layer_name: DEFAULT_LAYER_NAME,
		comments: []};
	let body = newJsonCommentAsString(1, imageName,
		size.w, size.h, [defaultLayer]);
	
	RewriteMemoryCommentFile(index, body);
}

function loadArchive(){
	
	function clean(){ 
		clearPageImage();
		clearPageFromAllComments();
		removeFileLayers();
	}
	
	async function finishLoading(){
		let imagesNum = getMemoryImageListLength();
		let commentsNum = getMemoryCommentFileListLength();
		if (imagesNum <	commentsNum)
			TruncateMemoryCommentFilesList(imagesNum);
		if (imagesNum >	commentsNum) {
			for (let i = commentsNum; i < imagesNum; i++)
				await addDefaultJsonToArchive(i);
		}
		disablePageArchiveButtons(false);
	}
	
	let f = getPageFileInput();
	if (!f) return;
	if (isRegexpImageMime(f.type)){
		//image case
		clean();		
		
		archive = initMemoryForSingleImage(f.name);
		singleImage.onload = (e) => {
			archive.file(
				imageName,
				e.target.result,
				{binary: true});
				finishLoading()
					.then(() => selectFileAndLayer(0, 0));
		}
		reader.singleImage.readAsBinaryString(f);
		return;
	}
		
	JSZip.loadAsync(f).then((z) => {
		// archive case
		let tempImages = [];
		let tempJsons = [];
		z.forEach(function (relativePath, zipEntry) {
			let ext = getRegexpExtension(relativePath);
			if( ext == 'png' || ext == 'jpg' ||
				ext == 'jpeg' || ext == 'gif')
				tempImages.push(relativePath);
			if( ext == 'json')
				tempJsons.push(relativePath);
		});
		if (tempImages.length < 1){
			alert(getLanguagePhrase('noImagesAlert'));
			return;
		}
		
		tempJsons.sort();
		tempImages.sort();
		
		clean();
		
		initMemoryForArchive(z, tempImages, tempJsons);
		finishLoading().then(() => 
			selectFileAndLayer(0, 0));
	},
	(e) => {
		alert(getLanguagePhrase('notImageOrArchiveAlert'));
		console.log(e.message);
	});
}

function getImageSize(index){
	return new Promise((resolve, reject) => {
		let image = newDocumentElement('img');
		let f = new FileReader();
		f.onerror = reject;
		f.onload = (e) => {
			image.onerror = reject;
			image.onload = () => 
				resolve({w: image.naturalWidth,
					h: image.naturalHeight});
			image.src = e.target.result;
		}
		let imageName = getMemoryImageNameWithPath(index);
		if (imageName === null){
			reject('Image name not retrieved');
		}
		let archive = getMemoryArchive();
		archive.file(imageName).async('blob')
			.then((blob) => {
				f.readAsDataURL(blob);
			});
	});
}

function saveCurrentJson(){
	//untie from inputs?
	if (!page.widthInput ||	!page.heightInput) return;
	
	let imageName = DEFAULT_IMAGE_NAME;
	if (getMemoryImageListLength() > 0)
		imageName = getMemoryImageNameNoPath(
			getMemoryCurrentFile());
	let layers = layersToJson();
	let body = newJsonCommentAsString(1, imageName,
		page.widthInput.value, page.heightInput.value,
		layers);
	let blob = new Blob([body],	
		{type: 'application/json'});
	let ext = getRegexpExtension(imageName);
	let jsonName = (ext === undefined) ? imageName :
		imageName.replace(ext, 'json');
	saveAs(blob, jsonName);
}

function saveArchive(){
	let archive = getMemoryArchive();
	if (!archive) return;
	
	saveCurrentFileToArchive().then(() => {
		archive.generateAsync({type:'blob'})
			.then((blob) => {
				saveAs(blob, '');
			});
		});
}

function initCanvas() {
	
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
		let container = newMemoryCommentContainer(com, el);
		let comments = getMemoryCurrentComments();
		comments.push(container);
	}
	
	function addCanvasDefaultFile(){
		addLayer(DEFAULT_LAYER_NAME, []);
		selectLayer(0);
	}
	
	if(!isPageInEditorMode()) 
		return;
	
	let mouse = { x: 0, y: 0, startX: 0,
		startY: 0, offsetX: 0, offsetY: 0};
	let drawing = null;
	
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
	initPageFileInput(loadArchive);
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
