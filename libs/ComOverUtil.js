/* By: VINT64
All code copied from Stack Overflow and
other places keeps its respective licenses.
All original code is unlicensed (more info
https://unlicense.org ) */

const MAGIC_NUMBER = 64; // should be large
const IMAGE_ID = 'img';
const DEFAULT_LAYER_NAME = 'default';
const DEFAULT_ROOT_FOLDER_NAME = 'root';
const DEFAULT_IMAGE_NAME = 'default';
const regexp = {
	extension: /(?:\.([^.]+))?$/, 
	filename: /([^\/]+)(?:\.[^.\/]+)$/, // without ext
	imageMime: /^(image\/)/,
	path: /(.+\/)?(?:[^\/]+)?/
};

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

const memory = { archive: null,
	filenames: {images: [], comments: []}, fileLayers: [],
	currentFile: 0, currentLayer: 0, 
};


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

function getComOverPair(comOver){
	let comments = memory.fileLayers[memory.currentLayer]
		.comments;
	for(let i = comments.length - 1; i >= 0; i--)
		if (comments[i].commentOverlayDiv === comOver)
			return comments[i];
	return null;
}

function newCommentContainer(comment, commentOverlay){
	return {commentDiv: comment, 
		commentOverlayDiv: commentOverlay};
}

function newComment(x, y, text, commentOverlay){
	let com = newElement('div');
	com.style.zIndex = MAGIC_NUMBER;
	com.classList.add('commentDiv');
	com.style.left = x + 'px';
	com.style.top = y + 'px';
	com.appendChild(document.createTextNode(text));
	com.style.visibility = 'hidden';
	commentOverlay.addEventListener('mouseover', () => {
		com.style.visibility = 'visible';
	});
	commentOverlay.addEventListener('mouseout', () => {
		com.style.visibility = 'hidden';
	});
	return com;
}

function removeComment(comOver){
	if (!comOver) return;
	let comments = memory
		.fileLayers[memory.currentLayer].comments;
	for(let i = comments.length - 1; i >= 0; i--)
		if (comments[i].commentOverlayDiv === comOver){
			if (comments[i].commentDiv)
				page.canvasDiv
					.removeChild(comments[i].commentDiv);
			page.canvasDiv
				.removeChild(comOver);
			// don't use getComOverPair
			comments.splice(i, 1); 
			break;
		}
}

function deselectComment(){
	if (page.selectedComment){
		page.selectedComment.classList.remove('selected');
	}
	page.selectedComment = null;
	disableIfPresent(page.commentInput, true);
	disableIfPresent(page.removeCommentButton, true);
}

function removeSelectedComment(){
	removeComment(page.selectedComment);
	deselectComment();
}

function selectComment(el){
	deselectComment();
	if (el){
		el.classList.add('selected');
		let com = getComOverPair(el);
		if (com.commentDiv)
			page.commentInput.value = 
				com.commentDiv.textContent;
		disableIfPresent(page.removeCommentButton, false);
		disableIfPresent(page.commentInput, false);
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
	if (memory.filenames.images.length == 0) return;
	(memory.currentFile - 1 < 0) ?
		saveAndSelectFileAndLayer(
			memory.filenames.images.length - 1, 0) :
		saveAndSelectFileAndLayer(
			memory.currentFile - 1, 0);
}

function goRight(){
	if (memory.filenames.images.length == 0) return;
	(memory.currentFile + 1 >=
		memory.filenames.images.length) ?
			saveAndSelectFileAndLayer(0, 0) :
			saveAndSelectFileAndLayer(
				memory.currentFile + 1, 0);
}

function selectFile(i){ 

	function useImageReader(blob){
		reader.image.readAsDataURL(blob);
	}
	
	function useJSONReader(blob){
		reader.json.readAsText(blob);
	}
	
	if (i < 0 || i >= memory.filenames.images.length){
		console.log('Tried to select image: ' + i +
			', number of images: ' + 
			memory.filenames.images.length);
		return;
	}
	memory.currentFile = i;
	
	if(page.fileInfo){
		page.fileInfo.textContent =
			memory.filenames.images[memory.currentFile] +
			' ' + (memory.currentFile + 1) + '/' +
			memory.filenames.images.length + ' ';
	}

	memory.archive.file(memory.filenames.images[
		memory.currentFile])
		.async('blob').then(useImageReader,
		logError
		);
	
	if (memory.filenames.comments.length > 0){
		memory.archive.file(memory.filenames.comments[
			memory.currentFile])
			.async('blob').then(useJSONReader,
				logError
			);
	}
}

function selectFileAndLayer(f, l){
	memory.currentLayer = l;
	// after finishing json download selectLayer is called
	// with memory.currentLayer parameter
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
	for (let i = 0; i < memory.fileLayers.length; i++){
		let l = memory.fileLayers[i];
		let coms = commentsToJson(l.comments);
		layers.push({layer_name: l.name,
			comments: coms});
	}
	return layers;
}

function saveCurrentFileToArchive(){
	return new Promise((resolve, reject) => {
		let f = new FileReader();
		f.onload = (e) => {
			file = JSON.parse(event.target.result);
			file.layers = layersToJson();
			memory.archive.file(memory.filenames.comments[
				memory.currentFile], JSON.stringify(file));
			resolve();
		};
		memory.archive.file(memory.filenames.comments[
			memory.currentFile])
			.async('blob').then((blob) => {
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
		disableIfPresent(page.widthInput, false);
		disableIfPresent(page.heightInput, false);
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
	memory.archive = null;
	memory.filenames = {images: [], comments: []}; 
	if(page.fileInfo)
		page.fileInfo.textContent = '';
	disableIfPresent(page.saveArchiveButton, true);
	disableIfPresent(page.clearArchiveButton, true);
}
	
function removeFileLayers(){
	memory.fileLayers = [];
	if (!page.layerSelect) return;
	for (let i = page.layerSelect.options.length - 1;
		i >= 0; i--)
		page.layerSelect.remove(i);
}

function selectLayer(i){
	if (i < 0 || i >= memory.fileLayers.length){
		console.log('Tried to select layer: ' + i +
			', number of layers: ' + 
			memory.fileLayers.length + '\nresetting current Layer to 0...');
		memory.currentLayer = 0;
		return;
	}
	memory.currentLayer = i;
	deselectComment();
	clearAllComments();
	
	memory.fileLayers[i].comments.forEach((com, n, a) => {
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
		page.layerInput.value =	memory.fileLayers[i].name;
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
	
	function newLayer(name, list){
		return {name: name, comments: list};
	}

	let l = newLayer(name, comments);
	if (page.layerSelect){
		let option = newElement('option');
		option.text = name;
		page.layerSelect.add(option);
	}
	memory.fileLayers.push(l);
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
	memory.fileLayers
		.splice(page.layerSelect.selectedIndex, 1);
	page.layerSelect.remove(
		page.layerSelect.selectedIndex);
	selectLayer(page.layerSelect.selectedIndex);
}

function renameCurrentLayer(name){
	if (!page.layerSelect)
		return;
	page.layerSelect.options[
		page.layerSelect.selectedIndex].text = name;
		memory.fileLayers[
			page.layerSelect.selectedIndex].name = name;
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
		disableIfPresent(page.widthInput, true);
		disableIfPresent(page.heightInput, true);
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
		let comment = newComment(jsonComment.x1,
			jsonComment.y2 + 5, jsonComment.text,
			commentOverlay);
		let container = newCommentContainer(comment,
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
	selectLayer(memory.currentLayer);		
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

function getImageNameNoPath(index){
	let imageFullName = memory.filenames.images[index];
	let path = imageFullName.match(regexp.path)[1];
	return (path === undefined) ?
		imageFullName : imageFullName.replace(path, '');
}

async function addDefaultJsonToArchive(index){
	
	function getJsonNameWithPath(index){
		let imageFullName = memory.filenames.images[index];
		let ext = imageFullName.match(regexp.extension)[1];
		return (ext === undefined) ? imageFullName :
			imageFullName.replace(ext, 'json');
	}
	
	let size = await getImageSize(index);
	let imageName = getImageNameNoPath(index);
	let defaultLayer = {layer_name: DEFAULT_LAYER_NAME,
		comments: []};
	let body = newJsonCommentAsString(1, imageName,
		size.w, size.h, [defaultLayer]);
	
	let jsonFullName = getJsonNameWithPath(index);
	memory.filenames.comments[index] = jsonFullName;
	memory.archive.file(jsonFullName, body);
}

function loadArchive(){
	
	function clean(){ 
		clearImage();
		clearAllComments();
		removeFileLayers();
	}
	
	async function finishLoading(){
		if (memory.filenames.images.length <
			memory.filenames.comments.length)
			memory.filenames.comments.length =
				memory.filenames.images.length;
		if (memory.filenames.images.length >
			memory.filenames.comments.length) {
			for (let i = memory.filenames.comments.length;
				i < memory.filenames.images.length; i++)
				await addDefaultJsonToArchive(i);
		}
		disableIfPresent(page.saveArchiveButton, false);
		disableIfPresent(page.clearArchiveButton, false);
	}
	
	let f = page.fileInput.files[0];
	if (!f) return;
	if (f.type.match(regexp.imageMime)){
		//image case
		clean();
		
		memory.archive = new JSZip();
		imageName = DEFAULT_ROOT_FOLDER_NAME + '/'
			+ f.name;
		memory.filenames = {images: [imageName],
			comments: []};
		reader.singleImage.onload = (e) => {
			memory.archive.file(
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
		let tempFiles = {images: [], comments: []};
		z.forEach(function (relativePath, zipEntry) {
			let ext = relativePath
				.match(regexp.extension)[1]; 
			if( ext == 'png' || ext == 'jpg' ||
				ext == 'jpeg' || ext == 'gif')
				tempFiles.images.push(relativePath);
			if( ext == 'json')
				tempFiles.comments.push(relativePath);
		});
		if (tempFiles.images.length < 1){
			alert(getLanguagePhrase('noImagesAlert'));
			return;
		}
		
		tempFiles.comments.sort();
		tempFiles.images.sort();
		
		clean();
		
		memory.filenames = tempFiles;
		memory.archive = z; 		
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
		memory.archive.file(memory.filenames.images[index])
			.async('blob').then((blob) => {
				f.readAsDataURL(blob);
			});
	});
}

function dumpFiles(){
	for (let i = 0; i < memory.filenames.images.length; i++)
		console.log(memory.filenames.images[i]);
	for (let i = 0; i < memory.filenames.comments.length;
		i++)
		console.log(memory.filenames.comments[i]);
}

function saveCurrentJson(){
	//untie from inputs?
	if (!page.widthInput ||	!page.heightInput) return;
	
	let imageName = DEFAULT_IMAGE_NAME;
	if (memory.filenames.images.length > 0)
		imageName = getImageNameNoPath(memory.currentFile);
	let layers = layersToJson();
	let body = newJsonCommentAsString(1, imageName,
		page.widthInput.value, page.heightInput.value,
		layers);
	let blob = new Blob([body],	
		{type: 'application/json'});
	let ext = imageName.match(regexp.extension)[1];
	let jsonName = (ext === undefined) ? imageName :
		imageName.replace(ext, 'json')
	saveAs(blob, jsonName);
}

function saveArchive(){
	if (!memory.archive) return;
	
	saveCurrentFileToArchive().then(() => {
		memory.archive.generateAsync({type:'blob'})
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
		let com = newComment(
			parseInt(el.style.left),
			parseInt(el.style.top) + 
			parseInt(el.style.height) + 5, '', el);
		page.canvasDiv.appendChild(com);
		addSelectCommentListener(el);
		let container = newCommentContainer(com, el);
		memory.fileLayers[memory.currentLayer]
			.comments.push(container);
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
		disableIfPresent(page.commentInput, true);
		page.commentInput.oninput = () => {
			if (!page.selectedComment) return;
			let com = getComOverPair(page.selectedComment);
			if (!com.commentDiv) return;
			com.commentDiv.textContent =
				commentInput.value;
		};
	}
	disableIfPresent(page.removeCommentButton, true);
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
		if (!memory.archive && memory.fileLayers == 0){
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
	
	if(memory.archive){
		saveAndSelectFileAndLayer(memory.currentFile,
			memory.currentLayer);
	}
	else {
		disableIfPresent(page.saveArchiveButton, true);
		disableIfPresent(page.clearArchiveButton, true);
	}
}

function launch(mode){
	
	function clearPage(){
		while(document.body.firstChild){
			document.body.removeChild(
				document.body.firstChild);
		}
		for (let key in page ) {
			page[key] = null;
		}
	}
	
	function clearMemory(){
		memory.archive = null;
		memory.filenames.images = [];
		memory.filenames.comments = [];
		memory.fileLayers = [];
		memory.currentFile = 0;
		memory.currentLayer = 0;
	}
	
	setDefaultLanguageIfEmpty();
	if (!memory.archive && memory.fileLayers.length == 1){
		//if (!confirm(getLanguagePhrase(
		//'LoseDefaultLayerConfirm'))) return;
		memory.fileLayers = [];
	}
	clearPage();
	//clearMemory();	
	
	let template = newTemplate(mode);
	if (template === null)
		return;
	document.body.appendChild(template.content.firstChild);
	initPage();
	
}
