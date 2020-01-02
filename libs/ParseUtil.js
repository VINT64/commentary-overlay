/* By: VINT64
All code copied from Stack Overflow and
other places keeps its respective licenses.
All original code is unlicensed (more info
https://unlicense.org ) */


var ParseUtil = (function(){
	function getExtension(s){
		return s.match(/(?:\.([^.]+))?$/)[1];
	}
	
	// check before usage
	function getFilename(s){
		return s.match(/([^\/]+)(?:\.[^.\/]+)$/)[1];
	}
	
	function isImageMime(s){
		return RegExp(/^(image\/)/).test(s);
	}
	
	function getPath(s){
		return s.match(/(.+\/)?(?:[^\/]+)?/)[1];
	}
	
	return {getExtension, getFilename,
		isImageMime, getPath};
}())




