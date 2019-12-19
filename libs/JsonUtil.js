/* By: VINT64
All code copied from Stack Overflow and
other places keeps its respective licenses.
All original code is unlicensed (more info
https://unlicense.org ) */


//uses memory structure of comOver. Create object with new,
//getters and setters?

function JsonFile1(imageName,
	imageWidth, imageHeight, layers){
		this.version = 1; 
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

var JsonUtil = (function(){

	function convertLayersList(layers){
		
		function convertComOversList(comovers){
			let jsonComs = [];
			for(let i = comovers.length - 1; i >= 0; i--){
				let comOver = comovers[i];
				if (comOver.notComplete()){
					continue;
				}
				let ov = comOver.getOverlay();
				let text = comOver.getText();
				if (!ov || text === null){
					continue;
				}
				let coords = Element.parseCoordinates(ov);
				jsonComs.push(new JsonComment(
					coords.x, coords.y, coords.x + coords.w,
					coords.y + coords.h, text));
			}
			jsonComs.reverse();
			return jsonComs;
		}
	
		let ret = [];
		let l = layers.length;
		for (let i = 0; i < l; i++){
			let jsonComs = convertComOversList(
				layers[i].getComOversList());
			ret.push(new JsonLayer(layers[i].getName(),
				 jsonComs));
		}
		return ret;
	}
	
	function convertToComOver(jsonComment, editorMode, listeners){
		return new ComOver(jsonComment.x1,
			jsonComment.y1, jsonComment.x2 - jsonComment.x1,
			jsonComment.y2 - jsonComment.y1, jsonComment.text,
			editorMode, listeners)
	}
	
	function getFileLayersList(json){
		return json.layers;
	}
	
	function getLayerName(json){
		return json.layer_name;
	}
	
	function getLayerCommentsList(json){
		return json.comments;
	}
	
	return {
		convertToComOver: convertToComOver,
		convertLayersList: convertLayersList,
		getFileLayersList: getFileLayersList,
		getLayerName: getLayerName,
		getLayerCommentsList: getLayerCommentsList
	}
}());
