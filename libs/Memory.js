/* By: VINT64
All code copied from Stack Overflow and
other places keeps its respective licenses.
All original code is unlicensed (more info
https://unlicense.org ) */

const memory = { archive: null,
	filenames: {images: [], comments: []},
	fileLayers: [],	currentFile: 0, currentLayer: 0, 
};

function clearMemory(){
	memory.archive = null;
	memory.filenames.images = [];
	memory.filenames.comments = [];
	memory.fileLayers = [];
	memory.currentFile = 0;
	memory.currentLayer = 0;
}

function newMemoryCommentContainer(comment, commentOverlay){
	return {commentDiv: comment, 
		commentOverlayDiv: commentOverlay};
}

function getMemoryCurrentLayer(){
	return memory.currentLayer;
}

function getMemoryCommentsFromLayer(layerNum){
	if (layerNum < 0 || layerNum >=
		memory.fileLayers.length){
		return null;
	}
	return memory.fileLayers[layerNum].comments;
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

