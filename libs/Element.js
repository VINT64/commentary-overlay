/* By: VINT64
All code copied from Stack Overflow and
other places keeps its respective licenses.
All original code is unlicensed (more info
https://unlicense.org ) */

//uses Document

var Element = (function(){
    const DRAWING_Z_INDEX = 500;
	const DISABLED_ATTRIBUTE = 'disabled'
	
	function toggleClass(el, cl, flag){
		if(!el) return;
		if(flag)
			el.classList.add(cl);
		else
			el.classList.remove(cl);
	}

	function disable(element, flag){
		if(!element) return;
		if(flag)
			element.setAttribute(
				DISABLED_ATTRIBUTE, true);
		else
			element.removeAttribute(DISABLED_ATTRIBUTE);
	}

	function toggleHidden(el, flag){
		if(!el) return;
		el.style.visibility = flag ? 'hidden' : 'visible';
	}
	

	function newDrawing(x, y, width, height){
		let drawing = Document.newElement('div');
		drawing.style.left = x + 'px';
		drawing.style.top = y + 'px';
		drawing.style.width = width + 'px';
		drawing.style.height = height + 'px';
		drawing.classList.add('drawing');
		drawing.style.zIndex = DRAWING_Z_INDEX;
		return drawing;
	}

	function newImage(src){
		let img = Document.newElement('img');
		img.src = src;
		return img;
	}
	
	function newTemplate(content){
		let template = Document.newElement('template');
		template.innerHTML = content;
		return template;
	}

	function newOption(text){
		let option = Document.newElement('option');
		option.text = text;
		return option;
	}

	function parseCoordinates(div){
		
		function safeParse(str){
			let ret = parseInt(str, 10);
			return Number.isNaN(ret) ? 0 : ret;
		}

		return {
			x: safeParse(div.style.left),
			y: safeParse(div.style.top),
			w: safeParse(div.style.width),
			h: safeParse(div.style.height),
		}
	}

	function setCoordinates(div, x, y, w, h){
		div.style.left = x + 'px';
		div.style.top = y + 'px';
		if(w > 0)
			div.style.width = w + 'px';
		if(h > 0)
		div.style.height = h + 'px';

	}

	function clearSelect(select){
		if(!select) return;
		for(let i = select.options.length - 1;
			i >= 0; i--)
			select.remove(i);
	}

	return {
		toggleClass: toggleClass,
		disable: disable,
		toggleHidden: toggleHidden,
		newDrawing: newDrawing,
		newImage: newImage,
		newTemplate: newTemplate,
		newOption: newOption,
		parseCoordinates: parseCoordinates,
		setCoordinates: setCoordinates,
		clearSelect: clearSelect,
	}
}());
