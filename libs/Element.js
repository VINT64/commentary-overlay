/* By: VINT64
All code copied from Stack Overflow and
other places keeps its respective licenses.
All original code is unlicensed (more info
https://unlicense.org ) */

const MAGIC_NUMBER = 64; // should be large

function disableElementIfPresent(element, flag){
	if (!element) return;
	if (flag)
		element.setAttribute('disabled', true);
	else
		element.removeAttribute('disabled');
}

function newCommentElement(x, y, text, commentOverlay){
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