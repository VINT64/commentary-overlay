/* By: VINT64
All code copied from Stack Overflow and
other places keeps its respective licenses.
All original code is unlicensed (more info
https://unlicense.org ) */

//uses Document

var Language = (function(){

	const langs = [
		{	
			id: 'ru',
			loadButton: 'Загрузить архив',
			editorButton: 'Перейти в редактор',
			viewerButton: 'Перейти в режим просмотра',
			clearArchiveButton: 'Чистый холст',
			removeAllCommentsFromLayerButton: 
				'Удалить все комментарии со слоя',
			addLayerButton: 'Новый слой',
			removeLayerButton: 'Удалить слой',
			saveJsonButton: 'Сохранить комментарии',
			removeCommentButton: 
				'Удалить выбранный комментарий',
			saveArchiveButton:
				'Сохранить архив',
			commentLabel: 'Комментарий: ',
			layerLabel: 'Слой: ',
			removeLayerConfirm: 'Удалить текущий слой?',
			removeAllCommentsFromLayerConfirm: 
				'Удалить все комментарии со слоя?',
			LoseDefaultLayerConfirm: 
				'Текущие комментарии ' +
				'на холсте будут потеряны. Продолжить?',
			removeArchiveConfirm: 
				'Архив будет потерян, продолжить?',
			lastLayerAlert: 'Нельзя удалить последний слой',
			noImagesAlert: 'В этом архиве нет изображений!',
			notImageOrArchiveAlert:
				'Не изображение и не архив!'
		},
		{	
			id: 'en',
			loadButton: 'Load archive',
			editorButton: 'Go to editor mode',
			viewerButton: 'Go to viewer mode',
			clearArchiveButton: 'Blank canvas',
			removeAllCommentsFromLayerButton: 
				'Remove all commentaries from layer',
			addLayerButton: 'New layer',
			removeLayerButton: 'Delete layer',
			saveJsonButton: 'Save commentaries',
			removeCommentButton: 'Remove selected',
			saveArchiveButton: 'Save Archive',
			commentLabel: 'Commentary: ',
			layerLabel: 'Layer: ',
			removeLayerConfirm: 'Delete current layer?',
			removeAllCommentsFromLayerConfirm: 
				'Remove all commentaries from layer?',
			LoseDefaultLayerConfirm: 
				'Current comments on image ' +
				'will be lost. Continue?',
			removeArchiveConfirm: 
				'Archive will be lost, continue?',
			lastLayerAlert: 'Cannot delete last layer',
			noImagesAlert: 'No images in this archive!',
			notImageOrArchiveAlert: 'Not an image or archive!'
		}
	];
	
	let currentLanguage = '';
	
	function update(){
		langs.forEach((lang, i, a) => {
			if (lang.id == currentLanguage)
				for (let key in lang){
					let el = Document.getElement(key);
					if (el)
						el.textContent = lang[key];
				}
		});
	}
	
	function set(language){
		currentLanguage = language;
		update();
	}
	
	function getPhrase(phrase){
		let ret = phrase;
		langs.forEach((lang, i, a) => {
			if (lang.id == currentLanguage)
				ret = lang[phrase];
		});
		if (ret === undefined)
			ret = phrase;
		return ret;
	}
	
	function addOptions(select){
		langs.forEach((lang, i, a) => {
			let option = Document.newElement('option');
			option.text = lang.id;
			select.add(option);
		});
		select.value = currentLanguage;
	}
	
	function init(){
		if (currentLanguage == '')
			currentLanguage = 'en';
	}
	

	return {
		update: update,
		set: set,
		getPhrase: getPhrase,
		addOptions: addOptions,
		init: init
	}
}());

