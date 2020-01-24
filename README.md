# NumberDrawing


## Description


Приложение NumberDrawing отрисовывает число на изображении формата PNG, переданное аргументом командной строки. Число может быть целым, отрицательным, положительным или вещественным (возможна запись вещественного числа через '.' и ','). Изображение создается в папке images, которая находится в папке проекта ([папка с изображениями](https://github.com/enotRishinn/NumberDrawing/images)). Для отрисовки доступно 4 шрифта(стандартный шрифт белого и черного цвета с размерами шрифта 48 и 72). Более подробную информацию о шрифтах можно прочитать в файле fonts/README.md [описание шрифтов](https://github.com/enotRishinn/NumberDrawing/fonts/README.md)


The NumberDrawing application draws a number on a PNG image passed as a command-line argument. The number can be integer, negative, positive or real (it is possible to write a real number with '.' and ','). The image is created in the folder 'images', which is located in the project folder ([images folder](https://github.com/enotRishinn/NumberDrawing/images)). Four fonts are available for drawing (the standard font is white and black with font sizes 48 and 72). More detailed information about fonts can be found in the file fonts/README.md [description of fonts](https://github.com/enotRishinn/NumberDrawing/fonts/README.md)


## How to run the application


Для запуска приложения необходим установленный на компьютер Node.js. ([Установка Node.js](https://nodejs.org/en/download/)). Проверить наличие Node.js на компьютере можно с помощью команды в консоли:

`node -v`

В приложении используется библиотека fs, которая реализует ввод и вывод файлов. Если необходимо подключить зависимости и создать папку node_modules и установить данную библиотеку, перейдите в консоли в папку проекта и выполните следующую команду:

`npm install`

Для запуска приложения необходимо перейти в папку проекта в консоли и запустить проект с помощью команды `node index.js ` + число, которое хотите напечатать. Примеры запуска приложения:

`node index.js 136046`

`node index.js 854.34`

`node index.js 64,36587`

`node index.js -35674`

`node index.js -353.47`

`node index.js 1234567654376564345765987`

Изображение сохранится в папку 'images'(находится в папке проекта) под названием 'number555.png' (в случае, если напечатанное число равно 555). ([папка с изображениями](https://github.com/enotRishinn/NumberDrawing/images))

Пример создания картинки с помощью кода в файле 'index.js' ([index.js](https://github.com/enotRishinn/NumberDrawing/index.js)):

```js
// параметрами передается размер изображения, первый аргумент - ширина, второй - высота
// parameters is image size, the first argument is the width, the second is the height
let numberDrawing = new NumberDrawing(40 * NUMBER_FOR_DRAWING.length, 200);
numberDrawing.createPNG(function() {

  // выбор шрифта
  // font selection
  this.selectFont(Font.FONT_BLACK_48);

  //печать числа, число считывается с консоли и передается аргументом в виде строки
  //print a number, the number is read from the console and passed as an argument as a string
  this.printNumber(NUMBER_FOR_DRAWING);
});
```
