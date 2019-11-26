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
	
	function clear(){
		while(document.body.firstChild){
			document.body.removeChild(
				document.body.firstChild);
		}
	}
	
	function createText(text){
		return document.createTextNode(text);
	}

	return {
		getElement: getElement,
		newElement: newElement,
		clear: clear,
		createText: createText
	}
})();
