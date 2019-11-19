/* By: VINT64
All code copied from Stack Overflow and
other places keeps its respective licenses.
All original code is unlicensed (more info
https://unlicense.org ) */

function getRegexpExtension(s){
	return s.match(/(?:\.([^.]+))?$/)[1];
}

// check before usage
// function getRegexpFilename(s){
	// return s.match(/([^\/]+)(?:\.[^.\/]+)$/)[1];
// }

function isRegexpImageMime(s){
	return RegExp(/^(image\/)/).test(s);
}

function getRegexpPath(s){
	return s.match(/(.+\/)?(?:[^\/]+)?/)[1];
}



