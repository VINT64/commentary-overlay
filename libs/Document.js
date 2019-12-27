/* By: VINT64
All code copied from Stack Overflow and
other places keeps its respective licenses.
All original code is unlicensed (more info
https://unlicense.org ) */


var Document = (function(){

	function getElement(id){
		return document.getElementById(id);
	}
	
	function newElement(tag){
		return document.createElement(tag);
	}
	
	function clear(el){
		while(el.firstChild){
			el.removeChild(el.firstChild);
		}
	}
	
	function createText(text){
		return document.createTextNode(text);
	}

	function setText(id, text){
		let el = getElement(id);
		if(el)
			el.textContent = text;
	}

	return {
		getElement: getElement,
		newElement: newElement,
		clear: clear,
		createText: createText,
		setText: setText
	}
}());
