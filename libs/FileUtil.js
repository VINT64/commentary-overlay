/* By: VINT64
All code copied from Stack Overflow and
other places keeps its respective licenses.
All original code is unlicensed (more info
https://unlicense.org ) */


//uses Memory, Json, Language, FileSaver,
//parseUtil
//functions from util: 

var FileUtil = (function(){

	function currentFileLayersListToWrite(){
	
		let layersList = Memory.getLayers();
		if(!Array.isArray(layersList)){
			console.log('currentFileLayersListToWrite ' +
			'panic, not an array: ' + i);
				return [];
		}
		return JsonUtil.convertLayersList(layersList);
	}

	function load(file, clean, afterLoading){
	
		function getImageSize(index){
			return new Promise((resolve, reject) => {
				let f = new FileReader();
				f.onerror = reject;
				f.onload = (e) => {
					let image = Element.newImage(
						e.target.result);
					image.onerror = reject;
					image.onload = () => 
						resolve({w: image.naturalWidth,
							h: image.naturalHeight});
				}
				let imageName =
					Memory.getFullImageName(index);
				if(imageName === null){
					reject('Image name not retrieved');
				}
				Memory.getArchive().file(imageName)
					.async('blob').then((blob) => {
						f.readAsDataURL(blob);
					});
			});
		}
		
		async function addDefaultJsonFileToArchive(index){
			let size = await getImageSize(index);
			let imageName = Memory.getImageNameNoPath(index);
			let defaultLayer = 
				new JsonLayer(DEFAULT_LAYER_NAME, []);
			let body = JSON.stringify(new JsonFile1(
				imageName, size.w, size.h, [defaultLayer]));
			
			Memory.rewriteCommentFile(index, body);
		}
		
		function finishLoading(){
			Memory.equalizeFiles(
				addDefaultJsonFileToArchive).then(
				afterLoading);
		}
		
		if(!file) return;
		if(ParseUtil.isImageMime(file.type)){
			//image case
			clean();		
			archive = Memory.initForSingleImage(file.name);
			let singleImageReader = new FileReader();
			singleImageReader.onload = (e) => {
				archive.file(
					imageName,
					e.target.result,
					{binary: true});
					finishLoading();
			}
			singleImageReader.readAsBinaryString(file);
			return;
		}
			
		JSZip.loadAsync(file).then((z) => {
			// archive case
			let tempImages = [];
			let tempJsons = [];
			z.forEach(function (relativePath, zipEntry) {
				let ext = 
					ParseUtil.getExtension(relativePath);
				if( ext == 'png' || ext == 'jpg' ||
					ext == 'jpeg' || ext == 'gif')
					tempImages.push(relativePath);
				if( ext == 'json')
					tempJsons.push(relativePath);
			});
			if(tempImages.length < 1){
				alert(Language.getPhrase('noImagesAlert'));
				return;
			}
			
			tempJsons.sort();
			tempImages.sort();
			
			clean();
			
			Memory.initForArchive(z, tempImages, tempJsons);
			finishLoading();
		},
		(e) => {
			alert(Language.getPhrase(
				'notImageOrArchiveAlert'));
			console.log(e.message);
		});
	}
	
	function saveJson(width, height){
		let layers = currentFileLayersListToWrite();
		let imageName = DEFAULT_IMAGE_NAME;
		if(Memory.getImagesNumber() > 0)
			imageName = Memory.getImageNameNoPath(
				Memory.getCurrentFileIndex());
		let body = JSON.stringify(new JsonFile1(imageName,
			width, height, layers));
		let blob = new Blob([body],	
			{type: 'application/json'});
		let ext = ParseUtil.getExtension(imageName);
		let fileName = (ext === undefined) ? imageName :
			imageName.replace(ext, 'json');
		saveAs(blob, fileName);
	}
	
	function save(logError){
		saveJsonToArchive(logError).then((archive) => {
			archive.generateAsync({type:'blob'})
				.then((blob) => {
					saveAs(blob, '');
				});
			});
	}
	
	function saveJsonToArchive(logError){
		return new Promise((resolve, reject) => {
			let f = new FileReader();
			let filename = 
				Memory.getFullCurrentCommentFileName();
			let archive = Memory.getArchive();
			f.onload = (e) => {
				let file = JSON.parse(e.target.result);
				file.layers = 
					currentFileLayersListToWrite();
				archive.file(filename,
					JSON.stringify(file));
				resolve(archive);
			};
			archive.file(filename).async('blob')
				.then((blob) => {
					f.readAsText(blob);
				}, () => {logError(), reject()}
			);
			
		});
	}	


	return {load, saveJson, saveJsonToArchive, save};
}())

