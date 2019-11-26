/* By: VINT64
All code copied from Stack Overflow and
other places keeps its respective licenses.
All original code is unlicensed (more info
https://unlicense.org ) */

//uses Regexp
const DEFAULT_ROOT_FOLDER_NAME = 'root';
const memory = { archive: null,
	filenames: {images: [], comments: []},
	fileLayers: [],	currentFile: 0, currentLayer: 0,
	nextLayer: 0,
};

function Layer(name, list){
	this.name = name;
	this.comments = list;
}

function clearMemoryArchive(){
	memory.archive = null;
	memory.filenames.images = [];
	memory.filenames.comments = [];
}

function checkMemoryClear(){
	return !memory.archive && memory.fileLayers == 0;	
}

function clearMemoryLayers(){
	memory.fileLayers = [];
}

function clearMemory(){
	clearMemoryArchive();
	clearMemoryLayers();
	memory.currentFile = 0;
	memory.currentLayer = 0;
	memory.nextLayer = 0;
}

function addMemoryLayerToCurrentFile(name, comments){
	memory.fileLayers.push(new Layer(name, comments));
}

function removeMemoryLayerFromCurrentFile(i){
	if (i < 0){
		console.log('negative layer number is not ' +
		'allowed in removeMemoryLayerFromCurrentFile');
		return false;
	}
	memory.fileLayers.splice(i, 1);
	return true;
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
			return false;
	}
	else{
		memory.currentLayer = i;
		return true;
	}
}

function getMemoryNextLayer(){
	return memory.nextLayer;
}

function setMemoryNextLayer(i){
	memory.nextLayer = i;
	return true;
}

function getMemoryCurrentFile(){
	return memory.currentFile;
}

function setMemoryCurrentFile(i){
	if (i < 0 || i >= memory.filenames.images.length){
		console.log(
			'Bad param for setMemoryCurrentFile: ' + i);
			return false;
	}
	else{
		memory.currentFile = i;
		return true;
	}
}

function getMemoryImageNameWithPath(i){
	if (i < 0 || i >= memory.filenames.images.length){
		console.log(
			'Bad param for getMemoryImageName: ' + i);
		return null;
	}
	return memory.filenames.images[i];
}

function getMemoryImageNameNoPath(i){
	let imageFullName = getMemoryImageNameWithPath(i);
	if (imageFullName === null){
		return null;
	}
	let path = getRegexpPath(imageFullName);
	return (path === undefined) ?
		imageFullName : imageFullName.replace(path, '');
}

function getMemoryCommentFileName(i){
	if (i < 0 || i >= memory.filenames.comments.length){
		console.log(
			'Bad param for getMemoryCommentFileName: ' + i);
		return null;
	}
	return memory.filenames.comments[i];
}

function getMemoryCurrentCommentFileName(){
	return getMemoryCommentFileName(memory.currentFile);
}

function getMemoryLayersListLength(){
	return memory.fileLayers.length;
}

function getMemoryLayersList(){
	return memory.fileLayers;
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

function getMemoryLayerName(i){
	if (i < 0 || i >= memory.fileLayers.length){
		console.log(
			'Bad param for getMemoryLayerName: ' + i);
		return null;
	}
	return memory.fileLayers[i].name;
}

function setMemoryLayerName(i, name){
	if (i < 0 || i >= memory.fileLayers.length){
		console.log(
			'Bad param for setMemoryLayerName: ' + i);
		return false;
	}
	memory.fileLayers[i].name = name;
	return true;
}

function getMemoryCurrentLayerName(){
	return getMemoryLayerName(memory.currentLayer);
}

function getMemoryCurrentComments(){
	return getMemoryCommentsFromLayer(memory.currentLayer);
}

/* Searches comment pair by overlay Div on current layer */
function getComOver(overlay, del){
	if (overlay === null)
		return null;
	let comments = getMemoryCurrentComments();
	if (comments === null)
		return null;
	for(let i = comments.length - 1; i >= 0; i--)
		if (comments[i].commentOverlayDiv === overlay){
			let ret = comments[i];
			if (del)
				comments.splice(i, 1);
			return ret;
		}
	return null;
}

//should return null if overlay equals null
function getMemoryComOverPair(overlay){
	return getComOver(overlay, false);
}

function removeMemoryCommentPair(overlay){
	return getComOver(overlay, true);
}

function RewriteMemoryCommentFile(i, body){
	
	function generateMemoryCommentFileName(i){
		let imageFullName = getMemoryImageNameWithPath(i);
		if (imageFullName === null)
			return null;
		let ext = getRegexpExtension(imageFullName);
		return (ext === undefined) ? imageFullName :
			imageFullName.replace(ext, 'json');
	}
		
	if (i < 0 || i >= memory.filenames.images.length){
		console.log(
			'Bad param for RewriteMemoryCommentFile: ' + i);
		return false;
	}
	let filename = memory.filenames.comments[i];
	if (filename === undefined || filename === null)
		filename = generateMemoryCommentFileName(i);
	if (filename === null){
		console.log('RewriteMemoryCommentFile failed: ' +
			'image name is null. Index in question: ' + i);
		return false;
	}
	memory.filenames.comments[i] = filename;
	memory.archive.file(filename, body);
	return true;
}

function TruncateMemoryCommentFilesList(i){
	if (i >= 0 && i < memory.filenames.comments.length){
		if (i < memory.filenames.images.length)
			console.log('Warning, ' +
				'TruncateCommentFilesList may cut out ' +
				'too much. Images: ' +
				memory.filenames.images.length + 
				', comments: ' + i);
		memory.filenames.comments.length = i;
	}
}

function initMemoryForSingleImage(filename){
	memory.archive = new JSZip();
	imageName = DEFAULT_ROOT_FOLDER_NAME + '/'
		+ filename;
	memory.filenames = {images: [imageName],
		comments: []};
	return memory.archive;
}

function initMemoryForArchive(archive, imagesList,
	commentFilesList){
	memory.filenames = {images: imagesList,
		comments: commentFilesList};
	memory.archive = archive; 
}

function dumpMemoryFiles(){
	for (let i = 0; i < memory.filenames.images.length; i++)
		console.log(memory.filenames.images[i]);
	for (let i = 0; i < memory.filenames.comments.length;
		i++)
		console.log(memory.filenames.comments[i]);
}

function removeMemoryDefaultLayerIfPresent(){
	//if (!confirm(getLanguagePhrase(
		//'LoseDefaultLayerConfirm'))) return;
	if (!memory.archive && memory.fileLayers.length == 1){
		memory.fileLayers = [];
	}

}