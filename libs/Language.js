/* By: VINT64
All code copied from Stack Overflow and
other places keeps its respective licenses.
All original code is unlicensed (more info
https://unlicense.org ) */

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
	
	function findCurrent(){
		return langs.find(
			lang => lang.id == currentLanguage);
	}

	function applyCurrent(apply){
		let lang = findCurrent();
		if(lang)
			apply(lang);
	}

	function set(language, apply){
		currentLanguage = language;
		applyCurrent(apply);
	}
	
	function getPhrase(phrase){
		let lang = findCurrent();
		if(lang && lang[phrase])
			return lang[phrase];
		return phrase;
	}
	
	function getList(){
		let ret = [];
		for(const lang of langs){
			ret.push(lang.id);
		}
		return ret;
	}

	function init(){
		if (currentLanguage == '')
			currentLanguage = 'en';
	}
	

	return {
		applyCurrent: applyCurrent,
		set: set,
		getPhrase: getPhrase,
		getList: getList,
		init: init
	}
}());

