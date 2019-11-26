/* By: VINT64
All code copied from Stack Overflow and
other places keeps its respective licenses.
All original code is unlicensed (more info
https://unlicense.org ) */


//uses memory structure of comOver. Create object with new,
//getters and setters?

const COMMENT_VERTICAL_OFFSET = 5;
const COMMENT_HORIZONTAL_OFFSET = 0;

function convertLayersListToJsonData(layers){
	
	function convertCommentsListToJsonData(comments){
		let coms = [];
		for(let i = comments.length - 1; i >= 0; i--){
			let com = comments[i];
			if (!com.commentOverlayDiv || !com.commentDiv)
				continue;
			let ov = com.commentOverlayDiv;
			let x = parseInt(ov.style.left);
			let y = parseInt(ov.style.top);
			let w = parseInt(ov.style.width);
			let h = parseInt(ov.style.height);
			coms.push(new JsonComment(x, y, x + w, y + h,
				com.commentDiv.textContent));
		}
		return coms;
	}

	let ret = [];
	let l = layers.length;
	for (let i = 0; i < l; i++){
		let coms = convertCommentsListToJsonData(
			layers[i].comments);
		ret.push(new JsonLayer(layers[i].name, coms));
	}
	return ret;
}

function convertJsonToNewComOver(jsonComment, overlayFun){
	let commentOverlay = newDocumentElement('div');
	commentOverlay.style.left = jsonComment.x1 + 'px';
	commentOverlay.style.top = jsonComment.y1 + 'px';
	commentOverlay.style.width = (jsonComment.x2 -
		jsonComment.x1) + 'px';
	commentOverlay.style.height = (jsonComment.y2 -
		jsonComment.y1) + 'px';
	let comment = newCommentElement(
		jsonComment.x1 + COMMENT_HORIZONTAL_OFFSET,
		jsonComment.y2 + COMMENT_VERTICAL_OFFSET,
		jsonComment.text, commentOverlay);
	overlayFun(commentOverlay);
	return {commentDiv: comment, 
		commentOverlayDiv: commentOverlay};
}

function getJsonLayers(json){
	return json.layers;
}

function getJsonLayerName(json){
	return json.layer_name;
}

function getJsonLayerComments(json){
	return json.comments;
}

function JsonFile(version, imageName,
	imageWidth, imageHeight, layers){
		this.version = version; 
		this.image_name = imageName;
		this.image_width = imageWidth;
		this.image_height = imageHeight;
		this.layers = layers;
}

function JsonLayer(name, commentList){
	this.layer_name = name;
	this.comments = commentList;
}

function JsonComment(x1, y1, x2, y2, text){
	this.x1 = x1;
	this.y1 = y1;
	this.x2 = x2;
	this.y2 = y2;
	this.text = text;
}