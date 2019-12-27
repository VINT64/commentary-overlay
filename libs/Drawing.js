var Drawing = (function(){

    const OVERLAY_MIN_WIDTH = 3;
    const OVERLAY_MIN_HEIGHT = 3;

    let mouse = { x: 0, y: 0, startX: 0,
        startY: 0, offsetX: 0, offsetY: 0, moved: false};
    let drawing = null;
    let moving = { comOver: null, w: 0, h: 0};
    let resizing = {comOver: null, corner: '',
        offsetX: 0, offsetY: 0};

    //partially copied from 
	//https://www.w3schools.com/howto/howto_js_draggable.asp
    function addDragAndResize(comOver, selectComOver) {
        let ov = comOver.getOverlay();
        ov.onmousedown = dragMouseDown;
        ov.onclick = click;
        let nw = comOver.getNWHandle();
        let se = comOver.getSEHandle();
        nw.onmousedown = function(e){
            resizeMouseDown(e, 'nw');
        }
        se.onmousedown = function(e){
            resizeMouseDown(e, 'se');
        }
        
        function click(e){
            if(mouse.moved){
                mouse.moved = false;
                return;
            }
            selectComOver(comOver);
        }
		function dragMouseDown(e) {
            if (e.button != 0) return;
            //if(resizing.comOver) return;
            moving.comOver = comOver;
            mouse.moved = false;
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
        
        function resizeMouseDown(e, corner){
            if (e.button != 0) return;
            //stopResizing(resizing.comOver, corner, e);
            resizing.comOver = comOver;
            resizing.corner = corner;
            comOver.using();
            let ev = e || window.event;
			ev.stopPropagation();
			ev.preventDefault();
            let coords = Element.parseCoordinates(ov);
            if(corner === 'nw'){
                mouse.startX = coords.x + coords.w;
                mouse.startY = coords.y + coords.h;
                resizing.offsetX = coords.x - mouse.x;
                resizing.offsetY = coords.y - mouse.y;
                nw.onmouseup = closeResizeElement;
            } 
            else if(corner === 'se'){
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
    
    function inBorders(val, min, max){
        return Math.min(Math.max(val, min), max);
    }

    function keepInBorders(cursor, minX, minY, maxX, maxY){
        cursor.x = inBorders(cursor.x, minX, maxX);
        cursor.y = inBorders(cursor.y, minY, maxY);
    }

    function keepOnCanvas(cursor, canvas,
        rightOffset, downOffset){
        keepInBorders(cursor, 0, 0,
            canvas.clientWidth - rightOffset,
            canvas.clientHeight - downOffset);
  }

    function setMousePosition(e, canvas) { 
        // partially copied from Stack Overflow
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

        updateMouseOffset(canvas);
        if(!e){
            console.log('Event has not passed. ' +
                'Maybe browser is too old');
            return;
        }
        //Moz
        mouse.x = e.pageX - mouse.offsetX;
        mouse.y = e.pageY - mouse.offsetY;
    };

    function canvasOnMouseMove(e, canvas, showOnPage){
        mouse.moved = true;
        setMousePosition(e, canvas);
        showOnPage(
            'X : ' + mouse.x + ', Y : ' + mouse.y +
            ' (' + e.pageX + ':' + e.pageY + ')');
        if(drawing){
            //here startX,Y is starting point
            keepOnCanvas(mouse, canvas, 0, 0);
            let width = Math.max(OVERLAY_MIN_WIDTH,
                Math.abs(mouse.x - mouse.startX));
            let height = Math.max(OVERLAY_MIN_HEIGHT,
                Math.abs(mouse.y - mouse.startY));
            let cursor = {
                x: Math.min(mouse.x, mouse.startX),
                y: Math.min(mouse.y, mouse.startY)
            }
            keepOnCanvas(cursor, canvas, OVERLAY_MIN_WIDTH,
                OVERLAY_MIN_HEIGHT);
            Element.setCoordinates(drawing, cursor.x,
                cursor.y, width, height);
        }
        if(moving.comOver){
            //here startX,Y is starting point
            let cursor = { x: mouse.x - mouse.startX,
                y: mouse.y - mouse.startY};
            keepOnCanvas(cursor, canvas, moving.w, moving.h);
			moving.comOver.move(cursor.x, cursor.y);
        }
        if(resizing.comOver){
            //here startX,Y is opposite corner
            let cursor;
            if(resizing.corner === 'nw'){
                let x = inBorders(mouse.x +
                    resizing.offsetX, 0, mouse.startX
                    - OVERLAY_MIN_WIDTH),
                    y = inBorders(mouse.y +
                        resizing.offsetY, 0, mouse.startY
                        - OVERLAY_MIN_HEIGHT);
                cursor = { 
                    x: x,
                    y: y,
                    w: Math.max(mouse.startX - x,
                        OVERLAY_MIN_WIDTH),
                    h: Math.max(mouse.startY - y,
                        OVERLAY_MIN_HEIGHT)
                }
            }
            else if(resizing.corner === 'se'){
                cursor = { 
                    x: mouse.startX,
                    y: mouse.startY,   
                    w: inBorders(mouse.x - resizing.offsetX
                        - mouse.startX, OVERLAY_MIN_WIDTH,
                        canvas.clientWidth - mouse.startX),
                    h: inBorders(mouse.y - resizing.offsetY
                        - mouse.startY, OVERLAY_MIN_HEIGHT,
                        canvas.clientHeight - mouse.startY)
                }
            }
            else return;
            resizing.comOver.resize(cursor.x, cursor.y,
                cursor.w, cursor.h);
        }
    }
    
    function canvasOnMouseDown(e, canvas, removeFaulty) {
        // if(moving.comOver || resizing.comOver)
        //     return;
        setMousePosition(e, canvas);
        mouse.moved = false;
        mouse.startX = inBorders(mouse.x, 0,
            canvas.clientWidth - OVERLAY_MIN_WIDTH);
        mouse.startY = inBorders(mouse.y, 0,
            canvas.clientHeight - OVERLAY_MIN_HEIGHT);
        if(drawing !== null)
            removeFaulty(drawing);
        drawing = Element.newDrawing(mouse.startX,
            mouse.startY, OVERLAY_MIN_WIDTH,
            OVERLAY_MIN_HEIGHT); 
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
        moving.comOver = null;
        stopResizing(resizing.comOver,
            resizing.corner, e);
        resizing.comOver = null;
        stopDrawing(drawing, initOverlay);
        drawing = null;
    }

    function stopMoving(comOver, e){
        if(!comOver) return;
        comOver.getOverlay().onmouseup(e);
    }

    function stopResizing(comOver, corner, e){
        if(!comOver) return;
        if(corner === 'nw')
            comOver.getNWHandle().onmouseup(e);
        else if(corner === 'se')
            comOver.getSEHandle().onmouseup(e);
    }

    function stopDrawing(drawing, initOverlay/*, canvas*/){


        // function safeParse(str){
        //     let ret = parseInt(str, 10);
        //     return Number.isNaN(ret) ? 0 : ret;
        // }

        if(!drawing) return;
        //let top = safeParse(drawing.style.top);
        //let left = safeParse(drawing.style.left);
        //let width = safeParse(drawing.style.width);
        //let height = safeParse(drawing.style.height);
        let ok = (mouse.moved
            //&& width >= OVERLAY_MIN_WIDTH
            //&& height >= OVERLAY_MIN_HEIGHT
            //&& top >= 0 && left >= 0
            //&& left + width <= canvas.clientWidth
            //&& top + height <= canvas.clientHeight
            );
        initOverlay(drawing, ok);
    }
    
    return {
        canvasOnMouseMove: canvasOnMouseMove,
        canvasOnMouseDown: canvasOnMouseDown,
        canvasOnMouseUp: canvasOnMouseUp,
        canvasOnMouseLeave,canvasOnMouseLeave,
        addDragAndResize: addDragAndResize
    }
}());