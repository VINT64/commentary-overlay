# Программа для просмотра и редактирования оверлеев с комментариями для изображений
##### Версия: бета (2018-11-22)
Поддерживаемые архивы: zip.
Поддерживаемые изображения:  png/jpeg/gif.
###### Инструкции: 
Открыть HTML с программой. В программе два режима: просмотрщик и редактор.
* Режим просмотрщика: 
Выбрать архив с одинаковым количеством изображений и json файлов с комментариями (все должны соответствовать json-схеме). Изображения и комментарии будут загружены и отсортированы в лексикографическом порядке (10.jpg будет раньше, чем 8.jpg, но позже, чем 08.jpg) и сопоставлены соответственно.
По наведению на оверлей появляется комментарий. По щелчку на любом участке изображения все оверлеи скрываются.
Горячие клавиши:
  * Стрелки влево-вправо - прокрутка изображений
* Режим редактора:
Оверлеи рисуются мышью на холсте. Зажмите ЛКМ и потяните, чтобы нарисовать оверлей.
Оверлеи выделяются по щелчку мыши. Выделенному оверлею можно редактировать комментарий. Оверлей можно удалить кнопкой на панели или клавишей del. Для отмены выделения кликните по свободному месту на холсте или нажмите esc.
Можно выбрать архив с изображениями или одно изображение в качестве подложки. Если нет подложки, можно задавать размер холста. С подложкой размер холста фиксирован.
Горячие клавиши:
  * Стрелки влево-вправо - прокрутка подложек
  * Esc - снять выделение
  * Del - удалить выделенный комментарий 
  

###### Ожидают исправления: 
* При ширине изображения больше ширины экрана холст "уезжает"

###### Возможные улучшения:
* Общие:
  * Поддержка других форматов архивов и изображений
  * Внедрить проверку на соответствие json файлов схеме
* Редактор: 
  * Не сохранять комментарии, оверлеи которых выходят за пределы холста
  * Поддержка множественных слоёв: создание, переименование, удаление и т.д.
  * Другое поведение холста при переключении подложек
    * Автоматически сохранять файл с комментариями, очищать холст
	* Хранить комментарии для каждого файла в памяти, сохранять изображения и комментарии сразу одним архивом
  * Указание имени и размера файла вручную, указание авторства
  * Перемещение и изменение размера оверлеев
  * Загружать оверлеи из файлов для продолжения редактирования


# Program for viewing and editing overlays with comments for images

Translation in progress...