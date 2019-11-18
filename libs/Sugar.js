/* By: VINT64
All code copied from Stack Overflow and
other places keeps its respective licenses.
All original code is unlicensed (more info
https://unlicense.org ) */

function getElement(id){
	return document.getElementById(id);
}

function newElement(tag){
	return document.createElement(tag);
}

function logError(error){
	console.log(error.message);
}

function clearDocument(){
	while(document.body.firstChild){
		document.body.removeChild(document.body.firstChild);
	}
}