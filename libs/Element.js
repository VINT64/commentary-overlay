/* By: VINT64
All code copied from Stack Overflow and
other places keeps its respective licenses.
All original code is unlicensed (more info
https://unlicense.org ) */

//uses Document

var Element = (function(){
	const MAGIC_NUMBER = 64; // should be large
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
		com.style.zIndex = MAGIC_NUMBER;
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
	
	return {
		disable: disable,
		newComment: newComment
	}
})();
