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
	const DEFAULT_CANVAS_SIZE = 512;
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
	
	function selectAux(comOver, bool){
		if(!comOver) return;
		comOver.select(bool);
		comOver.alwaysVisible(bool);
	}

	function deselectComOver(){
		selectAux(page.selectedComOver, false);
		page.selectedComOver = null;
		Element.disable(page.commentInput, true);
		// Element.toggleHidden(page.commentInput, true);
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

	function removeSelectedComOver(remove){
		removeComOver(page.selectedComOver);
		remove(page.selectedComOver);
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
	
	function selectComOver(comOver, text){
		// if(page.selectedComOver){
		// 	page.selectedComOver.select(false);
		// }
		page.commentInput.value = text ? text : '';
		Element.disable(page.removeCommentButton,
			false);
		Element.disable(page.commentInput, false);
		//Element.toggleHidden(page.commentInput, false);
		if(page.commentInput){
			// let ov = comOver.getOverlay();
			// let coords = ov.getBoundingClientRect();
			// Element.setCoordinates(page.commentInput, coords.left + coords.width + 25, coords.top, 0, 0);
			page.commentInput.focus({
				preventScroll: true
			  });
		}
		selectAux(page.selectedComOver, false);
		selectAux(comOver, true);
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

	function applyLanguage(lang){
		for(let key in lang)
			Document.setText(key, lang[key]);
		if(page.languageSelect){
			page.languageSelect.value = lang.id;
		}
	}

	function updateLanguage(set){
		if(!page.languageSelect) return;
		set(page.languageSelect.value, applyLanguage);
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
		image.onload = () => {
			lockSize(image.naturalWidth,
				image.naturalHeight);
		};
	};
		
	function getCanvas(){
		return page.canvasDiv;
	}
	
	function initCanvasDiv(onmousemoveFun, onmousedownFun,
		onmouseupFun, onmouseleaveFun, push,
		addCommentListeners){

		function addDrawing(dr){
			if(!page.canvasDiv || !dr) return;
			page.canvasDiv.appendChild(dr);
		}
		
		function removeDrawing(dr){
			if(!page.canvasDiv) return;
			page.canvasDiv.removeChild(dr);
		}
		
		function initOverlay(dr, bool){
			removeDrawing(dr);
			if(!bool) return;
			let coords = Element.parseCoordinates(dr);
			let comOver = new ComOver(coords.x,
				coords.y, coords.w, coords.h,
				 '', true, addCommentListeners);
			push(comOver);
			addComOver(comOver);
		}	

		if(!page.canvasDiv)
			return;
		page.canvasDiv.onmousemove = 
			(e) => onmousemoveFun(e, page.canvasDiv,
				(text) => {
					if(page.coordinatesInfo)
						page.coordinatesInfo
							.textContent = text;
				});
		page.canvasDiv.onmousedown = (e) => {
			if (e.button != 0) return null;
			deselectComOver();
			let dr = onmousedownFun(e, page.canvasDiv,
					removeDrawing);
			addDrawing(dr);
		};
		page.canvasDiv.onmouseup = (e) => {
			onmouseupFun(e, initOverlay);
		};
		page.canvasDiv.onmouseleave = (e) => {
			onmouseleaveFun(e, initOverlay);
		};
		page.canvasDiv.oncontextmenu = 
			e => e.preventDefault();
	}
	
	function initEditorMode(noPropagate, renameFun){

		function initImagePadding(){
			if(!page.canvasDiv || !page.imageDiv) return;
			let style = getComputedStyle(page.canvasDiv);
			page.imageDiv.style.padding = style.borderWidth;
		}
		
		function initCommentInput(noPropagate){
			if(!page.commentInput) return;
			page.commentInput.onkeydown = (e) => {
				for(key of noPropagate)
					if(e.keyCode == key)
						e.stopPropagation();
			};
			page.commentInput.oninput = () => {
				if(page.selectedComOver)
					page.selectedComOver.setText(
						page.commentInput.value);
			};
			Element.disable(page.commentInput, true);
			//Element.toggleHidden(page.commentInput, true);
		}
		
		function initRemoveCommentButton(){
			Element.disable(page.removeCommentButton,
				true);
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
			widthInput.value = DEFAULT_CANVAS_SIZE;
			heightInput.value = DEFAULT_CANVAS_SIZE;
			if(page.widthInput){
				updateWidth();
				page.widthInput.oninput = updateWidth;
			}
			if(page.heightInput){
				updateHeight()
				page.heightInput.oninput = updateHeight;
			}
		}
	
		function initLayerInput(renameFun){

			function setLayerName(index, name){
				if(!page.layerSelect)
					return;
				page.layerSelect
					.options[index].text = name;
			}

			if(!page.layerInput) return;
			page.layerInput.onkeydown =
				(e) => e.stopPropagation();
			page.layerInput.oninput = 
				(e) => renameFun(page.layerInput.value,
					setLayerName);
		}
					
		if(!isInEditorMode()) 
			return;		
		initImagePadding();		
		initCommentInput(noPropagate);		
		initRemoveCommentButton();
		initSizeInputs();
		initLayerInput(renameFun);
	}

	function bind(){
		for(let key in page){
			page[key] = Document.getElement(key);
		}
	}
	
	function initImagePanel(){
		if(!page.imageDiv || !isInViewerMode()) return;
		page.imageDiv.onclick = () => {
			page.allCommentsDiv.style.display = 
				(page.allCommentsDiv.style.display ==
					'none') ? 'block' : 'none';
		};
	}
	
	function initFileInput(loadFileFun, removeFileLayers,
		finalSelect){
		
		function clean(){ 
			clearImage();
			clearGallery();
			removeFileLayers();
		}

		function finalize(){
			disableArchiveButtons(false);
			finalSelect();
		}

		if(!page.fileInput) return;
		page.fileInput.onchange = (e) =>
			loadFileFun(page.fileInput.files[0],
				clean, finalize)
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
		selectComOver: selectComOver,
		selectLayer: selectLayer,
		triggerFileInput: triggerFileInput,
		fillFileInfo: fillFileInfo,
		clearGallery: clearGallery,
		disableArchiveButtons: disableArchiveButtons,
		clearArchive: clearArchive,
		clearLayersSelect: clearLayersSelect,
		clearCanvas: clearCanvas,
		applyLanguage: applyLanguage,
		updateLanguage: updateLanguage,
		addLayer: addLayer,
		removeLayer: removeLayer,
		getLayerIndex: getLayerIndex,
		getCanvas: getCanvas,
		initCanvasDiv: initCanvasDiv,
		initEditorMode: initEditorMode,
		bind: bind,
		initImagePanel: initImagePanel,
		initFileInput: initFileInput,
		fillLanguageSelect: fillLanguageSelect,
		manageImage: manageImage
	}
}())

