/* By: VINT64
All code copied from Stack Overflow and
other places keeps its respective licenses.
All original code is unlicensed (more info
https://unlicense.org ) */

//uses Document

let index = 0;

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
	const USING_CLASS = 'using';
	const SELECTED_CLASS = 'selected';
	//internal functions
	function calculatePos(ovX, ovY, ovW, ovH){
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
	function newComment(x, y, text){
		let com = Document.newElement('div');
		com.classList.add('commentDiv');
		com.style.left = x + 'px';
		com.style.top = y + 'px';
		com.appendChild(Document.createText(text));
		com.style.visibility = 'hidden';
		com.onmousedown = (e) => e.stopPropagation();
		com.onkeydown = (e) => {
			e.stopPropagation();
			if(e.key != 'Enter') return;
			e.preventDefault();
			document.execCommand('insertHTML',false,'\n');
		}
		return com;
	}
    function newHandle(x, y){
        let handle = Document.newElement('div');
        handle.style.left = x + 'px';
        handle.style.top = y + 'px';
        handle.style.width = HANDLE_SIZE + 'px';
        handle.style.height = HANDLE_SIZE + 'px';
        handle.classList.add('handle');
       return handle;
    }
	function newOverlay(x, y, width, height, editorMode){
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
		if(editorMode)
			overlay.classList.add('canvasOverlayDiv');
		return overlay;
	}
	function moveAux(com, ov, nwh, seh, x, y){
		ov.style.left = x + 'px';
		ov.style.top = y + 'px';
		let w = parseInt(ov.style.width, 10);
		let h = parseInt(ov.style.height, 10);
		pos = calculatePos(x, y, w, h);
		com.style.left = pos.comX + 'px';
		com.style.top = pos.comY + 'px';
		nwh.style.left = pos.nwX + 'px';
		nwh.style.top = pos.nwY + 'px';
		seh.style.left = pos.seX + 'px';
		seh.style.top = pos.seY + 'px';
	}
	function resizeAux(ov, w, h){
		ov.style.width = w + 'px';
		ov.style.height = h + 'px';
	}
	function setIndex(list, index){
		for(let obj of list)
			obj.dataset.index = index;
	}
	//accessible functions
	this.getComment = function(){return this.commentDiv;}
	this.getOverlay = function(){
		return this.commentOverlayDiv;
	}
    this.getHandles = function(){
        return [this.nwHandle, this.seHandle];
	}
	this.getNWHandle = function(){
		return this.nwHandle;
	}
	this.getSEHandle = function(){
		return this.seHandle;
	}
	this.notComplete = function(){
		return !this.commentOverlayDiv
		|| !this.commentDiv;
	}
	this.getText = function(){
		if(!this.commentDiv)
			return null;
		return this.commentDiv.textContent;
	}
	this.setText = function(text){
		if(text === null
			|| !this.commentDiv)
			return null;
		this.commentDiv.textContent = text;
		return text;
	}
	this.using = function(){
		function useOverlay(overlay){
			overlay.style.zIndex = OVERLAY_USED_Z_INDEX;
		}
		function useComment(comment){
			comment.style.zIndex = COMMENT_USED_Z_INDEX;
		}
		useComment(this.commentDiv);
		useOverlay(this.commentOverlayDiv);
		for (handle of this.getHandles())
			useOverlay(handle);
		Element.toggleClass(this.commentOverlayDiv,
			USING_CLASS, true);
		
	}
	this.release = function(){
		function releaseOverlay(overlay){
			overlay.style.zIndex = OVERLAY_STANDARD_Z_INDEX;
		}
		function releaseComment(comment){
			comment.style.zIndex = COMMENT_STANDARD_Z_INDEX;
		}	
		releaseComment(this.commentDiv);
		releaseOverlay(this.commentOverlayDiv);
		for (handle of this.getHandles())
			releaseOverlay(handle);
		Element.toggleClass(this.commentOverlayDiv,
			USING_CLASS, false);
	}
	this.move = function(x, y){
		moveAux(this.commentDiv,
			this.commentOverlayDiv, this.nwHandle,
			this.seHandle, x, y);
    }
	this.resize = function(x, y, w, h){
		resizeAux(this.commentOverlayDiv, w, h);
		this.move(x, y);
	}
	this.select = function(toggle){	
		Element.toggleClass(this.commentOverlayDiv,
			SELECTED_CLASS, toggle);
		this.alwaysVisible(toggle);
		// Element.attribute(this.commentDiv,
		// 	'contenteditable', toggle);
		// if(toggle){
		// 	setTimeout(() => this.commentDiv.focus(), 0);
		// }
	}
	this.alwaysVisible = function(bool){

		function setVisible(com){
			com.style.visibility = 'visible';
		}

		function setHidden(com){
			com.style.visibility = 'hidden';
		}

		function allVisible(){
			return [this.commentOverlayDiv,
				this.nwHandle, this.seHandle];
		}

		let com = this.commentDiv;
		for(ov of allVisible.call(this)){
			ov.onmouseover = e => setVisible(com);
			if(bool){
				ov.onmouseleave = null;
			}
			else
				ov.onmouseleave = e => setHidden(com);
		}
		if(bool)
			setVisible(com);
		else
			setHidden(com);
	}
	//initialization

	this.commentOverlayDiv = 
        newOverlay(x, y, width, height, editorMode);
	let pos = calculatePos(x, y, width, height);
	this.nwHandle = newHandle(pos.nwX, pos.nwY);
	this.seHandle = newHandle(pos.seX, pos.seY);
	this.commentDiv = newComment(pos.comX, pos.comY,
		text);
    setIndex([this.commentOverlayDiv, this.commentDiv,
		this.nwHandle, this.seHandle], index++); 
	this.alwaysVisible(false);
	this.release();
	listeners(this);
}