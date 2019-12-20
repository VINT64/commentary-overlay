/* By: VINT64
All code copied from Stack Overflow and
other places keeps its respective licenses.
All original code is unlicensed (more info
https://unlicense.org ) */

var Memory = (function(){

	function Filenames(imageslist, commentFilesList){
		this.images = imageslist;
		this.jsonfiles = commentFilesList;
		this.clear = function(){
			this.images = [];
			this.jsonfiles = [];
	
		}
	}
	
	const DEFAULT_ROOT_FOLDER_NAME = 'root';
	const memory = { archive: null,
		filenames: new Filenames([], []),
		openLayers: [],	currentFile: 0, currentLayer: 0,
		nextLayer: 0,
	};
	
	function clearArchive(){
		memory.archive = null;
		memory.filenames.clear();
	}
	
	function isClear(){
		return !memory.archive && memory.openLayers == 0;	
	}
	
	function clearLayers(){
		memory.openLayers = [];
	}
	
	function clearCurrentLayer(){
		memory.openLayers[memory.currentLayer]
			.clearComOversList();
	}

	function clear(){
		clearArchive();
		clearLayers();
		memory.currentFile = 0;
		memory.currentLayer = 0;
		memory.nextLayer = 0;
	}
	
	function addLayer(name, comovers){
		memory.openLayers.push(new Layer(name, comovers));
	}
	
	function removeLayer(i){
		if(i < 0){
			console.log('negative layer number is not ' +
			'allowed in removeLayer');
			return false;
		}
		memory.openLayers.splice(i, 1);
		return true;
	}
	
	function getArchive(){
		return memory.archive;
	}
	
	function getCurrentLayer(){
		return memory.currentLayer;
	}
	
	function setCurrentLayer(i){
		if(i < 0 || i >= memory.openLayers.length){
			console.log(
				'Bad param for setCurrentLayer: ' + i);
				return false;
		}
		else{
			memory.currentLayer = i;
			return true;
		}
	}
	
	function getNextLayer(){
		return memory.nextLayer;
	}
	
	function setNextLayer(i){
		memory.nextLayer = i;
		return true;
	}
	
	function getCurrentFile(){
		return memory.currentFile;
	}
	
	function setCurrentFile(i){
		if(i < 0 || i >= memory.filenames.images.length){
			console.log(
				'Bad param for setCurrentFile: ' + i);
				return false;
		}
		else{
			memory.currentFile = i;
			return true;
		}
	}
	
	function getFullImageName(i){
		if(i < 0 || i >= memory.filenames.images.length){
			console.log(
				'Bad param for getFullImageName: ' + i);
			return null;
		}
		return memory.filenames.images[i];
	}
	
	function getImageNameNoPath(i){
		let imageFullName = getFullImageName(i);
		if(imageFullName === null){
			return null;
		}
		let path = ParseUtil.getPath(imageFullName);
		return (path === undefined) ?
			imageFullName : imageFullName.replace(path, '');
	}
	
	function getFullCommentFileName(i){
		if(i < 0 || i >= memory.filenames.jsonfiles.length){
			console.log(
				'Bad param for getFullCommentFileName: ' + i);
			return null;
		}
		return memory.filenames.jsonfiles[i];
	}
	
	function getFullCurrentCommentFileName(){
		return getFullCommentFileName(memory.currentFile);
	}
	
	function getLayersNumber(){
		return memory.openLayers.length;
	}
	
	function getLayers(){
		return memory.openLayers;
	}
	
	function getImagesNumber(){
		return memory.filenames.images.length;
	}
	
	function getCommentFilesNumber(){
		return memory.filenames.jsonfiles.length;
	}
	
	function getLayer(i){
		if(i < 0 || i >= memory.openLayers.length){
			console.log(
				'Bad param for getLayer: ' + i);
			return null;
		}
		return memory.openLayers[i];
	}
	
	function getLayerComOvers(i){
		return getLayer(i).getComOversList();
	}
	
	function getLayerName(i){
		return getLayer(i).getName();
	}
	
	function setLayerName(i, name){
		let layer = getLayer(i);
		if(layer === null)
			return false;
		return layer.setName(name);
	}
	
	function getCurrentLayerName(){
		return getLayerName(memory.currentLayer);
	}
	
	function getCurrentComOvers(){
		return getLayerComOvers(memory.currentLayer);
	}
	
	/* Searches comOver by overlay div on current layer 
		with removal, if del is true
	*/
	function getComOverWithDel(overlay, del){
		if(overlay === null)
			return null;
		let comovers = getCurrentComOvers();
		if(comovers === null)
			return null;
		for(let i = comovers.length - 1; i >= 0; i--)
			if(comovers[i].commentOverlayDiv === overlay){
				let ret = comovers[i];
				if(del)
					comovers.splice(i, 1);
				return ret;
			}
		return null;
	}
	
	//should return null if overlay equals null
	function getComOverByOverlay(overlay){
		return getComOverWithDel(overlay, false);
	}
	
	function removeComOverByOverlay(overlay){
		return getComOverWithDel(overlay, true);
	}
	
	function RewriteCommentFile(i, body){
		
		function generateMemoryCommentFileName(i){
			let imageFullName = getFullImageName(i);
			if(imageFullName === null)
				return null;
			let ext = ParseUtil.getExtension(imageFullName);
			return (ext === undefined) ? imageFullName :
				imageFullName.replace(ext, 'json');
		}
			
		if(i < 0 || i >= memory.filenames.images.length){
			console.log(
				'Bad param for RewriteCommentFile: ' + i);
			return false;
		}
		let filename = memory.filenames.jsonfiles[i];
		if(filename === undefined || filename === null)
			filename = generateMemoryCommentFileName(i);
		if(filename === null){
			console.log('RewriteCommentFile failed: ' +
				'image name is null. Index in question: ' + i);
			return false;
		}
		memory.filenames.jsonfiles[i] = filename;
		memory.archive.file(filename, body);
		return true;
	}
	
	function TruncateCommentFiles(i){
		if(i >= 0 && i < memory.filenames.jsonfiles.length){
			if(i < memory.filenames.images.length)
				console.log('Warning, ' +
					'TruncateCommentFilesList may cut out ' +
					'too much. Images: ' +
					memory.filenames.images.length + 
					', json Files: ' + i);
			memory.filenames.jsonfiles.length = i;
		}
	}
	
	function initForSingleImage(filename){
		memory.archive = new JSZip();
		imageName = DEFAULT_ROOT_FOLDER_NAME + '/'
			+ filename;
		memory.filenames = new Filenames([imageName],
			[]);
		return memory.archive;
	}
	
	function initForArchive(archive, imagesList,
		commentFilesList){
		memory.filenames = new Filenames(imagesList,
			commentFilesList);
		memory.archive = archive; 
	}
	
	function dumpMemoryFiles(){
		for(let imageName of memory.filenames.images)
			console.log(imageName);
		for(let jsonName of memory.filenames.jsonfiles)
			console.log(jsonName);
	}
	
	function removeDefaultLayer(){
		//if(!confirm(Language.getPhrase(
			//'LoseDefaultLayerConfirm'))) return;
		if(!memory.archive && memory.openLayers.length == 1){
			memory.openLayers = [];
		}
	
	}
	
	return {
		clearArchive: clearArchive,
		isClear: isClear,
		clearLayers: clearLayers,
		clearCurrentLayer: clearCurrentLayer,
		//clear: clear,
		addLayer: addLayer,
		removeLayer: removeLayer,
		getArchive: getArchive,
		getCurrentLayer: getCurrentLayer,
		setCurrentLayer: setCurrentLayer,
		getNextLayer: getNextLayer,
		setNextLayer: setNextLayer,
		getCurrentFile: getCurrentFile,
		setCurrentFile: setCurrentFile,
		getFullImageName: getFullImageName,
		getImageNameNoPath: getImageNameNoPath,
		getFullCommentFileName: getFullCommentFileName,
		getFullCurrentCommentFileName: getFullCurrentCommentFileName,
		getLayersNumber: getLayersNumber,
		getLayers: getLayers,
		getImagesNumber: getImagesNumber,
		getCommentFilesNumber: getCommentFilesNumber,
		setLayerName: setLayerName,
		getCurrentLayerName: getCurrentLayerName,
		getCurrentComOvers: getCurrentComOvers,
		getComOverByOverlay: getComOverByOverlay,
		removeComOverByOverlay: removeComOverByOverlay,
		RewriteCommentFile: RewriteCommentFile,
		TruncateCommentFiles: TruncateCommentFiles,
		initForSingleImage: initForSingleImage,
		initForArchive: initForArchive,
		removeDefaultLayer: removeDefaultLayer,
	}
}())

function Layer(name, list){
	this.name = name;
	this.comovers = list;
	this.getName = function(){return this.name};
	this.getComOversList = function(){
		return this.comovers;
	};
	this.clearComOversList = function(){
		this.comovers = [];
	};
	this.setName = function(n){
		if(typeof n !== 'string')
			return false;
		this.name = n;
		return true;
	}
}

