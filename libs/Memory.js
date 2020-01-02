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
	
	function getCurrentLayerIndex(){
		return memory.currentLayer;
	}
	
	function setCurrentLayerIndex(i){
		if(i < 0 || i >= memory.openLayers.length){
			console.log(
				'Bad param for setCurrentLayerIndex: ' + i);
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
	
	function getCurrentFileIndex(){
		return memory.currentFile;
	}
	
	function setCurrentFileIndex(i){
		if(i < 0 || i >= memory.filenames.images.length){
			console.log(
				'Bad param for setCurrentFileIndex: ' + i);
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
	
	function getCurrentComOvers(){
		return getLayerComOvers(memory.currentLayer);
	}
	
	function addToCurrentComOvers(comOver){
		let list = getLayerComOvers(memory.currentLayer);
		if(list === null)
			return null;
		list.push(comOver);
		return comOver;
	}

	function removeComOver(comOver){
		if (!comOver) return null;
		let comovers = getCurrentComOvers();
		if(comovers === null)
			return null;
		for(let i = comovers.length - 1; i >= 0; i--)
			if(comovers[i] == comOver){
				comovers.splice(i, 1);
				return comOver;
			}
		return null;
	}

	function rewriteCommentFile(i, body){
		
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
				'Bad param for rewriteCommentFile: ' + i);
			return false;
		}
		let filename = memory.filenames.jsonfiles[i];
		if(filename === undefined || filename === null)
			filename = generateMemoryCommentFileName(i);
		if(filename === null){
			console.log('rewriteCommentFile failed: ' +
				'image name is null. Index in question: ' + i);
			return false;
		}
		memory.filenames.jsonfiles[i] = filename;
		memory.archive.file(filename, body);
		return true;
	}
	
	async function equalizeFiles(addJsonFun){
		let imagesNum = memory.filenames.images.length,
		commentsNum = memory.filenames.jsonfiles.length;
		if(imagesNum <	commentsNum)
			memory.filenames.jsonfiles.length = i;
		if(imagesNum >commentsNum) {
			for(let i = commentsNum; i < imagesNum; i++)
				await addJsonFun(i);
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
		if(!memory.archive){
			memory.openLayers = [];
		}
	
	}
	
	return {clearArchive, isClear, clearLayers,
		clearCurrentLayer, addLayer, removeLayer,
		//clear: clear,
		getArchive, getCurrentLayerIndex,
		setCurrentLayerIndex, getNextLayer, setNextLayer,
		getCurrentFileIndex, setCurrentFileIndex,
		getFullImageName, getImageNameNoPath,
		getFullCurrentCommentFileName, getLayersNumber,
		getLayers, getImagesNumber, getCommentFilesNumber,
		setLayerName, getCurrentComOvers, removeComOver,
		rewriteCommentFile, equalizeFiles,
		initForSingleImage, initForArchive,
		removeDefaultLayer, addToCurrentComOvers};
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

