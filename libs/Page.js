/* By: VINT64
All code copied from Stack Overflow and
other places keeps its respective licenses.
All original code is unlicensed (more info
https://unlicense.org ) */


//uses Document, Element
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

const SELECTED_CLASS = 'selected'
const IMAGE_ID = 'img';
const imageReader = new FileReader();

imageReader.onload = displayImage;

function clearPage(){
	for (let key in page ) {
		page[key] = null;
	}
}

function isPageInEditorMode(){
	return !!page.canvasDiv;
}

function isPageInViewerMode(){
	return !!page.allCommentsDiv;
}

function deselectPageComment(){
	if (page.selectedComment){
		page.selectedComment.classList.remove(SELECTED_CLASS);
	}
	page.selectedComment = null;
	disableElementIfPresent(page.commentInput, true);
	disableElementIfPresent(page.removeCommentButton, true);
}

function removePageCommentPair(comment, overlay){
	if (!isPageInEditorMode())
		return;
	if (comment)
		page.canvasDiv.removeChild(comment);
	if (overlay)
		page.canvasDiv.removeChild(overlay);	
}

function addPageCommentPair(comment, overlay){
	if (isPageInViewerMode()){
		if (comment)
			page.allCommentsDiv.appendChild(comment);
		if (overlay)
			page.allCommentsDiv.appendChild(overlay);
	}
	if (isPageInEditorMode()){
		if (comment)
			page.canvasDiv.appendChild(comment);
		if (overlay)
			page.canvasDiv.appendChild(overlay);
	}
}

function getPageSelectedComment(){
	return page.selectedComment;
}

function selectPageComment(comment, text){
	comment.classList.add(SELECTED_CLASS);
	page.commentInput.value = text ? text : '';
	disableElementIfPresent(page.removeCommentButton,
		false);
	disableElementIfPresent(page.commentInput, false);
	if (page.commentInput){
		page.commentInput.focus();
	}
	page.selectedComment = comment;
}

function selectPageLayer(name, index){
	if (page.layerInput){
		page.layerInput.value =	name;
	}
	if (page.layerSelect && 
		page.layerSelect.selectedIndex != index)
		//do not trigger if it's already selected
		page.layerSelect.selectedIndex = index;
}

function triggerPageFileInput(){
	if (page.fileInput)
		page.fileInput.click();
}

function fillPageFileInfo(text){
	if(page.fileInfo)
		page.fileInfo.textContent = text;
}

function fillPageCoordinatesInfo(text){
	if(page.coordinatesInfo)
		page.coordinatesInfo.textContent = text;
}	

function clearPageFromAllComments(){
	if (page.allCommentsDiv){
		while (page.allCommentsDiv.firstChild) {
			page.allCommentsDiv.removeChild(
				page.allCommentsDiv.firstChild);
		}
	}
	if (isPageInEditorMode()){
		while (page.canvasDiv.firstChild) {
			page.canvasDiv.removeChild(
				page.canvasDiv.firstChild);
		}
		deselectPageComment();
	}
}

function clearPageImage(){
	
	function unlock_size(){
		disableElementIfPresent(page.widthInput, false);
		disableElementIfPresent(page.heightInput, false);
		page.imageDiv.style.width =
			page.widthInput.value + 'px';
		page.imageDiv.style.height =
			page.heightInput.value + 'px';
	}
	
	if (!page.imageDiv) return;
	let d = getDocumentElement(IMAGE_ID);
	if (d)
		page.imageDiv.removeChild(d); 
	if (page.widthInput && page.heightInput){
		unlock_size();
	}
}

function disablePageArchiveButtons(b){
	disableElementIfPresent(page.saveArchiveButton, b);
	disableElementIfPresent(page.clearArchiveButton, b);
}

function clearPageArchive(){
	clearPageImage();
	fillPageFileInfo('');
	disablePageArchiveButtons(true);
}

function clearPageLayersSelect(){
	if (!page.layerSelect) return;
	for (let i = page.layerSelect.options.length - 1;
		i >= 0; i--)
		page.layerSelect.remove(i);
}

function getPageLanguage(){
	if (!page.languageSelect) return null;
	return page.languageSelect.value;
}

function addPageLayer(name){
	if (page.layerSelect){
		let option = newDocumentElement('option');
		option.text = name;
		page.layerSelect.add(option);
	}
}

function removePageLayer(index){
	if (!page.layerSelect)
		return;
	page.layerSelect.remove(index);
}

function getPageLayerIndex(){
	if (!page.layerSelect)
		return -1;
	return page.layerSelect.selectedIndex;
}

function setPageLayerName(index, name){
	if (!page.layerSelect)
		return;
	page.layerSelect.options[index].text = name;	
}

function displayImage(event){
	
	function lockSize(w, h){
		if (isPageInEditorMode()){
			page.canvasDiv.style.width = w + 'px';
			page.canvasDiv.style.height = h + 'px';			
		}
		if (page.widthInput){
			page.widthInput.value = w;
			page.imageDiv.style.width = null; //TODO ?
			disableElementIfPresent(page.widthInput, true);
		}
		if (page.heightInput){
			page.heightInput.value = h;
			page.imageDiv.style.height = null; //TODO ?
			disableElementIfPresent(page.heightInput, true);
		}
	}

	clearPageImage();
	let image = newDocumentElement('img');
	image.id = IMAGE_ID;
	image.src = event.target.result;
	page.imageDiv.appendChild(image);
	image.addEventListener('load', () => {
		lockSize(image.clientWidth,	image.clientHeight);
	});
};

function getPageFileInput(){
	if (!page.fileInput) return null;
	return page.fileInput.files[0];
}

function getPageCanvas(){
	return page.canvasDiv;
}

function removePageCanvasElement(el){
	if (!page.canvasDiv) return;
	page.canvasDiv.removeChild(el);
}

function addPageCanvasElement(el){
	if (!page.canvasDiv) return;
	page.canvasDiv.appendChild(el);
}

function initPageImagePadding(){
	if (!page.canvasDiv || !page.imageDiv) return;
	let style = getComputedStyle(page.canvasDiv);
	page.imageDiv.style.padding = style.borderWidth;
}

function getPageCommentInput(){
	if (!page.commentInput) return '';
	return page.commentInput.value;
}

function getPageLayerInput(){
	if (!page.layerInput) return '';
	return page.layerInput.value;
}

function initPageCommentInput(keydownFun, inputFun){
	if (!page.commentInput) return;
	page.commentInput.onkeydown = keydownFun;
	page.commentInput.oninput = inputFun;
	disableElementIfPresent(page.commentInput, true);
}

function initPageRemoveCommentButton(){
	disableElementIfPresent(page.removeCommentButton, true);
}

function initPageSizeInputs(){
	
	function updateWidth(){
		page.canvasDiv.style.width = 
			page.widthInput.value + 'px';
		page.imageDiv.style.width = 
			page.widthInput.value + 'px';
	}
	
	function updateHeight(){
		page.canvasDiv.style.height = 
			page.heightInput.value + 'px';
		page.imageDiv.style.height = 
			page.heightInput.value + 'px';
	}
	
	if (!page.canvasDiv || !page.imageDiv){
		console.log('Bad usage of initPageSizeInputs: ' +
		'canvas div and image div should be present!');
		return;
	}
	if (page.widthInput){
		updateWidth();
		page.widthInput.addEventListener('input', 
			updateWidth);
	}
	if (page.heightInput){
		updateHeight()
		page.heightInput.addEventListener('input', 
			updateHeight);
	}
}

function initPageLayerInput(keydownFun, inputFun){
	if (!page.layerInput) return;
	page.layerInput.onkeydown = keydownFun;
	page.layerInput.oninput = inputFun;
}

function initPageCanvasDiv(onmousemoveFun, onmousedownFun,
	onmouseupFun){
	if (!page.canvasDiv)
		return;
	page.canvasDiv.onmousemove = onmousemoveFun;
	page.canvasDiv.onmousedown = onmousedownFun;
	page.canvasDiv.onmouseup = onmouseupFun;
}

function initPage(){
	for (let key in page){
		page[key] = getDocumentElement(key);
	}
}

function initPageImagePanel(){
	if (!page.imageDiv || !isPageInViewerMode()) return;
	page.imageDiv.addEventListener('click', () => {
		page.allCommentsDiv.style.display = 
			(page.allCommentsDiv.style.display ==
				'none') ? 'block' : 'none';
	});
}

function initPageFileInput(onchangeFun){
	if (!page.fileInput) return;
	page.fileInput.addEventListener('change', onchangeFun);
}

function fillPageLanguageSelect(fillingFun){
	if (!page.languageSelect) return;
	fillingFun(page.languageSelect);
}

function managePageImage(blob){
	imageReader.readAsDataURL(blob);
}