# Program for viewing and editing overlays with comments for images
Версия на русском ниже
##### version: beta3.1 (2019-12-11)
Supported archives: zip.\
Supported images:  png/jpeg/gif.\
##### Instructions: 
Open HTML with program, change language if needed. Program has two modes: viewer and editor.
###### Viewer mode: 
Choose archive with images and json comment files. First image with overlays will be shown on screen. Comment appears on hover over the overlay. All overlays are hidden on click on image.\
Hotkeys:
* Arrows left, right — scroll images.\
Some details about archives: it's preferred that archive contains equal number of images and json comment files (all must validate json schema). Images and comments will be uploaded and sorted lexicographically (10.jpg will be before 8.jpg, but after 08.jpg) and paired correspondingly.
###### Editor mode:
Upload one image or archive with images. Json comment files can be present. After archive upload canvas size is locked. If only one image was opened, the resulting archive will contain one image and one comment file (obviously).\
All the comment files found will be uploaded from the archive. If there are more images than comments,'default' comment files will be created with a single layer each. Archive can be saved anytime, as well as current comment file. **Attention**, don't overwrite an existing archive on hard drive, better save edited archive as new one.\
Overlays are drawn on image with mouse. Click and hold LMB to draw an overlay.\
Overlays are selected on click. Selected overlay's comment can be edited. It can be deleted with button on control panel, or with del key. To unselect overlay click on free image space or push esc.\
Layers can be added and removed by corresponding buttons on panel, current layer's name can be edited. Last layer left can't be deleted.\
Editor can be used in free mode without images, with possibility to set canvas size. In this mode archive can't be saved, only comment file. To enter the mode after image or archive was opened,  push the "something canvas" on the control panel.\
Hotkeys:
* Arrows left, right — scroll images
* Esc — deselect comment
* Del — remove selected comment
  

###### Waiting for fix: 

###### Possible ameliorations:
* General:
  * Support of another archive and image formats
  * Implement validation of json comment files against schema
* Viewer:
  * Add "auto-scale" option — if image size differs from expected one, comment overlays will be scaled to correspond to image size
  * Warn about unsaved changes upon closing the program,
* Editor:
  * Manual set of filename and size, author attribution
  * Warn over unsaved changes
  * Move overlays and change their size
  * Don't save comments if overlays surpass canvas size
  * implement undo, redo


# Программа для просмотра и редактирования оверлеев с комментариями для изображений
##### Версия: бета3.1 (2019-12-11)
Поддерживаемые архивы: zip.
Поддерживаемые изображения:  png/jpeg/gif.
##### Инструкции: 
Открыть HTML с программой. В программе два режима: просмотр и редактор.
###### Режим просмотра: 
Выбрать архив с изображениями и файлами json с комментариями. Будет показано первое изображение с оверлеями поверх него. По наведению на оверлей появляется комментарий. По щелчку на любом участке изображения все оверлеи скрываются.\
Горячие клавиши:
* Стрелки влево-вправо — прокрутка изображений\
Касательно архива: предпочтительно, чтобы архив содержал одинаковое количество изображений и json файлов, все файлы должны соответствовать схеме (json-схема для файлов лежит в корне проекта). Изображения и комментарии будут загружены и отсортированы в лексикографическом порядке (10.jpg будет раньше, чем 8.jpg, но позже, чем 08.jpg) и сопоставлены соответственно.
###### Режим редактора:
Выбрать архив с изображениями или одно изображение. В последнем случае на выходе будет архив с одним изображением и соответствующим комментарием (-- КО). После выбора размер холста фиксирован.\
Из архива будут загружены все комментарии, которые будут найдены. Если изображений больше, для них будут созданы комментарии с одним слоем "по умолчанию". Архив можно сохранить в любой момент, также можно сохранить текущий файл с комментариями. **Внимание**, не перезаписывайте свой архив на жестком диске, лучше сохраните архив с правками как новый.\
Оверлеи рисуются мышью на холсте. Зажмите ЛКМ и потяните, чтобы нарисовать оверлей.\
Оверлеи выделяются по щелчку мыши. Выделенному оверлею можно редактировать комментарий. Оверлей можно удалить кнопкой на панели или клавишей del. Для отмены выделения кликните по свободному месту на холсте или нажмите esc.\
Слои можно добавлять и удалять соответствующими кнопками на панели. Выделенному слою можно менять имя. Последний оставшийся слой нельзя удалить.\
В редакторе есть свободный режим с возможностью задавать размер холста. В этом режиме нельзя сохранить архив, только одиночный файл с комментариями. Чтобы войти в этот режим после того, как был открыт архив, нажмите кнопку "чистый холст"\
Горячие клавиши:
* Стрелки влево-вправо — прокрутка подложек
* Esc — снять выделение
* Del — удалить выделенный комментарий\
  

###### Ожидают исправления: 

###### Возможные улучшения:
* Общие:
  * Поддержка других форматов архивов и изображений
  * Внедрить проверку на соответствие json файлов схеме
* Просмотрщик:
  * Добавить опцию "автоподгон масштаба" — если размер изображения отличается от ожидаемого, оверлеи комментариев масштабируются, чтобы соответствовать размеру изображения

* Редактор:
  * Указание имени и размера файла вручную, указание авторства
  * Перемещение и изменение размера оверлеев
  * Не сохранять комментарии, оверлеи которых выходят за пределы холста
  * undo, redo


