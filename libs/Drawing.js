var Drawing = (function(){

    let mouse = { x: 0, y: 0, startX: 0,
        startY: 0, offsetX: 0, offsetY: 0};
    let drawing = null;
    
	//copied from 
	//https://www.w3schools.com/howto/howto_js_draggable.asp
	function dragOverlay(com, ov, selectAction, calcComPos) {
        let latestX = 0, latestY = 0, previousX = 0, previousY = 0;
        let moved = false;
			// otherwise, move the DIV from anywhere inside the DIV:
			ov.onmousedown = dragMouseDown;
            ov.onclick = 


        function click(e){
            if (moved) return;
            selectAction(com, ov);
        }
		function dragMouseDown(e) {
            moved = false;
            Element.useComOver(com, ov);
			let ev = e || window.event;
			ev.stopPropagation();
			ev.preventDefault();
			// get the mouse cursor position at startup:
			previousX = ev.clientX;
            previousY = ev.clientY;
            mouse.startX = mouse.x;
            mouse.startY = mouse.y; 
			ov.onmouseup = closeDragElement;
			ov.onmouseleave = closeDragElement;
			// call a function whenever the cursor moves:
			ov.onmousemove = elementDrag;
		}
		
		function elementDrag(e) {
            moved = true;
            Element.useComOver(com, ov);
			let ev = e || window.event;
			ev.preventDefault();
			// calculate the new cursor position:
			latestX = previousX - ev.clientX;
			latestY = previousY - ev.clientY;
			previousX = ev.clientX;
            previousY = ev.clientY;
            let x = ev.pageX - mouse.offsetX;
            let y = ev.pageY - mouse.offsetY;
			// set the element's new position:
			let newPosX = ov.offsetLeft - latestX
			let newPosY = ov.offsetTop - latestY

			let canvas = Page.getCanvas();
			if (newPosX < 0)
				newPosX = 0;
			else if (newPosX >
				canvas.clientWidth - ov.clientWidth)
					newPosX = canvas.clientWidth - ov.clientWidth;
			if (newPosY < 0)
					newPosY = 0;
			else if (newPosY > 
					canvas.clientHeight - ov.clientHeight)
						newPosY = canvas.clientHeight - ov.clientHeight;
			// console.log(
			// 	'clientWidth : ' + elmnt.clientWidth
			// 	+ ', clientHeight : ' + elmnt.clientHeight +
			// 	' (' + elmnt.naturalWidth + ':' + elmnt.naturalHeight + ')')
				
			//console.log("canvasX: " + canvas.clientWidth + ", canvasY: " + canvas.clientHeight);
			//console.log("X: " + newPosX + ", Y: " + newPosY 
//				+ ", width: " + elmnt.style.width + ", height: " + elmnt.style.height);
			ov.style.top = newPosY + "px";
            ov.style.left = newPosX + "px";
            let pos = calcComPos(ov);
            com.style.left = pos.x + "px";
            com.style.top = pos.y + "px";
		}
		
		function closeDragElement(e) {
            // stop moving when mouse button is released:
            Element.releaseComOver(com, ov);
			ov.onmouseup = null;
			ov.onmousemove = null;
			ov.onmouseleave = null;
		}
	}


    function updateMouseOffset(canvas){
        mouse.offsetX = 0;
        mouse.offsetY = 0;
        let el = canvas;
        while (el) {
            mouse.offsetX += (el.offsetLeft -
                el.scrollLeft +	el.clientLeft);
            mouse.offsetY += (el.offsetTop -
                el.scrollTop + el.clientTop);
            el = el.offsetParent;
        }
    }
    
    function keepInBorders(mouse, canvas){
        if (mouse.x < 0)
            mouse.x = 0;
        else if (mouse.x > canvas.clientWidth)
            mouse.x = canvas.clientWidth;
        if (mouse.y < 0)
            mouse.y = 0;
        else if (mouse.y > canvas.clientHeight)
            mouse.y = canvas.clientHeight;
    }

    function setMousePosition(e, canvas) { 
        // Stack Overflow code
        let ev = e || window.event; //Moz || IE
        if (ev.pageX) { //Moz
            mouse.x = ev.pageX - mouse.offsetX;
            mouse.y = ev.pageY - mouse.offsetY;
        } else if (ev.clientX) { //IE
            mouse.x = ev.clientX +
                document.body.scrollLeft;
            mouse.y = ev.clientY +
                document.body.scrollTop;
        }
        
        //canvas border correction
        keepInBorders(mouse, canvas);
    };

    function canvasOnMouseMove(e, canvas, showOnPage){
        updateMouseOffset(canvas);
        setMousePosition(e, canvas);
        let x = e.pageX - mouse.offsetX;
        let y = e.pageY - mouse.offsetY;
        showOnPage(
            'X : ' + mouse.x + ', Y : ' + mouse.y +
            ' (' + e.pageX + ':' + e.pageY + ')');
        if (drawing === null)
            return;
        drawing.style.width = 
            Math.abs(mouse.x - mouse.startX) + 'px';
        drawing.style.height = 
            Math.abs(mouse.y - mouse.startY) + 'px';
        drawing.style.left = 
            (mouse.x - mouse.startX < 0) ?
            mouse.x + 'px' : mouse.startX + 'px';
        drawing.style.top =
            (mouse.y - mouse.startY < 0) ?
            mouse.y + 'px' : mouse.startY + 'px';
    }
    
    function canvasOnMouseDown(e, initOverlay) {
        mouse.startX = mouse.x;
        mouse.startY = mouse.y;
        
        if (drawing !== null)
            initOverlay(drawing);
        drawing = Element.newOverlay(mouse.x, mouse.y, 0,0); 
        return drawing;
    }

    function canvasOnMouseUp(e, initOverlay) {
        if (drawing !== null){ 
            initOverlay(drawing);
            drawing = null;
        }
    }

    return {
        canvasOnMouseMove: canvasOnMouseMove,
        canvasOnMouseDown: canvasOnMouseDown,
        canvasOnMouseUp: canvasOnMouseUp,
        dragOverlay: dragOverlay
    }
}());