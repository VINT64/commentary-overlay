/* By: VINT64
All code copied from Stack Overflow and
other places keeps its respective licenses.
All original code is unlicensed (more info
https://unlicense.org ) */


//uses Document, Element

var Page = (function(){
	const page = { imageDiv: null,
		fileInput: null, allCommentsDiv: null,
		layerInput: null, layerSelect: null,
		fileInfo: null, canvasDiv: null,
		coordinatesInfo: null, widthInput: null,
		heightInput: null, commentInput: null,
		selectedComOver: null, removeCommentButton: null,
		saveArchiveButton: null, clearArchiveButton: null,
		languageSelect: null
	};
	
	const IMAGE_ID = 'img';
	const imageReader = new FileReader();
	
	imageReader.onload = displayImage;
	
	function clear(){
		for(let key in page ) {
			page[key] = null;
		}
	}
	
	function isInEditorMode(){
		return !!page.canvasDiv;
	}
	
	function isInViewerMode(){
		return !!page.allCommentsDiv;
	}
	
	function deselectComOver(){
		if(page.selectedComOver){
			page.selectedComOver.select(false);
		}
		page.selectedComOver = null;
		Element.disable(page.commentInput, true);
		Element.disable(page.removeCommentButton, true);
	}
	
	function removeComOver(comOver){
		if(!isInEditorMode() || !comOver)
			return;
		page.canvasDiv.removeChild(
			comOver.getComment());
		page.canvasDiv.removeChild(
			comOver.getOverlay());
		let handles = comOver.getHandles();
		for(let handle of handles){
			page.canvasDiv.removeChild(handle);
		}
	}

	function removeSelectedComOver(){
		removeComOver(page.selectedComOver);
		deselectComOver();
	}
	
	function addComOver(comOver){
		if(!comOver)
			return;
		let comment = comOver.getComment();
		let overlay = comOver.getOverlay();
		if(isInViewerMode()){
			if(comment)
				page.allCommentsDiv.appendChild(comment);
			if(overlay)
				page.allCommentsDiv.appendChild(overlay);
		}
		if(isInEditorMode()){
			if(comment)
				page.canvasDiv.appendChild(comment);
			if(!overlay)
				return;
			page.canvasDiv.appendChild(overlay);
			let handles = comOver.getHandles();
			for(let handle of handles){
				page.canvasDiv.appendChild(handle);
			}
		}
	}
	
	function getSelectedComOver(){
		return page.selectedComOver;
	}
	
	function selectComOver(comOver, text){
		if(page.selectedComOver){
			page.selectedComOver.select(false);
		}
		page.commentInput.value = text ? text : '';
		Element.disable(page.removeCommentButton,
			false);
		Element.disable(page.commentInput, false);
		if(page.commentInput){
			page.commentInput.focus();
		}
		comOver.select(true);
		page.selectedComOver = comOver;
	}
	
	function selectLayer(name, index){
		if(page.layerInput){
			page.layerInput.value =	name;
		}
		if(page.layerSelect && 
			page.layerSelect.selectedIndex != index)
			//do not trigger if it's already selected
			page.layerSelect.selectedIndex = index;
	}
	
	function triggerFileInput(){
		if(page.fileInput)
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
	
	function clearGallery(){
		if(page.allCommentsDiv){
			while (page.allCommentsDiv.firstChild) {
				page.allCommentsDiv.removeChild(
					page.allCommentsDiv.firstChild);
			}
		}
		if(isInEditorMode()){
			while (page.canvasDiv.firstChild) {
				page.canvasDiv.removeChild(
					page.canvasDiv.firstChild);
			}
			deselectComOver();
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
		
		if(!page.imageDiv) return;
		let d = Document.getElement(IMAGE_ID);
		if(d)
			page.imageDiv.removeChild(d); 
		if(page.widthInput && page.heightInput){
			unlock_size();
		}
	}
	
	function disableArchiveButtons(b){
		Element.disable(page.saveArchiveButton, b);
		Element.disable(page.clearArchiveButton, b);
	}
	
	function clearArchive(){
		
		function clearFileInput(){
			if(!page.fileInput) return null;
			page.fileInput.value = '';
		}
		
		clearImage();
		fillFileInfo('');
		disableArchiveButtons(true);
		clearFileInput();
	}
	
	function clearLayersSelect(){
		Element.clearSelect(page.layerSelect);
	}
	
	function clearCanvas(){
		if(!isInEditorMode() ||
			!confirm(Language.getPhrase(
			'removeAllCommentsFromLayerConfirm')))
			return;
		clearGallery();
	}	

	function getLanguage(){
		if(!page.languageSelect) return null;
		return page.languageSelect.value;
	}
	
	function applyLanguage(lang){
		for(let key in lang)
			Document.setText(key, lang[key]);
		if(page.languageSelect){
			page.languageSelect.value = lang.id;
		}
	}

	function addLayer(name){
		if(page.layerSelect){
			let option = Element.newOption(name);
			page.layerSelect.add(option);
		}
	}
	
	function removeLayer(index){
		if(!page.layerSelect)
			return;
		page.layerSelect.remove(index);
	}
	
	function getLayerIndex(){
		if(!page.layerSelect)
			return -1;
		return page.layerSelect.selectedIndex;
	}
	
	function setLayerName(index, name){
		if(!page.layerSelect)
			return;
		page.layerSelect.options[index].text = name;	
	}
	
	function displayImage(event){
		
		function lockSize(w, h){
			if(isInEditorMode()){
				page.canvasDiv.style.width = w + 'px';
				page.canvasDiv.style.height = h + 'px';			
			}
			if(page.widthInput){
				page.widthInput.value = w;
				page.imageDiv.style.width = null; //TODO ?
				Element.disable(page.widthInput, true);
			}
			if(page.heightInput){
				page.heightInput.value = h;
				page.imageDiv.style.height = null; //TODO ?
				Element.disable(page.heightInput, true);
			}
		}
	
		clearImage();
		let image = Element.newImage(event.target.result);
		image.id = IMAGE_ID;
		page.imageDiv.appendChild(image);
		image.addEventListener('load', () => {
			lockSize(image.naturalWidth,
				image.naturalHeight);
		});
	};
	
	function getFile(){
		if(!page.fileInput) return null;
		return page.fileInput.files[0];
	}
	
	function getCanvas(){
		return page.canvasDiv;
	}
	
	function removeDrawing(dr){
		if(!page.canvasDiv) return;
		page.canvasDiv.removeChild(dr);
	}
	
	function addDrawing(dr){
		if(!page.canvasDiv || !dr) return;
		page.canvasDiv.appendChild(dr);
	}
	
	function initImagePadding(){
		if(!page.canvasDiv || !page.imageDiv) return;
		let style = getComputedStyle(page.canvasDiv);
		page.imageDiv.style.padding = style.borderWidth;
	}
	
	function getCommentInput(){
		if(!page.commentInput) return '';
		return page.commentInput.value;
	}
	
	function getLayerInput(){
		if(!page.layerInput) return '';
		return page.layerInput.value;
	}
	
	function initCommentInput(keydownFun, inputFun){
		if(!page.commentInput) return;
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
		
		if(!page.canvasDiv || !page.imageDiv){
			console.log('Bad usage of initSizeInputs: ' +
			'canvas div and image div should be present!');
			return;
		}
		if(page.widthInput){
			updateWidth();
			page.widthInput.addEventListener('input', 
				updateWidth);
		}
		if(page.heightInput){
			updateHeight()
			page.heightInput.addEventListener('input', 
				updateHeight);
		}
	}
	
	function initLayerInput(keydownFun, inputFun){
		if(!page.layerInput) return;
		page.layerInput.onkeydown = keydownFun;
		page.layerInput.oninput = inputFun;
	}
	
	function initCanvasDiv(onmousemoveFun, onmousedownFun,
		onmouseupFun, onmouseleaveFun){
		if(!page.canvasDiv)
			return;
		page.canvasDiv.onmousemove = onmousemoveFun;
		page.canvasDiv.onmousedown = onmousedownFun;
		page.canvasDiv.onmouseup = onmouseupFun;
		page.canvasDiv.onmouseleave = onmouseleaveFun;
	}
	
	function bind(){
		for(let key in page){
			page[key] = Document.getElement(key);
		}
	}
	
	function initImagePanel(){
		if(!page.imageDiv || !isInViewerMode()) return;
		page.imageDiv.addEventListener('click', () => {
			page.allCommentsDiv.style.display = 
				(page.allCommentsDiv.style.display ==
					'none') ? 'block' : 'none';
		});
	}
	
	function initFileInput(onchangeFun){
		if(!page.fileInput) return;
		page.fileInput
			.addEventListener('change', onchangeFun);
	}
	
	function fillLanguageSelect(list){
		if(!page.languageSelect) return;
		for(const lang of list){
			let option = Element.newOption(lang);
			page.languageSelect.add(option);
		}
	}
	
	function manageImage(blob){
		imageReader.readAsDataURL(blob);
	}

	return {
		clear: clear,
		isInEditorMode: isInEditorMode,
		deselectComOver,
		removeSelectedComOver: removeSelectedComOver,
		addComOver: addComOver,
		getSelectedComOver: getSelectedComOver,
		selectComOver: selectComOver,
		selectLayer: selectLayer,
		triggerFileInput: triggerFileInput,
		fillFileInfo: fillFileInfo,
		fillCoordinatesInfo: fillCoordinatesInfo,
		clearGallery: clearGallery,
		clearImage: clearImage,
		disableArchiveButtons: disableArchiveButtons,
		clearArchive: clearArchive,
		clearLayersSelect: clearLayersSelect,
		clearCanvas: clearCanvas,
		getLanguage: getLanguage,
		applyLanguage: applyLanguage,
		addLayer: addLayer,
		removeLayer: removeLayer,
		getLayerIndex: getLayerIndex,
		setLayerName: setLayerName,
		getFile: getFile,
		getCanvas: getCanvas,
		removeDrawing: removeDrawing,
		addDrawing: addDrawing,
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

