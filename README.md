# Программа для просмотра и редактирования оверлеев с комментариями для изображений
##### Версия: бета3 (2018-12-03)
Поддерживаемые архивы: zip.
Поддерживаемые изображения:  png/jpeg/gif.
##### Инструкции: 
Открыть HTML с программой. В программе два режима: просмотрщик и редактор.
###### Режим просмотрщика: 
Выбрать архив с одинаковым количеством изображений и json файлов с комментариями (все должны соответствовать json-схеме). Изображения и комментарии будут загружены и отсортированы в лексикографическом порядке (10.jpg будет раньше, чем 8.jpg, но позже, чем 08.jpg) и сопоставлены соответственно.
По наведению на оверлей появляется комментарий. По щелчку на любом участке изображения все оверлеи скрываются.
Горячие клавиши:
* Стрелки влево-вправо - прокрутка изображений
###### Режим редактора:
Оверлеи рисуются мышью на холсте. Зажмите ЛКМ и потяните, чтобы нарисовать оверлей.
Оверлеи выделяются по щелчку мыши. Выделенному оверлею можно редактировать комментарий. Оверлей можно удалить кнопкой на панели или клавишей del. Для отмены выделения кликните по свободному месту на холсте или нажмите esc.
Редактор запускается в свободном режиме с возможностью задавать размер холста. В этом режиме нельзя сохранить архив, только один файл с комментариями.
Можно добавлять и удалять слои соответствующими кнопками на панели. Выделенному слою можно менять имя. Последний слой нельзя удалить.
Можно выбрать архив с изображениями или одно изображение, которое считается за архив с одним изображением. После выбора архива размер холста фиксирован.
Из архива будут загружены все комментарии, которые будут найдены. Если изображений больше - для них будут созданы комментарии с одним слоем "по умолчанию". Архив можно сохранять в любой момент, или сохранять один, текущий файл с комментариями. **Внимание**, не перезаписывайте свой архив на жестком диске, лучше сохраните архив с правками как новый.
Горячие клавиши:
* Стрелки влево-вправо - прокрутка подложек
* Esc - снять выделение
* Del - удалить выделенный комментарий 
  

###### Ожидают исправления: 

###### Возможные улучшения:
* Общие:
  * Поддержка других форматов архивов и изображений
  * Внедрить проверку на соответствие json файлов схеме
  * Предупреждать о несохранённых изменениях, при закрытии программы или открытии другого архива
* Просмотрщик:
  * Добавить опцию "автоподгон масштаба" - если размер изображения отличается от ожидаемого, оверлеи комментариев масштабируются, чтобы соответствовать размеру изображения

* Редактор:
  * Указание имени и размера файла вручную, указание авторства
  * Перемещение и изменение размера оверлеев
  * Не сохранять комментарии, оверлеи которых выходят за пределы холста
  * undo, redo


# Program for viewing and editing overlays with comments for images

##### version: beta3 (2018-12-03)
Supported archives: zip.
Supported images:  png/jpeg/gif.
##### Instructions: 
Open HTML with program, change language in upper right corner. Program has two modes: viewer and editor.
###### Viewer mode: 
Choose archive with equal number of images and json comment files (all must validate json schema). Images and comments will be uploaded and sorted lexicographically (10.jpg will be before 8.jpg, but after 08.jpg) and paired correspondingly.
Comment appears on hover over the overlay. All overlays are hidden on click anywhere.
Hotkeys:
* left-right arrows - scroll images
###### Editor mode:
Overlays are drawn on canvas with mouse. Click and hold LMB to draw an overlay.
Overlays are selected on click. Selected overlay's comment can be edited. It can be deleted with button on control panel, or with del key. To unselect click on free canvas space or type esc.
Editor is started in free mode with possibility to set canvas size. In this mode archive can be saved, only comment file.
Layers can be added and removed by corresponding buttons on panel, current layer's name can be edited. Last layer can't be deleted.
Archive can be selected, as well as a single image, which count as an archive with sole image. After archive upload canvas size is locked.
All the comment files found will be uploaded from the archive. If there are more images, than comments - there will be created 'default' comment files with a single layer. Archive can be saved anytime, as well as current comment file. **Attention**, don't overwrite an existing archive on hard drive, better save edited archive as new one.
Hotkeys:
* left-right arrows - scroll images
* Esc - deselect comment
* Del - remove selected comment 
  

###### Waiting for fix: 

###### Possible ameliorations:
* General:
  * Support of another archive and image formats
  * Implement validation of json comment files against schema
  * Don't discard opened archive with mode change
* Viewer:
  * Add "auto-scale" option - if image size differs from expected one, comment overlays will be scaled to correspond to image size
  * Add "save archive" button and warn about unsaved changes, when archive won't be discarded with mode change 
* Editor:
  * Manual set of filename and size, author attribution
  * Warn over unsaved changes
  * Move overlays and change their size
  * Don't save comments if overlays surpass canvas size
  * implement undo, redo

