var Drawing = (function(){

    let mouse = { x: 0, y: 0, startX: 0,
        startY: 0, offsetX: 0, offsetY: 0,
        rawX: 0, rawY: 0};
    let drawing = null;
    let moving = { comOver: null, moved: false, w: 0, h: 0};
    let resizing = {comOver: null, nw: false,
        offsetX: 0, offsetY: 0};
    //copied from 
	//https://www.w3schools.com/howto/howto_js_draggable.asp
    function dragOverlay(comOver, selectComOver) {
        let ov = comOver.getOverlay();
        ov.onmousedown = dragMouseDown;
        ov.onclick = click;
        let nw = comOver.getNWHandle();
        let se = comOver.getSEHandle();
        nw.onmousedown = function(e){
            resizeMouseDown(e, true);
        }
        se.onmousedown = function(e){
            resizeMouseDown(e, false);
        }
        
        function click(e){
            if(moving.moved){
                moving.moved = false;
                return;
            }
            selectComOver(comOver);
        }
		function dragMouseDown(e) {
            //if(resizing.comOver) return;
            moving.comOver = comOver;
            moving.moved = false;
            comOver.using();
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
        
        function resizeMouseDown(e, nwbool){
            //stopResizing(resizing.comOver, resizing.nw, e);
            resizing.comOver = comOver;
            resizing.nw = nwbool;
            comOver.using();
            let ev = e || window.event;
			ev.stopPropagation();
			ev.preventDefault();
            let coords = Element.parseCoordinates(ov);
            if(nwbool){
                mouse.startX = coords.x + coords.w;
                mouse.startY = coords.y + coords.h;
                resizing.offsetX = coords.x - mouse.x;
                resizing.offsetY = coords.y - mouse.y;
                nw.onmouseup = closeResizeElement;
            } 
            else{
                mouse.startX = coords.x;
                mouse.startY = coords.y;
                resizing.offsetX = mouse.x - 
                    (coords.x + coords.w);
                resizing.offsetY = mouse.y -
                    (coords.y + coords.h);
                se.onmouseup = closeResizeElement;
            }
        }
        function closeResizeElement(e) {
            resizing.comOver = null;
            comOver.release();
            nw.onmouseup = null;
            se.onmouseup = null;
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
        mouse.rawX = mouse.x;
        mouse.rawY = mouse.y;
        keepInBorders(mouse, canvas, 0, 0);
    };

    function canvasOnMouseMove(e, canvas, showOnPage){
        updateMouseOffset(canvas);
        setMousePosition(e, canvas);
        let x = e.pageX - mouse.offsetX;
        let y = e.pageY - mouse.offsetY;
        showOnPage(
            'X : ' + mouse.x + ', Y : ' + mouse.y +
            ' (' + mouse.rawX + ':' + mouse.rawY + ')');
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
        if(resizing.comOver){
            let newPos;
            if(resizing.nw){
                newPos = { 
                    x: mouse.rawX + resizing.offsetX,
                    y: mouse.rawY + resizing.offsetY,
                }
                keepInBorders(newPos, canvas, 0, 0);
                newPos.w = mouse.startX - 
                    newPos.x;
                newPos.h = mouse.startY - 
                    newPos.y;
                if (newPos.x >= mouse.startX)
                newPos.x = mouse.startX - 1;
                if (newPos.y >= mouse.startY)
                newPos.y = mouse.startY - 1;
                if (newPos.w <= 0)
                    newPos.w = 1;
                if (newPos.h <= 0)
                    newPos.h = 1;

            }
            else{
                newPos = { 
                    x: mouse.startX,
                    y: mouse.startY,   
                    w: mouse.rawX - resizing.offsetX
                        - mouse.startX,
                    h: mouse.rawY - resizing.offsetY
                        - mouse.startY
                }
                if(newPos.w > canvas.clientWidth - newPos.x)
                    newPos.w = canvas.clientWidth - newPos.x;
                if(newPos.h > canvas.clientHeight - newPos.y)
                    newPos.h = canvas.clientHeight - newPos.y;
                if(newPos.w <= 0)
                    newPos.w = 1;
                if(newPos.h <= 0)
                    newPos.h = 1;
            }
            resizing.comOver.resize(newPos.x, newPos.y,
                newPos.w, newPos.h);
        }
    }
    
    function canvasOnMouseDown(e, removeFaulty) {
        // if(moving.comOver || resizing.comOver)
        //     return;
        mouse.startX = mouse.x;
        mouse.startY = mouse.y;
        
        if(drawing !== null)
            removeFaulty(drawing);
        drawing = Element.newDrawing(mouse.x, mouse.y, 0,0); 
        return drawing;
    }

    function canvasOnMouseUp(e, initOverlay) {
        stopAllActions(e, initOverlay);
    }

    function canvasOnMouseLeave(e, initOverlay){
        stopAllActions(e, initOverlay);
    }

    function stopAllActions(e, initOverlay){
        stopMoving(moving.comOver, e);
        stopResizing(resizing.comOver, resizing.nw, e);
        stopDrawing(drawing, initOverlay);
        drawing = null;
    }

    function stopMoving(comOver, e){
        if(!comOver) return;
        comOver.getOverlay().onmouseup(e);
    }

    function stopResizing(comOver, nw, e){
        if(!comOver) return;
        if(nw)
            comOver.getNWHandle().onmouseup(e);
        else
            comOver.getSEHandle().onmouseup(e);
    }

    function stopDrawing(drawing, initOverlay){
        if(!drawing) return;
        initOverlay(drawing);
    }
    
    return {
        canvasOnMouseMove: canvasOnMouseMove,
        canvasOnMouseDown: canvasOnMouseDown,
        canvasOnMouseUp: canvasOnMouseUp,
        canvasOnMouseLeave,canvasOnMouseLeave,
        dragOverlay: dragOverlay
    }
}());