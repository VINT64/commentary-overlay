/* By: VINT64
All code copied from Stack Overflow and
other places keeps its respective licenses.
All original code is unlicensed (more info
https://unlicense.org ) */

//uses Element

var Template = (function(){
	const templates = {
		viewerHTML: 
`<div>
	<div id="controlPanel">
		<p>
			<button type="button" 
				id="editorButton">
			</button>
			<select id="languageSelect">
			</select>
		</p>
		<p>
			<input type="file" id="fileInput">
			<button type="button" 
				id="loadButton">
			</button>
			<button type="button" 
				id="saveArchiveButton">
			</button>
		</p>
		<p>
			<span id="fileInfo"></span>
			<select id="layerSelect">
			</select>
		</p>
	</div>
	<div id="gallery">
		<button type="button" id="leftButton"
			class="nav">
			&lt;
		</button>
		<div id="imageDiv">
			<div id="allCommentsDiv"></div>
		</div>
		<button type="button" id="rightButton"
			class="nav">
			&gt;
		</button>
	</div>
</div>`
		,
		editorHTML: 
`<div>
	<div id="controlPanel">
		<p>
			<button type="button" 
				id="viewerButton">
			</button>
			<select id="languageSelect">
			</select>
		</p>
		<p>
			<input type="file" id="fileInput">
			<button type="button" 
				id="loadButton">
			</button>
			<button type="button" 
				id="clearArchiveButton">
			</button>
			</button>
			<button type="button" 
				id="saveArchiveButton">
			</button>
			<button type="button" 
				id="saveJsonButton">
			</button>
		</p>
		<p>
			<span id="fileInfo"></span>
		</p>
		<p>
			<label for="layerInput" 
				id="layerLabel">
			</label>
			<input type="text" 
			id="layerInput">
			<select id="layerSelect">
			</select>
			<button type="button" 
				id="addLayerButton">
			</button>
			<button type="button" 
				id="removeLayerButton">
			</button>
		</p>
		<p>
			<input type="number" 
				class="numInput" 
				id="widthInput" 
				min="1">
			<input type="number" 
				class="numInput" 
				id="heightInput" 
				min="1">
			<button type="button" 
				id="removeAllCommentsFromLayerButton">
			</button>
		</p>
		<p>
			<label for="commentInput" 
				id="commentLabel">
			</label>
			<textarea rows=1
			id="commentInput">
			</textarea>
			<button type="button" 
				id="removeCommentButton">
			</button>
		</p>
		<p>
			<span id="coordinatesInfo">
				&nbsp;
			</span>
		</p>
	</div>
	<div id="gallery">
		<button type="button" id="leftButton"
			class="nav">
			&lt;
		</button>
		<div id="canvasDiv"></div>
		<div id="imageDiv"></div>
		<button type="button" id="rightButton"
			class="nav">
			&gt;
		</button>
	</div>
</div>`
	}
	
	function get(mode){	
		let content;
		switch(mode){
			case 'viewer':
				content = templates.viewerHTML;
				break;
			case 'editor':
				content = templates.editorHTML;
				break;
			default:
				console.log('Unknown mode: ', mode);
				return null;
		}
		return Element.newTemplate(content)
			.content.firstChild;
	}

	return {
		get: get
	}
}());

