function getElement(id){
	return document.getElementById(id);
}

function newElement(tag){
	return document.createElement(tag);
}

function disableIfPresent(element, flag){
	if (!element) return;
	if (flag)
		element.setAttribute('disabled', true);
	else
		element.removeAttribute('disabled');
}