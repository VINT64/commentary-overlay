
const templates = {
	viewerHTML: 
		`<div>
			<div class="upperRight">
				<button type="button" 
					id="editorButton" 
					onclick="launch('editor')">
				</button>
				<br>
				<select id="languageSelect" 
					onchange="updateLanguage()">
				</select>
			</div>
			<div id="controlPanel">
				<p>
					<input type="file" id="fileInput">
					<button type="button" 
						id="loadButton" 
						onclick="triggerFileInput()">
					</button>
					<button type="button" 
						id="saveArchiveButton" 
						onclick="saveArchive()">
					</button>
				</p>
				<p>
					<span id="fileInfo"></span>
					<select id="layerSelect" 
					onchange="updateLayer()">
					</select>
				</p>
			</div>
			<div id="gallery">
				<button type="button" 
					class="nav"onclick="goLeft()">
					&lt;
				</button>
				<div id="imageDiv">
					<div id="allCommentsDiv"></div>
				</div>
				<button type="button" 
					class="nav"onclick="goRight()">
					&gt;
				</button>
			</div>
		</div>`,
	editorHTML: 
		`<div>
			<div class="upperRight">
				<button type="button" 
					id="viewerButton" 
					onclick="launch('viewer')">
				</button>
				<br>
				<select id="languageSelect" 
					onchange="updateLanguage()">
				</select>
				<br>
				<span id="coordinatesInfo">
					&nbsp;
				</span>
			</div>
			<div id="controlPanel">
				<p>
					<input type="file" id="fileInput">
					<button type="button" 
						id="loadButton" 
						onclick="triggerFileInput()">
					</button>
					<button type="button" 
						id="clearArchiveButton" 
						onclick="clearArchive()">
					</button>
					</button>
					<button type="button" 
						id="saveArchiveButton" 
						onclick="saveArchive()">
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
					onchange="updateLayer()">
					</select>
					<button type="button" 
						id="addLayerButton" 
						onclick="addEmptyLayer()">
					</button>
					<button type="button" 
						id="removeLayerButton" 
						onclick="removeCurrentLayer()">
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
						id="removeAllCommentsButton" 
						onclick="clearCanvas()">
					</button>
					<button type="button" 
						id="saveJsonButton" 
						onclick="saveCurrentJson()">
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
						removeSelectedComment()">
					</button>
				</p>
			</div>
			<div id="gallery">
				<button type="button" class="nav" 
					onclick="goLeft()">
					&lt;
				</button>
				<div id="canvasDiv"></div>
				<div id="imageDiv"></div>
				<button type="button" class="nav" 
					onclick="goRight()">
					&gt;
				</button>
			</div>
		</div>`
}
