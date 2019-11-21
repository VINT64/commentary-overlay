/* By: VINT64
All code copied from Stack Overflow and
other places keeps its respective licenses.
All original code is unlicensed (more info
https://unlicense.org ) */


//uses memory structure of comOver. Create object with new,
//getters and setters?

const COMMENT_VERTICAL_OFFSET = 5;
const COMMENT_HORIZONTAL_OFFSET = 0;

function convertLayersListToData(layers){
	
	function convertCommentsListToData(comments){
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
			coms.push({x1: x, y1: y, x2: x + w, y2: y + h,
				text: com.commentDiv.textContent});
		}
		return coms;
	}

	let ret = [];
	let l = layers.length;
	for (let i = 0; i < l; i++){
		let coms = convertCommentsListToData(
			layers[i].comments);
		ret.push({layer_name: layers[i].name,
			comments: coms});
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

function convertJsonToLayerNameAndListPair(
	json, overlayFun){
	
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