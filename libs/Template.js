/* By: VINT64
All code copied from Stack Overflow and
other places keeps its respective licenses.
All original code is unlicensed (more info
https://unlicense.org ) */

//uses Document

var Template = (function(){
	const templates = {
		viewerHTML: 
`<div>
	<div id="controlPanel">
		<p>
			<button type="button" 
				id="editorButton" 
				onclick="Main.launch('editor')">
			</button>
			<select id="languageSelect" 
				onchange="Main.updateLanguage()">
			</select>
		</p>
		<p>
			<input type="file" id="fileInput">
			<button type="button" 
				id="loadButton" 
				onclick="Page.triggerFileInput()">
			</button>
			<button type="button" 
				id="saveArchiveButton" 
				onclick="FileUtil.save()">
			</button>
		</p>
		<p>
			<span id="fileInfo"></span>
			<select id="layerSelect" 
			onchange="Main.updateLayer()">
			</select>
		</p>
	</div>
	<div id="gallery">
		<button type="button" 
			class="nav" 
			onclick="Main.goLeft()">
			&lt;
		</button>
		<div id="imageDiv">
			<div id="allCommentsDiv"></div>
		</div>
		<button type="button" 
			class="nav"
			onclick="Main.goRight()">
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
				id="viewerButton" 
				onclick="Main.launch('viewer')">
			</button>
			<select id="languageSelect" 
				onchange="Main.updateLanguage()">
			</select>
		</p>
		<p>
			<input type="file" id="fileInput">
			<button type="button" 
				id="loadButton" 
				onclick="Page.triggerFileInput()">
			</button>
			<button type="button" 
				id="clearArchiveButton" 
				onclick="Main.clearArchive()">
			</button>
			</button>
			<button type="button" 
				id="saveArchiveButton" 
				onclick="FileUtil.save()">
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
			<select id="layerSelect" 
			onchange="Main.updateLayer()">
			</select>
			<button type="button" 
				id="addLayerButton" 
				onclick="Main.addEmptyLayer()">
			</button>
			<button type="button" 
				id="removeLayerButton" 
				onclick="
					Main.removeCurrentLayer()">
			</button>
		</p>
		<p>
			<input type="number" 
				class="numInput" 
				id="widthInput" 
				min="1" value="512">
			<input type="number" 
				class="numInput" 
				id="heightInput" 
				min="1" value="512">
			<button type="button" 
				id="removeAllCommentsFromLayerButton" 
				onclick="Main.clearCurrentLayer()">
			</button>
			<button type="button" 
				id="saveJsonButton" 
				onclick="FileUtil.saveJson()">
			</button>
		</p>
		<p>
			<label for="commentInput" 
				id="commentLabel">
			</label>
			<input type="text" 
			id="commentInput">
			<button type="button" 
				id="removeCommentButton" 
				onclick="
				Main.removeSelectedComment()">
			</button>
		</p>
		<p>
			<span id="coordinatesInfo">
				&nbsp;
			</span>
		</p>
	</div>
	<div id="gallery">
		<button type="button" class="nav" 
			onclick="Main.goLeft()">
			&lt;
		</button>
		<div id="canvasDiv"></div>
		<div id="imageDiv"></div>
		<button type="button" class="nav" 
			onclick="Main.goRight()">
			&gt;
		</button>
	</div>
</div>`
	}
	
	function get(mode){	
		let template = Document.newElement('template');
		switch(mode){
			case 'viewer':
				template.innerHTML = templates.viewerHTML;
				break;
			case 'editor':
				template.innerHTML = templates.editorHTML;
				break;
			default:
				console.log('Unknown mode: ', mode);
				template.innerHTML = '';
				return null;
		}
		return template;
	}

	return {
		get: get
	}
}());

