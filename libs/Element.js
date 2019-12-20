/* By: VINT64
All code copied from Stack Overflow and
other places keeps its respective licenses.
All original code is unlicensed (more info
https://unlicense.org ) */

//uses Document

var Element = (function(){
    const DRAWING_Z_INDEX = 500;
	const DISABLED_ATTRIBUTE = 'disabled'
	
	function toggleClass(element, cl, flag){
		if(!element) return;
		if(flag)
			element.classList.add(cl);
		else
			element.classList.remove(cl);
	}

	function disable(element, flag){
		if(!element) return;
		if(flag)
			element.setAttribute(
				DISABLED_ATTRIBUTE, true);
		else
			element.removeAttribute(DISABLED_ATTRIBUTE);
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
		return {
			x: parseInt(div.style.left, 10),
			y: parseInt(div.style.top, 10),
			w: parseInt(div.style.width, 10),
			h: parseInt(div.style.height, 10),
		}
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
		newDrawing: newDrawing,
		newImage: newImage,
		newTemplate: newTemplate,
		newOption: newOption,
		parseCoordinates: parseCoordinates,
		clearSelect: clearSelect
	}
}());
