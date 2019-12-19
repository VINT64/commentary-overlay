/* By: VINT64
All code copied from Stack Overflow and
other places keeps its respective licenses.
All original code is unlicensed (more info
https://unlicense.org ) */

//uses Document

function ComOver(x, y, width, height, text, editorMode,
	listeners){
		
	const COMMENT_VERTICAL_OFFSET = 5;
	const COMMENT_HORIZONTAL_OFFSET = 0;
	
	const COMMENT_STANDARD_Z_INDEX = 75;
	const COMMENT_USED_Z_INDEX = 750;
	const OVERLAY_STANDARD_Z_INDEX = 50;
    const OVERLAY_USED_Z_INDEX = 500;
	const HANDLE_SIZE = 5;
	const OVERLAY_MIN_SIZE = 1;

	//internal functions
	function calcAuxPos(ovX, ovY, ovW, ovH){
		return {
			comX: ovX + 
			//ovW +
			COMMENT_HORIZONTAL_OFFSET,
			comY: ovY + 
			ovH +
			COMMENT_VERTICAL_OFFSET,
			nwX: ovX - HANDLE_SIZE,
			nwY: ovY - HANDLE_SIZE,
			seX: ovX + ovW,
			seY: ovY + ovH
		}
	}
	function useOverlay(overlay){
		overlay.style.zIndex = OVERLAY_USED_Z_INDEX;
	}
	function releaseOverlay(overlay){
		overlay.style.zIndex = OVERLAY_STANDARD_Z_INDEX;
	}
	function useComment(comment){
		comment.style.zIndex = COMMENT_USED_Z_INDEX;
	}
	function releaseComment(comment){
		comment.style.zIndex = COMMENT_STANDARD_Z_INDEX;
	}
	function newComment(x, y, text, commentOverlay){
		let com = Document.newElement('div');
		com.classList.add('commentDiv');
		com.style.left = x + 'px';
		com.style.top = y + 'px';
		com.appendChild(Document.createText(text));
		com.style.visibility = 'hidden';
		commentOverlay.addEventListener('mouseover', 
		() => {
			com.style.visibility = 'visible';
		}
		);
		commentOverlay.addEventListener('mouseout', 
		() => {
			com.style.visibility = 'hidden';
		}
		);
		releaseComment(com);
		return com;
	}
	function newOverlay(x, y, width, height, editorMode){

		function newHandle(x, y){
			let handle = Document.newElement('div');
			handle.style.left = x + 'px';
			handle.style.top = y + 'px';
			handle.style.width = HANDLE_SIZE + 'px';
			handle.style.height = HANDLE_SIZE + 'px';
			handle.classList.add('handle');
			//releaseOverlay(handle);				
			return handle;
		}

		let overlay = Document.newElement('div');
		overlay.style.left = x + 'px';
		overlay.style.top = y + 'px';
		width = (width < OVERLAY_MIN_SIZE) ? 
			OVERLAY_MIN_SIZE : width;
		height = (height < OVERLAY_MIN_SIZE) ?
			OVERLAY_MIN_SIZE : height;
		overlay.style.width = width + 'px';
		overlay.style.height = height + 'px';
		overlay.classList.add('commentOverlayDiv');
		if (editorMode)
			overlay.classList.add('canvasOverlayDiv');
		releaseOverlay(overlay);
		let pos = calcAuxPos(x, y, width, height);
		overlay.nwHandle = newHandle(
			pos.nwX, pos.nwY);
		overlay.seHandle = newHandle(
			pos.seX, pos.seY);
		return overlay;
	}
	function moveAux(com, ov, x, y){
		ov.style.left = x + 'px';
		ov.style.top = y + 'px';
		let w = parseInt(ov.style.width, 10);
		let h = parseInt(ov.style.height, 10);
		pos = calcAuxPos(x, y, w, h);
		com.style.left = pos.comX + 'px';
		com.style.top = pos.comY + 'px';
		ov.nwHandle.style.left = pos.nwX + 'px';
		ov.nwHandle.style.top = pos.nwY + 'px';
		ov.seHandle.style.left = pos.seX + 'px';
		ov.seHandle.style.top = pos.seY + 'px';
	}
	//accessible functions
	function getComment(){return this.commentDiv;}
	function getOverlay(){
		return this.commentOverlayDiv;
	}
	function notComplete(){
		return !this.commentOverlayDiv || !this.commentDiv;
	}
	function getText(){
		return this.commentDiv.textContent;
	}
	function setText(text){
		if (text === null)
			return;
		this.commentDiv.textContent = text;
	}
	function use(){
		useComment(this.commentDiv);
		useOverlay(this.commentOverlayDiv);
	}
	function release(){
		releaseComment(this.commentDiv);
		releaseOverlay(this.commentOverlayDiv);
	}
	function move(x, y){
		moveAux(this.commentDiv,
			this.commentOverlayDiv, x, y);
	}

	//initialization
	let pos = calcAuxPos(x, y, width, height);
	
	this.commentOverlayDiv = 
		newOverlay(x, y, width, height, editorMode);
	this.commentDiv = 
		newComment(pos.comX, pos.comY, text,
		this.commentOverlayDiv);
	this.getComment = getComment;
	this.getOverlay = getOverlay;
	this.notComplete = notComplete;
	this.getText = getText;
	this.setText = setText;
	this.use = use;
	this.release = release;
	this.move = move;
		listeners(this);
}

var Element = (function(){
    const DRAWING_Z_INDEX = 500;
	const DISABLED_ATTRIBUTE = 'disabled'
	
	function disable(element, flag){
		if (!element) return;
		if (flag)
			element.setAttribute(
				DISABLED_ATTRIBUTE, true);
		else
			element.removeAttribute(DISABLED_ATTRIBUTE);
	}
	

	function newDrawing(x, y, width, height){
		let drawing = Document.newElement('div');
		drawing.style.left = x + 'px';
		drawing.style.top = y + 'px';
		drawing.style.width = width + 'px';
		drawing.style.height = height + 'px';
		drawing.classList.add('drawing');
		drawing.style.zIndex = DRAWING_Z_INDEX;
		return drawing;
	}

	function newImage(){
		return Document.newElement('img');
	}
	
	function newTemplate(content){
		let template = Document.newElement('template');
		template.innerHTML = content;
		return template;
	}

	function newOption(text){
		let option = Document.newElement('option');
		option.text = text;
		return option;
	}

	function parseCoordinates(div){
		return {
			x: parseInt(div.style.left, 10),
			y: parseInt(div.style.top, 10),
			w: parseInt(div.style.width, 10),
			h: parseInt(div.style.height, 10),
		}
	}

	return {
		disable: disable,
		newDrawing: newDrawing,
		newImage: newImage,
		newTemplate: newTemplate,
		newOption: newOption,
		parseCoordinates: parseCoordinates
	}
}());
