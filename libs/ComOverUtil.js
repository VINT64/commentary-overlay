/* By: VINT64
All code copied from Stack Overflow and
other places keeps its respective licenses.
All original code is unlicensed (more info
https://unlicense.org ) */

const MAGIC_NUMBER = 64; // should be large
const IMAGE_ID = 'img';
const DEFAULT_LAYER_NAME = 'default';
const regexp = {
	extension: /(?:\.([^.]+))?$/, 
	filename: /(?:([^\/]+))?\.[^.]+$/, // without ext
	imageMime: /^(image\/)/
};

const templates = {
	viewerHTML: 
		'<div>' +
			'<div class="upperRight">' +
				'<button type="button" ' +
					'id="editorButton" ' +
					'onclick="launch(\'editor\')">' +
				'</button>' +
				'<br>' +
				'<select id="languageSelect" ' +
					'onchange="updateLanguage()">' +
				'</select>' +
			'</div>' +
			'<div id="controlPanel">' +
				'<p>' +
					'<input type="file" id="fileInput">' +
					'<button type="button" ' +
						'id="loadButton" ' +
						'onclick="triggerFileInput()">' +
					'</button>' +
				'</p>' +
				'<p>' +
					'<span id="fileInfo"></span>' +
					'<select id="layerSelect" ' +
						'onchange="updateLayer()">' +
					'</select>' +
				'</p>' +
			'</div>' +
			'<div id="gallery">' +
				'<button type="button" ' +
					'class="nav"onclick="goLeft()">' +
					'&lt;' +
				'</button>' +
				'<div id="imageDiv">' +
					'<div id="allCommentsDiv"></div>' +
				'</div>' +
				'<button type="button" ' +
					'class="nav"onclick="goRight()">' +
					'&gt;' +
				'</button>' +
			'</div>' +
		'</div>',
	editorHTML: 
		'<div>' +
			'<div class="upperRight">' +
				'<button type="button" ' +
					'id="viewerButton" ' +
					'onclick="launch(\'viewer\')">' +
				'</button>' +
				'<br>' +
				'<select id="languageSelect" ' +
					'onchange="updateLanguage()">' +
				'</select>' +
				'<br>' +
				'<span id="coordinatesInfo">' +
					'&nbsp;' +
				'</span>' +
			'</div>' +
			'<div id="controlPanel">' +
				'<p>' +
					'<input type="file" id="fileInput">' +
					'<button type="button" ' +
						'id="loadButton" ' +
						'onclick="triggerFileInput()">' +
					'</button>' +
					'<span id="fileInfo"></span>' +
					'<button type="button" ' +
						'id="hideImageButton" ' +
						'onclick="clearImage()">' +
					'</button>' +
				'</p>' +
				'<p>' +
					'<label for="layerInput" ' +
						'id="layerLabel">' +
					'</label>' +
					'<input type="text" ' +
					'id="layerInput">' +
					'<select id="layerSelect" ' +
						'onchange="updateLayer()">' +
					'</select>' +
					'<button type="button" ' +
						'id="addLayerButton" ' +
						'onclick="addEmptyLayer()">' +
					'</button>' +
					'<button type="button" ' +
						'id="removeLayerButton" ' +
						'onclick="removeCurrentLayer()">' +
					'</button>' +
				'</p>' +
				'<p>' +
					'<input type="number" ' +
						'id="widthInput" ' +
						'min="1" value="512">' +
					'<input type="number" ' +
						'id="heightInput" ' +
						'min="1" value="512">' +
					'<button type="button" ' +
						'id="removeAllCommentsButton" ' +
						'onclick="clearCanvas()">' +
					'</button>' +
					'<button type="button" ' +
						'id="saveJsonButton" ' +
						'onclick="saveJson()">' +
					'</button>' +
				'</p>' +
				'<p>' +
					'<label for="commentInput" ' +
						'id="commentLabel">' +
					'</label>' +
					'<input type="text" ' +
					'id="commentInput">' +
					'<button type="button" ' +
						'id="removeCommentButton" ' +
						'onclick="' +
						'removeSelectedComment()">' +
					'</button>' +
				'</p>' +
			'</div>' +
			'<div id="gallery">' +
				'<button type="button" class="nav" ' +
					'onclick="goLeft()">' +
					'&lt;' +
				'</button>' +
				'<div id="canvasDiv"></div>' +
				'<div id="imageDiv"></div>' +
				'<button type="button" class="nav" ' +
					'onclick="goRight()">' +
					'&gt;' +
				'</button>' +
			'</div>' +
		'</div>'
}

const page = { imageDiv: null,
	fileInput: null, allCommentsDiv: null,
	layerInput: null, layerSelect: null,
	fileInfo: null, canvasDiv: null,
	coordinatesInfo: null, widthInput: null,
	heightInput: null, commentInput: null,
	selectedComment: null, removeCommentButton: null,
	languageSelect: null
};

const memory = { zip: null,
	filenames: {images: [], comments: []}, fileLayers: [],
	currentFile: 0, currentLayer: 0, counter: 0, 
};

let currentLanguage = '';

const langs = [
	{	
		id: 'ru',
		loadButton: 'Загрузить',
		editorButton: 'Перейти в редактор',
		viewerButton: 'Перейти в просмотрщик',
		hideImageButton: 'Спрятать изображение',
		removeAllCommentsButton: 'Удалить все комментарии',
		addLayerButton: 'Новый слой',
		removeLayerButton: 'Удалить слой',
		saveJsonButton: 'Сохранить комментарии',
		removeCommentButton: 
			'Удалить выбранный комментарий',
		commentLabel: 'Комментарий: ',
		layerLabel: 'Слой: ',
		removeLayerConfirm: 'Удалить текущий слой?',
		removeAllCommentsConfirm: 
			'Удалить все комментарии?',
		lastLayerAlert: 'Нельзя удалить последний слой',
		noImagesAlert: 'В этом архиве нет изображений!',
		notImageOrZipAlert: 'Не изображение и не архив!'
	},
	{	
		id: 'en',
		loadButton: 'Load',
		editorButton: 'Editor',
		viewerButton: 'Viewer',
		hideImageButton: 'Hide image',
		removeAllCommentsButton: 'Remove all commentaries',
		addLayerButton: 'New layer',
		removeLayerButton: 'Delete layer',
		saveJsonButton: 'Save commentaries',
		removeCommentButton: 'Remove selected',
		commentLabel: 'Commentary: ',
		layerLabel: 'Layer: ',
		removeLayerConfirm: 'Delete current layer?',
		removeAllCommentsConfirm: 'Remove all comments?',
		lastLayerAlert: 'Cannot delete last layer',
		noImagesAlert: 'No images in this archive!',
		notImageOrZipAlert: 'Not an image or zip!'
	}
];

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

function setPageLanguage(){
	langs.forEach((lang, i, a) => {
		if (lang.id == currentLanguage)
			for (let key in lang){
				let el = getElement(key);
				if (el)
					el.textContent = lang[key];
			}
	});
}

function getLanguagePhrase(phrase){
	let ret = '';
	langs.forEach((lang, i, a) => {
		if (lang.id == currentLanguage)
			ret = lang[phrase];
	});
	return ret;
}

function getElement(id){
	return document.getElementById(id);
}

function getCommentAndOverlay(comId){
	if (!page.canvasDiv && !page.allCommentsDiv) return;
	let ret = {commentDiv: null, overlayDiv: null};
	let parentDiv = (page.canvasDiv)? page.canvasDiv :
		page.allCommentsDiv;
	let coms = parentDiv.querySelectorAll(
		'[comId="' + comId + '"]');
	if (coms.length === 0){
		console.log('Error comId not found: ', comId); 
		return null;
	}
	for (let i = coms.length - 1; i >= 0; i--){
		if (coms[i].classList.contains('commentDiv'))
			ret.commentDiv = coms[i];
		if (coms[i].classList.contains(
			'commentOverlayDiv'))
			ret.overlayDiv = coms[i];
	}
	return ret;
}

function newElement(tag){
	return document.createElement(tag);
}

function newLayer(n, d){
	return {name: n, divs: d};
}

function newComment(comId, x, y, text, el){
	let com = newElement('div');
	com.style.zIndex = MAGIC_NUMBER;
	com.classList.add('commentDiv');
	com.setAttribute('comId', comId);
	com.style.left = x + 'px';
	com.style.top = y + 'px';
	com.appendChild(document.createTextNode(text));
	com.style.visibility = 'hidden';
	el.addEventListener('mouseover', () => {
		com.style.visibility = 'visible';
	});
	el.addEventListener('mouseout', () => {
		com.style.visibility = 'hidden';
	});
	return com;
}

function removeSelectedComment(){
	if (!page.selectedComment) return;
	let com = getCommentAndOverlay(
		page.selectedComment.getAttribute('comId'));
		if (com.commentDiv)
			page.canvasDiv.removeChild(com.commentDiv);
		if (com.overlayDiv)
			page.canvasDiv.removeChild(com.overlayDiv);
	deselectComment();
}

function deselectComment(){
	page.selectedComment = null;
	if (page.commentInput)
		page.commentInput.setAttribute('disabled', true);
	if (page.removeCommentButton)
		page.removeCommentButton
			.setAttribute('disabled', true);
}

function selectComment(el){
	if (page.selectedComment){
		page.selectedComment.classList.remove('selected');
	}
	if (el){
		el.classList.add('selected');
		let com = getCommentAndOverlay(
			el.getAttribute('comId'));
		if (com.commentDiv)
			page.commentInput.value = 
				com.commentDiv.textContent;
		if (page.removeCommentButton)
			page.removeCommentButton
				.removeAttribute('disabled');
		if (page.commentInput){
			page.commentInput.removeAttribute('disabled');
			page.commentInput.focus();
		}
		page.selectedComment = el;
	}
	else {
		deselectComment();
	}
}

function triggerFileInput(){
	if (page.fileInput)
		page.fileInput.click();
}

function goLeft(){
	if (memory.filenames.images.length == 0) return;
	(memory.currentFile - 1 < 0) ?
		selectFile(memory.filenames.images.length - 1) :
		selectFile(memory.currentFile - 1);
}

function goRight(){
	if (memory.filenames.images.length == 0) return;
	(memory.currentFile + 1 >=
		memory.filenames.images.length) ? selectFile(0) :
		selectFile(memory.currentFile + 1);
}

function selectFile(i){ 
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

	memory.zip.file(memory.filenames.images[
		memory.currentFile])
		.async('blob').then((blob) => {
			reader.image.readAsDataURL(blob);
		},
		(error) => {console.log(error.message);}
		);
	
	if (memory.filenames.comments.length > 0){
		memory.zip.file(memory.filenames.comments[
			memory.currentFile])
			.async('blob').then((blob) => {
					reader.json.readAsText(blob);
				},
				(error) => {console.log(e.message);}
			);
	}
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
		page.widthInput.removeAttribute('disabled');
		page.heightInput.removeAttribute('disabled');
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
	
function removefileLayers(){
	memory.fileLayers = [];
	if (!page.layerSelect) return;
	for (let i = page.layerSelect.options.length - 1;
		i >= 0; i--)
		page.layerSelect.remove(i);
}

function saveCanvasToMemory(){
	if (!page.canvasDiv)
		return;
	let currentLayer = memory.fileLayers[
		memory.currentLayer];
	currentLayer.divs = [];
	for (let i = page.canvasDiv.children.length - 1;
		i >= 0; i--)
		currentLayer.divs.push(page.canvasDiv.children[i]);
	
	
}

function selectLayer(i){
	if (i < 0 || i >= memory.fileLayers.length){
		console.log('Tried to select layer: ' + i +
			', number of layers: ' + 
			memory.fileLayers.length);
		return;
	}
	saveCanvasToMemory();
	
	memory.currentLayer = i;
	clearAllComments()
	if (page.allCommentsDiv){
		memory.fileLayers[i].divs
			.forEach((div, n, a) => {
				page.allCommentsDiv.appendChild(div);
		});
	}
	if (page.canvasDiv){
		memory.fileLayers[i].divs
			.forEach((div, n, a) => {
				page.canvasDiv.appendChild(div);
		});
	}
	if (page.layerInput){
		page.layerInput.value =	memory.fileLayers[i].name;
	}
}

function updateLanguage(){
	if (!page.languageSelect) return;
	currentLanguage = page.languageSelect.value;
	setPageLanguage();
}

function addLayer(name, divs){
	let l = newLayer(name, divs);
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
	for( let i = memory.fileLayers.length - 1;
		i >= 0; i--){
			if (memory.fileLayers[i].name ==
				page.layerSelect.value){
					selectLayer(i);
					return;
			}
	}
	console.log('Unknown layer: ', page.layerSelect.value);
}

function manageLoadedImage(event){
	
	function lockSize(w, h){
		page.widthInput.value = w;
		page.heightInput.value = h;
		page.canvasDiv.style.width = w + 'px';
		page.canvasDiv.style.height = h + 'px';
		page.imageDiv.style.width = null;
		page.imageDiv.style.height = null;
		page.widthInput.setAttribute('disabled', true);
		page.heightInput.setAttribute('disabled', true);
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
	
	function addComment(jsonComment, list, comId){
		let commentOverlay = newElement('div');
		commentOverlay.classList.add('commentOverlayDiv');
		commentOverlay.setAttribute('comId', comId);
		commentOverlay.style.left = jsonComment.x1 + 'px';
		commentOverlay.style.top = jsonComment.y1 + 'px';
		commentOverlay.style.width = (jsonComment.x2 -
			jsonComment.x1) + 'px';
		commentOverlay.style.height = (jsonComment.y2 -
			jsonComment.y1) + 'px';
		let comment = newComment(comId, jsonComment.x1,
			jsonComment.y2 + 5, jsonComment.text,
			commentOverlay);
		list.push(commentOverlay, comment);
	}
	
	removefileLayers();
	let json = JSON.parse(event.target.result);
	json.layers.forEach((jsonLayer, i, a) => {
		let divs = [];
		jsonLayer.comments.forEach((json, j, ar) => {
			addComment(json, divs, j);
		});
		addLayer(jsonLayer.layer_name, divs);
	});
	selectLayer(0);		
}

function loadZip(){
	
	function clean(){ 
		clearImage();
		if (memory.filenames.comments.length == 0){
			//if editor mode - don't touch layers
			return;
		}
		clearAllComments();
		removefileLayers();
	}
	
	let f = page.fileInput.files[0];
	if (!f) return;
	if (regexp.imageMime.exec(f.type)){
		//image case
		clean();
		
		memory.zip = new JSZip();
		memory.filenames = {images: [f.name],
			comments: []};
		reader.singleImage.onload = (e) => {
			memory.zip.file(f.name, e.target.result,
				{binary: true});
			selectFile(0);
		}
		reader.singleImage.readAsBinaryString(f);
		return;
	}
		
	JSZip.loadAsync(f).then((z) => {
		// zip case
		let tempFiles = {images: [], comments: []};
		z.forEach(function (relativePath, zipEntry) {
			let ext = regexp.extension
				.exec(relativePath)[1];
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
		if (tempFiles.images.length !=
			tempFiles.comments.length || page.canvasDiv){
			tempFiles.comments = [];
		}		
		
		tempFiles.comments.sort();
		tempFiles.images.sort();
		
		clean();
		
		memory.filenames = tempFiles;
		memory.zip = z; 
		
		selectFile(0);

	},
	(e) => {
		alert(getLanguagePhrase('notImageOrZipAlert'));
		console.log(e.message);
	});
}

function saveJson(){
	
	function divsToComs(divs){
		//unify with getCommentAndOverlay
		let coms = [];
		let l = divs.filter(div => 
			div.classList.contains('commentDiv')
		);
		for(let i = l.length - 1; i >= 0; i--){
			let comId = l[i].getAttribute('comId');
			let com = {overlayDiv: null, commentDiv: null};
			for (let j = divs.length - 1; j >= 0; j--)
				if (divs[j].matches(
					'[comId="' + comId + '"]')){
					if (divs[j].classList.contains(
						'commentDiv'))
						com.commentDiv = divs[j];
					if (divs[j].classList.contains(
						'commentOverlayDiv'))
						com.overlayDiv = divs[j];
				}
			if (!com.overlayDiv || !com.commentDiv)
				continue;
			let x = parseInt(com.overlayDiv.style.left);
			let y = parseInt(com.overlayDiv.style.top);
			let w = parseInt(com.overlayDiv.style.width);
			let h = parseInt(com.overlayDiv.style.height);
			coms.push({x1: x, y1: y, x2: x + w, y2: y + h,
				text: com.commentDiv.textContent});
		}
		return coms;
	}
	
	if (!page.canvasDiv || !page.widthInput ||
		!page.heightInput) return;
	
	saveCanvasToMemory();
	
	let filename = '';
	if (memory.filenames.images.length > 0){
		filename = regexp.filename.exec(memory.filenames
			.images[memory.currentFile])[1];
	}
	let layers = []
	for (let i = 0; i < memory.fileLayers.length; i++){
		let l = memory.fileLayers[i];
		let coms = divsToComs(l.divs);
		layers.push({layer_name: l.name, comments: coms});
	}
	let obj = {version: 1, image_name: filename,
		image_width: page.widthInput.value,
		image_height: page.heightInput.value,
		layers: layers};
	let blob = new Blob([JSON.stringify(obj)],
		{type: 'application/json'});
	saveAs(blob, filename + '.json');
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
	
	function setMousePosition(e) { // Stack Overflow
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
		el.setAttribute('comId', memory.counter);
		let com = newComment(memory.counter, 
			parseInt(el.style.left),
			parseInt(el.style.top) + 
			parseInt(el.style.height) + 5, '', el);
		memory.counter++;
		page.canvasDiv.appendChild(com);
		el.onmousedown = (e) => {
			e.stopPropagation();
		};
		el.onmouseup = (e) => {
			selectComment(el);
		};
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
		page.commentInput.setAttribute('disabled', true);
		page.commentInput.oninput = () => {
			if (!page.selectedComment) return;
			let com = getCommentAndOverlay(
				page.selectedComment
					.getAttribute('comId'));
			if (!com.commentDiv) return;
			com.commentDiv.textContent =
				commentInput.value;
		};
	}
	if (page.removeCommentButton){
		page.removeCommentButton
			.setAttribute('disabled', true);
	}
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
				page.canvasDiv.style.height = page.heightInput.value + 'px';
				page.imageDiv.style.height = page.heightInput.value + 'px';
			}
		);
	}
	if (page.layerSelect){
		if (page.layerSelect.length == 0){
			addEmptyLayer();
			selectLayer(0);
		}
		if (page.layerInput){
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
			.addEventListener('change',	loadZip);
	}
	if (page.languageSelect){
		langs.forEach((lang, i, a) => {
			let option = newElement('option');
			option.text = lang.id;
			page.languageSelect.add(option);
		});
		page.languageSelect.value = currentLanguage;
	}
	setPageLanguage();
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
		memory.zip = null;
		memory.filenames.images = [];
		memory.filenames.comments = [];
		memory.fileLayers = [];
		memory.currentFile = 0;
		memory.counter = 0;
	}
	
	if (currentLanguage == '')
		currentLanguage = langs[0].id;
	
	clearPage();
	clearMemory();	
	
	let template = newElement('template');
	switch(mode){
		case 'viewer':
			template.innerHTML = templates.viewerHTML;
			break;
		case 'editor':
			template.innerHTML = templates.editorHTML;
			break;
		default:
			console.log('Unknown mode: ', mode);
			return;
	}
	document.body.appendChild(template.content.firstChild);
	initPage();
	
}
