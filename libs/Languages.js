const langs = [
	{	
		id: 'ru',
		loadButton: 'Загрузить архив',
		editorButton: 'Перейти в редактор',
		viewerButton: 'Перейти в просмотрщик',
		clearArchiveButton: 'Чистый холст',
		removeAllCommentsButton: 'Удалить все комментарии',
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
		removeAllCommentsConfirm: 
			'Удалить все комментарии?',
		LoseDefaultLayerConfirm: 
			'При смене режима холст без изображения ' +
			'будет потерян. Продолжить?',
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
		editorButton: 'Editor',
		viewerButton: 'Viewer',
		clearArchiveButton: 'Pure canvas',
		removeAllCommentsButton: 'Remove all commentaries',
		addLayerButton: 'New layer',
		removeLayerButton: 'Delete layer',
		saveJsonButton: 'Save commentaries',
		removeCommentButton: 'Remove selected',
		saveArchiveButton: 'Save Archive',
		commentLabel: 'Commentary: ',
		layerLabel: 'Layer: ',
		removeLayerConfirm: 'Delete current layer?',
		removeAllCommentsConfirm: 'Remove all comments?',
		LoseDefaultLayerConfirm: 
			'With mode change canvas without image ' +
			'will be lost. Continue?',
		removeArchiveConfirm: 
			'Archive will be lost, continue?',
		lastLayerAlert: 'Cannot delete last layer',
		noImagesAlert: 'No images in this archive!',
		notImageOrArchiveAlert: 'Not an image or archive!'
	}
];

let currentLanguage = '';

function setPageLanguage(){
	langs.forEach((lang, i, a) => {
		if (lang.id == currentLanguage)
			for (let key in lang){
				let el = getElement(key);
				if (el)
					el.textContent = lang[key];
			}
	});
}

function getLanguagePhrase(phrase){
	let ret = '';
	langs.forEach((lang, i, a) => {
		if (lang.id == currentLanguage)
			ret = lang[phrase];
	});
	return ret;
}

function addLangOptionsToSelect(select){
	langs.forEach((lang, i, a) => {
		let option = newElement('option');
		option.text = lang.id;
		select.add(option);
	});
	select.value = currentLanguage;
}

function setDefaultLanguageIfEmpty(){
	if (currentLanguage == '')
		currentLanguage = langs[0].id;
}
