/* By: VINT64
All code copied from Stack Overflow and
other places keeps its respective licenses.
All original code is unlicensed (more info
https://unlicense.org ) */


//uses Page, Memory, Document, Json, Language, FileSaver,
//Regexp
//functions from util: 

var FileUtil = (function(){
	function load(){
	
		function clean(){ 
			clearPageImage();
			clearPageFromAllComments();
			removeFileLayers();
		}
		
		function getImageSize(index){
			return new Promise((resolve, reject) => {
				let image = Document.newElement('img');
				let f = new FileReader();
				f.onerror = reject;
				f.onload = (e) => {
					image.onerror = reject;
					image.onload = () => 
						resolve({w: image.naturalWidth,
							h: image.naturalHeight});
					image.src = e.target.result;
				}
				let imageName = getMemoryImageNameWithPath(index);
				if (imageName === null){
					reject('Image name not retrieved');
				}
				let archive = getMemoryArchive();
				archive.file(imageName).async('blob')
					.then((blob) => {
						f.readAsDataURL(blob);
					});
			});
		}
		
		async function addDefaultJsonFileToArchive(index){
			let size = await getImageSize(index);
			let imageName = getMemoryImageNameNoPath(index);
			let defaultLayer = new JsonLayer(DEFAULT_LAYER_NAME,
				[]);
			let body = JSON.stringify(new JsonFile(1, imageName,
				size.w, size.h, [defaultLayer]));
			
			RewriteMemoryCommentFile(index, body);
		}
		
		async function finishLoading(){
			let imagesNum = getMemoryImageListLength();
			let commentsNum = getMemoryCommentFileListLength();
			if (imagesNum <	commentsNum)
				TruncateMemoryCommentFilesList(imagesNum);
			if (imagesNum >	commentsNum) {
				for (let i = commentsNum; i < imagesNum; i++)
					await addDefaultJsonFileToArchive(i);
			}
			disablePageArchiveButtons(false);
		}
		
		let f = getPageFileInput();
		if (!f) return;
		if (ParseUtil.isImageMime(f.type)){
			//image case
			clean();		
			archive = initMemoryForSingleImage(f.name);
			let singleImageReader = new FileReader();
			singleImageReader.onload = (e) => {
				archive.file(
					imageName,
					e.target.result,
					{binary: true});
					finishLoading()
						.then(() => selectFileAndLayer(0, 0));
			}
			singleImageReader.readAsBinaryString(f);
			return;
		}
			
		JSZip.loadAsync(f).then((z) => {
			// archive case
			let tempImages = [];
			let tempJsons = [];
			z.forEach(function (relativePath, zipEntry) {
				let ext = ParseUtil.getExtension(relativePath);
				if( ext == 'png' || ext == 'jpg' ||
					ext == 'jpeg' || ext == 'gif')
					tempImages.push(relativePath);
				if( ext == 'json')
					tempJsons.push(relativePath);
			});
			if (tempImages.length < 1){
				alert(Language.getPhrase('noImagesAlert'));
				return;
			}
			
			tempJsons.sort();
			tempImages.sort();
			
			clean();
			
			initMemoryForArchive(z, tempImages, tempJsons);
			finishLoading().then(() => 
				selectFileAndLayer(0, 0));
		},
		(e) => {
			alert(Language.getPhrase('notImageOrArchiveAlert'));
			console.log(e.message);
		});
	}
	
	function saveJson(){
		let canvas = getPageCanvas();
		if (!canvas) return;
		let imageName = DEFAULT_IMAGE_NAME;
		if (getMemoryImageListLength() > 0)
			imageName = getMemoryImageNameNoPath(
				getMemoryCurrentFile());
		let layers = currentFileLayersListToWrite();
		let body = JSON.stringify(new JsonFile(1, imageName,
			canvas.clientWidth, canvas.clientHeight,
			layers));
		let blob = new Blob([body],	
			{type: 'application/json'});
		let ext = ParseUtil.getExtension(imageName);
		let fileName = (ext === undefined) ? imageName :
			imageName.replace(ext, 'json');
		saveAs(blob, fileName);
	}
	
	function save(){
		let archive = getMemoryArchive();
		if (!archive) return;
		
		saveCurrentFileToArchive().then(() => {
			archive.generateAsync({type:'blob'})
				.then((blob) => {
					saveAs(blob, '');
				});
			});
	}
	
	return {
		load: load,
		saveJson: saveJson,
		save: save
	}	
}())

