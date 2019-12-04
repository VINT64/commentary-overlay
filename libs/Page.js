/* By: VINT64
All code copied from Stack Overflow and
other places keeps its respective licenses.
All original code is unlicensed (more info
https://unlicense.org ) */


//uses Document, Element

const COMMENT_VERTICAL_OFFSET = 5;
const COMMENT_HORIZONTAL_OFFSET = 0;

var Page = (function(){
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
	
	function clear(){
		for (let key in page ) {
			page[key] = null;
		}
	}
	
	function isInEditorMode(){
		return !!page.canvasDiv;
	}
	
	function isInViewerMode(){
		return !!page.allCommentsDiv;
	}
	
	function deselectComment(){
		if (page.selectedComment){
			page.selectedComment.classList.remove(SELECTED_CLASS);
		}
		page.selectedComment = null;
		Element.disable(page.commentInput, true);
		Element.disable(page.removeCommentButton, true);
	}
	
	function removeComOver(comOver){
		if (!isInEditorMode() || !comOver)
			return;
		let comment = comOver.getComment();
		let overlay = comOver.getOverlay();
		if (comment)
			page.canvasDiv.removeChild(comment);
		if (overlay)
			page.canvasDiv.removeChild(overlay);	
	}
	
	function addComOver(comOver){
		if(!comOver)
			return;
		let comment = comOver.getComment();
		let overlay = comOver.getOverlay();
		if (isInViewerMode()){
			if (comment)
				page.allCommentsDiv.appendChild(comment);
			if (overlay)
				page.allCommentsDiv.appendChild(overlay);
		}
		if (isInEditorMode()){
			if (comment)
				page.canvasDiv.appendChild(comment);
			if (overlay)
				page.canvasDiv.appendChild(overlay);
		}
	}
	
	function getSelectedComment(){
		return page.selectedComment;
	}
	
	function selectComment(comment, text){
		comment.classList.add(SELECTED_CLASS);
		page.commentInput.value = text ? text : '';
		Element.disable(page.removeCommentButton,
			false);
		Element.disable(page.commentInput, false);
		if (page.commentInput){
			page.commentInput.focus();
		}
		page.selectedComment = comment;
	}
	
	function selectLayer(name, index){
		if (page.layerInput){
			page.layerInput.value =	name;
		}
		if (page.layerSelect && 
			page.layerSelect.selectedIndex != index)
			//do not trigger if it's already selected
			page.layerSelect.selectedIndex = index;
	}
	
	function triggerFileInput(){
		if (page.fileInput)
			page.fileInput.click();
	}
	
	function fillFileInfo(text){
		if(page.fileInfo)
			page.fileInfo.textContent = text;
	}
	
	function fillCoordinatesInfo(text){
		if(page.coordinatesInfo)
			page.coordinatesInfo.textContent = text;
	}	
	
	function clearComments(){
		if (page.allCommentsDiv){
			while (page.allCommentsDiv.firstChild) {
				page.allCommentsDiv.removeChild(
					page.allCommentsDiv.firstChild);
			}
		}
		if (isInEditorMode()){
			while (page.canvasDiv.firstChild) {
				page.canvasDiv.removeChild(
					page.canvasDiv.firstChild);
			}
			deselectComment();
		}
	}
	
	function clearImage(){
		
		function unlock_size(){
			Element.disable(page.widthInput, false);
			Element.disable(page.heightInput, false);
			page.imageDiv.style.width =
				page.widthInput.value + 'px';
			page.imageDiv.style.height =
				page.heightInput.value + 'px';
		}
		
		if (!page.imageDiv) return;
		let d = Document.getElement(IMAGE_ID);
		if (d)
			page.imageDiv.removeChild(d); 
		if (page.widthInput && page.heightInput){
			unlock_size();
		}
	}
	
	function disableArchiveButtons(b){
		Element.disable(page.saveArchiveButton, b);
		Element.disable(page.clearArchiveButton, b);
	}
	
	function clearArchive(){
		
		function clearFileInput(){
			if (!page.fileInput) return null;
			page.fileInput.value = '';
		}
		
		clearImage();
		fillFileInfo('');
		disableArchiveButtons(true);
		clearFileInput();
	}
	
	function clearLayersSelect(){
		if (!page.layerSelect) return;
		for (let i = page.layerSelect.options.length - 1;
			i >= 0; i--)
			page.layerSelect.remove(i);
	}
	
	function clearCanvas(){
		if (!isInEditorMode() ||
			!confirm(Language.getPhrase(
			'removeAllCommentsConfirm'))) return;
		clearComments();
	}	

	function getLanguage(){
		if (!page.languageSelect) return null;
		return page.languageSelect.value;
	}
	
	function addLayer(name){
		if (page.layerSelect){
			let option = Document.newElement('option');
			option.text = name;
			page.layerSelect.add(option);
		}
	}
	
	function removeLayer(index){
		if (!page.layerSelect)
			return;
		page.layerSelect.remove(index);
	}
	
	function getLayerIndex(){
		if (!page.layerSelect)
			return -1;
		return page.layerSelect.selectedIndex;
	}
	
	function setLayerName(index, name){
		if (!page.layerSelect)
			return;
		page.layerSelect.options[index].text = name;	
	}
	
	function displayImage(event){
		
		function lockSize(w, h){
			if (isInEditorMode()){
				page.canvasDiv.style.width = w + 'px';
				page.canvasDiv.style.height = h + 'px';			
			}
			if (page.widthInput){
				page.widthInput.value = w;
				page.imageDiv.style.width = null; //TODO ?
				Element.disable(page.widthInput, true);
			}
			if (page.heightInput){
				page.heightInput.value = h;
				page.imageDiv.style.height = null; //TODO ?
				Element.disable(page.heightInput, true);
			}
		}
	
		clearImage();
		let image = Document.newElement('img');
		image.id = IMAGE_ID;
		image.src = event.target.result;
		page.imageDiv.appendChild(image);
		image.addEventListener('load', () => {
			lockSize(image.clientWidth,	image.clientHeight);
		});
	};
	
	function getFile(){
		if (!page.fileInput) return null;
		return page.fileInput.files[0];
	}
	
	function getCanvas(){
		return page.canvasDiv;
	}
	
	function removeCanvasElement(el){
		if (!page.canvasDiv) return;
		page.canvasDiv.removeChild(el);
	}
	
	function addCanvasElement(el){
		if (!page.canvasDiv) return;
		page.canvasDiv.appendChild(el);
	}
	
	function initImagePadding(){
		if (!page.canvasDiv || !page.imageDiv) return;
		let style = getComputedStyle(page.canvasDiv);
		page.imageDiv.style.padding = style.borderWidth;
	}
	
	function getCommentInput(){
		if (!page.commentInput) return '';
		return page.commentInput.value;
	}
	
	function getLayerInput(){
		if (!page.layerInput) return '';
		return page.layerInput.value;
	}
	
	function initCommentInput(keydownFun, inputFun){
		if (!page.commentInput) return;
		page.commentInput.onkeydown = keydownFun;
		page.commentInput.oninput = inputFun;
		Element.disable(page.commentInput, true);
	}
	
	function initRemoveCommentButton(){
		Element.disable(page.removeCommentButton, true);
	}
	
	function initSizeInputs(){
		
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
			console.log('Bad usage of initSizeInputs: ' +
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
	
	function initLayerInput(keydownFun, inputFun){
		if (!page.layerInput) return;
		page.layerInput.onkeydown = keydownFun;
		page.layerInput.oninput = inputFun;
	}
	
	function initCanvasDiv(onmousemoveFun, onmousedownFun,
		onmouseupFun){
		if (!page.canvasDiv)
			return;
		page.canvasDiv.onmousemove = onmousemoveFun;
		page.canvasDiv.onmousedown = onmousedownFun;
		page.canvasDiv.onmouseup = onmouseupFun;
	}
	
	function bind(){
		for (let key in page){
			page[key] = Document.getElement(key);
		}
	}
	
	function initImagePanel(){
		if (!page.imageDiv || !isInViewerMode()) return;
		page.imageDiv.addEventListener('click', () => {
			page.allCommentsDiv.style.display = 
				(page.allCommentsDiv.style.display ==
					'none') ? 'block' : 'none';
		});
	}
	
	function initFileInput(onchangeFun){
		if (!page.fileInput) return;
		page.fileInput.addEventListener('change', onchangeFun);
	}
	
	function fillLanguageSelect(fillingFun){
		if (!page.languageSelect) return;
		fillingFun(page.languageSelect);
	}
	
	function manageImage(blob){
		imageReader.readAsDataURL(blob);
	}

	return {
		clear: clear,
		isInEditorMode: isInEditorMode,
		deselectComment,
		removeComOver: removeComOver,
		addComOver: addComOver,
		getSelectedComment: getSelectedComment,
		selectComment: selectComment,
		selectLayer: selectLayer,
		triggerFileInput: triggerFileInput,
		fillFileInfo: fillFileInfo,
		fillCoordinatesInfo: fillCoordinatesInfo,
		clearComments: clearComments,
		clearImage: clearImage,
		disableArchiveButtons: disableArchiveButtons,
		clearArchive: clearArchive,
		clearLayersSelect: clearLayersSelect,
		clearCanvas: clearCanvas,
		getLanguage: getLanguage,
		addLayer: addLayer,
		removeLayer: removeLayer,
		getLayerIndex: getLayerIndex,
		setLayerName: setLayerName,
		getFile: getFile,
		getCanvas: getCanvas,
		removeCanvasElement: removeCanvasElement,
		addCanvasElement: addCanvasElement,
		initImagePadding: initImagePadding,
		getCommentInput: getCommentInput,
		getLayerInput: getLayerInput,
		initCommentInput: initCommentInput,
		initRemoveCommentButton: initRemoveCommentButton,
		initSizeInputs: initSizeInputs,
		initLayerInput: initLayerInput,
		initCanvasDiv: initCanvasDiv,
		bind: bind,
		initImagePanel: initImagePanel,
		initFileInput: initFileInput,
		fillLanguageSelect: fillLanguageSelect,
		manageImage: manageImage
	}
}())

