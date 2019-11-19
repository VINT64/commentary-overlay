/* By: VINT64
All code copied from Stack Overflow and
other places keeps its respective licenses.
All original code is unlicensed (more info
https://unlicense.org ) */

const IMAGE_ID = 'img';
const DEFAULT_LAYER_NAME = 'default';
const DEFAULT_IMAGE_NAME = 'default';
const COMMENT_VERTICAL_OFFSET = 5;

const page = { imageDiv: null,
	fileInput: null, allCommentsDiv: null,
	layerInput: null, layerSelect: null,
	fileInfo: null, canvasDiv: null,
	coordinatesInfo: null, widthInput: null,
	heightInput: null, commentInput: null,
	selectedComment: null, removeCommentButton: null,
	saveArchiveButton: null, clearArchiveButton: null,
	languageSelect: null
};

function clearPage(){
	for (let key in page ) {
		page[key] = null;
	}
}

const reader = {
	image: new FileReader(),
	json: new FileReader(),
	singleImage: new FileReader()
};

reader.image.onload = manageLoadedImage;

reader.json.onload = manageLoadedJson;

window.addEventListener('keydown', (e) => {
	switch(e.keyCode){
		case 27: selectComment(null); break;
		case 37: goLeft(); break;
		case 39: goRight(); break;
		case 46: 
			if (page.canvasDiv)
				removeSelectedComment();
			break;
		default: break;
	}
});


function removeComment(comOver){
	if (!comOver) return;
	let comments = getMemoryCurrentComments();
	for(let i = comments.length - 1; i >= 0; i--)
		if (comments[i].commentOverlayDiv === comOver){
			if (comments[i].commentDiv)
				page.canvasDiv
					.removeChild(comments[i].commentDiv);
			page.canvasDiv
				.removeChild(comOver);
			// don't use getMemoryComOverPair
			comments.splice(i, 1); 
			break;
		}
}

function deselectComment(){
	if (page.selectedComment){
		page.selectedComment.classList.remove('selected');
	}
	page.selectedComment = null;
	disableElementIfPresent(page.commentInput, true);
	disableElementIfPresent(page.removeCommentButton, true);
}

function removeSelectedComment(){
	removeComment(page.selectedComment);
	deselectComment();
}

function selectComment(el){
	deselectComment();
	if (el){
		el.classList.add('selected');
		let com = getMemoryComOverPair(el);
		if (com.commentDiv)
			page.commentInput.value = 
				com.commentDiv.textContent;
		disableElementIfPresent(
			page.removeCommentButton, false);
		disableElementIfPresent(page.commentInput, false);
		if (page.commentInput){
			page.commentInput.focus();
		}
		page.selectedComment = el;
	}
}

function triggerFileInput(){
	if (page.fileInput)
		page.fileInput.click();
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
	if(page.fileInfo){
		page.fileInfo.textContent =
			currentImage +
			' ' + (currentFile + 1) + '/' +
			imageListLength + ' ';
	}

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

function clearAllComments(){
	if (page.allCommentsDiv){
		while (page.allCommentsDiv.firstChild) {
			page.allCommentsDiv.removeChild(
				page.allCommentsDiv.firstChild);
		}
	}
	if (page.canvasDiv){
		while (page.canvasDiv.firstChild) {
			page.canvasDiv.removeChild(
				page.canvasDiv.firstChild);
		}
		deselectComment();
	}
}

function clearCanvas(){
	if (!page.canvasDiv)
		return;
	if (!confirm(getLanguagePhrase(
		'removeAllCommentsConfirm'))) return;
	clearAllComments();
}

function clearImage(){
	
	function unlock_size(){
		disableElementIfPresent(page.widthInput, false);
		disableElementIfPresent(page.heightInput, false);
		page.imageDiv.style.width =
			page.widthInput.value + 'px';
		page.imageDiv.style.height =
			page.heightInput.value + 'px';
	}
	if (!page.imageDiv) return;
	let d = getElement(IMAGE_ID);
	if (d)
		page.imageDiv.removeChild(d); 
	if (page.widthInput && page.heightInput){
		unlock_size();
	}
}

function clearArchive(){
	if (!confirm(getLanguagePhrase(
		'removeArchiveConfirm'))) return;
	clearImage();
	clearMemoryArchive();
	if(page.fileInfo)
		page.fileInfo.textContent = '';
	disableElementIfPresent(page.saveArchiveButton, true);
	disableElementIfPresent(page.clearArchiveButton, true);
}
	
function removeFileLayers(){
	clearMemoryLayers();
	if (!page.layerSelect) return;
	for (let i = page.layerSelect.options.length - 1;
		i >= 0; i--)
		page.layerSelect.remove(i);
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
	deselectComment();
	clearAllComments();
	
	let comments = getMemoryCurrentComments(); // i
	comments.forEach((com, n, a) => {
			if (page.allCommentsDiv){
				page.allCommentsDiv
					.appendChild(com.commentDiv);
				page.allCommentsDiv
					.appendChild(com.commentOverlayDiv);
			}
			if (page.canvasDiv){
				page.canvasDiv
					.appendChild(com.commentDiv);
				page.canvasDiv
					.appendChild(com.commentOverlayDiv);
			}
	});

	if (page.layerInput){
		page.layerInput.value =	getMemoryCurrentLayerName();
	}
	if (page.layerSelect && 
		page.layerSelect.selectedIndex != i)
		page.layerSelect.selectedIndex = i;
}

function updateLanguage(){
	if (!page.languageSelect) return;
	currentLanguage = page.languageSelect.value;
	setPageLanguage();
}

function addLayer(name, comments){
	if (page.layerSelect){
		let option = newElement('option');
		option.text = name;
		page.layerSelect.add(option);
	}
	addMemoryLayerToCurrentFile(name, comments);
}

function addEmptyLayer(){
	addLayer(DEFAULT_LAYER_NAME, []);
}

function removeCurrentLayer(){
	if (!page.layerSelect)
		return;
	if (page.layerSelect.length == 1){
		alert(getLanguagePhrase('lastLayerAlert'));
		return;
	}
	if (!confirm(getLanguagePhrase('removeLayerConfirm')))
		return;
	removeMemoryLayerFromCurrentFile(
		page.layerSelect.selectedIndex);
	page.layerSelect.remove(
		page.layerSelect.selectedIndex);
	selectLayer(page.layerSelect.selectedIndex);
}

function renameCurrentLayer(name){
	if (!page.layerSelect)
		return;
	page.layerSelect.options[
		page.layerSelect.selectedIndex].text = name;
	setMemoryLayerName(
		page.layerSelect.selectedIndex, name);
}

function updateLayer(){ 
	if (!page.layerSelect) return;
	selectLayer(page.layerSelect.selectedIndex);
}

function addSelectCommentListener(el){
	el.onmousedown = (e) => {
		e.stopPropagation();
	};
	el.onmouseup = (e) => {
		selectComment(el);
	};
}

function manageLoadedImage(event){
	
	function lockSize(w, h){
		page.widthInput.value = w;
		page.heightInput.value = h;
		page.canvasDiv.style.width = w + 'px';
		page.canvasDiv.style.height = h + 'px';
		page.imageDiv.style.width = null;
		page.imageDiv.style.height = null;
		disableElementIfPresent(page.widthInput, true);
		disableElementIfPresent(page.heightInput, true);
	}

	clearImage();
	let image = newElement('img');
	image.id = IMAGE_ID;
	image.src = event.target.result;
	page.imageDiv.appendChild(image);
	if (page.canvasDiv && page.widthInput
		&& page.heightInput){
			image.addEventListener('load', () => {
				lockSize(image.clientWidth,
					image.clientHeight);
			});
		}
};

function manageLoadedJson(event){
	
	function addComment(jsonComment, list){
		let commentOverlay = newElement('div');
		commentOverlay.classList.add('commentOverlayDiv');
		commentOverlay.style.left = jsonComment.x1 + 'px';
		commentOverlay.style.top = jsonComment.y1 + 'px';
		commentOverlay.style.width = (jsonComment.x2 -
			jsonComment.x1) + 'px';
		commentOverlay.style.height = (jsonComment.y2 -
			jsonComment.y1) + 'px';
		if (page.canvasDiv){
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
		clearImage();
		clearAllComments();
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
		disableElementIfPresent(
			page.saveArchiveButton, false);
		disableElementIfPresent(
			page.clearArchiveButton, false);
	}
	
	let f = page.fileInput.files[0];
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
		let image = newElement('img');
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
		let el = page.canvasDiv;
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
		//canvasDiv border correction
		if (mouse.x < 0)
			mouse.x = 0;
		if (mouse.x > page.canvasDiv.clientWidth)
			mouse.x = page.canvasDiv.clientWidth;
		if (mouse.y < 0)
			mouse.y = 0;
		if (mouse.y > page.canvasDiv.clientHeight)
			mouse.y = page.canvasDiv.clientHeight;
		
	};

	function completeDrawing(el){
		if (el.style.width == '0px' ||
			el.style.height == '0px' ||
			el.style.width == ''){
			page.canvasDiv.removeChild(el);
			return;
		}
		let com = newCommentElement(
			parseInt(el.style.left),
			parseInt(el.style.top) + 
			parseInt(el.style.height) +
			COMMENT_VERTICAL_OFFSET, '', el);
		page.canvasDiv.appendChild(com);
		addSelectCommentListener(el);
		let container = newMemoryCommentContainer(com, el);
		let comments = getMemoryCurrentComments();
		comments.push(container);
	}
	
	function addCanvasDefaultFile(){
		addEmptyLayer();
		selectLayer(0);
	}
	
	if(!page.canvasDiv) 
		return;
	
	let mouse = { x: 0, y: 0, startX: 0,
		startY: 0, offsetX: 0, offsetY: 0};
	let drawing = null;
	
	if (page.imageDiv){
		const style = getComputedStyle(page.canvasDiv);
		page.imageDiv.style.padding = 
			style.borderWidth;
	}
	if (page.commentInput){
		page.commentInput.onkeydown = 
			(e) => { 
				switch(e.keyCode){
					case 37: 
					case 39:
					e.stopPropagation();
					break;
				}
			};
		disableElementIfPresent(page.commentInput, true);
		page.commentInput.oninput = () => {
			if (!page.selectedComment) return;
			let com = getMemoryComOverPair(
				page.selectedComment);
			if (!com.commentDiv) return;
			com.commentDiv.textContent =
				commentInput.value;
		};
	}
	disableElementIfPresent(page.removeCommentButton, true);
	if (page.widthInput){
		page.canvasDiv.style.width = 
			page.widthInput.value + 'px';
		page.imageDiv.style.width = 
			page.widthInput.value + 'px';
		page.widthInput.addEventListener('input', 
			() => {
			page.canvasDiv.style.width = 
				page.widthInput.value + 'px';
			page.imageDiv.style.width = 
				page.widthInput.value + 'px';
			}
		);
	}
	if (page.heightInput){
		page.canvasDiv.style.height = 
			page.heightInput.value + 'px';
		page.imageDiv.style.height = 
			page.heightInput.value + 'px';
		page.heightInput.addEventListener('input', 
			() => {
				page.canvasDiv.style.height =
					page.heightInput.value + 'px';
				page.imageDiv.style.height =
					page.heightInput.value + 'px';
			}
		);
	}
	if (page.layerSelect){
		if (checkMemoryClear){
			addCanvasDefaultFile();
		}
		if (page.layerInput){
			page.layerInput.onkeydown = 
				(e) => {e.stopPropagation()};
			page.layerInput.oninput = () => {
				renameCurrentLayer(page.layerInput.value);
			};
		}
	}
	page.canvasDiv.onmousemove = (e) => {
		updateMouseOffset();
		setMousePosition(e);
		let x = e.pageX - mouse.offsetX;
		let y = e.pageY - mouse.offsetY;
		if (page.coordinatesInfo)
			page.coordinatesInfo.textContent = 
				'X : ' + mouse.x + ', Y : ' + mouse.y +
				' (' + e.pageX + ':' + e.pageY + ')';
		if (drawing !== null) {
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
		}
	}

	page.canvasDiv.onmousedown = (e) => {
		selectComment(null);
		mouse.startX = mouse.x;
		mouse.startY = mouse.y;
		
		if (drawing !== null)
			completeDrawing(drawing);
		drawing = newElement('div');
		drawing.classList.add('commentOverlayDiv',
			'canvasOverlayDiv');
		drawing.style.left = mouse.x + 'px';
		drawing.style.top = mouse.y + 'px';
		page.canvasDiv.appendChild(drawing);
	}
	
	page.canvasDiv.onmouseup = (e) => {
		if (drawing !== null){ 
			completeDrawing(drawing);
			drawing = null;
		}
	}
	
}

function initPage(){

	for (let key in page){
		page[key] = getElement(key);
	}

	if (page.imageDiv && page.allCommentsDiv){
		page.imageDiv.addEventListener('click', () => {
			page.allCommentsDiv.style.display = 
				(page.allCommentsDiv.style.display ==
					'none') ? 'block' : 'none';
		});
	}
	initCanvas();
	if (page.fileInput){
		page.fileInput
			.addEventListener('change',	loadArchive);
	}
	if (page.languageSelect){
		addLangOptionsToSelect(page.languageSelect);
	}
	setPageLanguage();
	
	if(getMemoryArchive()){
		saveAndSelectFileAndLayer(getMemoryCurrentFile(),
			getMemoryCurrentLayer());
	}
	else {
		disableElementIfPresent(
			page.saveArchiveButton, true);
		disableElementIfPresent(
			page.clearArchiveButton, true);
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
	initPage();
	
}
