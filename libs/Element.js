/* By: VINT64
All code copied from Stack Overflow and
other places keeps its respective licenses.
All original code is unlicensed (more info
https://unlicense.org ) */

//uses Document

var Element = (function(){
	const COMMENT_STANDARD_Z_INDEX = 64;
	const DISABLED_ATTRIBUTE = 'disabled'
	
	function disable(element, flag){
		if (!element) return;
		if (flag)
			element.setAttribute(
				DISABLED_ATTRIBUTE, true);
		else
			element.removeAttribute(DISABLED_ATTRIBUTE);
	}
	
	function newComment(x, y, text, commentOverlay){
		let com = Document.newElement('div');
		com.style.zIndex = COMMENT_STANDARD_Z_INDEX;
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
		return com;
	}
	function newOverlay(x, y, width, height){
		let overlay = Document.newElement('div');
		overlay.style.left = x + 'px';
		overlay.style.top = y + 'px';
		overlay.style.width = width + 'px';
		overlay.style.height = height + 'px';
		overlay.classList.add('commentOverlayDiv');					
		return overlay;
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
	// function Comment(x, y, text, commentOverlay){
	// 	this = Document.newElement('div');
	// 	this.style.zIndex = COMMENT_STANDARD_Z_INDEX;
	// 	com.classList.add('commentDiv');
	// 	this.style.left = x + 'px';
	// 	this.style.top = y + 'px';
	// 	this.appendChild(Document.createText(text));
	// 	this.style.visibility = 'hidden';
	// 	commentOverlay.addEventListener('mouseover', 
	// 		() => {
	// 			this.style.visibility = 'visible';
	// 		}
	// 	);
	// 	commentOverlay.addEventListener('mouseout', 
	// 		() => {
	// 			this.style.visibility = 'hidden';
	// 		}
	// 	);
	// }	

	return {
		disable: disable,
		newComment: newComment,
		newOverlay: newOverlay,
		newImage: newImage,
		newTemplate: newTemplate,
		newOption: newOption
	//	Comment: Comment
	}
}());
