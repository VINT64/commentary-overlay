/* By: VINT64
All code copied from Stack Overflow and
other places keeps its respective licenses.
All original code is unlicensed (more info
https://unlicense.org ) */

const memory = { archive: null,
	filenames: {images: [], comments: []},
	fileLayers: [],	currentFile: 0, currentLayer: 0,
	nextLayer: 0,
};

function clearMemory(){
	memory.archive = null;
	memory.filenames.images = [];
	memory.filenames.comments = [];
	memory.fileLayers = [];
	memory.currentFile = 0;
	memory.currentLayer = 0;
	memory.nextLayer = 0;
}

function newMemoryCommentContainer(comment, commentOverlay){
	return {commentDiv: comment, 
		commentOverlayDiv: commentOverlay};
}

function getMemoryArchive(){
	return memory.archive;
}

function getMemoryCurrentLayer(){
	return memory.currentLayer;
}

function setMemoryCurrentLayer(i){
	if (i < 0 || i >= memory.fileLayers.length){
		console.log(
			'Bad param for setMemoryCurrentLayer: ' + i);
	}
	else{
		memory.currentLayer = i;
	}
}

function getMemoryNextLayer(){
	return memory.nextLayer;
}

function setMemoryNextLayer(i){
	memory.nextLayer = i;
}

function getMemoryCurrentFile(){
	return memory.currentFile;
}

function setMemoryCurrentFile(i){
	if (i < 0 || i >= memory.filenames.images.length){
		console.log(
			'Bad param for setMemoryCurrentFile: ' + i);
	}
	else{
		memory.currentFile = i;
	}
}

function getMemoryImageName(i){
	if (i < 0 || i >= memory.filenames.images.length){
		console.log(
			'Bad param for getMemoryImageName: ' + i);
		return null;
	}
	return memory.filenames.images[i];
}

function getMemoryCommentFileName(i){
	if (i < 0 || i >= memory.filenames.comments.length){
		console.log(
			'Bad param for getMemoryCommentFileName: ' + i);
		return null;
	}
	return memory.filenames.comments[i];
}

function getMemoryLayersListLength(){
	return memory.fileLayers.length;
}

function getMemoryImageListLength(){
	return memory.filenames.images.length;
}

function getMemoryCommentFileListLength(){
	return memory.filenames.comments.length;
}

function getMemoryLayer(i){
	if (i < 0 || i >= memory.fileLayers.length){
		console.log(
			'Bad param for getMemoryLayer: ' + i);
		return null;
	}
	return memory.fileLayers[i];
}

function getMemoryCommentsFromLayer(i){
	if (i < 0 || i >= memory.fileLayers.length){
		console.log(
			'Bad param for getMemoryCommentLayer: ' + i);
		return null;
	}
	return memory.fileLayers[i].comments;
}

function getMemoryCurrentComments(){
	return getMemoryCommentsFromLayer(memory.currentLayer);
}

/* Searches comment pair by overlay Div on current layer */
function getMemoryComOverPair(comOver){
	let comments = getMemoryCurrentComments();
	if (comments === null)
		return null;
	for(let i = comments.length - 1; i >= 0; i--)
		if (comments[i].commentOverlayDiv === comOver)
			return comments[i];
	return null;
}

