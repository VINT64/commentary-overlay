var Drawing = (function(){

    let mouse = { x: 0, y: 0, startX: 0,
        startY: 0, offsetX: 0, offsetY: 0};
    let drawing = null;
    let moving = { comOver: null, moved: false, w: 0, h: 0};
    //copied from 
	//copied from 
    //copied from 
	//copied from 
    //copied from 
	//copied from 
    //copied from 
	//https://www.w3schools.com/howto/howto_js_draggable.asp
    function dragOverlay(comOver, selectComOver) {
        let ov = comOver.getOverlay();
        ov.onmousedown = dragMouseDown;
        ov.onclick = click;
        
        function click(e){
            if(moving.moved){
                moving.moved = false;
                return;
            }
            selectComOver(comOver);
        }
		function dragMouseDown(e) {
            moving.comOver = comOver;
            moving.moved = false;
            comOver.moving();
			let ev = e || window.event;
			ev.stopPropagation();
			ev.preventDefault();
            // get the mouse cursor position at startup:
            let coords = Element.parseCoordinates(ov);
            mouse.startX = mouse.x - coords.x;
            mouse.startY = mouse.y - coords.y;
            moving.w = coords.w;
            moving.h = coords.h;
			ov.onmouseup = closeDragElement;
		}	
		
		function closeDragElement(e) {
            // stop moving when mouse button is released:
            moving.comOver = null;
            comOver.release();
			ov.onmouseup = null;
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
    
    function keepInBorders(cursor, canvas,
        rightOffset, downOffset){
        if(cursor.x < 0)
            cursor.x = 0;
        else if(cursor.x > canvas.clientWidth - rightOffset)
            cursor.x = canvas.clientWidth - rightOffset;
        if(cursor.y < 0)
            cursor.y = 0;
        else if(cursor.y > canvas.clientHeight - downOffset)
            cursor.y = canvas.clientHeight - downOffset;
   }

    function setMousePosition(e, canvas) { 
        // Stack Overflow code
        let ev = e || window.event; //Moz || IE
        if(ev.pageX) { //Moz
            mouse.x = ev.pageX - mouse.offsetX;
            mouse.y = ev.pageY - mouse.offsetY;
        } else if(ev.clientX) { //IE
            mouse.x = ev.clientX +
                document.body.scrollLeft;
            mouse.y = ev.clientY +
                document.body.scrollTop;
        }
        //canvas border correction
        keepInBorders(mouse, canvas, 0, 0);
    };

    function canvasOnMouseMove(e, canvas, showOnPage){
        updateMouseOffset(canvas);
        setMousePosition(e, canvas);
        let x = e.pageX - mouse.offsetX;
        let y = e.pageY - mouse.offsetY;
        showOnPage(
            'X : ' + mouse.x + ', Y : ' + mouse.y +
            ' (' + e.pageX + ':' + e.pageY + ')');
        if(drawing){
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
        if(moving.comOver){ 
            moving.moved = true;
            let newPos = { x: mouse.x - mouse.startX,
                y: mouse.y - mouse.startY};
            keepInBorders(newPos, canvas, moving.w, moving.h);
			moving.comOver.move(newPos.x, newPos.y);
        }
    }
    
    function canvasOnMouseDown(e, removeFaulty) {
        mouse.startX = mouse.x;
        mouse.startY = mouse.y;
        
        if(drawing !== null)
            removeFaulty(drawing);
        drawing = Element.newDrawing(mouse.x, mouse.y, 0,0); 
        return drawing;
    }

    function canvasOnMouseUp(e, initOverlay) {
        if(drawing !== null){ 
            initOverlay(drawing);
            drawing = null;
        }
    }

    function canvasOnMouseLeave(e, initOverlay){
        if(drawing !== null)
            initOverlay(drawing);
        drawing = null;
    }

    return {
        canvasOnMouseMove: canvasOnMouseMove,
        canvasOnMouseDown: canvasOnMouseDown,
        canvasOnMouseUp: canvasOnMouseUp,
        canvasOnMouseLeave,canvasOnMouseLeave,
        dragOverlay: dragOverlay
    }
}());