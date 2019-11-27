/* By: VINT64
All code copied from Stack Overflow and
other places keeps its respective licenses.
All original code is unlicensed (more info
https://unlicense.org ) */

//uses Regexp
const DEFAULT_ROOT_FOLDER_NAME = 'root';
const memory = { archive: null,
	filenames: new Filenames([], []),
	fileLayers: [],	currentFile: 0, currentLayer: 0,
	nextLayer: 0,
};

function Layer(name, list){
	this.name = name;
	this.comovers = list;
	this.getName = function(){return this.name};
	this.getComOversList = function(){
		return this.comovers;
	};
}

function ComOver(com, over){
	this.commentDiv = com;
	this.commentOverlayDiv = over;
	this.getComment = function(){return this.commentDiv;};
	this.getOverlay = function(){
		return this.commentOverlayDiv;
	};
	this.notComplete = function(){
		return !this.commentOverlayDiv || !this.commentDiv;
	}
	this.getText = function(){
		if (!this.commentDiv){
			console.log('ComOver attempt to get text ' +
				'while comment div is absent');
			return null;
		}
		return this.commentDiv.textContent;
	};
	this.setText = function(text){
		if (text === null)
			return;
		if (!this.commentDiv){
			console.log('ComOver attempt to set text ' +
				'while comment div is absent');
			return;
		}
		this.commentDiv.textContent = text;
	}
}

function clearMemoryArchive(){
	memory.archive = null;
	memory.filenames.images = [];
	memory.filenames.jsonfiles = [];
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

function addMemoryLayerToCurrentFile(name, comovers){
	memory.fileLayers.push(new Layer(name, comovers));
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
	let path = ParseUtil.getPath(imageFullName);
	return (path === undefined) ?
		imageFullName : imageFullName.replace(path, '');
}

function getMemoryCommentFileName(i){
	if (i < 0 || i >= memory.filenames.jsonfiles.length){
		console.log(
			'Bad param for getMemoryCommentFileName: ' + i);
		return null;
	}
	return memory.filenames.jsonfiles[i];
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
	return memory.filenames.jsonfiles.length;
}

function getMemoryLayer(i){
	if (i < 0 || i >= memory.fileLayers.length){
		console.log(
			'Bad param for getMemoryLayer: ' + i);
		return null;
	}
	return memory.fileLayers[i];
}

function getMemoryComOversFromLayer(i){
	if (i < 0 || i >= memory.fileLayers.length){
		console.log(
			'Bad param for getMemoryCommentLayer: ' + i);
		return null;
	}
	return memory.fileLayers[i].comovers;
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

function getMemoryCurrentComOvers(){
	return getMemoryComOversFromLayer(memory.currentLayer);
}

/* Searches comOver by overlay div on current layer */
function getComOver(overlay, del){
	if (overlay === null)
		return null;
	let comovers = getMemoryCurrentComOvers();
	if (comovers === null)
		return null;
	for(let i = comovers.length - 1; i >= 0; i--)
		if (comovers[i].commentOverlayDiv === overlay){
			let ret = comovers[i];
			if (del)
				comovers.splice(i, 1);
			return ret;
		}
	return null;
}

//should return null if overlay equals null
function getMemoryComOver(overlay){
	return getComOver(overlay, false);
}

function removeMemoryComOver(overlay){
	return getComOver(overlay, true);
}

function RewriteMemoryCommentFile(i, body){
	
	function generateMemoryCommentFileName(i){
		let imageFullName = getMemoryImageNameWithPath(i);
		if (imageFullName === null)
			return null;
		let ext = ParseUtil.getExtension(imageFullName);
		return (ext === undefined) ? imageFullName :
			imageFullName.replace(ext, 'json');
	}
		
	if (i < 0 || i >= memory.filenames.images.length){
		console.log(
			'Bad param for RewriteMemoryCommentFile: ' + i);
		return false;
	}
	let filename = memory.filenames.jsonfiles[i];
	if (filename === undefined || filename === null)
		filename = generateMemoryCommentFileName(i);
	if (filename === null){
		console.log('RewriteMemoryCommentFile failed: ' +
			'image name is null. Index in question: ' + i);
		return false;
	}
	memory.filenames.jsonfiles[i] = filename;
	memory.archive.file(filename, body);
	return true;
}

function TruncateMemoryCommentFilesList(i){
	if (i >= 0 && i < memory.filenames.jsonfiles.length){
		if (i < memory.filenames.images.length)
			console.log('Warning, ' +
				'TruncateCommentFilesList may cut out ' +
				'too much. Images: ' +
				memory.filenames.images.length + 
				', json Files: ' + i);
		memory.filenames.jsonfiles.length = i;
	}
}

function initMemoryForSingleImage(filename){
	memory.archive = new JSZip();
	imageName = DEFAULT_ROOT_FOLDER_NAME + '/'
		+ filename;
	memory.filenames = new Filenames([imageName],
		[]);
	return memory.archive;
}

function initMemoryForArchive(archive, imagesList,
	commentFilesList){
	memory.filenames = new Filenames(imagesList,
		commentFilesList);
	memory.archive = archive; 
}

function dumpMemoryFiles(){
	for (let i = 0; i < memory.filenames.images.length; i++)
		console.log(memory.filenames.images[i]);
	for (let i = 0; i < memory.filenames.jsonfiles.length;
		i++)
		console.log(memory.filenames.jsonfiles[i]);
}

function removeMemoryDefaultLayerIfPresent(){
	//if (!confirm(Language.getPhrase(
		//'LoseDefaultLayerConfirm'))) return;
	if (!memory.archive && memory.fileLayers.length == 1){
		memory.fileLayers = [];
	}

}

function Filenames(imageslist, commentFilesList){
	this.images = imageslist;
	this.jsonfiles = commentFilesList;
}