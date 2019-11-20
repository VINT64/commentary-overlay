/* By: VINT64
All code copied from Stack Overflow and
other places keeps its respective licenses.
All original code is unlicensed (more info
https://unlicense.org ) */

function getDocumentElement(id){
	return document.getElementById(id);
}

function newDocumentElement(tag){
	return document.createElement(tag);
}

function clearDocument(){
	while(document.body.firstChild){
		document.body.removeChild(document.body.firstChild);
	}
}

function createDocumentText(text){
	return document.createTextNode(text);
}